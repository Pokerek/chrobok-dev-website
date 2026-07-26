# Hero — First Screen Implementation Plan

## Overview

Replace the "Work in progress…" placeholder on `src/pages/index.astro` with the hero section: the
author's name, role title, core stack, a one-line positioning statement, and an email + CV call-to-action
pair — all readable without scrolling on a 375×667 phone as well as on desktop.

This is roadmap slice **S-01** (`context/foundation/roadmap.md:134`), covering **US-01, FR-001, FR-002,
FR-003**. It is the first content slice to land on top of the F-01 design-system contract, and the first
change that deletes placeholder content from the page.

## Current State Analysis

`src/pages/index.astro` is entirely placeholder: an `<h1 class="text-2xl">Work in progress...</h1>`, a
sentence linking to the Instagram journal, and `/images/monk.webp`. The raw `text-2xl` overrides the H1
size the type scale already sets — one of the four hard-coded-value risks recorded in
`context/foundation/design-notes.md:112-115`. It disappears with the placeholder.

Everything the hero needs already exists and is frozen:

- **`src/components/layout/Section.astro`** — semantic `<section>` + scroll anchor + centered container,
  with an optional `label` slot producing the `label | content` grid that collapses below `md`. Semantics
  are deliberately left to the caller (`Section.astro:10-11`).
- **Tokens** — colours, fonts, spacing, `gridTemplateColumns.section`, and the flattened radius scale in
  `tailwind.config.mjs:15-63`. Every named radius resolves to `0`.
- **Focus ring** — global `:focus-visible { ring-2 ring-offset-2 }` in `src/styles/globals.css:22-24`,
  with the ring colour and offset supplied as Tailwind ring defaults. Never set at call sites.
- **Type scale** — H1 is `2.5rem`, H2 `1.75rem`, both Ramaraja 700 (`globals.css:26-44`). H3–H6 remain
  undefined by design; the hero uses H1 only.
- **`buttonStyles`** — CVA definition at `src/ui/base/button/button.styles.ts`, with `default`,
  `outline` and `link` variants. Importable independently of the React `Button` component.

What does **not** exist: any header or navigation component (S-06 builds it), any tag/chip primitive
(S-02 and S-03 land their own, in parallel with this slice), the CV PDF (external dependency, PRD Open
Question 3), and any test runner (deliberate — `context/foundation/roadmap.md:85`).

## Desired End State

`https://…-development.vercel.app` renders a single full-viewport hero. Opening it on a 375×667 phone
with browser chrome visible shows, without any scrolling: the name **Karol Chrobok**, the role
**Frontend Developer**, the core stack **React · Next.js · TypeScript**, the positioning line, and two
working CTAs — a filled *Email* button and an outline *CV* button. The word "placeholder" and the string
"Work in progress" appear nowhere in the built output. Tabbing reaches both CTAs in reading order with a
visible black focus ring. With JavaScript disabled the page is byte-for-byte the same.

Verified by: the automated build/lint gate, plus the manual viewport, keyboard and no-JS checks in Phase 2.

### Key Discoveries

- `Section.astro:24-26` puts `py-section` on the `<section>` and wraps content in `.container`. To make
  the hero fill the viewport the section needs extra classes via the `class` prop — but the `.container`
  child must then be told to take full width, because a block child of a flex container shrink-wraps.
- Tailwind 3.4 (`package.json` pins `^3.4.6`) ships `svh`/`dvh`/`lvh` height utilities, so `min-h-svh`
  is available without a config change.
- The existing `minHeight.without-footer` token (`tailwind.config.mjs:47-49`) is `calc(100dvh - 33px)` —
  built for the placeholder's centred flexbox and hard-coding the current footer height. It is not the
  right tool here (see Critical Implementation Details) and is left untouched for S-05/S-07 to retire.
- `Button` is a React component using `forwardRef` and Radix `Slot`. Importing it into the hero would
  create a hydrated island for what is structurally an anchor. `buttonStyles` is a plain CVA export and
  can be applied to an `<a>` in `.astro` with no client JS at all — which is what NFR-3 requires.
- The `:focus-visible` ring is global and unconditional. `buttonStyles` also declares
  `focus-visible:ring-2 ring-offset-2` (`button.styles.ts:4`); on an `<a>` the global rule already
  covers it, so no ring classes belong at the call site.
- `Footer.astro` already uses `border-border-default` — the hard-coded `border-black` risk was retired by
  F-01 and needs no attention here.

## What We're NOT Doing

- **No header or navigation.** FR-003's "from the header" is satisfied by in-hero CTAs; S-06
  (`sticky-section-nav`) owns the header and depends on this slice.
