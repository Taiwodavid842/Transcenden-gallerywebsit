import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Read real metadata without importing Vite's import.meta.env into Node.
// Expectations stay current when the client supplies more photographs.
const source = readFileSync(new URL('../../src/data/portfolio.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source.replace('import.meta.env.BASE_URL', '"/"'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
export const { gallery, galleryFilters } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

export const test = base.extend({
  // Guard every page/context, including any accidentally introduced form action.
  noWrites: [async ({ context }, use) => {
    const writes = [];
    await context.route('**/*', async (route) => {
      const request = route.request();
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
        await route.abort('blockedbyclient');
      } else {
        await route.continue();
      }
    });
    await use();
    expect(writes, 'Gallery tests must never attempt enquiry/API writes').toEqual([]);
  }, { auto: true }],
});
export { expect };
export const pad = (n) => String(n).padStart(2, '0');
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const photosFor = (filter) => gallery.filter((photo) => filter === 'All work' || photo.category === filter);
export const filterButton = (page, filter) => page.getByTestId(`gallery-filter-${slug(filter)}`);

export async function visitGallery(page) {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.getByRole('group', { name: 'Filter photographs by category' }).scrollIntoViewIfNeeded();
  await expect(filterButton(page, 'All work')).toHaveAttribute('aria-pressed', 'true');
}

export async function expectLoaded(image) {
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
    { message: 'Photograph must finish loading with nonzero natural dimensions' }).toBe(true);
}

export async function expectViewer(page, photos, index) {
  const viewer = page.getByRole('dialog');
  const photo = photos[index];
  await expect(viewer).toBeVisible();
  await expect(viewer.getByTestId('text-lightbox-counter')).toHaveText(`${pad(index + 1)} / ${pad(photos.length)}`);
  await expect(viewer.getByRole('heading', { name: photo.title, exact: true })).toBeVisible();
  const image = viewer.locator('img');
  await expect(image).toHaveAttribute('alt', photo.alt);
  await expect(image).toHaveAttribute('src', new URL(photo.image.slice(1), page.url()).pathname);
  await expectLoaded(image);
}

export async function expectFilter(page, filter) {
  const photos = photosFor(filter);
  await expect(filterButton(page, filter)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gallery-toolbar button[aria-pressed="true"]')).toHaveCount(1);
  await expect(page.getByTestId('text-gallery-count')).toHaveText(
    `${pad(photos.length)} ${photos.length === 1 ? 'PHOTOGRAPH' : 'PHOTOGRAPHS'}`,
  );
  await expect(page.locator('[data-testid^="gallery-item-"]')).toHaveCount(photos.length);
  if (photos.length) {
    await expect(page.getByTestId('gallery-empty')).toHaveCount(0);
    for (const photo of photos) {
      const item = page.getByTestId(`gallery-item-${photo.id}`);
      await item.scrollIntoViewIfNeeded(); // Trigger lazy image loading.
      await expect(item.getByRole('heading')).toHaveText(photo.title);
      await expect(item.locator('img')).toHaveAttribute('alt', photo.alt);
      await expectLoaded(item.locator('img'));
    }
  } else {
    await expect(page.getByTestId('photography-gallery')).toHaveCount(0);
    const empty = page.getByTestId('gallery-empty');
    await expect(empty.getByRole('heading')).toHaveText('No photographs here yet.');
    await expect(empty.locator('.eyebrow')).toHaveText(filter);
    await expect(empty.getByTestId('link-empty-enquire')).toHaveAttribute('href', '#contact');
    await expect(empty.getByTestId('link-empty-enquire')).toHaveText(`Enquire about ${filter}`);
    // Deliberately do not follow the enquiry link or touch the contact form.
  }
}
