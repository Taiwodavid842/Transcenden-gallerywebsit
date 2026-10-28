import { test, expect, gallery, galleryFilters, photosFor, filterButton, visitGallery, expectFilter, expectViewer } from './support.mjs';

async function expectNoOverflow(page, locator) {
  const width = page.viewportSize().width;
  await expect.poll(() => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)))
    .toBeLessThanOrEqual(width);
  // Also check the elements themselves: overflow:hidden on the site shell must
  // not hide a gallery control offscreen while masking document overflow.
  for (const element of await locator.all()) {
    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  }
}

test('touch filters, empty recovery, and image viewer stay inside the phone viewport', async ({ page }) => {
  await visitGallery(page);
  for (const filter of galleryFilters) {
    await filterButton(page, filter).tap();
    await expectFilter(page, filter);
    await expectNoOverflow(page, page.locator('.gallery-toolbar button, .gallery-count, .gallery-item, .gallery-empty, .gallery-empty-actions > *'));
    if (!photosFor(filter).length) {
      await page.getByTestId('button-empty-all').tap();
      await expect(filterButton(page, 'All work')).toHaveAttribute('aria-pressed', 'true');
    }
  }
  await filterButton(page, 'All work').tap();
  const opener = page.getByTestId(`button-open-${gallery[0].id}`);
  await opener.tap();
  await expectViewer(page, gallery, 0);
  for (let index = 0; index < gallery.length; index++) {
    await expectNoOverflow(page, page.locator('.lightbox, .lightbox img, .lightbox button'));
    // Viewer controls and the contained image must fit vertically as well.
    for (const element of await page.locator('.lightbox img, .lightbox button').all()) {
      const box = await element.boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
    }
    if (gallery.length > 1) {
      await page.getByRole('button', { name: 'Next photograph', exact: true }).tap();
      await expectViewer(page, gallery, (index + 1) % gallery.length);
    }
  }
  if (gallery.length > 1) {
    await page.getByRole('button', { name: 'Previous photograph', exact: true }).tap();
    await expectViewer(page, gallery, gallery.length - 1);
  }
  await page.getByRole('button', { name: 'Close photograph viewer' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expectNoOverflow(page, page.locator('.gallery-toolbar button, .gallery-item'));
});
