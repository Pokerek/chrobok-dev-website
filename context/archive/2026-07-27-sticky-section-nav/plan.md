# Sticky Section Navigation (S-06) Implementation Plan

## Overview

Roadmap slice **S-06**, covering **FR-012**: a sticky header, present on every breakpoint, from which a
visitor can jump to any section of the page. It is the first global chrome the site has had — everything
shipped so far lives inside `<main>` — so it also settles how the page skeleton reserves space for a
persistent bar without breaking the anchor landings that `Section.astro` has been emitting since F-01.

The nav ships with **zero hydrated JavaScript**: plain `<a href="#…">` links, CSS `position: sticky`, and a
native `<details>` disclosure on phones. One three-line inline script closes that disclosure after a tap —
a pure enhancement that the page works without.

## Current State Analysis

- **Anchors that exist today:** `#hero`, `#work`, `#skills`, `#about`. All are emitted by
  `src/components/layout/Section.astro:24`, which every section component wraps itself in.
- **There is deliberately no `#journal` anchor.** S-04 shipped the journal as an `<h3>` block inside
  `#about` rather than a one-line section (`src/components/about/About.astro:29`). The roadmap records this
  under S-06's Unknowns with an explicit instruction not to rediscover it as a gap. This plan keeps the
  status quo: the nav lists About, not Journal.
- **S-05 (`footer-contact`) is in flight on its own branch and owns the `#contact` anchor.** On
  `feat/sticky-section-nav` the footer is still the copyright bar at `src/components/footer/Footer.astro`,
  mounted outside `<main>` at `src/layouts/Layout.astro:26`, with no `id`. This slice links to `#contact` and
  does **not** create it — the anchor resolves once both branches are on `development`. Every anchor-integrity
  check below is therefore scoped to the four anchors this branch owns.
- **`scroll-mt-section` (2rem) was sized when nothing was sticky** (`Section.astro:24`). Any header taller
  than 32px overlaps every anchor landing. The value is part of the F-01 token contract, so changing it is
  a deliberate act, not a tweak.
- **`Hero.astro:14` reserves a full viewport** (`min-h-svh`) and centres its content. With a sticky bar in
  flow above it, the first screen becomes `header + 100svh` and the hero's contact buttons fall below the
  fold — directly against the US-01 acceptance criterion.
- **`<main>` lives in the page, not the layout** (`src/pages/index.astro:11`), so a skip link declared in
  `Layout.astro` would point at an id the layout does not own.
- **The page ships no JavaScript at all.** No `client:*` directive appears anywhere in `src/`; `Hero.astro`
  and `About.astro` import `buttonStyles()` for its class string only.
- **Motion ceiling is `transition-colors`** (`.claude/rules/design-system.md`), set by F-01 to protect the
  "no layout shift after first paint" NFR.
- **Constants and types belong in sibling files**, not `.astro` frontmatter — the convention added in
  `16813fb`, which the open `astro-constants-extraction` change exists to retrofit onto older components.
  New components comply from the start.

## Desired End State

A visitor opening the page on a phone sees the hero complete — name, role, stack, positioning line and both
buttons — with a hairline-bordered bar pinned above it carrying the wordmark and a **Menu** disclosure.
Tapping Menu reveals Work, Skills, About and Contact; tapping one scrolls to that section, lands it clear of
the bar, and closes the menu. At `md` and above the same four links sit inline in the bar. The bar stays
pinned the entire way down the page.

With scripts disabled, everything above still works except that the menu stays open after a tap. With a
keyboard, the first Tab reveals a **Skip to content** link; the ring is the same `focus-visible` ring as
everywhere else on the site.

Verify by: `yarn build` passing, and the manual sweep in Phase 3.

### Key Discoveries:

- `Section.astro:24` is the single place every anchor's scroll offset is set — one edit fixes all sections.
- Tailwind `theme.extend.spacing` feeds `h-*`, `scroll-mt-*` and `min-h-*` alike, so one constant in
  `tailwind.config.mjs` can drive the header height, the anchor offset and the hero's height correction.
- The `container` class (centred, `2rem` padding) already aligns section content; reusing it inside the
  header lines the nav up with the sections below it for free.
- `md:hidden` / `hidden md:flex` removes the inactive list from the accessibility tree via `display: none`,
  so rendering both lists does not produce duplicate links for a screen reader.
- `<details>`/`<summary>` gives disclosure semantics — including `aria-expanded` — with no script.

## What We're NOT Doing

