/**
 * Kept in sync with scripts/generate-og-image.sh, which writes the committed PNG.
 * Scrapers use the declared width and height to reserve the card before the image loads,
 * so these must match the file on disk.
 */
export const OG_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
} as const;
