<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Hero — First Screen

- **Plan**: `context/changes/hero-first-screen/plan.md`
- **Scope**: Phases 1–2 of 2 (full plan)
- **Date**: 2026-07-26
- **Verdict**: NEEDS ATTENTION (at time of review) → all findings triaged
- **Findings**: 0 critical, 4 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | WARNING |

## Automated re-verification

Re-run against the working tree during this review, all passing:

- `yarn build` (includes `astro check`) ✅
- `yarn lint` ✅
- `grep -ri "work in progress" dist/` → 0 matches ✅
- `grep -c "<h1" dist/index.html` → 1 ✅
- `grep -c "astro-island" dist/index.html` → 0 ✅
- `<script` tags in `dist/index.html` → 0 ✅
- `dist/karol_chrobok_cv.pdf` present, 115.8 KB ✅
- Raw HTML carries name, role, stack, positioning line and both hrefs ✅

## Findings

### F1 — Email CTA ships as `outline`, not the planned filled `default`

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `src/components/hero/Hero.astro:29`
- **Detail**: `plan.md` specified Email as `variant: 'default'` (filled) and CV as `outline`. Both anchors
  ship `outline`; the built HTML shows byte-identical class strings, so the primary contact action has no
  visual priority over the secondary one.
- **Fix**: Change the Email anchor to `buttonStyles({ variant: 'default' })`.
- **Decision**: ACCEPTED — the matched `outline` pair is a deliberate decision the author took after
  looking at the rendered page. Visual hierarchy is carried by order and copy instead of fill. The plan
  text was updated to match (see F4).

### F2 — Two Progress boxes assert things the code contradicts

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: `context/changes/hero-first-screen/plan.md` — Progress items 1.4 and 1.6
- **Detail**: 1.6 was checked as "email filled, CV outline", which the shipped code contradicts. 1.4 "No
  monk image reference survives" was checked and its grep does pass, but only because `astro:assets`
  renames the file — the illustration is in the build by design, so a green check meant the opposite of
  what the criterion was written to prove.
- **Fix**: Re-word both criteria to statements that are true and re-verifiable.
- **Decision**: FIXED — 1.4 now reads "No `public/images/monk.webp` reference survives — the illustration
  returns via `astro:assets`"; 1.6 now records the deliberate both-`outline` decision and notes that it
  supersedes the Phase 1 contract.

### F3 — Image breakpoint is `md:`, deviation note said `lg:`

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `src/components/hero/Hero.astro:15, 33`
- **Detail**: The recorded deviation described `lg:grid-cols-2` with the image `hidden lg:block`. The code
  uses `md:` for both, so the two-column split and the illustration appear from 768px rather than 1024px,
  while the fold budget in 2.3 was measured text-only.
- **Fix**: Amend the deviation note to `md:`, keeping the shipped breakpoint.
- **Decision**: FIXED — plan deviation note now says `md:grid-cols-2` / `hidden md:block`.

### F4 — Phase 1 contract text described the pre-deviation CV link and button variant

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `context/changes/hero-first-screen/plan.md` — deviation note, Phase 1 CTA contract, manual
  criterion for the CV link
- **Detail**: Four stale references: two instances of `href="/cv/karol-chrobok-cv.pdf"` (build serves
  `/karol_chrobok_cv.pdf`), `download="karol-chrobok-cv.pdf"` (code emits `karol-chrobok-en-cv.pdf`), and
  Email as `variant: 'default'` (both CTAs ship `outline`).
- **Fix**: Update all four to match the shipped code.
- **Decision**: FIXED — path, download filename and Email variant corrected; a sentence was added
  explaining why both CTAs use `outline`.

### F5 — `cn()` wrapping a single argument

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/components/hero/Hero.astro:28-29`
- **Detail**: `cn(buttonStyles({ variant: 'outline' }))` had nothing to merge — `cn` exists to reconcile a
  variant string with caller overrides, and there was no override.
- **Fix**: Pass `buttonStyles({ variant: 'outline' })` directly.
- **Decision**: FIXED — wrapper dropped on both anchors and the now-unused `cn` import removed. Rebuilt:
  the rendered class attributes are byte-identical.

### F6 — `space-y-2` alongside the spacing tokens

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/components/hero/Hero.astro:16`
- **Detail**: The component uses `space-y-element` / `gap-element` / `gap-grid` everywhere except the
  identity block, which uses raw `space-y-2`. There is no 0.5rem token in the F-01 scale, so this is a gap
  in the scale rather than a careless choice — and F-01 is frozen, so adding one here is out of bounds.
- **Fix**: Leave as-is; revisit if the scale is ever revised.
- **Decision**: SKIPPED.

### F7 — `dist/` ships a 143 kB React client chunk no page references

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `dist/_astro/client.*.js`
- **Detail**: The build emits a 143 kB (46 kB gzip) React runtime chunk that `index.html` does not
  reference — the page has 0 script tags, so NFR-3 holds and visitors download none of it. Pre-existing
  output of the `react()` integration, not introduced by this slice.
- **Fix**: None needed.
- **Decision**: SKIPPED — noted as expected output.
