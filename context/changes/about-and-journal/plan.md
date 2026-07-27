# About and Journal (S-04) Implementation Plan

## Overview

Build the About section of chrobok.dev: a short bio paragraph that carries the decade of teaching in one
sentence, closed by a labelled outbound link to the developer's journal at `instagram.com/chrobok.dev`.
Roadmap slice **S-04**, covering **FR-008** and **FR-009**.

This is the fourth content slice of v1 and the smallest so far. Everything it needs from the F-01 design
contract already exists and is frozen; the substance of the slice is editorial — what the paragraph says,
how long it is, and what the journal link claims — not architectural.

## Current State Analysis

`src/pages/index.astro` renders `Layout → <main> → <Hero /> → <Work />` and stops. The About section does
not exist in any form.

Everything this slice composes from is already built and settled:

- **`src/components/layout/Section.astro`** — semantic `<section>` with a scroll anchor and the centered
  container. Filling the `label` slot produces the `label | content` two-column grid on `md+`, collapsing
  to one column below. F-01 contract, frozen.
- **Design tokens** — `tailwind.config.mjs` carries the colour, spacing (`section` / `element` / `tight`),
  grid and radius scale; every named radius resolves to `0px`.
- **Global focus ring** — `globals.css` applies `ring-2 ring-offset-2` to `:focus-visible` on every
  element, with the `focus-ring` colour and `page-bg` offset wired as Tailwind ring defaults. Call sites
  add nothing.
- **`src/ui/base/button/button.styles.ts`** — `buttonStyles()` CVA, already used as a link skin by
  `Hero.astro` (`<a class={buttonStyles({ variant: 'outline' })}>`). No React is rendered; the styles
  module is imported for its class string only, so the page ships zero JavaScript.
- **Section convention set by S-02** — `Work.astro` is the template to mirror: `<Section id="…">` +
  `<h2 slot="label">` + a `max-w-3xl` content column with token-spaced children.

What is missing: the component, the copy, and its mount point. Nothing else.

**Copy source of record.** All factual copy is governed by `~/Documents/GitHub/priv/pokerek_mind/kariera/`,
not by this repo's `context/foundation/author-profile.md` (a pre-audit snapshot that still contains
retracted claims). Three vault rules bind this slice, and the About copy is chosen so that none of them
can be tripped: no client name is mentioned, no role-scope claim is made, and no unverified count is
rendered.

**No test runner exists**, by design. Verification is `yarn build` (which runs `astro check`), `yarn lint`,
targeted greps over source and built output, and a manual inspection pass.

## Desired End State

Scrolling past the Work block reveals a section labelled **About**. A reader can state that the author has
taught for a decade — maths and programming — and that this is where his ability to explain hard things
simply comes from; and can see, immediately below, a bordered link that names the developer's journal and
its destination, opening `instagram.com/chrobok.dev` in a new tab with the context change announced to a
screen reader.

The section says nothing that Work already said: no client, no role scope, no stack, no numbers. It is one
paragraph and one link.

Verification: `yarn build` and `yarn lint` pass; the built HTML in `dist/` contains the paragraph text and
the journal anchor; the page's script payload is unchanged from before the slice; the link takes focus by
keyboard and shows the standard ring; no banned term appears anywhere in `src/`.

### Key Discoveries:

- `Work.astro:8-15` is the exact composition to mirror — `<Section id>` + `<h2 slot="label">` +
  `max-w-3xl` content column. Following it keeps four sections structurally identical for S-06.
- `Hero.astro:27-30` establishes the link-as-button pattern: `buttonStyles({ variant: 'outline' })`
  applied to an `<a>`, wrapped in `flex flex-wrap gap-element`. The journal link reuses it verbatim, so
  the visitor meets an affordance shape they already saw above the fold.
- `Hero.astro:9-11` establishes the constant convention for URLs and addresses: module-scope
  `UPPER_SNAKE_CASE` in the component frontmatter.
- **The English bio already exists, audited.** `kariera/05-bio-i-wiadomosci.md:70-74` holds the "Beyond
  code" paragraph currently live on LinkedIn and justjoin.it. Using it means the site agrees with the
  portals by construction — the "site, CV and GitHub must agree" guardrail is satisfied by derivation
  rather than by inspection.
