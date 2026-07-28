<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Footer Contact (S-05)

- **Plan**: `context/changes/footer-contact/plan.md`
- **Scope**: All 3 phases (full plan review)
- **Date**: 2026-07-28
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 5 observations

5/5 planned items MATCH. 0 DRIFT, 0 MISSING. No production file was touched that the plan did not name.

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING (F1 — plan document, not code) |
| Scope Discipline | WARNING (F2 — docs-only extra) |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | WARNING (F3, F4, F5) |
| Success Criteria | PASS |

## Automated criteria — all 13 re-run and passing

`yarn build` clean · `yarn lint` clean · zero `download=` in `src/` · email and CV path appear exactly once
each, both in `contact.constants.ts` · no hard-coded colour utilities in `src/components` or `src/layouts` ·
exactly one `<section id="contact">` in `dist/index.html` · `<footer>` byte-identical to the shipped
copyright strip · **zero `<script>` tags in `dist/index.html`** · `dist/karol_chrobok_cv.pdf` present.

`curl` against the LinkedIn URL returns `999` — LinkedIn's anti-automation status, already documented in
`inspection.md:118` with a real browser load as the evidence. Not a regression.

## Manual criteria — evidence-backed, not rubber-stamped

`inspection.md` carries per-claim evidence (measured element geometry, computed WCAG ratios, traced tab
order) and explicitly separates machine-measured results from author-confirmed ones (WebKit, screen reader,
mail composer). No manual checkbox lacks observable backing.

## Done right

- The plan's stated key risk — the `sr-only` span landing after `</a>`, leaving the link unlabelled for the
  change of context — was avoided. `Contact.astro:27,31` place it inside, matching `About.astro:44`, and
  `inspection.md:61-71` verifies the computed style and resulting accessible name, including a caveat that
  Chrome's a11y-tree dump under-reports it so nobody re-reads that as a defect.
- Comment discipline matches the recorded project lesson. One comment across four changed files
  (`Contact.astro:8-9`), recording a genuine non-obvious constraint — a style override against an
  F-01-frozen directory. No comment restates its code.

## Findings

### F1 — Plan's unamended sections still describe the superseded footer shape

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `context/changes/footer-contact/plan.md` — Overview, Current State, Desired End State, Implementation Approach, Critical Implementation Details, Testing Strategy, Performance Considerations, Migration Notes
- **Detail**: Phase 2 carried the amendment banner, but eight other sections still described the abandoned
  shape — `Footer.astro` becoming the contact block, `Section.astro` growing an `as` prop, a Critical
  Implementation Detail mandating the capitalised dynamic-tag binding, and Desired End State wrongly placing
  the copyright line inside the contact block. Current State also claimed `Footer.astro:5` used
  `border-black`, already fixed in F-01. The implementation was correct; the document lied, and every future
  review reads it as ground truth.
- **Fix**: Amend the stale sections to the implemented shape; drop the dynamic-tag Critical Implementation
  Detail.
- **Decision**: FIXED — 12 edits applied. Left intentionally: the plan title, `Footer.astro` references that
  remain factually correct, and Progress row 2.7's wording (the Progress format convention forbids renaming
  step titles).

### F2 — roadmap.md modified without being named in Changes Required

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: `context/foundation/roadmap.md` (+21 lines under S-07)
- **Detail**: A "Carried-in work (found during S-05): extract a `Link` component" block was appended to the
  S-07 slice. Phase 3's Changes Required names only `inspection.md`. Phase 3's prose does sanction recording
  findings "as carried-in work for S-07", so this is in-spirit but out-of-contract. Docs only.
- **Fix**: Name `roadmap.md` as a Phase 3 output in Changes Required.
- **Decision**: SKIPPED — the change is correct and already recorded in `change.md`.

### F3 — Hero's buttons lack the wrap guard both siblings apply

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: `src/components/hero/Hero.astro:25-26`
- **Detail**: Hero renders bare `buttonStyles({ variant: 'outline' })`, keeping the pinned `h-10` from
  `button.styles.ts:14`. `About.astro:39` and `Contact.astro:10` both override it with `h-auto min-h-10`
  because a wrapped label overflows the fixed box. The plan explicitly froze Hero's skin, so this is
  plan-compliant, not drift — and `inspection.md:161` measured hero at 200% zoom with no clipping (boxes
  grew to 80px). What is new is the coupling: `CV_LABEL` is one shared constant both components render
  verbatim, so lengthening it clips in the hero while rendering fine in Contact.
- **Fix**: Apply the `cn(buttonStyles(...), 'h-auto min-h-10 text-center')` override in Hero, or remove the
  workaround entirely via the S-07 `Link` component.
- **Decision**: SKIPPED — deferred to S-07, already tracked at `roadmap.md:231-234`. Fixing here would
  re-derive the workaround a fourth time instead of removing it.

### F4 — LOCATION holds half the fact

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/constants/contact.constants.ts:11`, `src/components/contact/Contact.astro:22`
- **Detail**: The constant is `'Silesia, Poland'`; the call site renders `{LOCATION} &mdash; remote`. The
  plan asked for the *separator* at the call site (correct as built), but described `LOCATION` as "the
  location line". The remote-work claim — a kariera-vault-governed fact — now lives in markup and cannot be
  changed from the constants module. One consumer today, so nothing is inconsistent yet.
- **Fix**: Export a sibling `WORK_MODE = 'remote'`, or fold it into `LOCATION`.
- **Decision**: SKIPPED — revisit if a second call site appears.

### F5 — Email link bypasses the `link` button variant with no in-code record

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/components/contact/Contact.astro:19`
- **Detail**: Raw `class="underline underline-offset-4"` where `button.styles.ts:10` defines a `link`
  variant. The plan justifies it (CVA `defaultVariants` force `size: 'default'`'s `h-10 px-6 py-2`, with no
  opt-out), but the code carries no trace of that reasoning, and the behaviour differs twice: always
  underlined vs. underline-on-hover, and no `transition-colors`. A future reader will "fix" this back to the
  variant and regress the layout.
- **Fix**: Fold the missing `size: 'none'` escape hatch into the S-07 `Link` work.
- **Decision**: SKIPPED — deferred to S-07, already tracked at `roadmap.md:239-241`.

### F6 — 140 kB unreferenced React client bundle shipped to dist/

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture (pre-existing, not caused by this slice)
- **Location**: `dist/_astro/client.BwmHNfYO.js` — emitted by `@astrojs/react`
- **Detail**: `yarn build` emits a ~143 kB client bundle. `index.html` references no script at all, so no
  user fetches it — but it is deployed. Neither `button.tsx` nor `tag.tsx` is rendered anywhere in `src/`;
  only `buttonStyles` and `tagStyles` are imported for their class strings. The site currently ships no
  React.
- **Fix**: Record as an open question on the S-08 production-cutover slice.
- **Decision**: FIXED — added as an S-08 unknown in `context/foundation/roadmap.md` (Block: no).

### F7 — JOURNAL_URL left local while the other profile URLs centralised

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/components/about/About.astro:7`
- **Detail**: Two of three profile URLs now live in `contact.constants.ts`; the Instagram journal link is
  still a local frontmatter const — the exact pattern this slice removed from Hero. The plan deliberately
  excluded it ("Not moving `JOURNAL_URL`… consolidation belongs to S-06 or S-07"), so scope was respected on
  purpose. Recorded so the inconsistency reads as a decision, not an oversight.
- **Fix**: Move `JOURNAL_URL` into the constants module.
- **Decision**: SKIPPED — deferred to S-06/S-07 as the plan intended.
