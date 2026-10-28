#!/usr/bin/env bash
# Run from a clean checkout without the API, database, or client originals.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

export CI=true
export PORT=4173
export BASE_PATH=/
export GALLERY_TEST_URL="http://127.0.0.1:${PORT}/"

mkdir -p generated-artifacts
pnpm --filter @workspace/transcendent-gallery run dev \
  > generated-artifacts/gallery-frontend.log 2>&1 &
frontend_pid=$!

cleanup() {
  kill "$frontend_pid" 2>/dev/null || true
  wait "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

ready=false
for ((attempt = 0; attempt < 60; attempt++)); do
  if ! kill -0 "$frontend_pid" 2>/dev/null; then
    echo "Gallery frontend exited before becoming ready." >&2
    cat generated-artifacts/gallery-frontend.log >&2
    exit 1
  fi
  if curl --fail --silent --max-time 2 "$GALLERY_TEST_URL" > /dev/null; then
    ready=true
    break
  fi
  sleep 1
done

if [[ "$ready" != true ]]; then
  echo "Gallery frontend did not become ready at $GALLERY_TEST_URL." >&2
  cat generated-artifacts/gallery-frontend.log >&2
  exit 1
fi

# This package script selects tests/gallery/playwright.config.mjs, not contact tests.
pnpm --filter @workspace/transcendent-gallery run test:gallery
