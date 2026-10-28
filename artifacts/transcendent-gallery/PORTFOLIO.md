# Updating the portfolio

## Where things live

- `src/data/portfolio.ts`: business address, categories, photograph records and services.
- `src/components/portfolio-gallery.tsx`: category buttons, photo grid and larger image viewer.
- `src/index.css`: colours, typography, spacing and responsive styles.
- `public/images/client/`: optimized client photographs and transparent studio logo.
- `../../attached_assets/`: original uploads, unchanged. Original JPGs/PNGs are excluded from Git and deployment, so keep your own backup.

Each photograph record contains its category, title, descriptive alternative text, original filename, dimensions, smaller image and larger image. Alternative text describes the photograph for visitors using screen readers.

Two photographs currently have `category: null`: the crowd celebration (`IMG_9509`) and the seated couple (`IMG_3189`). They appear in All work until the client confirms their categories. Do not infer that they show a wedding or a church programme.

All eight category filters are available. A category without confirmed photographs displays an empty state. This is intentional: only ten photographs have been supplied so far.

## Preparing additional photos

Keep the supplied originals unchanged. Create separate WebP files with a maximum edge of 720 pixels and 1600 pixels, preserve the whole composition, apply orientation, and remove metadata from the delivery copies.

For example, with ImageMagick installed:

```sh
magick original.jpg -auto-orient -resize '720x720>' -strip -quality 84 photo-720.webp
magick original.jpg -auto-orient -resize '1600x1600>' -strip -quality 84 photo-1600.webp
magick identify photo-720.webp photo-1600.webp
```

Put those copies in `public/images/client/`, then add a record in `portfolio.ts`. Use the actual output dimensions: “1600” is the maximum edge, not necessarily the image width. The image helper prefixes paths with Vite's base URL.

## Checks

From the workspace root:

```sh
pnpm run typecheck
PORT=21111 BASE_PATH=/ pnpm --filter @workspace/transcendent-gallery run build
node scripts/verify-gallery.mjs
```

The last command requires ImageMagick. It checks the current ten-photo upload set, image dimensions, category data, file references and presence of the contact form. Update the expected photo count when adding more client work. Set `GALLERY_TEST_URL` to the running site's URL, ending in `/`, to also check image delivery over HTTP.

For a phone check, open the preview, choose Work, try each filter, tap a photograph, use the viewer's navigation buttons and close it. Categories without photos should explain that no photographs have been published yet. A real contact-form submission saves a real enquiry; do not treat it as a preview-only action.

### Repeatable browser regression tests

With the **Transcendent Gallery** preview workflow running, run from the workspace root:

```sh
pnpm --filter @workspace/transcendent-gallery exec playwright install chromium
pnpm --filter @workspace/transcendent-gallery run test:gallery
```

The install command is only needed once on supported local/CI systems. On NixOS,
use a compatible system Chromium instead of installing a downloaded browser:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/absolute/path/to/chrome \
  pnpm --filter @workspace/transcendent-gallery run test:gallery
```

Tests default to the shared preview proxy at `http://localhost:80/`. To test
another **development preview**, set `GALLERY_TEST_URL` to its full URL, including
any base path and a trailing `/`. The suite does not launch servers or require
the API/database. It blocks all non-read HTTP requests and fails if a test
attempts one; it never submits or fills the enquiry form.

`tests/gallery/` covers every category and empty-state recovery, loaded grid and
viewer images, real mouse Next/Previous (including image pointer interception),
wraparound, keyboard arrows/Escape, and focus return to the exact opener.
Touch checks run at 320×568, 390×844, and 844×390 and check both document overflow
and individual gallery/viewer bounds so hidden overflow cannot mask clipped
controls. Expectations use the current portfolio metadata, not a duplicate
hardcoded photo list. The data/assets check above remains a separate check.

Failures save screenshots and Playwright traces under
`generated-artifacts/gallery-results/` (excluded from Git/deployment). To open a
trace, run `pnpm --filter @workspace/transcendent-gallery exec playwright show-trace`
followed by the path to its `trace.zip`. To run just desktop checks, append
`--project=desktop-mouse` to the `test:gallery` command. There are no automatic
retries, so a broken interaction is not hidden by a passing retry.

The contact form and backend were not changed by this portfolio update.
