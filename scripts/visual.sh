#!/bin/sh
# Runs the visual tests in Playwright's Linux image, the same one CI uses,
# so screenshots match no matter which OS you work on.
# Usage: npm run test:visual [-- --update-snapshots]
set -e

version=$(node -p "require('@playwright/test/package.json').version")

# The anonymous volume on node_modules keeps the Linux install inside the
# container, so it never overwrites your local (e.g. macOS) node_modules.
docker run --rm --ipc=host \
  -v "$PWD":/work -v /work/node_modules -w /work \
  "mcr.microsoft.com/playwright:v${version}-noble" \
  sh -c "npm ci --silent && npm run build --silent && npx playwright test --project=visual $*"