- **No active-section highlighting / scroll-spy.** No `aria-current`, no IntersectionObserver, no React
  island. The page stays at zero hydrated components.
- **No `#journal` anchor.** S-04's decision stands.
- **No footer changes at all.** `Footer.astro` is not touched — not its content, not its `id`. The
  `#contact` anchor is S-05's to create on its own branch; this slice only links to it.
- **No hide-on-scroll, shrink-on-scroll, or backdrop blur.** The bar's appearance is constant.
- **No `tabindex="-1"` on anchor targets.** Browsers move the sequential focus starting point to a fragment
  target on their own; adding it is recorded under Open Risks for S-07 to verify rather than assumed here.
- **No changes to `src/ui/base/**`,** including the `h-10` button issue already carried into S-07.
- **No test runner, no OG metadata, no dark mode.**

## Implementation Approach

Three phases, foundation first.

Phase 1 changes nothing a visitor can see: it introduces the header-height constant, re-derives the anchor
offset from it, opens the reduced-motion-guarded smooth scroll, and moves `<main>` into the layout so the
skip link has a stable target. The page still renders exactly as it does today, and `yarn build` proves the
token rename reached every call site.

Phase 2 adds the header itself and corrects the hero's reserved height in the same pass, so the first-screen
trade-off is evaluated on a real preview rather than reasoned about.

Phase 3 is the inspection sweep: FR-012 across breakpoints plus all four NFRs.

## Critical Implementation Details

**One constant, three derived tokens.** `tailwind.config.mjs` must not carry the header height twice. Hoist
it to a module-scope `const` and derive both spacing tokens from it — S-04 already produced one hand-copied
`10` between `button.styles.ts` and a call site, which S-07 now has to clean up. Do not repeat that shape.

**Tailwind arbitrary values collapse whitespace.** `min-h-[calc(100svh-theme(spacing.header))]` emits a CSS
`calc()` with no spaces around the minus, which is invalid and silently drops the declaration. Underscores
become spaces: write `min-h-[calc(100svh_-_theme(spacing.header))]`.

**The disclosure panel must not change the bar's height.** The anchor offset is derived from the closed-bar
height; if an open menu grows the header, every landing shifts by the menu's height. Position the panel
absolutely against the `<header>` (`absolute inset-x-0 top-full` — the header is already a positioned
element by virtue of `position: sticky`) so the bar row stays exactly `h-header` in both states.

**The inline script must be `is:inline`.** Astro bundles `<script>` into a module and emits a network
request for it; `is:inline` keeps three lines in the HTML where they belong for a progressive enhancement.

## Phase 1: Anchor and token foundation

### Overview

Introduce the header-height constant and the anchor offset derived from it, enable guarded smooth scrolling,
and move `<main>` into the layout. No visible change.

### Changes Required:

#### 1. Header-height constant and derived spacing tokens

**File**: `tailwind.config.mjs`

**Intent**: Establish a single source for the sticky bar's height so the bar, the anchor offset and the
hero's height correction cannot drift apart.

**Contract**: A module-scope constant (`3.5rem` — 56px, enough for a 44px touch target inside the bar)
feeding two new entries under `theme.extend.spacing`: `header` (the constant) and `anchor` (the constant
plus the existing `section` rhythm, so a section lands with breathing room below the bar rather than flush
against it). Both must be expressed in terms of the constant, not re-typed.

```js
const HEADER_HEIGHT = '3.5rem';
// spacing: { header: HEADER_HEIGHT, anchor: `calc(${HEADER_HEIGHT} + 2rem)`, … }
```

#### 2. Anchor offset on the section primitive

**File**: `src/components/layout/Section.astro`

**Intent**: Every section's scroll landing must clear the sticky bar instead of sliding under it.

**Contract**: `scroll-mt-section` → `scroll-mt-anchor` on the root `<section>` (line 24). The frontmatter
comment already names S-06 as the reason the anchor exists — update it to say the offset is now sized to the
header rather than to the section rhythm.

#### 3. Guarded smooth scrolling

**File**: `src/styles/globals.css`

**Intent**: Make a jump between distant sections legible as movement rather than a teleport, without
widening the v1 motion ceiling for anyone who has asked for less motion.

**Contract**: Inside `@layer base`, a `@media (prefers-reduced-motion: no-preference)` block setting
`scroll-behavior: smooth` on `html`. This is the one sanctioned exception to the `transition-colors`
ceiling; note it in the surrounding comment so it does not read as a violation.

#### 4. `<main>` moves into the layout