- **No tag/chip primitive.** The stack ships as a plain text line; S-02 and S-03 land tags in parallel.
- **No other page sections.** Work, skills, about, journal and footer content belong to S-02–S-05.
- **No CV PDF.** The link points at its final path; the artifact arrives from outside this repository.
- **No skip link, no OpenGraph tags, no favicon work.** S-07 owns the hardening pass; OG metadata was
  explicitly declined for v1 (PRD Open Question 2).
- **No test runner, no Lighthouse/axe automation.** Deliberate for v1 — `docs/nfr-inspection.md`
  documents why the NFRs are a manual runbook at the S-08 cutover.
- **No changes to `Section.astro`, the tokens, or `globals.css`.** The F-01 contract is frozen; if the
  hero cannot be built without changing it, stop and re-open F-01 rather than editing around it.

### Deviation recorded during Phase 1 (2026-07-26)

The plan originally dropped the monk illustration entirely and shipped a full-width, text-only hero.
On reviewing the desktop rendering the author asked for the illustration back, on the right-hand side,
to fill the empty column. Implemented as:

- `public/images/monk.webp` **moved to** `src/assets/monk.webp` and rendered through `astro:assets`
  `<Image>`. Reason: `<Image>` emits intrinsic `width`/`height` (500×500), which is what keeps the
  illustration from causing the layout shift the CLS = 0 requirement forbids. Files in `public/` cannot
  be processed by `astro:assets` at all, and `.claude/rules/astro.md` calls for the Image integration.
- `astro.config.mjs` gained `image: { service: passthroughImageService() }`. `astro:assets` otherwise
  requires `sharp`, which is not installed; the asset is already an optimised 21 KB webp, so passthrough
  keeps the width/height benefit without adding a native dependency.
- Hero content became a `md:grid-cols-2` grid. The image is `hidden md:block`, so it never competes for
  the mobile fold budget, and carries `alt=""` as decorative.

The CV also landed during this phase at `public/karol_chrobok_cv.pdf`, so the link is live rather than
the anticipated 404. The href points at the real (underscored) filename and uses
`download="karol-chrobok-en-cv.pdf"` to give the saved file a clean name.

## Implementation Approach

One new feature component, `src/components/hero/Hero.astro`, composed from the existing `Section`
primitive and styled entirely with existing tokens. `index.astro` shrinks to a `Layout` wrapping a
`<main>` that contains only `<Hero />`. Copy lives inline in the component — the PRD's §Non-Goals rule
out a content layer, and seven sections of static text have nothing to store.

The CTAs are `<a>` elements carrying `buttonStyles({ variant })` through `cn()`. No React, no island, no
`client:*` directive anywhere in this slice.

The fold guarantee is structural rather than editorial: the section sets a stable small-viewport minimum
height and vertically centres its content, so the criterion holds as long as the copy stays within the
budget Phase 2 verifies.

## Critical Implementation Details

**Use `min-h-svh`, not `min-h-dvh` or the `without-footer` token.** `dvh` resizes when the mobile URL
bar collapses on scroll; a hero sized in `dvh` therefore changes height after first paint, which violates
the "no layout shift after first paint" NFR and the CLS = 0 target in `docs/nfr-inspection.md`. `svh` is
the small-viewport height — stable for the page's lifetime and equal to the viewport *with* browser chrome
visible, which is exactly the pessimistic case the 375×667 floor is meant to capture.

**The `.container` inside a flex section needs `w-full`.** `Section.astro` renders
`<section>` → `.container` → grid wrapper. Making the section a flex column with centred content turns
`.container` into a flex item, which shrink-wraps to its content and silently loses the centred
max-width layout. Pass the flex classes on the section and ensure the container stretches, or centre the
content by other means — but verify the desktop container width is unchanged either way.

**Heading levels.** The name is the page's only `<h1>`. The role, stack and positioning line are
paragraphs, not headings — an `<h2>` here would announce a section that does not exist and would collide
with the section headings S-02–S-05 are about to introduce.

## Phase 1: Hero section

### Overview

Build the hero component, wire it into the page, and delete the placeholder markup.

### Changes Required:

#### 1. Hero component

**File**: `src/components/hero/Hero.astro` (new)

**Intent**: Render the first screen — name, role, core stack, positioning statement, and the email + CV
CTA pair — as a full-viewport section built on the `Section` primitive, with no client-side JavaScript.

**Contract**: Takes no props. Renders `<Section id="hero">` with no `label` slot (full-width). Inside, in
reading order: `<h1>` with the name; a paragraph with the role title; a paragraph with the core stack;
a paragraph with the positioning line; and a CTA group of two `<a>` elements. The section carries the
`min-h-svh` and vertical-centring classes via `Section`'s `class` prop. `id="hero"` is the anchor S-06
will target, so it must not be renamed.

