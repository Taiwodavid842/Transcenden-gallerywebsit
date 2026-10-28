import type { Locator, Page } from '@playwright/test';
import { test, expect } from './fixtures';

// These intentionally describe the currently published client collection, not
// the component's own filtering function. Review when the client adds photos.
const categories = [
  ['Studio Sessions', 3],
  ['Wedding Sessions', 0],
  ['Maternity Sessions', 0],
  ['Kids Shoots', 2],
  ['Family Sessions', 2],
  ['Others — Burials & Events', 0],
  ['Church Programs', 0],
  ['Lifestyle Photography', 1],
] as const;

const cards = (page: Page) => page.getByTestId('photography-gallery').locator('article');
const openers = (page: Page) => page.getByRole('button', { name: /^Open photograph / });
const filter = (page: Page, label: string) => page
  .getByRole('group', { name: 'Filter photographs by category' })
  .getByRole('button', { name: label, exact: false });
const viewer = (page: Page) => page.getByTestId('lightbox');
const counter = (page: Page) => page.getByTestId('text-lightbox-counter');
const number = (value: number) => String(value).padStart(2, '0');

async function loadedImage(image: Locator) {
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
    element.complete && element.naturalWidth > 0 && element.naturalHeight > 0,
  )).toBe(true);
}

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth + 1,
  )).toBe(true);
  // The page hides overflow, so also check actual controls instead of only
  // trusting document.scrollWidth.
  for (const button of await page
    .getByRole('group', { name: 'Filter photographs by category' })
    .getByRole('button').all()) {
    const bounds = await button.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  }
}

async function imageContained(page: Page) {
  const image = viewer(page).locator('figure img');
  await loadedImage(image);
  await expect(image).toHaveCSS('object-fit', 'contain');
  const bounds = await image.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.locator('#work').scrollIntoViewIfNeeded();
  await expect(filter(page, 'All work')).toHaveAttribute('aria-pressed', 'true');
});

test('All work displays all ten real photographs with loaded images and alt text', async ({ page }) => {
  await expect(cards(page)).toHaveCount(10);
  await expect(page.getByTestId('text-gallery-count')).toHaveText('10 PHOTOGRAPHS');
  const ids = await cards(page).evaluateAll((elements) => elements.map((element) => element.getAttribute('data-testid')));
  expect(new Set(ids).size).toBe(10);
  for (const image of await cards(page).locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await loadedImage(image);
    await expect(image).toHaveAttribute('alt', /\S.+/);
    await expect(image).toHaveAttribute('src', /images\/client\/.+\.webp$/);
    await expect(image).toHaveAttribute('srcset', /720\.webp.+1600\.webp/);
  }
  await noHorizontalOverflow(page);
});

test('every category filters correctly and empty categories can return to All work', async ({ page }) => {
  for (const [category, count] of categories) {
    await test.step(`${category}: ${count} photographs`, async () => {
      await filter(page, category).click();
      await expect(filter(page, category)).toHaveAttribute('aria-pressed', 'true');
      await expect(filter(page, 'All work')).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByTestId('text-gallery-count'))
        .toHaveText(`${number(count)} ${count === 1 ? 'PHOTOGRAPH' : 'PHOTOGRAPHS'}`);
      if (count === 0) {
        await expect(page.getByTestId('photography-gallery')).toHaveCount(0);
        await expect(page.getByTestId('gallery-empty')).toContainText(category);
        await expect(page.getByTestId('gallery-empty')).toContainText('No photographs here');
        await expect(page.getByTestId('link-empty-enquire')).toHaveAttribute('href', '#contact');
        // Never follow the enquiry link or interact with the contact form.
        await page.getByTestId('button-empty-all').click();
        await expect(cards(page)).toHaveCount(10);
        await expect(filter(page, 'All work')).toHaveAttribute('aria-pressed', 'true');
      } else {
        await expect(cards(page)).toHaveCount(count);
        await expect(page.getByTestId('gallery-empty')).toHaveCount(0);
        for (const label of await cards(page).locator('.gallery-caption .eyebrow').all()) {
          await expect(label).toHaveText(category);
        }
      }
    });
  }
  await filter(page, 'All work').click();
  await expect(cards(page)).toHaveCount(10);
  await noHorizontalOverflow(page);
});

test('pointer navigation works without the image covering controls, including wraparound', async ({ page }) => {
  const opener = openers(page).first();
  await opener.click();
  await expect(viewer(page)).toBeVisible();
  await expect(counter(page)).toHaveText('01 / 10');
  await imageContained(page);
  const firstSource = await viewer(page).locator('figure img').getAttribute('src');
  // Real pointer clicks, never force:true: this catches image interception.
  await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
  await expect(counter(page)).toHaveText('02 / 10');
  await imageContained(page);
  expect(await viewer(page).locator('figure img').getAttribute('src')).not.toBe(firstSource);
  await page.getByRole('button', { name: 'Previous photograph', exact: true }).click();
  await expect(counter(page)).toHaveText('01 / 10');
  await page.getByRole('button', { name: 'Previous photograph', exact: true }).click();
  await expect(counter(page)).toHaveText('10 / 10');
  await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
  await expect(counter(page)).toHaveText('01 / 10');
  await page.getByRole('button', { name: 'Close photograph viewer' }).click();
  await expect(viewer(page)).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('keyboard arrows, focus trap, Escape and focus return work', async ({ page }) => {
  const opener = openers(page).first();
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole('heading')).toHaveText('Green, worn with grace');
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('02 / 10');
  await page.keyboard.press('ArrowLeft');
  await expect(counter(page)).toHaveText('01 / 10');
  for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    expect(await viewer(page).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(viewer(page)).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('viewer navigation stays inside the selected category', async ({ page }) => {
  await filter(page, 'Studio Sessions').click();
  await openers(page).first().click();
  for (const position of [1, 2, 3]) {
    await expect(counter(page)).toHaveText(`${number(position)} / 03`);
    await expect(viewer(page).locator('.eyebrow')).toHaveText('Studio Sessions');
    await imageContained(page);
    await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
  }
  await expect(counter(page)).toHaveText('01 / 03');
  await page.keyboard.press('Escape');
  await expect(filter(page, 'Studio Sessions')).toHaveAttribute('aria-pressed', 'true');
  await expect(cards(page)).toHaveCount(3);
});

test('single-photo category has no next/previous controls and preserves the composition', async ({ page }) => {
  await filter(page, 'Lifestyle Photography').click();
  await expect(cards(page)).toHaveCount(1);
  const opener = openers(page).first();
  await opener.click();
  await expect(counter(page)).toHaveText('01 / 01');
  await expect(viewer(page).locator('.eyebrow')).toHaveText('Lifestyle Photography');
  await imageContained(page);
  await expect(page.getByRole('button', { name: 'Next photograph', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous photograph', exact: true })).toHaveCount(0);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(counter(page)).toHaveText('01 / 01');
  await page.getByRole('button', { name: 'Close photograph viewer' }).click();
  await expect(opener).toBeFocused();
});

test('navigation reaches the gallery and category buttons fit the viewport', async ({ page }) => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const menu = page.getByTestId('mobile-menu-toggle');
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Work', exact: true }).click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  } else {
    await page.getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Work', exact: true }).click();
  }
  await expect(page).toHaveURL(/#work$/);
  await expect(cards(page)).toHaveCount(10);
  await noHorizontalOverflow(page);
});