**File**: `src/layouts/Layout.astro`

**Intent**: The skip link is declared by the layout, so the layout must own the element it points at.

**Contract**: Wrap `<slot />` in `<main id="main-content">`. `<Footer />` stays outside it.

#### 5. Page drops its own `<main>`

**File**: `src/pages/index.astro`

**Intent**: Avoid two `<main>` landmarks once the layout provides one.

**Contract**: Remove the `<main>` wrapper; the four section components become direct children of `<Layout>`.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- No stale token reference remains: `grep -rn "scroll-mt-section" src/` returns nothing
- Exactly one `<main>` in the built output: `grep -c "<main" dist/index.html` returns `1`
- The footer was not touched: `git diff --name-only development -- src/components/footer/` returns nothing

#### Manual Verification:

- The rendered page is visually identical to `development` — no shifted spacing, no new elements
- Navigating to `#work`, `#skills` and `#about` by URL lands on each section
- With OS "reduce motion" enabled, in-page jumps are instant; with it off, they animate

**Implementation Note**: After completing this phase and all automated verification passes, pause for
manual confirmation before proceeding.

---

## Phase 2: The navigation component

### Overview

Build the sticky header — wordmark, skip link, desktop link row, mobile disclosure, close-on-tap
enhancement — mount it in the layout, and re-derive the hero's reserved height so the first screen still
fits beneath it.

### Changes Required:

#### 1. Nav item type

**File**: `src/components/navigation/navigation.types.ts`

**Intent**: Type the nav's content so the constants file and the component agree.

**Contract**: `export interface NavItem { href: string; label: string }`.

#### 2. Nav content

**File**: `src/components/navigation/navigation.constants.ts`

**Intent**: Keep the nav's data out of `.astro` frontmatter, per the project convention.

**Contract**: `NAV_ITEMS: NavItem[]` — Work (`#work`), Skills (`#skills`), About (`#about`), Contact
(`#contact`), in page order — plus a `WORDMARK` entry (`#hero`, "Karol Chrobok"). Both lists render from
these constants at every breakpoint; no label is written twice in markup.

`#contact` is created by S-05 on its own branch, so on `feat/sticky-section-nav` that one link has no target
and does nothing when activated. Ship the item anyway — it resolves the moment both branches meet on
`development`, and removing it would mean a second edit to put it back.

**Addendum (2026-07-28, impl-review):** `WORDMARK.label` shipped as `"chrobok.dev"` rather than the
`"Karol Chrobok"` drafted above — the domain reads more naturally as a wordmark next to the hero's own
name heading. Recorded here rather than reopening implementation.

#### 3. The header component

**File**: `src/components/navigation/Navigation.astro`

**Intent**: Render the sticky bar: a wordmark that returns to the top, an inline link row from `md` up, and
a native disclosure below `md` — with no hydrated JavaScript.

**Contract**:

- Root `<header class="sticky top-0 z-50 border-b border-border-default bg-page-bg">`. The opaque
  `page-bg` background is required — a transparent bar lets section content read through it. `sticky` is
  already a positioned value, so the disclosure panel can be absolutely positioned against this element
  without adding `relative`.
- Inside it, the `container` class, then a `flex h-header items-center justify-between` row. `h-header` is
  fixed in both disclosure states.
- A single `<nav aria-label="Sections">` holds both lists: `<ul class="hidden gap-element md:flex">` and a
  `<details class="md:hidden">` whose `<summary>` reads "Menu" and whose `<ul>` is
  `absolute inset-x-0 top-full` against the header, with the same border and background as the bar.
- Links carry `transition-colors` with a `hover:bg-hover-bg` state; touch targets are at least 44px tall in
  the disclosure panel. No `ring-*` at call sites — the global `:focus-visible` rule owns focus.
- One `<script is:inline>` closing the open `<details>` when a link inside it is activated. Guard for the
  element being absent so the script cannot throw.

#### 4. Skip link and mount point

**File**: `src/layouts/Layout.astro`

**Intent**: Give keyboard users a bypass past the nav, and put the header on the page.

