<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Work — The Proof Block

- **Plan**: `context/changes/work-proof-block/plan.md`
- **Scope**: Phases 1–3 of 3 (full plan)
- **Date**: 2026-07-27
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 4 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | WARNING |

## What passed cleanly

Every automated criterion in all three phases re-ran green: clean `yarn build` (with `astro check`),
`yarn lint`, and all 12 content/structure greps (`h1`/`h2`/`h3` = 1/1/2, `id="work"` = 1,
`astro-island`/`<script>` = 0, `614` = 0, confidential names = 0, availability = 0, `sql` = 0,
`aria-labelledby` = 3, `~52`/`~60` present, no placeholder copy in `dist/`).

Scope discipline is exact — the diff is precisely the 7 planned files (+130/−0), with `Section.astro`,
`globals.css`, `tailwind.config.mjs` and `components.json` untouched. All four Sology proof points and
the ownership paragraph render verbatim to the plan. Tag tiers cross-check correctly against the vault's
skill levels, including Playwright demoted out of core and Ruby on Rails / Redis / Docker absent. Zero
comments in all seven new files — the recorded lesson is being followed. No security surface: static
prerender, no scripts, no forms, no runtime input.

## Post-triage state (2026-07-27)

Fixed F1, F2 (Fix B), F5, F7. Skipped F3, F4, F6.

Re-verified after all fixes on a clean `rm -rf dist && yarn build`: build and lint pass; `h1`/`h2`/`h3`
= 1/1/2; `id="work"` = 1; `astro-island`/`<script>` = 0; `614`, confidential names, availability
language and `sql` = 0; `aria-labelledby` = 3; `role="list"` = 5; `<article>` = 2; `~52`/`~60` present;
no placeholder copy in `dist/`.

**Scope Discipline now records a deliberate exception**: `tailwind.config.mjs` and
`.claude/rules/design-system.md` are edited, which this plan's "What We're NOT Doing" (`plan.md:77`)
listed as frozen. This was the accepted tradeoff of F2 Fix B, plus the F7 cleanup that rode along on the
already-open file.

**Carried forward**: `Hero.astro:17` and `Footer.astro:5` still use `space-y-2` and are now the only
non-token spacing left in `src/` — migrate them to `space-y-tight` in a slice that owns those files.

## Findings

### F1 — Tag lists lose their list role in WebKit

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality (+ Success Criteria)
- **Location**: `src/components/work/SologyRole.astro:30,56`, `src/components/work/MeetmediaRole.astro:19,32`
- **Detail**: Tailwind Preflight emits `ol,ul,menu{list-style:none;margin:0;padding:0}` (verified in
  `dist/_astro/index.DWf9TrRH.css`). Safari/VoiceOver strips the implicit `list` role from any `ul`
  carrying `list-style: none`. All five lists announce as loose text; `role="list"` appears 0 times in
  `dist/index.html`. This undercuts the plan's own load-bearing claim (`plan.md:114`) that tier captions
  must be programmatically associated — the `aria-labelledby` wiring is correct, but in WebKit it labels
  an element that is no longer a list, producing exactly the flat-wall reading FR-006 exists to prevent.
  Related: Progress item 3.6 is marked `[x]` at `4beb90a`; that would not hold in Safari/VoiceOver, an
  engine NFR-4 names as supported. The plan forbids editing `globals.css` (F-01 frozen), so the fix
  belongs at the call site.
- **Fix**: Add `role="list"` to the four `<ul>` elements in the two role components (the standard
  Preflight mitigation). Purely additive, no visual change, no frozen-file edit.
- **Decision**: FIXED — role="list" added to all five `ul` elements; explanatory comment uses a non-emitting `{/* */}` form so it does not ship.

### F2 — Spacing drops off the token scale; plan named `gap-element`

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence / Pattern Consistency
- **Location**: `src/components/work/SologyRole.astro:19,30,52,56`, `src/components/work/MeetmediaRole.astro:9,19,30,32`
- **Detail**: `plan.md:259` states "Vertical rhythm uses the token scale (`space-y-element`,
  `gap-element`)". `space-y-element` is used at wrapper and tier-group level, but eight inner sites use
  `space-y-2` / `gap-2` — Tailwind default steps, not tokens. `gap-element` appears nowhere.
  `.claude/rules/design-system.md:21,51` names the spacing scale and forbids raw values;
  `tailwind.config.mjs` defines no 0.5rem step. In practice `gap-element` (3rem) between chips would be
  wrong, and `Hero.astro:17` / `Footer.astro:5` already set the `space-y-2` precedent. The real gap is
  systemic: the token scale has no tight/sub-element step, so the rule and the committed code disagree.
- **Fix A ⭐ Recommended**: Leave the code; amend `.claude/rules/design-system.md` to sanction the
  Tailwind default scale for sub-element rhythm.
  - Strength: Matches three existing call sites rather than making this slice the odd one out; no
    frozen-file edit; the rule stops contradicting reality.
  - Tradeoff: Widens the sanctioned surface — future authors can reach for any default step.
  - Confidence: HIGH — the precedent is in already-shipped, already-reviewed code (Hero passed its own
    impl review with `space-y-2`).
  - Blind spot: Haven't checked whether S-03/S-04 planning assumes a tight token exists.
