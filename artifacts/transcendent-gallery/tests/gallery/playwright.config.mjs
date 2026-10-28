import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// Use the running preview, never start a second copy of the app or its backend.
const baseURL = process.env.GALLERY_TEST_URL || 'http://localhost:80/';
const url = new URL(baseURL);
if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.endsWith('/')) {
  throw new Error('GALLERY_TEST_URL must be an HTTP(S) preview URL ending in /.');
}

export default defineConfig({
  testDir: '.',
  outputDir: fileURLToPath(new URL('../../../../generated-artifacts/gallery-results', import.meta.url)),
  reporter: 'list',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    browserName: 'chromium',
    // NixOS can supply its compatible Chromium; elsewhere use Playwright's browser.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-mouse', testMatch: 'desktop.spec.mjs', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'small-phone', testMatch: 'mobile.spec.mjs', use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true } },
    { name: 'phone', testMatch: 'mobile.spec.mjs', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'phone-landscape', testMatch: 'mobile.spec.mjs', use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } },
  ],
});