Copy is fixed by the decisions taken during planning:

- Name: `Karol Chrobok`
- Role: `Frontend Developer` — the public title, which per PRD §Guardrails must never read "fullstack"
- Stack: `React · Next.js · TypeScript`
- Positioning: the author's verbatim line *"I don't generate code, I craft it."* followed by the AI
  clarifier — AI is used every day as a tool, the result is owned by a human. Source:
  `context/foundation/author-profile.md:25-26`. The clarifier is not optional; FR-002's resolution exists
  specifically to stop the bare line reading as "I don't use AI".
- No availability, start date or notice period anywhere — PRD §Guardrails, and an acceptance criterion
  of US-01.

**Contract (CTAs)**: two anchors, styled by `buttonStyles` from `src/ui/base/button/button.styles.ts`
combined through `cn()` from `styles/utils`:

- Email — `variant: 'outline'`, `href="mailto:karolchrobok@gmail.com"`
- CV — `variant: 'outline'`, `href="/karol_chrobok_cv.pdf"`, carrying the `download` attribute

Both CTAs ship the `outline` variant: the `default`/`outline` split was tried on the rendered page and
the matched pair read better, so the visual hierarchy is carried by order and copy, not by fill.

Both are internal-or-mailto targets, so neither needs `rel="noopener"` or `target="_blank"`. Do not add
focus-ring classes — the global `:focus-visible` rule in `globals.css` already applies.

#### 2. Page wiring and placeholder removal

**File**: `src/pages/index.astro`

**Intent**: Delete the placeholder block entirely and render the hero as the page's only content.

**Contract**: `<Layout>` wrapping a `<main>` that contains `<Hero />` and nothing else. The existing
`title` and `description` props stay as they are — page metadata is out of scope. Everything else in the
file goes: the `min-h-without-footer` flex wrapper, the `text-2xl` H1, the journal sentence, and the
`<img src="/images/monk.webp">` tag. The illustration itself returns inside `Hero.astro` on `lg+` only —
see the deviation note under "What We're NOT Doing".

### Success Criteria:

#### Automated Verification:

- Type-check and build pass: `yarn build` (runs `astro check` first — never drop it)
- Lint passes: `yarn lint`
- No placeholder text survives in the build: `grep -ri "work in progress" dist/` returns no matches
- No monk image reference survives: `grep -r "monk.webp" dist/` returns no matches
- The hero renders server-side with no island: `grep -c "<h1" dist/index.html` returns > 0 and the built
  HTML contains no `astro-island` element

#### Manual Verification:

- Both CTAs are visible and correctly styled — email filled, CV outline — on desktop
- The email link opens a mail client addressed to `karolchrobok@gmail.com`
- The CV link resolves to `/karol_chrobok_cv.pdf` (the artifact landed during Phase 1)
- Desktop container width and centring are unchanged from the rest of the design system

**Implementation Note**: After completing this phase and all automated verification passes, pause here
for manual confirmation from the human that the manual testing was successful before proceeding to the
next phase.

---

## Phase 2: First-screen verification

### Overview

Prove the acceptance criterion that gives this slice its name — everything readable without scrolling at
the agreed viewport floor — plus the accessibility and no-JS properties the NFRs require of new markup.

No production code changes are expected in this phase. If a check fails, the fix is a copy or spacing
adjustment inside `Hero.astro`, made under Phase 1's contract.

### Changes Required:

#### 1. Fold, keyboard, contrast and no-JS checks

**File**: none expected — verification only; remediation edits land in `src/components/hero/Hero.astro`

**Intent**: Confirm the hero satisfies US-01's acceptance criteria and does not regress the four NFRs,
before the section is considered done.

**Contract**: the checks below are run against `yarn build && yarn preview` (the built output, not the
dev server — the no-JS and CLS checks are meaningless against dev). This is a subset of
`docs/nfr-inspection.md` scoped to the new markup; the full runbook still runs once at the S-08 cutover.

### Success Criteria:

#### Automated Verification:

- Production build serves cleanly: `yarn build && yarn preview`
- Raw HTML carries the content without scripts: `curl -s localhost:4321 | grep -c "<main"` returns > 0,
  and the name, role, stack, positioning line and both hrefs are all present in that raw output

#### Manual Verification:

- At 375×667 with browser chrome visible, name, role, stack, positioning line and both CTAs are all
  visible with no scrolling
- No layout shift after first paint — DevTools Performance recording shows no layout-shift bars, and
  the hero does not resize when the mobile URL bar collapses
