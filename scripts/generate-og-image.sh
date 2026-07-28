#!/usr/bin/env bash
# scripts/generate-og-image.sh — regenerate public/og-image.png from the hero asset.
#
# The output is committed, so this script exists to make that binary reproducible rather
# than to run in the build. Re-run it after changing src/assets/monk.webp or the palette.
#
# The card carries no name or role text on purpose: og:title and og:description supply
# those, and every scraper renders them beside the image.
set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE="src/assets/monk.webp"
OUTPUT="public/og-image.png"

# 1200x630 is the OpenGraph summary_large_image size every major scraper expects.
WIDTH=1200
HEIGHT=630

# Design-system tokens (tailwind.config.mjs): page-bg and border-default.
PAGE_BG="#FAFAFA"
BORDER="#000000"
BORDER_WIDTH=2

# Leaves the monk inset from the border rather than filling the card edge to edge.
ARTWORK_HEIGHT=480

magick "$SOURCE" -resize "x${ARTWORK_HEIGHT}" \
  -background "$PAGE_BG" -gravity center -extent "${WIDTH}x${HEIGHT}" \
  -bordercolor "$BORDER" -shave "${BORDER_WIDTH}x${BORDER_WIDTH}" \
  -border "$BORDER_WIDTH" \
  "$OUTPUT"

magick identify "$OUTPUT"
