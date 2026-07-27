<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Skills — Two Honest Tiers

- **Plan**: `context/changes/skills-two-tier/plan.md`
- **Scope**: Phases 1–3 of 3 (all)
- **Date**: 2026-07-27
- **Verdict**: NEEDS ATTENTION
- **Findings**: 1 critical, 3 warnings, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | WARNING |
| Pattern Consistency | WARNING |
| Success Criteria | FAIL |

The code side is clean: all five planned changes verified MATCH, all 26 chips exact against the plan
table, no unplanned files, no `What We're NOT Doing` violations, and no tier contradiction between
Skills and `SologyRole` across the thirteen shared technologies. The failures are in content truth and
in the manual criteria that were supposed to catch it.

**Rubric note**: F1 is CRITICAL severity against a FAIL dimension, which the rubric maps to REJECTED.
Recorded as NEEDS ATTENTION instead — the REJECTED bar is written for security, data safety, major
drift and failing tests, and this is a one-word content fix. The deviation is flagged rather than
buried.

**Automated verification re-run on the final state**: `yarn build` passes (astro check clean, 1 page
built), `yarn lint` passes (0 problems). Re-run again after the F2/F3 fixes — both still pass.

**Cleared during review**: the `border-dashed` tier signal does render (the CVA base class string
carries a `border` width; confirmed in built CSS and `dist/index.html`), and the technologies shared
between Skills and `SologyRole` agree on tier without exception.

## Findings

### F1 — "React 19" is unsupported by any source

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `src/components/skills/Skills.astro:30`
- **Detail**: The chip ships as "React 19" in the core tier — the tier whose own legend
  (`Skills.astro:11`) reads "used daily, and defensible in a technical interview". Every source says
  React 18: `kariera/02-umiejetnosci.md:42` (`| **React 18** | **core** |`), `03-doswiadczenie.md:202`,
  `04-materialy-cv.md:160/189/259`, and every `cv-en.html` under `kariera/aplikacje/`. A grep across
  the whole vault returns zero occurrences of "React 19". This repo is React 18 (CLAUDE.md). Next.js 14
  on the next line is correct, so the version numbers are not decorative — a reader takes them
  literally. The error originates in the plan (`plan.md:169`), so implementation matched it faithfully
  and drift detection could not catch it. What should have caught it is Phase 3 criterion 3.2 — "every
  chip traceable to a core or uzupełniające row" — which is marked `[x]` against commit `ac5b614`.
  React 19 has no vault row. That checkbox is a rubber stamp, which is why this lands as a Success
  Criteria FAIL rather than a content nit.
- **Fix**: Change to `React 18`, or drop the version number entirely (no other chip carries one except
  Next.js 14).
- **Decision**: SKIPPED

### F2 — Solid chips on the Meetmedia stack read as a core claim

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Architecture
- **Location**: `src/components/work/MeetmediaRole.astro:33` (stack at `:5`)
- **Detail**: Amendment point 3 restyled the Work tags so that "dashed never means two different things
  on one page". The converse now bites: after the CVA default, `tagStyles()` emits `border-solid`, so
  every chip in the 2019–2020 historical stack — including jQuery and PHP — renders in the same visual
  register the Skills legend defines as "used daily, and defensible in a technical interview". The vault
  marks both jQuery and PHP *liznięte* with an explicit "Nie wpisywać jako skill"
  (`02-umiejetnosci.md:37,69`). Sass makes it concrete: it renders solid under Work and dashed under
  Skills — the one technology whose border style contradicts itself across the page. Compounding it,
  `index.astro` mounts Work before Skills, so the reader meets the encoded chips before the legend that
  decodes them; `SologyRole` is self-decoding via visible Core/Supporting captions, `MeetmediaRole` is
  not.
- **Fix A ⭐ Recommended**: Add a third `tier` value (e.g. `historical`) for MeetmediaRole's stack, with
  a matching legend row.
  - Strength: Closes the vocabulary honestly — a 2019 stack stops making the page's strongest claim, and
    the axis stays the single source of tier truth.
  - Tradeoff: Three 1px border styles on small chips is close to the limit of what reads as distinct.
  - Confidence: MED — mechanically trivial, but the visual legibility of a third border style is
    unverified.
  - Blind spot: Haven't checked how dotted vs dashed reads at 320px.
- **Fix B**: Reword the caption at `MeetmediaRole.astro:31` to explicitly disclaim a current skill claim.
  - Strength: Zero visual risk, one line, and the caption is already doing this job half-way.
  - Tradeoff: The chip vocabulary stays genuinely ambiguous; the fix depends on the reader reading the
    caption.
  - Confidence: HIGH — pure copy change, no build surface.
  - Blind spot: Doesn't help a screen-reader user scanning the list without its caption.
- **Decision**: FIXED via Fix B — caption now reads "Stack at the time — not a current skill claim".

