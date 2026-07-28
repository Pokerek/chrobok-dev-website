---
change_id: inspection-hardening-pass
title: Inspection hardening pass
status: implementing
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

## Decisions taken during the inspection run (Phase 5)

- **The `sr-only` "(opens in a new tab)" suffix was removed from all three external links.** Owner's
  call: the pattern carries no value for this site. It is an advisory technique, not a WCAG 2.1 AA
  requirement, so the NFR-2 claim is unaffected. `target="_blank"` and `rel="noopener noreferrer"`
  stay coupled in `Link.astro` — the rel is a tabnabbing control, not an accessibility affordance.
  This reverses part of the S-04 risk mitigation recorded at `context/foundation/roadmap.md:236-238`.
  Consequences: criterion 2.5's "opens in a new tab" clause and criteria 2.8 / 5.7 no longer apply;
  the `noopener noreferrer` count of 3 still holds.
- **Criterion 5.5 (axe DevTools) was skipped**, not run.
- **Open defect — WCAG 2.1 AA 1.4.10 Reflow.** The Contact email address is a single unbreakable
  token; at 200% text on a 375px viewport it measures 422px in a ~232px column and forces horizontal
  page scroll (486px vs 360px). At the formal test condition — 1280px viewport at 400% zoom — the
  page scrolls to 1933px against a 1265px viewport. Pre-existing: the anchor's classes are unchanged
  by this slice, and axe does not test reflow, so nothing else would have caught it. Fix is one line
  in `link.styles.ts` (`break-all` on the `inline` variant). Not yet applied.
