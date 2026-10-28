import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

// Reuse the running development preview; never start the API or another Vite.
const baseURL = process.env.CONTACT_TEST_URL ?? 'http://127.0.0.1:80/';
const url = new URL(baseURL);
if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.endsWith('/')) {
  throw new Error('CONTACT_TEST_URL must be an HTTP(S) development preview URL ending in /.');
}

export default defineConfig({
  testDir: '.',
  testMatch: 'contact.spec.ts',
  outputDir: fileURLToPath(new URL('../../../../generated-artifacts/contact-results', import.meta.url)),
  reporter: 'list',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        ?? (existsSync('/repl/tools/bin/chromium') ? '/repl/tools/bin/chromium' : undefined),
    },
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
