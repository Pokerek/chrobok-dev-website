---
change_id: inspection-hardening-pass
title: Inspection hardening pass
status: planned
created: 2026-07-28
updated: 2026-07-28
archived_at: null
---

## Notes

Roadmap slice S-07 (`context/foundation/roadmap.md:210-250`), Linear CHR-37.

Two regressions found during planning that the roadmap did not know about:

- **The webfonts have never shipped.** `src/styles/globals.css:6-8` places the `@fontsource`
  `@import`s after the `@tailwind` directives, so PostCSS drops them silently — and
  `@fontsource/ramaraja/700.css` does not exist (the package ships weight 400 only). The built CSS
  contains zero `@font-face` rules and `dist/` contains no woff2. Production renders in system
  serif and monospace.
- **`monk.webp` is fetched on phones and never displayed.** `Hero.astro:30` uses `hidden md:block`,
  which does not prevent the request.

Cross-change resolution: this plan answers the open question parked in
`context/changes/astro-constants-extraction/change.md` — `.astro` `Props` types move to a sibling
`.types.ts`, declared with `type`. The frontmatter *data* extraction remains that change's work.

Phase 4 (React removal) is self-contained and droppable: it reverses an F-01 stack decision and
carries CLAUDE.md, `components.json`, `tsconfig.json`, `eslint.config.js` and two `.claude/rules/`
files with it.
