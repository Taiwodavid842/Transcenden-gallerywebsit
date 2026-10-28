import { test as base, expect, type Request, type Route } from '@playwright/test';

type Reply = (route: Route) => Promise<void>;
type EnquiryMock = {
  requests: Request[];
  replyWith: (reply: Reply) => void;
};

export const receipt = {
  id: '00000000-0000-4000-8000-000000000001',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Context-wide, automatic, installed before page navigation. No route.fetch(),
// fallback(), or continuation is ever allowed for enquiries or write requests.
export const test = base.extend<{ enquiry: EnquiryMock }>({
  enquiry: [async ({ context }, use) => {
    const requests: Request[] = [];
    const unexpected: string[] = [];
    let reply: Reply = (route) => route.fulfill({ status: 201, json: receipt });
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const isContact = /\/api\/contact\/?$/.test(url.pathname);
      if (isContact && request.method() === 'POST') {
        requests.push(request);
        await reply(route);
      } else if (isContact || !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
        unexpected.push(`${request.method()} ${url.pathname}`);
        await route.abort('blockedbyclient');
      } else {
        await route.continue();
      }
    });
    try {
      await use({ requests, replyWith: (next) => { reply = next; } });
    } finally {
      await context.unrouteAll({ behavior: 'wait' });
      expect(unexpected, 'Unexpected writes/enquiry methods were blocked, never forwarded').toEqual([]);
    }
  }, { auto: true }],
});

export { expect };
