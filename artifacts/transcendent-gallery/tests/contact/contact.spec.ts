import type { Page } from '@playwright/test';
import { test, expect, receipt } from './fixtures';

const details = {
  name: 'Browser Test Visitor',
  email: 'browser-test@example.invalid',
  projectType: 'Portrait session',
  message: 'Synthetic browser regression enquiry. Never send to the backend.',
};
const success = 'Thanks — your message was saved. We have your inquiry.';
const failure = 'We could not save your message. Please check your details and try again shortly. Your message has not been saved.';
const fieldIds = ['contact-name', 'contact-email', 'contact-project', 'contact-message'] as const;

async function fillForm(page: Page) {
  await page.getByTestId('contact-name').fill(details.name);
  await page.getByTestId('contact-email').fill(details.email);
  await page.getByTestId('contact-project').selectOption(details.projectType);
  await page.getByTestId('contact-message').fill(details.message);
}

async function expectValues(page: Page, reset = false) {
  for (const [index, value] of Object.values(details).entries()) {
    await expect(page.getByTestId(fieldIds[index])).toHaveValue(reset ? '' : value);
  }
}

test.beforeEach(async ({ page, enquiry }) => {
  // Referencing the automatic fixture also makes interception order explicit.
  expect(enquiry.requests).toHaveLength(0);
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('contact-form').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('contact-submit')).toBeEnabled();
});

for (const field of fieldIds) {
  test(`requires ${field} without sending an enquiry`, async ({ page, enquiry }) => {
    await fillForm(page);
    const input = page.getByTestId(field);
    if (field === 'contact-project') {
      // The empty placeholder is disabled, so restore it through a native reset.
      await page.getByTestId('contact-form').evaluate((form: HTMLFormElement) => form.reset());
      await page.getByTestId('contact-name').fill(details.name);
      await page.getByTestId('contact-email').fill(details.email);
      await page.getByTestId('contact-message').fill(details.message);
    } else {
      await input.fill('');
    }
    await page.getByTestId('contact-submit').click();
    expect(await input.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
    await expect(input).toBeFocused();
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(enquiry.requests).toHaveLength(0);
  });
}

test('rejects a malformed email without a request', async ({ page, enquiry }) => {
  await fillForm(page);
  await page.getByTestId('contact-email').fill('not-an-email');
  await page.getByTestId('contact-submit').click();
  expect(await page.getByTestId('contact-email').evaluate(
    (input: HTMLInputElement) => input.validity.typeMismatch,
  )).toBe(true);
  await expect(page.getByTestId('contact-email')).toBeFocused();
  expect(enquiry.requests).toHaveLength(0);
});

test('sends the trimmed payload, announces success and resets the form', async ({ page, enquiry }) => {
  await fillForm(page);
  await page.getByTestId('contact-name').fill(`  ${details.name}  `);
  await page.getByTestId('contact-message').fill(`  ${details.message}  `);
  await page.getByTestId('contact-submit').click();
  await expect(page.getByRole('status')).toHaveText(success);
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expectValues(page, true);
  await expect(page.getByTestId('contact-submit')).toBeEnabled();
  expect(enquiry.requests).toHaveLength(1);
  expect(enquiry.requests[0].postDataJSON()).toEqual(details);
  expect(enquiry.requests[0].headers()['content-type']).toContain('application/json');
});

for (const status of [400, 500]) {
  test(`announces HTTP ${status}, preserves entries and allows a successful retry`, async ({ page, enquiry }) => {
    enquiry.replyWith((route) => route.fulfill({ status, json: { error: 'Synthetic failure' } }));
    await fillForm(page);
    await page.getByTestId('contact-submit').click();
    await expect(page.getByRole('alert')).toHaveText(failure);
    await expect(page.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    await expect(page.getByRole('status')).toHaveCount(0);
    await expectValues(page);
    await expect(page.getByTestId('contact-submit')).toBeEnabled();
    expect(enquiry.requests).toHaveLength(1);

    enquiry.replyWith((route) => route.fulfill({ status: 201, json: receipt }));
    await page.getByTestId('contact-submit').click();
    await expect(page.getByRole('status')).toHaveText(success);
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expectValues(page, true);
    expect(enquiry.requests).toHaveLength(2);
    expect(enquiry.requests[1].postDataJSON()).toEqual(details);
  });
}

test('handles a dropped connection without losing the draft', async ({ page, enquiry }) => {
  enquiry.replyWith((route) => route.abort('failed'));
  await fillForm(page);
  await page.getByTestId('contact-submit').click();
  await expect(page.getByRole('alert')).toHaveText(failure);
  await expectValues(page);
  await expect(page.getByTestId('contact-submit')).toBeEnabled();
  expect(enquiry.requests).toHaveLength(1);
});

test('shows pending feedback, clears stale feedback and prevents duplicate submissions', async ({ page, enquiry }) => {
  // Start with an error so stale feedback clearing is observable while pending.
  enquiry.replyWith((route) => route.fulfill({ status: 500, json: { error: 'Synthetic failure' } }));
  await fillForm(page);
  const submit = page.getByTestId('contact-submit');
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText(failure);

  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  enquiry.replyWith(async (route) => {
    await gate;
    await route.fulfill({ status: 201, json: receipt });
  });
  try {
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText('Saving your note…');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveCount(0);
    await expectValues(page);
    await expect.poll(() => enquiry.requests.length).toBe(2);

    // Native repeated pointer/keyboard attempts while the reply is held.
    const bounds = await submit.boundingBox();
    if (!bounds) throw new Error('Submit button has no bounding box');
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { clickCount: 3 });
    await page.getByTestId('contact-email').press('Enter');
    // Explicit submit events also exercise the handler's pending guard,
    // independently of the disabled button's native browser protection.
    await page.getByTestId('contact-form').evaluate((form) => {
      for (let i = 0; i < 3; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  } finally {
    release();
  }
  await expect(page.getByRole('status')).toHaveText(success);
  await expect(submit).toBeEnabled();
  await expect(submit).toHaveText('Prepare your note');
  await expectValues(page, true);
  expect(enquiry.requests).toHaveLength(2); // One failure, exactly one pending retry.
});
