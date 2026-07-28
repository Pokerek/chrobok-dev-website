---
paths:
  - "src/**/*.astro"
  - "src/pages/api/**/*.ts"
  - "src/middleware/**/*.ts"
  - "astro.config.mjs"
---

# Astro

- Everything is `.astro`. This page ships **no client JavaScript** — there is no UI framework installed
  and no `client:` directive anywhere. Reach for native HTML (`<details>`, `<picture>`, anchors) before
  proposing any script; adding an island means reversing S-07 and needs a real requirement behind it.
- Use the View Transitions API (`ClientRouter`) for page transitions.
- Use type-safe content collections for blog posts, docs, and similar structured content.
- Use the Astro Image integration for image optimization.
- Implement hybrid rendering — server-render only the routes that need it.

## Server Endpoints (`src/pages/api`)

- Handlers are uppercase: `export const GET`, `export const POST`.
- Set `export const prerender = false` on API routes.
- Validate input with Zod.
- Keep business logic out of the route — extract it into services under `src/lib/services`.

## Runtime

- `Astro.cookies` for server-side cookie management.
- `import.meta.env` for environment variables.
- Use middleware (`src/middleware/index.ts`) for request/response modification.
