---
change_id: design-system-contract
title: Design-system and layout contract
status: new
created: 2026-07-24
updated: 2026-07-24
archived_at: null
---

## Notes

Roadmap **F-01** (`context/foundation/roadmap.md`) — foundation slice, unblocks S-01…S-05.

Settles the page skeleton + token contract so no content slice re-opens a visual decision.
Author decisions (2026-07-24): section-level `label | content` grid collapsing below `md`;
Ramaraja 700 + IBM Plex Mono frozen; motion limited to `transition-colors`.

Retires the four recorded design risks: radius scale leaking through `rounded-md`/`rounded-lg`,
undefined focus-ring colour, hard-coded `border-black` in `Footer.astro`, shadcn `cssVariables`
clash with the named tokens.

Implemented on branch `feat/design-system-contract` (commit `c145cac`). Merges to `development`.
