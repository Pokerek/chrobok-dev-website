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
- **Fixed — WCAG 2.1 AA 1.4.10 Reflow, email address.** The Contact email is a single unbreakable
  token; at 200% text on a 375px viewport it measured 422px in a ~232px column and pushed the page
  to 486px against a 360px viewport, cutting the address off mid-string. `break-all` on the `inline`
  link variant fixes it: the address now wraps to two lines at 230px and reads in full. Pre-existing
  — the anchor's classes were unchanged by this slice — and axe does not test reflow, so only the
  manual run would have caught it.

- **Open defect — residual 30px horizontal scroll at 200% text on mobile.** Separate root cause,
  left unfixed. The four mobile-menu anchors in `Navigation.astro` carry Tailwind's `container`,
  whose `2rem` side padding doubles to 64px each at 200% text — 128px of padding in a menu column
  that is narrower than that, so each anchor overflows to 376px against a 360px viewport. Present
  whether the `<details>` is open or closed, and unchanged by swapping `container` for
  `px-container` (same 2rem token). Nothing is visibly clipped; the symptom is a short scrollbar
  over empty space. Pre-existing S-06 nav code, outside this slice's contract, and a fix touches the
  sticky-nav layout — raised rather than absorbed, per the Phase 5 defect policy.
