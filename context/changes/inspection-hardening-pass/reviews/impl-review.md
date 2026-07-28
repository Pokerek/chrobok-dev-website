<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Inspection Hardening Pass

- **Plan**: `context/changes/inspection-hardening-pass/plan.md`
- **Scope**: Phases 1-5 (all)
- **Date**: 2026-07-28
- **Verdict**: NEEDS ATTENTION (at review time) → all findings triaged, 6 fixed / 1 skipped
- **Findings**: 0 critical, 2 warnings, 6 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | WARNING |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

26 of 27 planned items matched. No scope-guardrail violations. All automated gates green.

## Automated verification

`yarn build` and `yarn lint` pass. Every phase criterion verified: 3 `@font-face` rules and 3 woff2
in `dist/`, no telugu subset, 0 `interface` in `src/`, 0 `h-auto min-h-10`, 0 `buttonStyles` in
`src/components/`, 3× `noopener noreferrer`, 7 `og:` tags, canonical present, og-image exactly
1200×630, the 768px media source present, zero `.js` in `dist/_astro/`, `TagVariant` intact, and all
23 hrefs resolve.

Two criteria are **mis-specified rather than failing** — worth correcting before S-08 reuses them:

- `grep -c "@font-face" dist/_astro/*.css` returns 1 because the built CSS is minified onto one
  line. There are genuinely 3 rules; count occurrences (`grep -o … | wc -l`), not lines.
- `grep -rc "react" src/` returns 6 because the page's *copy* names React as a skill
  (`Skills.astro`, `Hero.astro`, `index.astro`, and "reactivation" in `SologyRole.astro`).
  Case-sensitively it is 1. No React code references exist.

A third of the same class was introduced and avoided during triage: the F7 provenance comment
originally contained the literal `@fontsource`, tripping the "no stale imports" gate. Reworded so
the gate stays meaningful.

## Manual criteria

No rubber-stamping. Every ticked manual item has supporting evidence in the diff or a recorded
measurement; 5.5 (axe) is honestly left unchecked; 2.8 / 5.7 are marked n/a with the reason.

## Scope discipline

All four unplanned files are downstream consequences of authorized work:

- `src/layouts/layout.constants.ts` holds **new** OG data, not an extraction — it does not touch
  `astro-constants-extraction`'s territory.
- `.claude/rules/design-system.md`, `.claude/rules/tailwind.md` and
  `context/foundation/design-notes.md` correct statements Phases 1 and 4 made false.

`Hero.astro` keeping `TRANSPARENT_PIXEL` in frontmatter is **correct here** — the plan explicitly
reserves Hero's frontmatter for the other change.

## Findings

### F1 — Link primitive is split across two directories

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence / Architecture / Pattern Consistency
- **Location**: `src/ui/base/link/link.styles.ts`, `src/components/layout/Link.astro`,
  `src/components/layout/link.types.ts`
- **Detail**: The plan put all three Link files in `src/components/layout/` (plan.md:293).
  Implementation moved only `link.styles.ts` to `src/ui/base/link/`, leaving that folder holding one
  file while `Link.astro` and `link.types.ts` stayed in `components/layout/` — and `link.types.ts:3`
  imported back across the boundary. This matched neither documented shape: CLAUDE.md:57-63 requires
  the trio together, as does the design-system checklist edited in this same branch. `button/` and
  `tag/` colocate; `Section.astro` lives wholly in `components/layout` with no `ui/base` folder. The
  rationale existed only in commit f60ec8a's message, and plan.md still documented the abandoned
  path. Secondary: `bordered` gained `flex w-fit` beyond the planned `text-center` — behaviourally
  correct, undocumented.
- **Fix A ⭐ Recommended**: Move `Link.astro` + `link.types.ts` into `src/ui/base/link/`.
  - Strength: satisfies both documented conventions; kills the cross-boundary import; keeps
    `.claude/rules/tailwind.md`'s `cn()` example honest.
  - Tradeoff: Link renders markup, unlike its style-contract-only neighbours.
  - Confidence: HIGH — the convention is written down twice and both readings agree.
  - Blind spot: path aliasing after the move.
- **Fix B**: Move `link.styles.ts` back to `components/layout/`.
  - Strength: follows the `Section.astro` precedent; restores what the plan specified.
  - Tradeoff: `components/` then reaches into `ui/`, the direction the move avoided.
  - Confidence: MEDIUM.
- **Decision**: FIXED via Fix A. All three files now in `src/ui/base/link/`; internal imports
  relative; three call sites re-pointed to `../../ui/base/link/Link.astro`. plan.md updated with a
  "Landed differently" note recording the placement rationale and the `flex w-fit` addition.

### F2 — A caller can emit `target="_blank"` without the rel

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `src/ui/base/link/Link.astro:16`
- **Detail**: `{...externalAttributes} {...rest}` spreads `rest` last, so caller props win.
  `LinkProps` extends `HTMLAttributes<'a'>`, which permits `target` and `rel`, so
  `<Link href={x} target="_blank">` compiles and emits `target` with no `rel` — the exact
  tabnabbing vector the comment three lines above says must never be separated. Phase 2's goal was
  to make this contract structural rather than remembered; the runtime coupling is structural, the
  type is not. No current call site does this — all six go through `external`.