- Tab order reaches the email CTA then the CV CTA, each with a visible black focus ring, no keyboard trap
- axe DevTools scan of the page reports 0 critical or serious violations
- Text contrast meets WCAG AA — verify `text-secondary` (`#333333`) on `page-bg` (`#FAFAFA`) if the
  positioning line uses it
- With JavaScript disabled in DevTools, the page renders identically
- Layout holds at desktop, tablet and the 375px floor with no horizontal overflow

**Implementation Note**: This phase closes the slice. Once it passes, `/pr-ready hero-first-screen` opens
the PR against `development` and moves CHR-31 to In Review.

---

## Testing Strategy

There is no test runner in this repository, and adding one is explicitly out of scope for v1
(`context/foundation/roadmap.md:85`, `docs/nfr-inspection.md`). Verification is therefore:

### Automated:

- `yarn build` — `astro check` type-checks `.astro` and `.ts`, then the build must succeed
- `yarn lint` — ESLint flat config
- `grep` assertions against `dist/` for placeholder removal and server-rendered content

### Manual Testing Steps:

1. `yarn build && yarn preview`
2. Open at 375×667 in device emulation with chrome visible; confirm nothing requires scrolling
3. Tab from page load; confirm ring visibility and order on both CTAs
4. Disable JavaScript; reload; confirm identical rendering
5. Run axe DevTools; confirm 0 critical/serious
6. Record a load in the Performance panel; confirm no layout-shift bars

## Performance Considerations

The hero adds no JavaScript, no images and no fonts beyond the three already imported in `globals.css`.
The only performance-relevant decision is `svh` over `dvh`, taken to keep CLS at 0. Nothing in this slice
should move the LCP figure other than by replacing a smaller placeholder with slightly more text.

## Migration Notes

None. No data, no stored content, no persisted state. The only removal is placeholder markup, recoverable
from git history if needed.

## References

- Roadmap slice: `context/foundation/roadmap.md:134-146` (S-01)
- Requirements: `context/foundation/prd.md:114-153` (US-01, FR-001, FR-002, FR-003)
- Copy source: `context/foundation/author-profile.md:22-33` (identity, role, positioning line)
- Design contract: `.claude/rules/design-system.md`, `context/foundation/design-notes.md`
- F-01 predecessor: `context/archive/2026-07-24-design-system-contract/change.md`
- Inspection runbook: `docs/nfr-inspection.md`
- Section primitive: `src/components/layout/Section.astro`
- CTA styles: `src/ui/base/button/button.styles.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Hero section

#### Automated

- [x] 1.1 Type-check and build pass: `yarn build`
- [x] 1.2 Lint passes: `yarn lint`
- [x] 1.3 No placeholder text survives in the build
- [x] 1.4 No `public/images/monk.webp` reference survives — the illustration returns via `astro:assets`
      (`src/assets/monk.webp` → hashed `/_astro/monk.*.webp`) per the Phase 1 deviation
- [x] 1.5 Hero renders server-side with no island

#### Manual

- [x] 1.6 Both CTAs visible and correctly styled on desktop — both ship the `outline` variant, a
      deliberate visual decision taken on the rendered page (supersedes the `default`/`outline` split in
      the Phase 1 contract)
- [x] 1.7 Email link opens a mail client with the correct address
- [x] 1.8 CV link resolves to its final path — PDF landed in Phase 1; serves 200 application/pdf
- [x] 1.9 Desktop container width and centring unchanged — re-checked with the illustration in place

### Phase 2: First-screen verification

#### Automated

- [x] 2.1 Production build serves cleanly: `yarn build && yarn preview` — 16654fc
- [x] 2.2 Raw HTML carries all hero content without scripts — 16654fc

#### Manual

- [x] 2.3 Nothing requires scrolling at 375×667 — hero content 315px + 64px padding vs ~557px usable; 178px headroom — 16654fc
- [x] 2.4 No layout shift after first paint; hero does not resize on URL-bar collapse — CLS measured 0; URL-bar behaviour confirmed by author — 16654fc
- [x] 2.5 Tab order and focus ring correct on both CTAs, no keyboard trap — 2 focusables, DOM order, no positive tabindex — 16654fc
- [x] 2.6 axe DevTools reports 0 critical or serious violations — confirmed by author — 16654fc
- [x] 2.7 Text contrast meets WCAG AA — all pairs computed, lowest 12.1:1 vs 4.5:1 required — 16654fc
- [x] 2.8 Page renders identically with JavaScript disabled — 0 script tags in served HTML and in the DOM — 16654fc
- [x] 2.9 Layout holds at desktop, tablet and 375px with no horizontal overflow — container centred at 1400px max-width — 16654fc
