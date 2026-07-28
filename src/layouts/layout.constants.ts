/**
 * Must match public/og-image.png on disk — scrapers use the declared width and height to
 * reserve the card before the image loads.
 */
export const OG_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
} as const;
