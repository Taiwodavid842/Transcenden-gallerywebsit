import { test, expect, gallery, galleryFilters, photosFor, filterButton, visitGallery, expectFilter, expectViewer } from './support.mjs';

for (const filter of galleryFilters) {
  test(`category: ${filter} shows exactly its photographs or its empty state`, async ({ page }) => {
    await visitGallery(page);
    await expect(page.getByRole('group', { name: 'Filter photographs by category' }).getByRole('button')).toHaveCount(galleryFilters.length);
    await filterButton(page, filter).click();
    await expectFilter(page, filter);
    if (photosFor(filter).length === 0) {
      await page.getByTestId('button-empty-all').click();
      await expectFilter(page, 'All work');
    }
  });
}

test('real mouse Next/Previous can traverse loaded images and wrap in both directions', async ({ page }) => {
  test.skip(gallery.length < 2, 'Navigation requires multiple supplied photographs');
  await visitGallery(page);
  const opener = page.getByTestId(`button-open-${gallery[0].id}`);
  await opener.click();
  await expectViewer(page, gallery, 0);
  // No force, dispatchEvent, or DOM click: browser hit-testing must reach the buttons.
  // Cycling every photograph exercises portrait and landscape contained-image bounds.
  for (let index = 1; index <= gallery.length; index++) {
    await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
    await expectViewer(page, gallery, index % gallery.length);
  }
  for (let index = gallery.length - 1; index >= 0; index--) {
    await page.getByRole('button', { name: 'Previous photograph', exact: true }).click();
    await expectViewer(page, gallery, index);
  }
  await page.getByRole('button', { name: 'Close photograph viewer' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('keyboard arrows wrap within the active category; Escape returns focus to its exact opener', async ({ page }) => {
  const category = galleryFilters.find((filter) => filter !== 'All work' && photosFor(filter).length > 1);
  expect(category, 'Keep a populated-category keyboard regression case').toBeTruthy();
  const photos = photosFor(category);
  await visitGallery(page);
  await filterButton(page, category).click();
  const opener = page.getByTestId(`button-open-${photos[photos.length - 1].id}`);
  await opener.focus();
  await page.keyboard.press('Enter');
  await expectViewer(page, photos, photos.length - 1);
  await page.keyboard.press('ArrowRight');
  await expectViewer(page, photos, 0);
  await page.keyboard.press('ArrowLeft');
  await expectViewer(page, photos, photos.length - 1);
  await page.keyboard.press('ArrowLeft');
  await expectViewer(page, photos, photos.length - 2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
  // Reopening must start at the clicked item, not the previous viewer index.
  await page.keyboard.press('Enter');
  await expectViewer(page, photos, photos.length - 1);
});
