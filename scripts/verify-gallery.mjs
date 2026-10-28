// Data/asset regression checks. Run with: node scripts/verify-gallery.mjs
// These do not replace interactive browser tests.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const frontend = resolve(root, 'artifacts/transcendent-gallery');
const source = readFileSync(resolve(frontend, 'src/data/portfolio.ts'), 'utf8');
const compiled = ts.transpileModule(
  source.replace('import.meta.env.BASE_URL', '"/"'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } },
).outputText;
const { gallery, categories, galleryFilters, services, BUSINESS } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

assert.equal(categories.length, 8);
assert.equal(galleryFilters.length, 9);
assert.deepEqual(services.map((service) => service.title), categories);
assert.equal(gallery.length, 10);
assert.equal(new Set(gallery.map((photo) => photo.id)).size, gallery.length);
assert.equal(BUSINESS.address, 'Ayeso, Adelegan Compound, Ilesha, Osun State, Nigeria.');
const paths = new Set([BUSINESS.logo]);
for (const photo of gallery) {
  assert.ok(photo.alt && photo.title && photo.sourceFile);
  assert.ok(photo.category === null || categories.includes(photo.category));
  assert.ok(existsSync(resolve(root, `attached_assets/${photo.sourceFile}.jpg`)));
  paths.add(photo.image);
  paths.add(photo.thumbnail);
  for (const [url, expectedWidth, expectedHeight] of [
    [photo.image, photo.width, photo.height],
    [photo.thumbnail, photo.thumbWidth, undefined],
  ]) {
    const file = resolve(frontend, 'public', url.replace(/^\//, ''));
    assert.ok(existsSync(file), `Missing image: ${url}`);
    const [width, height] = execFileSync('magick', ['identify', '-format', '%w %h', file], { encoding: 'utf8' }).split(' ').map(Number);
    assert.equal(width, expectedWidth, url);
    if (expectedHeight !== undefined) assert.equal(height, expectedHeight, url);
  }
}
const originals = readdirSync(resolve(root, 'attached_assets')).filter((file) => file.endsWith('.jpg'));
assert.deepEqual(new Set(gallery.map((photo) => `${photo.sourceFile}.jpg`)), new Set(originals));
for (const filter of galleryFilters) {
  const visible = gallery.filter((photo) => filter === 'All work' || photo.category === filter);
  if (filter === 'All work') assert.equal(visible.length, gallery.length);
  else assert.ok(visible.every((photo) => photo.category === filter));
  console.log(`${filter}: ${visible.length} photographs${visible.length ? '' : ' (empty state)'}`);
}
const app = readFileSync(resolve(frontend, 'src/App.tsx'), 'utf8');
assert.ok(app.includes('<ContactForm />'), 'Contact form must remain mounted');
assert.ok(!/\/images\/(?:hero-portrait|studio-portrait|wedding-story|celebration)\.jpg/.test(app + source));
if (process.env.GALLERY_TEST_URL) {
  for (const path of paths) {
    const response = await fetch(new URL(path.replace(/^\//, ''), process.env.GALLERY_TEST_URL));
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-type')?.startsWith('image/'), path);
    await response.arrayBuffer();
  }
  console.log(`All ${paths.size} web assets return HTTP 200 with image content types.`);
}
console.log('PASS: categories, portfolio metadata, image dimensions, original coverage and contact mount.');
