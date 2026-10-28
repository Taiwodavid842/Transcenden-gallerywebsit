import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ safeGallery: void }>({
  safeGallery: [async ({ context, page }, use) => {
    const blockedRequests: string[] = [];
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await context.route('**/*', async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      // Never send enquiries or any other write request, even if a regression
      // accidentally triggers one. Also fail the test if such an attempt occurs.
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())
        || /\/api\/contact\/?$/.test(path)) {
        blockedRequests.push(`${request.method()} ${path}`);
        await route.abort('blockedbyclient');
        return;
      }
      await route.continue();
    });
    await use();
    expect(blockedRequests, 'Gallery browsing must not attempt to submit enquiries or write data').toEqual([]);
    expect(pageErrors, 'Gallery browsing must not cause uncaught browser errors').toEqual([]);
  }, { auto: true }],
});

export { expect };