- **The vault's main bio block cannot be lifted.** `kariera/05-bio-i-wiadomosci.md:50-63` names *Rentola*
  verbatim, which the confidentiality rule (`04-materialy-cv.md:36-64`, extended to the website on
  2026-07-27) forbids on circulated material. Only the "Beyond code" paragraph is safe to reuse, and it is
  the only part of the vault bio this slice needs.
- **Journal facts that are verified:** running since Jan 2023, daily, at `instagram.com/chrobok.dev`
  (`kariera/03-doswiadczenie.md:401-405`, `04-materialy-cv.md:271-273`). **Not verified:** the ~492 post
  count, which `08-profile-portale.md:134` flags explicitly as un-audited, and the 49-follower figure,
  which is small enough to undercut the claim it would support. Neither is rendered.
- **Teaching facts:** maths tutoring since Sep 2015 (~11 years, ongoing) and LEGO Education programming
  instructor Sep 2020 – Feb 2023 (`kariera/01-profil.md:74-76`, `03-doswiadczenie.md:329-348`). The
  chosen sentence compresses both to "a decade — maths and programming" with no dates, matching the live
  portal text.
- Tailwind ships `sr-only` in core utilities — the announced-new-tab pattern needs no config change.
- `Layout.astro` renders `<Footer />` after `<slot />`, outside `<main>`. The About section mounts inside
  `<main>` in `index.astro`, after `<Work />`.

## What We're NOT Doing

- **Not adding a separate `#journal` section or anchor.** The journal lives inside `#about`. See the
  consequence recorded in Open Risks.
- Not building Skills (S-03), the footer (S-05) or the sticky nav (S-06).
- Not touching `Section.astro`, `globals.css`, `tailwind.config.mjs` or any file under `src/ui/base/` —
  all F-01-frozen.
- Not adding a new UI primitive. The journal link is an `<a>` wearing `buttonStyles()`, exactly as the
  hero's two links are.
- Not adding an author photo, an Instagram embed, a feed, an icon set or any third-party script.
- Not adding a post count, a follower count, or any other unverified number.
- Not repeating the work narrative (client, role scope, stack, proof numbers) or the hero's craft
  positioning line.
- Not stating availability, a start date or a notice period, in any form.
- Not introducing a test runner, and not adding Open Graph metadata (PRD Open Question 2, declined).

## Implementation Approach