### F3 — Only supporting chips carry the sr-only annotation

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality (accessibility)
- **Location**: `src/components/skills/Skills.astro:121`
- **Detail**: `{item.tier === 'supporting' && <span class="sr-only">…(supporting)</span>}` annotated one
  tier only. A screen-reader user hears the legend define two tiers, then hears bare "TypeScript",
  "JavaScript", "HTML" — nothing distinguishes "core" from "unlabelled". Sighted users got a closed
  two-value system; SR users got one value plus silence. (The `&nbsp;` separator is correct and survives
  to `dist` — the announcement is "Node.js (supporting)", not run together.)
- **Fix A ⭐ Recommended**: Annotate both tiers — emit `(core)` / `(supporting)` unconditionally from
  `item.tier`.
  - Strength: Makes the convention self-describing regardless of whether the legend was reached; removes
    the special case from the template.
  - Tradeoff: Adds a spoken suffix to every chip — more verbose to listen through.
  - Confidence: HIGH — same mechanism already proven in dist output.
  - Blind spot: None significant.
- **Fix B**: Keep the asymmetry, extend the Core `<dd>` at `Skills.astro:11` to state "chips not marked
  supporting are core".
  - Strength: Keeps the chip list terse to listen to.
  - Tradeoff: Only works if the user hears the legend first and retains it across eight category lists.
  - Confidence: MED — correct but depends on reading order.
  - Blind spot: Haven't tested how the `<dl>` legend is announced in the label slot.
- **Decision**: FIXED via Fix A — verified in `dist/index.html`: 17 `(core)` and 9 `(supporting)`
  annotations across the 26 chips.

### F4 — Tag primitive misses the design-system forwardRef requirement

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/ui/base/tag/tag.tsx:7`
- **Detail**: `.claude/rules/design-system.md:55` requires the "`forwardRef` pattern, with `displayName`
  set" for every `src/ui/base` component. The sibling primitive complies (`button.tsx:1,11,18`). `Tag`
  is a plain arrow function with neither — and this slice edited the file, so the gap was in scope to
  notice. Secondary: `Tag` has no consumers. All three call sites import `tagStyles` directly
  (`Skills.astro:2`, `SologyRole.astro:2`, `MeetmediaRole.astro:2`), so the `tier` prop plumbing added
  by this slice ships dead. The CVA itself is correct — `cn(tagStyles({ tier }), className)` resolves
  overrides properly.
- **Fix**: Bring `Tag` to the checklist shape (forwardRef + displayName), matching `button.tsx`.
- **Decision**: SKIPPED

### F5 — Cursor ships core against an explicit vault exclusion

- **Severity**: 📋 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: `src/components/skills/Skills.astro:87`
- **Detail**: The PRD correction discloses this itself: Cursor ships as core despite the vault ruling
  "Cursor/Codex — nie wpisywać" (2026-07-23), which the note calls "the same class of ruling that keeps
  SQL off the page". So the section applies a vault exclusion to SQL/Docker/Redis and declines to apply
  it to Cursor. Author-authorised and documented — raised only because it is an unresolved honesty
  asymmetry inside the section built to enforce honesty, and criterion 3.2 is marked passed over it.
- **Fix**: Decide it explicitly — either drop the Cursor chip, or record in the PRD correction why this
  exclusion is overridden and SQL's is not.
- **Decision**: SKIPPED

### F6 — Vault divergence list lives only in a Todoist task

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `context/changes/skills-two-tier/plan.md:130-132`
- **Detail**: The amendment says content moved "against the vault in eight places" and defers the list
  to a Todoist task; the PRD correction enumerates four. At least one divergence is recorded nowhere
  in-repo: REST APIs ships core (`Skills.astro:52`) while `02-umiejetnosci.md:65` rates
  `REST / integracje z API` as *uzupełniające*. The in-repo record is the durable one — a tracker task
  is not where the next reader looks.
- **Fix**: Move the eight-item divergence list into the PRD correction or the change folder.
- **Decision**: SKIPPED

### F7 — Stale criterion wording: "omits Rails and SQL"

- **Severity**: 📋 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `context/changes/skills-two-tier/plan.md:251,350`
- **Detail**: Phase 2's criterion reads "a cold reader can tell why the shipped page omits Rails and
  SQL" — but the amendment returned Rails to the page, so it is marked `[x]` against a statement that is
  no longer true. The PRD correction itself gets this right. Harmless now; misleading to anyone auditing
  the checklist later.
- **Fix**: Reword to "…why the shipped page omits SQL and ships Rails".
- **Decision**: SKIPPED

## Triage summary

| Outcome | Findings |
|---------|----------|
| Fixed | F2 (Fix B), F3 (Fix A) |
| Skipped | F1, F4, F5, F6, F7 |
