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

The contact form and backend were not changed by this portfolio update.
