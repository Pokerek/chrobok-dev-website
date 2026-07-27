# Work — The Proof Block Implementation Plan

## Overview

Build the Work section of chrobok.dev: a single block dominated by the Rentola role, carrying the
ownership scope that calibrates seniority, four quantified outcome-based proof points, and stack tags
split into labelled core and supporting tiers — with the earlier Meetmedia role as a closing line.
Roadmap **S-02** (`work-proof-block`), covering **US-01, FR-004, FR-005, FR-006**.

This is the single place on the page where level is stated. FR-001's resolution deliberately kept
seniority *out* of the hero ("the hero keeps the bare title — seniority is calibrated in the Work
section instead"), which makes this slice load-bearing for the hero that already shipped.

## Current State Analysis

`src/pages/index.astro` renders `Layout → <main> → <Hero />` and nothing else. The page currently ends
after the first screen.

Everything this slice needs from F-01 exists and is frozen:

- **`src/components/layout/Section.astro`** — semantic `<section>` with `scroll-mt-section py-section`,
  the centered `.container`, and an optional `label` slot. With the slot filled it renders
  `md:grid-cols-section` (`minmax(0,12rem) minmax(0,1fr)`, `gap-grid` = 3rem) and collapses to one
  column below `md`. Hero deliberately did not use the label slot; this section is the first to.
- **Tokens** (`tailwind.config.mjs`) — `page-bg`, `element-bg`, `text-primary`, `text-secondary`,
  `border-default`, `hover-bg`, `focus-ring`; spacing `section`/`element`/`card`/`container`, `gap-grid`;
  every named `borderRadius` flattened to `0px`; ring colour/offset defaults wired so `ring-2
  ring-offset-2` needs no colour at the call site.
- **`src/styles/globals.css`** — body font/colour, the global `:focus-visible` rule, and heading
  declarations. **Only `h1` (2.5rem) and `h2` (1.75rem) carry a font-size.**

What is missing:

- **No tag primitive.** `src/ui/base/` contains only `button/`. The hero plan explicitly deferred a tag
  primitive to "S-02/S-03", and S-03 (`skills-two-tier`) is a parallel slice that needs the same
  two-tier vocabulary. This slice builds it and owns the contract.
- **No test runner**, by design. Verification is `yarn build` (which runs `astro check`), `yarn lint`,
  greps against `dist/`, and manual checks — the pattern the hero slice used and its review re-ran.

## Desired End State

Scrolling past the hero reveals a section labelled **Work**. A reader can state, without leaving the
page, that the author was the sole frontend developer of a greenfield multi-tenant rental marketplace
owning the registration/subscription funnel, payments and CRO; can read four proof points each led by a
number; and can see which technologies are core versus supporting, stated in words rather than implied
by styling. The earlier Meetmedia role appears as one closing line.

Verified by: the section renders at 375×667 with no horizontal scroll and no new focusable elements;
the built HTML contains one `<h1>`, one `<h2>` and one `<h3>`, zero `<script>` tags and zero
`astro-island` markers; and the built output contains no availability language and no `614` PR count.

### Key Discoveries:

- **`Section.astro:26` gates the two-column grid on `Astro.slots.has('label')`** — filling the slot is
  the whole opt-in; no prop or class is involved.
- **`h3` renders at the browser default size.** `globals.css:26-36` applies `font-heading`,
  `font-weight: 700`, tracking and line-height to `h1`–`h6`, but sizes only `h1` and `h2` — a gap
  `design-notes.md:57-60` records explicitly. The role heading needs a size utility at the call site;
  `globals.css` is F-01-frozen and must not be edited.
- **`Button` (the `.tsx`) is unused anywhere in `src/`.** `Hero.astro:28-29` consumes only
  `buttonStyles`. A Tag primitive whose `.tsx` this slice does not render therefore matches existing
  repo precedent rather than introducing dead code.
- **Hero review lessons apply directly** (`context/archive/2026-07-26-hero-first-screen/reviews/impl-review.md`):
  F5 — never wrap a single argument in `cn()`; F2 — success criteria must not be able to pass for the
  wrong reason.
- **Tailwind Preflight strips list markers and padding from `ul`/`ol`.** The quantified-bullet format
  wants no marker, so this is the desired default — do not add `list-disc`.
- **The PR count is banned content.** FR-005's resolution drops 614 PRs from the site entirely as an
  activity metric a technical reader reads as metric-gaming.

## What We're NOT Doing

- The Skills section and its own two-tier list (S-03) — this slice ships the tag primitive S-03 will
  consume, not the Skills section itself.
- About, journal, footer contact (S-04, S-05), sticky section nav (S-06).
- Any edit to `Section.astro`, `globals.css`, `tailwind.config.mjs` or `components.json`. The F-01
  contract is frozen; a missing token is worked around at the call site or recorded, never patched here.
- Any interactivity on tags — no filtering, linking, tooltips or hover states. Tags are static text.
- Per-project case studies or expandable role detail (PRD §Non-Goals).
- Introducing a test runner. Verification stays build + lint + grep + manual, as in S-01.
- Open Graph metadata (PRD Open Question 2, declined) and the skip link (S-07).

## Implementation Approach

One new `src/ui/base` primitive and one new feature component, composed from what F-01 already froze.

`Tag` follows the `button/` folder pattern exactly — `tag.styles.ts` (CVA), `tag.types.ts`,
`tag.tsx` (forwardRef + displayName) — and exists so S-03 inherits a settled contract instead of
diverging. The Astro call site applies `tagStyles()` to `<li>` elements, mirroring how `Hero.astro`
applies `buttonStyles()` to `<a>` elements; no React island, no client directive, zero shipped JS.

`Work.astro` fills the `Section` `label` slot with the `<h2>`, giving the section a persistent left-column
marker on `md+` and setting the convention S-03–S-05 follow. Copy lives inline — the PRD rules out a
content layer.

## Critical Implementation Details

**`h3` has no size in the type scale.** The role heading must be an `<h3>` for a valid document outline
(`h1` hero → `h2` Work → `h3` Rentola), but `globals.css` sizes only `h1` and `h2`, so an unstyled `h3`
renders at the browser's UA default in Ramaraja 700 — visually smaller than body copy in places and
inconsistent across engines. Apply a Tailwind type utility at the call site. Do not add an `h3` rule to
`globals.css`; F-01 is frozen and every section after this one would inherit the change unreviewed.

**Tag type size deviates from the Notion token by 0.4px, deliberately.** `design-notes.md:63` specifies
accents at IBM Plex Mono 500 / 0.9rem (14.4px). Tailwind's scale has no 0.9rem step, and adding one means
editing the frozen `tailwind.config.mjs`. Use `text-sm` (0.875rem) and accept the 0.4px difference rather
than shipping an arbitrary value — recorded here so an implementation review reads it as a decision, not
drift. The same note records that the accent letter-spacing was never implemented for the button either;
tags match the button's actual treatment, not the unimplemented spec.

**Tier captions must be programmatically associated with their tag lists.** The entire honesty argument
of FR-006 lives in the caption — a screen-reader user who hears eleven technology names with no tier
boundary gets the flat-wall reading the FR exists to prevent.

## Phase 1: Tag primitive

### Overview

Add the two-tier stack tag as a design-system primitive under `src/ui/base/tag/`, following the
`button/` folder contract, so S-03 consumes a settled component rather than re-deriving one.

### Changes Required:

#### 1. Tag styles

**File**: `src/ui/base/tag/tag.styles.ts`

**Intent**: Define the single visual treatment for a stack tag — square bordered chip on the element
background, mono accent type — so both this section and S-03's skills list render identical tags.

**Contract**: Exports `tagStyles`, a CVA with a base class string and **no variants**. Core and
supporting tiers are distinguished by their caption, not by styling (see Phase 2), so there is
deliberately no `tier` axis; S-03 may add one if its layout needs it. Composition: `inline-flex`,
`border border-border-default`, `bg-element-bg`, `text-text-primary`, `font-body font-medium`,
`text-sm`, and horizontal/vertical padding. No hover, focus or transition classes — tags are not
interactive.

#### 2. Tag types

**File**: `src/ui/base/tag/tag.types.ts`

**Intent**: Type the component's props so callers get autocomplete and `astro check` catches misuse.

**Contract**: Exports `TagProps`, extending `HTMLAttributes<HTMLSpanElement>`. It does **not** extend
`VariantProps<typeof tagStyles>` — there are no variants to derive, and an empty `VariantProps` reads as
an oversight.

#### 3. Tag component

**File**: `src/ui/base/tag/tag.tsx`

**Intent**: Provide the React-facing API for the primitive, matching `button.tsx` so the two primitives
are structurally identical.

**Contract**: `export const Tag`, a `forwardRef<HTMLSpanElement, TagProps>` rendering a `<span>` with
`cn(tagStyles(), className)` and `displayName = 'Tag'`. Note this slice does not render it — `Work.astro`
uses `tagStyles()` directly on `<li>`, exactly as `Hero.astro` uses `buttonStyles()` on `<a>` and leaves
`Button` unused.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- All three files exist under `src/ui/base/tag/` with the design-system folder names
- No raw hex, px or `border-black` in `tag.styles.ts`: `grep -nE "#[0-9a-fA-F]{3,6}|border-black|[0-9]+px" src/ui/base/tag/tag.styles.ts` returns nothing
- `cn()` is called with more than one argument in `tag.tsx` (hero review F5)

#### Manual Verification:

- The folder mirrors `src/ui/base/button/` — same three file suffixes, same export shape
- No rounded corner, hover state, or focus ring appears on a tag when rendered in Phase 2

---

## Phase 2: Work section

### Overview

Build `Work.astro` and mount it below the hero: section label, Rentola block (heading, meta line,
ownership scope, four quantified bullets, two labelled tag rows) and the Meetmedia closing line.

### Changes Required:

#### 1. Work section component

**File**: `src/components/work/Work.astro`

**Intent**: Render the whole Work block, composed from the `Section` primitive and `tagStyles`. Carries
all copy inline; ships no client-side JavaScript.

**Contract**: `<Section id="work">` with the `label` slot filled by `<h2>Work</h2>`. Content column, in
order:

1. `<h3>` — `Rentola — Sology Software House`, with a call-site type utility (`text-xl`) because the
   scale does not size `h3`.
2. Meta line — `Frontend Developer · Aug 2023 – Jul 2026 · Remote, B2B`, in `text-text-secondary`.
   Dates render as exact months to match the CV and LinkedIn; see Open Risks.
3. Ownership scope paragraph — scope first, growth arc second, so a skimmer meets the seniority signal
   before the word "junior":
   > Sole frontend developer of a greenfield, multi-tenant rental marketplace running on subscriptions —
   > owner of the registration and subscription funnel, payments and CRO. Joined as a junior with no
   > React or Next.js experience and grew into that ownership over three years.
4. `<ul>` of four proof points, each led by its number, no list marker (Preflight already removes it):
   - `~52 A/B experiments in GrowthBook across the registration and subscription funnel — designing variants, shipping winners as defaults, deleting losers.`
   - `~60 language-market locales with Lingui and Crowdin, including full RTL for Arabic and Hebrew, plus new market rollouts in DE, AU and CA.`
   - `7 legacy country platforms (DK, NL, GR, BE, IT, CZ, FI) migrated to the new product via 301s and canonicalisation, preserving organic traffic.`
   - `3 payment providers — Rebilly framepay, Apple Pay and PayPal — behind an end-to-end subscription flow: checkout, cancellation, reactivation, invoices and dashboard.`
5. Two tag rows. Each is a caption plus a `<ul>` of `<li class={tagStyles()}>`:
   - **Core** — TypeScript, React, Next.js, Tailwind CSS, Jest, Playwright
   - **Supporting** — Node.js, Ruby on Rails, Redis, Docker, AWS

   The caption carries an `id`; the `<ul>` references it via `aria-labelledby`. Tools already named in
   the bullets (GrowthBook, Lingui, Crowdin) are deliberately not repeated as tags.
6. Meetmedia closing line — one paragraph, stack named in prose, no tag row:
   > Before that: Junior Frontend Developer at Meetmedia (2019–2020) — hand-coded HTML, Sass and
   > JavaScript from PSD, no framework.

Vertical rhythm uses the token scale (`space-y-element`, `gap-element`). `tagStyles()` is applied
directly — no `cn()` wrapper, since there is nothing to merge (hero review F5).

#### 2. Page composition

**File**: `src/pages/index.astro`

**Intent**: Mount the Work section directly below the hero inside the existing `<main>`.

**Contract**: Import `Work` from `../components/work/Work.astro` and render `<Work />` after `<Hero />`.
No other change — `Layout`, title and description stay as they are.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- Exactly one `<h1>`, one `<h2>` and one `<h3>` in the built page: `grep -c "<h1\|<h2\|<h3" dist/index.html` resolves to 1 each when counted separately
- The section anchor exists for S-06: `grep -c 'id="work"' dist/index.html` → 1
- Zero client JavaScript: `grep -c "astro-island\|<script" dist/index.html` → 0
- The banned PR count does not appear: `grep -c "614" dist/index.html` → 0
- No availability language: `grep -ciE "availab|notice period|start date|immediately" dist/index.html` → 0
- SQL is not claimed anywhere (no-overstatement guardrail): `grep -ci "sql" dist/index.html` → 0
- Both tier captions are present and associated: `grep -c "aria-labelledby" dist/index.html` → 2
- All four proof-point numbers reach the HTML: `grep -c "~52\|~60" dist/index.html` → at least 1 each

#### Manual Verification:

- On `md+`, "Work" sits in the left label column and the content in the right — the `Section` label grid
  is actually engaged, not silently falling through to one column
- At 375×667 the section reads top to bottom with no horizontal scroll and no tag row overflowing
- The `h3` renders visibly larger than body copy and smaller than the `h2` — the call-site size utility
  took effect
- Tags render square, bordered, on `element-bg`, with no hover or focus affordance

**Implementation Note**: After completing this phase and all automated verification passes, pause here
for manual confirmation from the human that the manual testing was successful before proceeding to the
next phase.

---

## Phase 3: Inspection verification

### Overview

Verify the slice against the NFRs and the two PRD guardrails it can violate — accessibility, no-JS,
contrast, no layout shift, no availability language, no overstated competency.

### Changes Required:

No source changes are planned in this phase. Any defect it surfaces is fixed back in Phase 1 or 2 and
re-verified.

### Success Criteria:

#### Automated Verification:

- Full build from clean passes: `yarn build`
- Lint passes: `yarn lint`
- Every proof point and both tier captions are present in the raw HTML with scripts irrelevant —
  the content is server-rendered, not injected
- No placeholder copy survives: `grep -ric "work in progress\|lorem\|TODO\|coming soon" dist/` → 0

#### Manual Verification:

- **Keyboard**: tab order runs hero CTAs → footer unchanged; the Work section adds no focusable element
  and no focus trap
- **Screen reader**: the section is announced with its "Work" heading; each tag list is announced with
  its tier caption ("Core", "Supporting") rather than as two undifferentiated lists
- **No-JS**: with scripts disabled the section is byte-for-byte the same content — every proof point,
  both tag rows and the Meetmedia line remain readable (NFR-3)
- **Contrast**: the meta line (`text-secondary` on `page-bg`) and tag text (`text-primary` on
  `element-bg`) both meet WCAG AA
- **No layout shift**: the section introduces no image or web-font swap beyond what the hero already
  loads; CLS stays 0 (NFR-1)
- **Cross-engine**: the section renders correctly in current Chromium, Firefox and WebKit (NFR-4)
- **Guardrail read-through**: a human reads the rendered section and confirms it states no availability,
  start date or notice period, and claims no competency the author profile lists as a gap

**Implementation Note**: Pause here for human confirmation before the change is considered done.

---

## Testing Strategy

There is no test runner in this project by design (PRD §Non-Goals keeps the MVP at zero moving parts),
so "testing" here means the build gate plus reproducible greps plus a manual pass — the same strategy
S-01 used and its implementation review successfully re-ran.

### Automated (build gate + greps):

- `yarn build` — `astro check` catches type errors in `tag.tsx`/`tag.types.ts` before `astro build` runs
- `yarn lint`
- Content greps against `dist/index.html` for the banned strings (`614`, availability language, `sql`)
  and the required structure (`id="work"`, one heading of each level, two `aria-labelledby`)

### Manual Testing Steps:

1. `yarn dev`, open the page, scroll past the hero — confirm the Work section reads as one block
   dominated by Rentola with Meetmedia as a closing line
2. Narrow to 375px — confirm the label collapses above the content, tags wrap, no horizontal scroll
3. Widen past `md` — confirm "Work" moves into the left column
4. Tab through the page — confirm the Work section is skipped entirely (nothing focusable)
5. Run a screen reader over the tag rows — confirm "Core" and "Supporting" are announced as list labels
6. Disable JavaScript, reload — confirm nothing changes
7. Read the section as a recruiter would: can you state the author's level from this block alone?

## Performance Considerations

The slice adds text only — no image, no font, no script, no third-party request. The page's zero-JS and
zero-CLS properties are preserved by construction, not by tuning. The one thing to watch is that
`Work.astro` must not import the `Tag` React component, which would pull the React runtime into the
page's module graph even without a client directive.

## Migration Notes

Not applicable — no stored content, no schema, no existing Work section to migrate from. The page simply
gains a section below the hero.

## References

- Roadmap item: `context/foundation/roadmap.md` — S-02, "Work — the proof block"
- Requirements: `context/foundation/prd.md` — US-01, FR-004, FR-005, FR-006, §Guardrails
- Copy source: `context/foundation/author-profile.md:45-71` (proof points), `:89-99` (voice)
- Design contract: `context/foundation/design-notes.md`, `.claude/rules/design-system.md`
- Precedent slice: `context/archive/2026-07-26-hero-first-screen/plan.md` and its
  `reviews/impl-review.md` (findings F2 and F5 are carried into this plan's criteria)
- Pattern to mirror: `src/ui/base/button/` and `src/components/hero/Hero.astro:28-29`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename
> step titles. See `references/progress-format.md`.

### Phase 1: Tag primitive

#### Automated

- [x] 1.1 Build and type-check pass: `yarn build`
- [x] 1.2 Lint passes: `yarn lint`
- [x] 1.3 All three files exist under `src/ui/base/tag/` with the design-system folder names
- [x] 1.4 No raw hex, px or `border-black` in `tag.styles.ts`
- [x] 1.5 `cn()` is called with more than one argument in `tag.tsx`

#### Manual

- [ ] 1.6 Folder mirrors `src/ui/base/button/` — same file suffixes, same export shape
- [ ] 1.7 No rounded corner, hover state or focus ring on a rendered tag

### Phase 2: Work section

#### Automated

- [ ] 2.1 Build and type-check pass: `yarn build`
- [ ] 2.2 Lint passes: `yarn lint`
- [ ] 2.3 Exactly one `<h1>`, one `<h2>` and one `<h3>` in the built page
- [ ] 2.4 Section anchor exists for S-06: `id="work"` appears once
- [ ] 2.5 Zero client JavaScript: no `astro-island` and no `<script>` in `dist/index.html`
- [ ] 2.6 The banned PR count `614` does not appear in the built page
- [ ] 2.7 No availability language in the built page
- [ ] 2.8 SQL is not claimed anywhere in the built page
- [ ] 2.9 Both tier captions are associated via `aria-labelledby` (2 occurrences)
- [ ] 2.10 Both hard numbers `~52` and `~60` reach the HTML

#### Manual

- [ ] 2.11 On `md+`, "Work" sits in the left label column and content in the right
- [ ] 2.12 At 375×667 the section reads with no horizontal scroll and no tag overflow
- [ ] 2.13 The `h3` renders larger than body copy and smaller than the `h2`
- [ ] 2.14 Tags render square, bordered, on `element-bg`, with no hover or focus affordance

### Phase 3: Inspection verification

#### Automated

- [ ] 3.1 Full build from clean passes: `yarn build`
- [ ] 3.2 Lint passes: `yarn lint`
- [ ] 3.3 Proof points and tier captions are present in the server-rendered HTML
- [ ] 3.4 No placeholder copy survives anywhere in `dist/`

#### Manual

- [ ] 3.5 Keyboard: tab order unchanged; the Work section adds no focusable element
- [ ] 3.6 Screen reader: each tag list is announced with its tier caption
- [ ] 3.7 No-JS: the section is fully readable with scripts disabled
- [ ] 3.8 Contrast: meta line and tag text both meet WCAG AA
- [ ] 3.9 No layout shift: CLS stays 0
- [ ] 3.10 Cross-engine: renders correctly in Chromium, Firefox and WebKit
- [ ] 3.11 Guardrail read-through: no availability language, no competency the profile lists as a gap
