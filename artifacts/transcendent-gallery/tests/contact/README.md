# Isolated enquiry-form browser checks

Start the existing Transcendent Gallery development preview, then run from the workspace root:

```sh
pnpm --filter @workspace/transcendent-gallery run test:contact:types
pnpm --filter @workspace/transcendent-gallery run test:contact
```

No API server or database is required. The suite reuses the running frontend at
`http://127.0.0.1:80/`. To target a different **development** preview, set
`CONTACT_TEST_URL` to its HTTP(S) URL, including any base path and a trailing slash.
Never target production.

Chromium uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if supplied, otherwise
`/repl/tools/bin/chromium` when available, or Playwright's installed Chromium.
Outside Replit, install the browser if necessary:

```sh
pnpm --filter @workspace/transcendent-gallery exec playwright install chromium
```

## Coverage

Ten tests run independently at desktop and phone sizes (20 checks):

- Each required field, plus malformed email, blocks submission without a request.
- Successful submissions send the expected trimmed JSON, announce success, and reset fields.
- HTTP 400 and 500 responses announce errors, preserve entries, and permit retry.
- Dropped connections display an error without losing the draft.
- A held response shows pending text, disables the button, clears stale feedback,
  and prevents repeated pointer, Enter-key, and explicit submit-event requests.

## Safety and isolation

An automatic context-wide fixture installs interception **before navigation**.
Every POST to `/api/contact` (including base-path-prefixed URLs) is fulfilled
locally or deliberately aborted. It never uses `route.fetch`, `fallback`, or
`continue` for enquiries. All other non-read requests and unexpected enquiry
methods are blocked and fail the test. Service workers are disabled.
Only harmless read requests can reach the running preview.

Each test gets a fresh browser context and mock state. Responses contain only a
synthetic receipt; no enquiry records are created. The pending-response test uses
an explicit release gate, not a timed server delay.

This directory, configuration, commands and result directory are separate from
the gallery suite; neither suite imports the other's fixtures. Application and
backend behavior are unchanged.

Retries are disabled. Failure traces and screenshots are saved under the ignored
`generated-artifacts/contact-results/` directory at the workspace root.