- **Fix B**: Add a `tight: '0.5rem'` spacing token and use it at all eight sites.
  - Strength: Keeps every spacing value on the token scale, rule intact.
  - Tradeoff: Requires editing `tailwind.config.mjs` — explicitly forbidden by this plan's "What We're
    NOT Doing" (`plan.md:77`). Would leave Hero/Footer inconsistent unless migrated too.
  - Confidence: MEDIUM — clean in principle, but breaches this slice's own frozen-contract guardrail to
    fix a style nit.
  - Blind spot: Ripple into S-03's planned Skills list.
- **Decision**: FIXED via Fix B — `tight: 0.5rem` added to `tailwind.config.mjs` spacing scale, all eight sites migrated to `space-y-tight`/`gap-tight`, `design-system.md:21` updated. Accepted the recorded exception to the plan's frozen-config guardrail. `Hero.astro:17` and `Footer.astro:5` still use `space-y-2` — left out of scope.

### F3 — `design-system.md` checklist now contradicts committed code

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: `.claude/rules/design-system.md:53` vs `src/ui/base/tag/tag.tsx:7`
- **Detail**: The rule file lists "`forwardRef` pattern, with `displayName` set" as required for every
  `src/ui/base` component. `button.tsx:11-18` follows it; `tag.tsx:7` does not. `plan.md:166-171` argues
  the exemption deliberately and well — a tag is a leaf with no imperative handle — and the
  implementation matches the plan exactly. The gap is that the exception was recorded in a change-scoped
  plan that will be archived, while the always-loaded rule file still says "required". S-03 inherits
  ambiguous guidance from two sources.
- **Fix**: Scope the checklist item in `design-system.md:53` to components that wrap a focusable or
  imperative element, citing `tag/` as the leaf case. (Adding `forwardRef` to `Tag` instead reintroduces
  the ceremony the plan reasoned its way out of.)
- **Decision**: SKIPPED

### F4 — jQuery and PHP rendered in chips identical to Core/Supporting

- **Severity**: 💭 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence (content guardrail)
- **Location**: `src/components/work/MeetmediaRole.astro:5`
- **Detail**: The vault rates jQuery and PHP `liznięte` with an explicit "nie wpisywać jako skill na CV
  ani portalach". The plan anticipated this and used the vault's own carve-out ("najwyżej wspomnieć w
  kontekście projektu") by captioning the row "Stack at the time" rather than Core/Supporting
  (`plan.md:280-285`). The implementation follows that decision faithfully. Flagged only because the
  rendered chips are visually identical to the Core and Supporting chips, so the caption is the sole
  signal separating a historical fact from a current competency claim.
- **Fix**: None required — the plan decided this. Revisit only if the caption alone feels too thin a
  separator.
- **Decision**: SKIPPED — the plan decided this; the "Stack at the time" caption is the intended separator.

### F5 — Role blocks are bare `<div>`, not `<article>`

- **Severity**: 💭 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/components/work/SologyRole.astro:18`, `src/components/work/MeetmediaRole.astro:8`
- **Detail**: CLAUDE.md requires "Semantic HTML first". A dated job entry with its own heading is the
  textbook `<article>` case. Purely additive, no visual change.
- **Fix**: Change the outer `<div class="space-y-element">` to `<article>` in both role components.
- **Decision**: FIXED — both role blocks are now `<article>`.

### F6 — `text-2xl` duplicated at both `h3` call sites

- **Severity**: 💭 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: `src/components/work/SologyRole.astro:20`, `src/components/work/MeetmediaRole.astro:11`
- **Detail**: `globals.css` sizes only `h1`/`h2`, so each `h3` carries its own size utility — exactly as
  `plan.md:104` mandated. Nothing enforces that S-03's Skills `h3` picks the same utility, and the
  duplication grows per section.
- **Fix**: No change now. Revisit at the third `h3` (S-03) — that is the point to either add the `h3`
  scale entry or extract a shared heading class.
- **Decision**: SKIPPED — revisit at the third `h3` (S-03).

### F7 — Dead `minHeight` token with a hardcoded px value

- **Severity**: 💭 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `tailwind.config.mjs:47-49`
- **Detail**: `minHeight: { 'without-footer': 'calc(100dvh - 33px)' }` is unreferenced across `src/`
  (`Hero.astro:14` uses `min-h-svh`) and hardcodes `33px`, which `design-system.md:43` forbids.
  Pre-existing from F-01, outside this slice — and this plan explicitly forbids editing
  `tailwind.config.mjs`.
- **Fix**: Out of scope here. Queue as a follow-up for a slice allowed to touch the F-01 config.
- **Decision**: FIXED — unused `minHeight.without-footer` deleted from `tailwind.config.mjs`.