**Contract**: As the first child of `<body>`, an `<a href="#main-content">Skip to content</a>` styled
`sr-only focus:not-sr-only` and, when visible, absolutely positioned above the header (`z` greater than the
header's) with the page background, `2rem`-consistent padding and the default border. Then `<Navigation />`,
then the `<main id="main-content">` added in Phase 1.

**Addendum (2026-07-28, impl-review):** shipped as `focus:fixed` rather than `focus:absolute` — `fixed`
keeps the skip link pinned to the visible viewport if a user tabs in after scrolling past the top; the
literal `absolute` spec would render it at the top of the document, out of view until scrolled back up.
z-index, background, padding and border all match the contract as written.

#### 5. Hero height correction

**File**: `src/components/hero/Hero.astro`

**Intent**: The hero reserved a full viewport when nothing sat above it; with the bar in flow the first
screen must still hold the whole hero on a phone.

**Contract**: `min-h-svh` → `min-h-[calc(100svh_-_theme(spacing.header))]` on the `Section` class list. The
underscores are load-bearing (see Critical Implementation Details). Nothing else in the hero changes.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- No hydrated island was introduced: `grep -rn "client:" src/` returns nothing
- Every nav target this branch owns resolves: `#hero`, `#work`, `#skills` and `#about` each have a matching
  `id="…"` in `dist/index.html`. `#contact` is expected to have none until S-05 merges — that is the one
  known dangling anchor and it must be the only one
- The enhancement is inline, not bundled: `grep -n "is:inline" src/components/navigation/Navigation.astro`
  matches, and no new `.js` asset appears in `dist/_astro/`

#### Manual Verification:

- The bar stays pinned at 320px, 768px and 1440px while scrolling the full page
- Below `md`: Menu opens, the panel does not change the bar's height, a tap scrolls to the section and the
  menu closes
- At `md`+: all four links sit inline and are reachable
- Work, Skills and About each land clear of the bar — heading fully visible, not clipped. Contact does
  nothing on this branch, by design
- The hero still shows name, role, stack, positioning line and both buttons without scrolling on a phone
- The first Tab press reveals "Skip to content"; activating it moves focus into the content
- Focus rings on nav links match the rest of the site

**Implementation Note**: After completing this phase and all automated verification passes, pause for
manual confirmation before proceeding.

---

## Phase 3: Inspection verification

### Overview

Prove FR-012 and the four NFRs against the built preview. No code changes unless a check fails.

### Changes Required:

#### 1. Evidence pass — no source changes expected

**File**: `context/changes/sticky-section-nav/plan.md`

**Intent**: Record the outcome of each check in the Progress section, and open a follow-up note for anything
that belongs to S-07 rather than here.

**Contract**: Every Manual bullet below is answered with an observation, not an assumption. A failure that
is cheap to fix is fixed in this phase; a failure that reopens a frozen contract is written down for S-07.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- No raw colour or radius leaked into the new component:
  `grep -rnE "#[0-9a-fA-F]{3,6}|border-black|rounded-(md|lg|full)" src/components/navigation/` returns
  nothing

#### Manual Verification:

- **No-JS**: with JavaScript disabled, the bar is sticky, all four links navigate, and the disclosure opens
  and closes — only the close-on-tap convenience is absent
- **Keyboard**: skip link → wordmark → nav links → content, in that order, with a visible ring at every stop
- **Screen reader**: the bar is announced as a navigation landmark named "Sections"; the disclosure announces
  its expanded state
- **Contrast**: bar text and border against `page-bg` meet WCAG AA
- **Layout shift**: no movement after first paint at any breakpoint — the sticky bar is in flow and the
  disclosure panel is absolutely positioned
- **Cross-engine**: the bar pins correctly and `100svh` resolves as expected in Chromium, Firefox and WebKit
- **FR-012 restated**: from any scroll position, on any breakpoint, a visitor can reach Work, Skills and
  About in one interaction (two on mobile, counting the Menu tap). Contact closes on `development` once
  S-05 lands — re-check it there, not here

---

## Testing Strategy

There is no test runner in this project, by design (PRD §Non-Goals; roadmap Baseline). Verification is
`yarn build`, `yarn lint`, targeted greps, and the manual sweep in Phase 3.

### Manual Testing Steps:

1. `yarn dev`, open at 320px width, confirm the hero fits under the bar without scrolling.
2. Open Menu, tap Work, Skills and About; confirm each landing clears the bar and the menu closes. Tap
   Contact and confirm it is inert rather than broken-looking — no error, no scroll.
3. Resize to `md`+, repeat with the inline links.
4. Disable JavaScript, repeat step 2 — expect the menu to remain open, everything else identical.
5. Tab from a fresh load: skip link, wordmark, links, then content.
6. Toggle OS reduce-motion and confirm the scroll animation appears and disappears with it.

## Performance Considerations

The page's JavaScript payload goes from zero bytes to three inline lines — no bundle, no request, no
hydration. No new fonts, images or network calls. The sticky bar participates in normal flow, so it reserves
its own space at first paint and cannot cause a shift.

## Migration Notes

The `scroll-mt-section` → `scroll-mt-anchor` rename touches the shared `Section` primitive and therefore
every section at once; the grep in Phase 1 is what proves no call site was missed. `spacing.section` itself
stays — it is still the vertical rhythm token — so nothing outside the anchor offset is affected.

**Cross-branch coordination with S-05.** This branch ships a `#contact` link with no target; the
`feat/footer-contact` branch ships the target. Neither branch touches the other's files, so the merge is
clean, but the requirement only closes when both are on `development`. Two things to check there rather than
here: that the footer's `id` is exactly `contact`, and — if S-05 wraps the footer in the `Section`
primitive — that it picks up `scroll-mt-anchor` from this branch rather than reintroducing
`scroll-mt-section`.

## References

- Roadmap slice: `context/foundation/roadmap.md` §S-06 (and its Unknowns entry on `#journal`)
- Requirement: `context/foundation/prd.md` FR-012, §Non-Functional Requirements
- Prior slice for section conventions: `context/archive/2026-07-27-about-and-journal/plan.md`
- Section primitive: `src/components/layout/Section.astro:24`
- Token contract: `tailwind.config.mjs`, `.claude/rules/design-system.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step
> titles. See `references/progress-format.md`.

### Phase 1: Anchor and token foundation

#### Automated

- [x] 1.1 Build and type-check pass: `yarn build` — 72fe6c0
- [x] 1.2 Lint passes: `yarn lint` — 72fe6c0
- [x] 1.3 No stale token reference remains: `grep -rn "scroll-mt-section" src/` returns nothing — 72fe6c0
- [x] 1.4 Exactly one `<main>` in the built output — 72fe6c0
- [x] 1.5 The footer was not touched on this branch — 72fe6c0

#### Manual

- [x] 1.6 The rendered page is visually identical to `development` — 72fe6c0
- [x] 1.7 Navigating to `#work`, `#skills` and `#about` by URL lands on each section — 72fe6c0
- [x] 1.8 Smooth scroll appears and disappears with the OS reduce-motion setting — 72fe6c0

### Phase 2: The navigation component

#### Automated

- [x] 2.1 Build and type-check pass: `yarn build` — e999698
- [x] 2.2 Lint passes: `yarn lint` — e999698
- [x] 2.3 No hydrated island was introduced: `grep -rn "client:" src/` returns nothing — e999698
- [x] 2.4 `#hero`, `#work`, `#skills`, `#about` resolve in the built output; `#contact` is the only dangling anchor — e999698
- [x] 2.5 The enhancement is inline; no new `.js` asset in `dist/_astro/` — e999698

#### Manual

- [x] 2.6 The bar stays pinned at 320px, 768px and 1440px — e999698
- [x] 2.7 Below `md`: menu opens, bar height is unchanged, tap navigates and closes the menu — e999698
- [x] 2.8 At `md`+: all four links sit inline and are reachable — e999698
- [x] 2.9 Work, Skills and About each land clear of the bar; Contact is inert by design — e999698
- [x] 2.10 The hero still fits the first screen on a phone — e999698
- [x] 2.11 The first Tab press reveals "Skip to content" and it moves focus into the content — e999698
- [x] 2.12 Focus rings on nav links match the rest of the site — e999698

### Phase 3: Inspection verification

#### Automated

- [x] 3.1 Build and type-check pass: `yarn build` — 68798fb
- [x] 3.2 Lint passes: `yarn lint` — 68798fb
- [x] 3.3 No raw colour, `border-black` or non-zero radius in `src/components/navigation/` — 68798fb

#### Manual

- [x] 3.4 No-JS: sticky, navigable and expandable with scripts disabled — 68798fb
- [x] 3.5 Keyboard: skip link → wordmark → links → content, ring visible at every stop — 68798fb
- [x] 3.6 Screen reader: navigation landmark named "Sections"; disclosure state announced — 68798fb
- [x] 3.7 Contrast: bar text and border meet WCAG AA against `page-bg` — 68798fb
- [x] 3.8 No layout shift after first paint at any breakpoint — 68798fb
- [x] 3.9 Cross-engine: bar pins and `100svh` resolves in Chromium, Firefox and WebKit — 68798fb
- [x] 3.10 FR-012 restated: Work, Skills and About reachable in one interaction from any scroll position; Contact re-checked on `development` after S-05 — 68798fb
