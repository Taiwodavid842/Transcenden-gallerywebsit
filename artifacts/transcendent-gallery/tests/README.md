# Repeatable gallery browser checks

These tests exercise the existing site in Chromium using Playwright. No application code, backend routes, database tables or contact-form logic are changed.

## Run from the workspace root

1. Start the existing Transcendent Gallery preview using the usual Run action.
2. Run:

```sh
pnpm --filter @workspace/transcendent-gallery run test:gallery:types
pnpm --filter @workspace/transcendent-gallery run test:gallery
```

The default target is the workspace's running preview at `http://127.0.0.1:80/`. The tests reuse that server rather than starting another Vite service.

To check another running development preview, set its URL, including any base path and a final slash:

```sh
GALLERY_TEST_URL=https://your-development-preview.example/ pnpm --filter @workspace/transcendent-gallery run test:gallery
```

Use a development preview, not the production site.

## Browser setup

Playwright is the only added development dependency. The configuration reuses `/repl/tools/bin/chromium` when available on Replit. No extra browser download is needed in this workspace.

Outside Replit, install Playwright's browser once if necessary:

```sh
pnpm --filter @workspace/transcendent-gallery exec playwright install chromium
```

Alternatively, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a compatible installed Chromium executable. The tests do not install operating-system packages automatically.

## What is checked

Seven tests run at desktop (1280×900), tablet (768×1024) and phone (390×844) sizes: 21 checks in total.

- All ten gallery photographs load with alternative text.
- All eight category filters show the expected photos or empty state.
- Empty categories can return to All work.
- Real pointer clicks on Next and Previous work without an image covering the controls.
- Navigation wraps at the first and last image.
- Keyboard arrows, focus trapping, Escape and return of focus work.
- A filtered viewer stays inside its category.
- The single-photo Lifestyle category has no unnecessary navigation buttons.
- Images fit inside the viewer; category buttons fit within the screen.
- The navigation menu reaches Work, including the mobile menu.
- Uncaught browser errors fail the tests.

The expected counts in `gallery/gallery.spec.ts` deliberately describe the current published collection independently of the component. Update them when approved photographs are added or recategorized; do not change them merely to hide a failure.

## No enquiries or database writes

Tests never fill or submit the contact form. An automatic safety fixture blocks any attempted write request and all requests to `/api/contact`, then fails the test if one was attempted. Service workers are disabled so they cannot bypass this browser interception. This suite does not verify contact-form submission or database persistence.

## Results

Retries are disabled: each test runs once. The runner prints pass/fail results and saves an HTML report under `generated-artifacts/gallery-report/` at the workspace root. Failures also save screenshots and traces under `generated-artifacts/gallery-results/`. These generated files are excluded from Git and deployment.

Open the report with:

```sh
pnpm --filter @workspace/transcendent-gallery run test:gallery:report
```

This opens a local report server, not the application itself.