- **Fix**: `Omit<HTMLAttributes<'a'>, 'target' | 'rel'>` in `link.types.ts`, so the bypass stops
  compiling.
- **Decision**: SKIPPED — owner's call. Still open; the type permits the bypass.

### F3 — Ramaraja's unicode-range overclaims its coverage

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Safety & Quality
- **Location**: `src/styles/globals.css:26-28`
- **Detail**: All three faces declared a byte-identical `unicode-range`; upstream Fontsource ships
  none at all, so it was hand-written and copy-pasted. Measured with fontTools: Ramaraja carries 122
  codepoints and covers 7 of the 64 in U+00C0-00FF (no ó é ä ç ñ · € −); IBM Plex Mono carries 229
  and covers all 64, so only Ramaraja's was wrong. **This does not cause tofu** — CSS font matching
  falls through to the next family when a face lacks a glyph, so "ó" renders in the system serif.
  The cost was a mid-word typeface switch on any Polish heading plus a misleading declaration.
- **Fix**: Drop `unicode-range` from the Ramaraja face — single-subset file, the property cannot
  save a download and can only be wrong.
- **Decision**: FIXED. Replaced with a comment recording the measured coverage and why the property
  is absent.

### F4 — The inspection runbook has no reflow/zoom check

- **Severity**: 📋 OBSERVATION
- **Impact**: 🔎 MEDIUM
- **Dimension**: Success Criteria
- **Location**: `docs/nfr-inspection.md`
- **Detail**: grep for reflow / 1.4.10 / 200% / zoom returned nothing, yet 200% text zoom surfaced
  both real defects this slice found — the Contact email overflow (fixed, 136720c) and the nav
  container padding (open). Phase 5 amended the runbook for the browser matrix but not for the check
  that actually caught bugs. NFR-2 scopes its WCAG AA claim to *text contrast*, so the open reflow
  defect breaches no NFR — this is about runbook coverage, not conformance.
- **Fix**: Add a 200%-text-zoom / reflow step to the NFR-2 section.
- **Decision**: FIXED. Step added, with a note that it is expected to fail on the known nav defect
  until that is fixed, that it uses text zoom rather than page zoom, and that axe cannot see 1.4.10.

### F5 — `buttonStyles`' unreachable sizes keep the fixed-height bug

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Pattern Consistency
- **Location**: `src/ui/base/button/button.styles.ts:12-17`
- **Detail**: The only consumer is `link.styles.ts`, calling `{ variant: 'outline' }` at the default
  size, so `sm`/`lg`/`icon` are unreachable — and `sm: 'h-9'`, `lg: 'h-11'` still carried the exact
  clipping bug `default` was just fixed for (`h-10` → `min-h-10`).
- **Fix**: Convert `sm` and `lg` to `min-h-*`.
- **Decision**: FIXED. `icon` deliberately left fixed (square, no label to wrap); comment records
  why.

### F6 — `tailwindcss-animate` survived the shadcn removal

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Pattern Consistency
- **Location**: `tailwind.config.mjs:67`, `package.json` devDependencies
- **Detail**: Phase 4 deleted `components.json` and `ui-shadcn.md` but left the plugin and its
  devDependency. Nothing used its utilities, and `design-system.md` caps motion at
  `transition-colors` — so it contradicted the design system beside it. Not on Phase 4's package
  list, so completeness rather than drift.
- **Fix**: Remove the plugin and the devDependency.
- **Decision**: FIXED. `plugins: []`; package uninstalled.

### F7 — Fontsource packages kept with no recorded reason

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Pattern Consistency
- **Location**: `package.json:33-34`
- **Detail**: Both packages remained in `dependencies` with zero imports. They were the
  byte-identical provenance of the committed woff2 files, so they carried the upgrade path — but
  nothing recorded that, so the next cleanup pass would delete them and lose it.
- **Fix**: Remove both packages.
- **Decision**: FIXED. Both uninstalled. Because removal drops exactly the provenance the finding
  named, a note in the `globals.css` header now records where the committed files came from and what
  upgrading a face requires.

### F8 — CLAUDE.md names a file `button/` no longer has

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Pattern Consistency
- **Location**: `CLAUDE.md:64-65`
- **Detail**: "A primitive that is only a style contract (`button`, `tag`) is just the `.styles.ts`
  and `.types.ts`" — but Phase 4 deleted `button.types.ts`, so `button/` holds only
  `button.styles.ts`. The doc was edited in this branch and still disagreed with the tree.
- **Fix**: Make `.types.ts` conditional on there being a type worth exporting.
- **Decision**: FIXED. Reworded, naming `tag`'s `TagVariant` as the case that earns a `.types.ts`
  and `button` as the case that does not.

## Review process note

The safety sub-agent reported it had verified font coverage with `fc-query`. `fc-query` cannot read
woff2 at all (it errors with "Can't query face"), so that evidence did not hold. The finding was
re-verified independently with fontTools, which confirmed the coverage gap but showed the agent's
stated consequence (tofu) was wrong — see F3.
