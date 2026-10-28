import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

// Reuse the existing running frontend. Do not start a second Vite service.
const baseURL = process.env.GALLERY_TEST_URL ?? 'http://127.0.0.1:80/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync('/repl/tools/bin/chromium') ? '/repl/tools/bin/chromium' : undefined);

export default defineConfig({
  testDir: './tests/gallery',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: '../../generated-artifacts/gallery-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../generated-artifacts/gallery-report', open: 'never' }],
  ],
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: { executablePath },
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