One new file and a two-line edit. `About.astro` fills the `Section` `label` slot with its `<h2>`, then
renders a single `<p>` followed by a link row. The paragraph is two sentences: the teaching sentence
(FR-008's required content, lifted from the live portal text) and the journal sentence that gives the link
below it its meaning. The link row reuses the hero's outline-button treatment so the page has exactly one
"this is clickable" shape.

The `target="_blank"` carries `rel="noopener noreferrer"` and an `sr-only` suffix inside the anchor, so the
accessible name ends with "(opens in a new tab)". This is the deliberate cost of opening a third-party
destination in a new tab: WCAG treats an unannounced context change as a failure, and the guardrail says
the page must survive exactly that inspection.

## Critical Implementation Details

**Announced new tab.** The `sr-only` span must sit **inside** the `<a>`, not beside it — it works by
extending the anchor's accessible name, which is what a screen reader announces on focus. Placed outside,
it announces as stray text and the link stays unannounced.

## Phase 1: About section with journal link

### Overview

Create the component, write the copy, and mount it in the page. After this phase the section is visible on
the branch preview and the slice's user-facing outcome is complete.

### Changes Required:

#### 1. About section component

**File**: `src/components/about/About.astro` (new)

**Intent**: Render the About section — the bio paragraph carrying the teaching sentence (FR-008) and the
labelled outbound journal link (FR-009). Mirrors `Work.astro`'s composition so all content sections stay
structurally identical for S-06.

**Contract**:

- Imports `Section` from `../layout/Section.astro` and `buttonStyles` from `ui/base/button/button.styles`
  (path alias, as `Hero.astro` does).
- Module-scope constant `JOURNAL_URL = 'https://www.instagram.com/chrobok.dev/'`.
- Root: `<Section id="about">` with `<h2 slot="label">About</h2>`.
- Content column: `<div class="max-w-3xl space-y-element">` — matching `Work.astro:11`, `element` rather
  than `section` because this section holds one block, not two.
- Paragraph — one `<p>`, two sentences, this text (HTML entities per the house convention visible in
  `Hero.astro` and `Work.astro`; `&rsquo;`, `&mdash;`):

  > I&rsquo;ve been teaching for a decade &mdash; maths and programming &mdash; which taught me to explain
  > hard things simply and to work with people. I document the road from Zero to Senior Developer in a
  > daily developer&rsquo;s journal, running since January 2023.

- Link row — `<div class="flex flex-wrap gap-element">` wrapping a single anchor, mirroring
  `Hero.astro:27-30`:

  ```astro
  <a
    class={buttonStyles({ variant: 'outline' })}
    href={JOURNAL_URL}
    target="_blank"
    rel="noopener noreferrer"
  >
    Read the journal on Instagram<span class="sr-only"> (opens in a new tab)</span>
  </a>
  ```

  The snippet is here because three things about it are load-bearing and not derivable from the intent:
  the `sr-only` span living inside the anchor, the `rel` pairing that must accompany `target="_blank"`,
  and the leading space inside the span that keeps the accessible name from running together.

- No `client:*` directive anywhere. No inline `style`. No colour, spacing or radius value that is not a
  token.

#### 2. Mount the section

**File**: `src/pages/index.astro`

**Intent**: Render `<About />` inside `<main>`, directly after `<Work />`, placing it at position 5 of the
PRD's locked reading order.

**Contract**: One import alongside the existing `Hero` / `Work` imports, and one element after `<Work />`.
Import ordering follows the ESLint config already enforced on the file.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- The section renders into the static output: `grep -c 'id="about"' dist/index.html` returns `1`
- The journal anchor ships with its hardening attributes:
  `grep -o 'href="https://www.instagram.com/chrobok.dev/"[^>]*' dist/index.html` shows both
  `target="_blank"` and `rel="noopener noreferrer"`
- The announced-new-tab text is inside the anchor: `grep -o '<a[^>]*instagram[^<]*<span class="sr-only">[^<]*</span>' dist/index.html` matches
- No client-side JavaScript was added: `ls dist/_astro/*.js 2>/dev/null | wc -l` returns the same count as
  on `development` (expected `0`)

#### Manual Verification:

- The About section reads as one paragraph plus one link on a 375px-wide viewport, with no horizontal
  overflow and no text clipped by the container padding
- The `label | content` grid shows "About" beside the paragraph at `md+` and stacks above it below `md`
- Tabbing from the Work section reaches the journal link and the focus ring is the standard black ring
  with a page-background offset — no blue browser default
- A screen reader announces the link as "Read the journal on Instagram (opens in a new tab), link"
- Activating the link opens `instagram.com/chrobok.dev` in a new tab, leaving the page in place

**Implementation Note**: After completing this phase and all automated verification passes, pause here for
manual confirmation from the human that the manual testing was successful before proceeding to the next
phase.

---

## Phase 2: Inspection verification

### Overview

Prove the new markup satisfies the four NFRs and the three copy guardrails. No code changes are expected;
this phase produces evidence, and any failure it finds is fixed here.

### Changes Required:

#### 1. Guardrail sweep over the new copy

**File**: `src/components/about/About.astro` (verification only — no change expected)

**Intent**: Confirm the section introduces none of the three vault violations and none of the PRD's banned
content classes. Run the greps against all of `src/`, not just the new file, so the sweep doubles as a
regression check on the sections already shipped.

**Contract**: Case-insensitive searches over `src/` must all return zero matches:

- Client names — `rentola`, `rentbilly`, `reva media`
- Retracted claims — `sole frontend`, `primary frontend`, and any PR count (`\b\d{3} PRs?\b`)
- Availability — `available`, `notice period`, `start date`, `asap`
- Hard-coded design values — `border-black`, `#[0-9a-f]{3,6}`, `style="`

#### 2. NFR inspection pass

**File**: — (browser-side verification against the branch preview)

**Intent**: Check the section against the four PRD NFRs on the deployed preview rather than only on
localhost, since the preview is what a reviewer opens.

**Contract**: The checks enumerated under Success Criteria below. Contrast is measured against the known
token pairs (`#000000` and `#333333` on `#FAFAFA`), so it needs a spot check rather than a full audit.

### Success Criteria:

#### Automated Verification:

- All guardrail greps return zero matches across `src/`
- `yarn build` and `yarn lint` still pass after any fix applied in this phase
- The page's total HTML weight has not grown by more than a couple of kilobytes:
  compare `wc -c dist/index.html` against the pre-slice figure

#### Manual Verification:

- With JavaScript disabled, the paragraph and the journal link are both present and the link works
- Text contrast meets WCAG AA — spot-checked on the paragraph and on the link's label against the button's
  background
- No layout shift after first paint when the section enters the viewport (fonts are the only late asset
  and are already loaded by the sections above)
- The section renders correctly in Chromium, Firefox and WebKit at both mobile and desktop widths
- Read end to end, the page states no availability, no client name and no unverified number

**Implementation Note**: This is the final phase — after manual confirmation the slice is ready for
`/pr-ready about-and-journal`.

---

## Testing Strategy

There is no test runner in this project, by design (PRD §Non-Goals — zero moving parts). Verification is
three layers:

### Automated (build-time):

- `astro check` type-checks the component and its props (run inside `yarn build`)
- `yarn lint` enforces the ESLint flat config, including import ordering
- `.husky/pre-commit` runs `validate-branch-name` → `tsc --noEmit` → `lint-staged` on every commit

### Automated (output assertions):

- Greps over `dist/index.html` for the anchor, its `target`/`rel` pair and the `sr-only` span
- A grep for emitted JS bundles, asserting the section added none

### Manual Testing Steps:

1. `yarn dev`, scroll past Work — the About section appears with its label beside the paragraph
2. Narrow the window below `md` — the label stacks above the paragraph, nothing overflows
3. Tab from the Work section — focus lands on the journal link with the black ring visible
4. Activate the link — Instagram opens in a new tab, the site stays open behind it
5. With VoiceOver (or equivalent) — the link announces including "(opens in a new tab)"
6. Disable JavaScript and reload — paragraph and link are unchanged and the link still works
7. Read the whole page top to bottom — no availability, no client name, no unverified count

## Performance Considerations

The section adds one paragraph, one anchor and no assets. No image, no font weight, no script. The page's
JavaScript payload stays at zero, which the Phase 1 bundle-count check asserts rather than assumes.

## Migration Notes

Not applicable — no stored content, no data, no existing About section to migrate from.

## References

- Roadmap slice: `context/foundation/roadmap.md` → S-04 (`about-and-journal`)
- Requirements: `context/foundation/prd.md` → FR-008, FR-009, §Non-Functional Requirements, §Guardrails
- Design contract: `.claude/rules/design-system.md`, `context/foundation/design-notes.md`
- Section convention to mirror: `src/components/work/Work.astro:8-15`
- Link-as-button pattern to mirror: `src/components/hero/Hero.astro:27-30`
- Copy source of record: `~/Documents/GitHub/priv/pokerek_mind/kariera/05-bio-i-wiadomosci.md:70-74`
  (bio), `01-profil.md:74-76` (teaching), `03-doswiadczenie.md:401-405` (journal)
- Prior slice for plan and verification shape: `context/archive/2026-07-27-work-proof-block/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: About section with journal link

#### Automated

- [x] 1.1 Build and type-check pass: `yarn build`
- [x] 1.2 Lint passes: `yarn lint`
- [x] 1.3 The section renders into the static output (`id="about"` present once in `dist/index.html`)
- [x] 1.4 The journal anchor ships `target="_blank"` and `rel="noopener noreferrer"`
- [x] 1.5 The announced-new-tab `sr-only` span is inside the anchor
- [x] 1.6 No client-side JavaScript was added (JS bundle count unchanged)

#### Manual

- [x] 1.7 Reads as one paragraph plus one link at 375px, no horizontal overflow
- [x] 1.8 Label sits beside the paragraph at `md+` and stacks below `md`
- [x] 1.9 Journal link is keyboard-reachable and shows the standard focus ring
- [x] 1.10 Screen reader announces the link including "(opens in a new tab)"
- [x] 1.11 The link opens Instagram in a new tab, leaving the page in place

### Phase 2: Inspection verification

#### Automated

- [ ] 2.1 All guardrail greps return zero matches across `src/`
- [ ] 2.2 `yarn build` and `yarn lint` pass after any fix applied in this phase
- [ ] 2.3 Page HTML weight has not grown materially

#### Manual

- [ ] 2.4 With JavaScript disabled, paragraph and link are present and the link works
- [ ] 2.5 Text contrast meets WCAG AA on the paragraph and the link label
- [ ] 2.6 No layout shift after first paint
- [ ] 2.7 Renders correctly in Chromium, Firefox and WebKit at mobile and desktop widths
- [ ] 2.8 The page states no availability, no client name and no unverified number
