# Footer Contact (S-05) Implementation Plan

## Overview

Roadmap slice **S-05**, closing **FR-010** (email selectable as text, LinkedIn and GitHub reachable from
the footer) and **FR-011** (the CV as a direct, ungated PDF link). The contact facts move into one shared
constants file, `Footer.astro` grows from a copyright strip into the page's contact block, and the hero's
CV link is realigned to the behaviour settled here so both ends of the page point at the same artifact and
describe it the same way.

## Current State Analysis

- `src/components/footer/Footer.astro` is nine lines: a `<footer>` with a top border and a copyright line.
  `Layout.astro:26` renders it after `<slot />`, so it sits **outside** `<main>` — correct landmark
  placement, and this plan keeps it there.
- The footer carries two of the three hard-coded values `design-notes.md` flagged as "fix on the first
  content pass": `border-black` instead of `border-border-default` (`Footer.astro:5`), and raw `mt-2 pt-2`
  spacing instead of the token scale. This slice is that content pass for this file.
- `src/components/hero/Hero.astro:9-11` declares `EMAIL`, `CV_PATH` and `CV_FILENAME` as local frontmatter
  constants. The roadmap's one recorded unknown for S-05 is exactly *"what is the CV's public path and
  filename, so both this slice and S-01 link to the same target"* — two hard-coded copies is the drift it
  warns about.
- **The CV blocker is resolved.** `public/karol_chrobok_cv.pdf` exists and is already linked from the hero.
  The roadmap (S-05 "Blockers", S-08) and PRD Open Question 3 still record it as an external dependency;
  that record is stale as of this plan.
- `src/components/layout/Section.astro` is the F-01 skeleton primitive — container, `label | content` grid
  (`md:grid-cols-section`, collapsing below `md`), `py-section` and `scroll-mt-section`. It hard-codes a
  `<section>` element, so a `<footer>` cannot use it as written.
- `About.astro:38-45` set the external-link pattern this slice follows: `buttonStyles({ variant: 'outline' })`
  on an `<a>`, `target="_blank" rel="noopener noreferrer"`, and an `sr-only` span **inside** the anchor so
  the accessible name ends "(opens in a new tab)".
- `About.astro:39` also carries the S-07 workaround `cn(buttonStyles(...), 'h-auto min-h-10 …')`, because
  `button.styles.ts:14` pins `h-10` and any label that wraps (as every label does at 200% zoom) overflows
  the box. `src/ui/base/**` is F-01-frozen, so this plan repeats the call-site workaround rather than
  fixing the primitive.
- No test runner exists, by design. Verification is `astro check` + `astro build` + ESLint, plus a manual
  sweep — the same shape S-02 and S-04 used.

### Key Discoveries:

- Contact facts, sourced from `public/karol_chrobok_cv.pdf` and `pokerek_mind/kariera/personal-branding.md:37-38`
  (**not** `context/foundation/author-profile.md`, which is the pre-audit snapshot S-04 flagged as a trap):
  `karolchrobok@gmail.com`, `https://www.linkedin.com/in/karol-chrobok`, `https://github.com/Pokerek`.
- `tsconfig.json` sets `baseUrl: "./src"`, so `constants/contact.constants` resolves without a new alias.
- The CV PDF's own header reads "Available ASAP". That is the author's artifact and outside this
  repository — but it means the no-availability guardrail holds for the *page* and not for the linked file.
  Recorded, not acted on.
- `Layout.astro` renders `<Footer />` for every page, so giving the footer `id="contact"` also gives S-06
  its seventh nav anchor without a second component.

## Desired End State

A visitor who scrolls to the bottom of the page sees a block labelled **Contact**, aligned with the Work
and About labels on desktop and stacked below `md`. It shows the full email address as selectable,
clickable text; a row of three bordered links to LinkedIn, GitHub and the CV; the author's location; and
the copyright line. LinkedIn and GitHub open in a new tab with the context change announced to a screen
reader; the CV opens the PDF in the same tab with no download prompt and no gate.

Verify by loading the built page: the footer is reachable and operable by keyboard alone, every link works
with JavaScript disabled, the CV link resolves to the same file the hero links to, and nothing in the
footer states availability, a start date or a notice period.

## What We're NOT Doing

- **Not** moving `JOURNAL_URL` out of `About.astro`. It is the same class of fact, but relocating it
  touches shipped code for no FR in this slice; consolidation belongs to S-06 or S-07 if it happens at all.
- **Not** fixing `h-10` in `src/ui/base/button/button.styles.ts`. That is S-07 carried-in work against an
  F-01-frozen directory; this slice repeats the documented call-site workaround.
- **Not** adding a contact form, a newsletter, analytics, an obfuscated email, a copy-to-clipboard button
  or any JavaScript. PRD §Non-Goals; the footer ships zero JS.
- **Not** adding a "built with / source" line, social icons, or an availability, contract-form or
  notice-period statement.
- **Not** building the sticky nav (S-06) or wiring its links — this slice only provides the `#contact`
  anchor it will need.
- **Not** touching `index.astro`, `globals.css`, `tailwind.config.mjs` or `src/ui/base/**`.
- **Not** regenerating the CV PDF or editing its contents.

## Implementation Approach

Three phases, ordered so the riskiest edit to already-shipped code lands first and alone.

Phase 1 extracts the contact facts into `src/constants/contact.constants.ts` and points `Hero.astro` at
them, dropping the `download` attribute and relabelling to "View CV (PDF)" — a behaviour change to a
shipped section, verified in isolation. Phase 2 teaches `Section.astro` to render a caller-chosen tag and
rewrites `Footer.astro` on top of it, so the footer inherits the F-01 skeleton instead of copying it.
Phase 3 is the inspection sweep.

The `as` prop is a widening, not a change: the default stays `'section'`, so Hero, Work and About render
byte-identical markup. That is what Phase 2's regression criteria check.

## Critical Implementation Details

**The `sr-only` span goes *inside* the anchor.** Placed after the closing `</a>` it announces as stray
text and the link itself stays unlabelled for the change of context — the failure S-04 called out as its
key risk. Copy the shape from `About.astro:44`, don't re-derive it.

**Astro dynamic tags require a capitalised binding.** `const Tag = as;` then `<Tag …>` renders the tag
name; a lowercase `const tag` is treated as a literal HTML element named `tag`.

## Phase 1: Shared contact constants and hero alignment

### Overview

One new constants module, one shipped component pointed at it, and the CV link's behaviour and label
settled in the place that already ships it. No new UI.

### Changes Required:

#### 1. Contact constants module

**File**: `src/constants/contact.constants.ts` (new; `src/constants/` is a new directory)

**Intent**: Give the email, CV path, CV link label, profile URLs and location one home, so the hero and
the footer cannot state different things about the same fact.

**Contract**: Named `UPPER_SNAKE_CASE` string exports — `EMAIL`, `CV_PATH`, `CV_LABEL`, `LINKEDIN_URL`,
`GITHUB_URL`, `LOCATION`. Values: `karolchrobok@gmail.com`, `/karol_chrobok_cv.pdf`, `View CV (PDF)`,
`https://www.linkedin.com/in/karol-chrobok`, `https://github.com/Pokerek`, and the location line
(Silesia, Poland — remote; render the separator as an HTML entity at the call site, not in the string).
`CV_LABEL` lives here deliberately: both components render it verbatim, and the label drifting from the
behaviour is precisely what this phase is correcting.

#### 2. Hero CV and email links

**File**: `src/components/hero/Hero.astro`

**Intent**: Consume the shared constants instead of local copies, and make the CV link open the PDF in the
browser rather than forcing a save — the behaviour settled for both ends of the page.

**Contract**: Delete the local `EMAIL`, `CV_PATH` and `CV_FILENAME` frontmatter constants and import from
`constants/contact.constants` (`baseUrl` is `./src`, so no relative path and no new alias). The CV anchor
loses its `download` attribute; its label becomes `CV_LABEL`. The `mailto:` link and both buttons'
`buttonStyles({ variant: 'outline' })` skin are unchanged. `CV_FILENAME` disappears entirely — with no
`download` attribute there is nothing to rename.

#### 3. Project structure note

**File**: `CLAUDE.md`

**Intent**: `CLAUDE.md` instructs that its "Project structure" section is updated when the structure
changes; this phase adds a directory it does not list.

**Contract**: One line added to the structure list naming `src/constants` as the home for shared constant
modules, in the same style as the surrounding entries.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- No `download` attribute remains on a CV link: `grep -rn "download=" src/` returns nothing
- The email and CV path appear exactly once each in `src/`, in the constants module:
  `grep -rn "karolchrobok@gmail.com\|karol_chrobok_cv.pdf" src/`

#### Manual Verification:

- The hero's CV link opens the PDF in the browser tab instead of downloading it, and the button reads
  "View CV (PDF)"
- The hero's "Email me" button still opens a mail composer addressed to the right address
- The hero renders unchanged otherwise — same layout, same spacing, no shift at mobile or desktop width

**Implementation Note**: After this phase and all automated verification passes, pause for manual
confirmation before proceeding.

---

## Phase 2: Section `as` prop and the footer contact block

### Overview

Widen the F-01 skeleton primitive to render a caller-chosen element, then rebuild `Footer.astro` on it as
the page's contact block — with the two carried-in hard-coded values fixed on the way through.

### Changes Required:

#### 1. Polymorphic section element

**File**: `src/components/layout/Section.astro`

**Intent**: Let the footer inherit the container, the `label | content` grid, the gap and the scroll anchor
instead of hand-copying them, without changing what any current caller renders.

**Contract**: Add an optional prop `as?: 'section' | 'footer'` defaulting to `'section'`. The rendered
element becomes the prop's value; `id`, the `class:list` (`scroll-mt-section py-section` plus caller
classes), the `label` slot handling and the grid markup are untouched. Update the component's header
comment to say the primitive renders a caller-chosen landmark element.

#### 2. Footer contact block

**File**: `src/components/footer/Footer.astro`

**Intent**: Replace the copyright-only strip with the contact block FR-010 and FR-011 describe, keeping the
footer where it is in the layout and giving it the anchor S-06 will need.

**Contract**: Renders `Section` with `as="footer"`, `id="contact"` and `class="border-t border-border-default"`.
The `label` slot carries `<h2>Contact</h2>`, matching Work and About. The content column holds, in order:

1. The email as a plain underlined anchor whose visible text is the full address —
   `href={`mailto:${EMAIL}`}`. Not `buttonStyles`: its `link` variant still applies the `h-10 px-6` default
   size, which is wrong for inline text, and CVA's `defaultVariants` cannot be opted out of by passing
   `null`. Underline utilities only; the global `:focus-visible` rule supplies the ring.
2. The location line as supporting copy (`text-text-secondary`).
3. A `flex flex-wrap gap-element` row of three anchors sharing one locally-declared class string —
   `cn(buttonStyles({ variant: 'outline' }), 'h-auto min-h-10 text-center')`, the `About.astro:39`
   workaround declared once and reused three times rather than repeated inline. LinkedIn and GitHub carry
   `target="_blank" rel="noopener noreferrer"` and the inner `sr-only` "(opens in a new tab)" span; the CV
   anchor is a plain same-tab `href={CV_PATH}` labelled `CV_LABEL`, with no `download` and no new tab.
4. The existing copyright line, retained verbatim, in `text-text-secondary`.

`border-black` and the `mt-2 pt-2 text-center` spacing are gone — the border uses the token and the
vertical rhythm comes from `Section`'s `py-section`. Vertical spacing inside the column uses
`space-y-element` / `space-y-tight`. The build-time `new Date().getFullYear()` stays as is.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- No hard-coded colour utilities remain: `grep -rn "border-black\|text-black\|bg-white\|#[0-9A-Fa-f]\{3,6\}" src/components src/layouts` returns nothing
- The footer renders one `id="contact"` anchor and no nested `<section>` inside `<footer>` in
  `dist/index.html` after `yarn build`
- Hero, Work and About markup is unchanged by the `as` prop: their rendered wrappers in `dist/index.html`
  are still `<section id="hero|work|about">`

#### Manual Verification:

- The Contact label aligns with the Work and About labels on desktop and stacks above the content below `md`
- Email, LinkedIn, GitHub and CV are each reachable and operable by keyboard alone, each showing the focus
  ring; tab order follows visual order
- A screen reader announces the LinkedIn and GitHub links with the "(opens in a new tab)" suffix, and the
  email link with the address as its name
- The CV link opens the same PDF the hero links to, in the browser, in the same tab
- At 200% text zoom no link label is clipped by its box
- Nothing in the footer states availability, a start date, a notice period or a client name

**Implementation Note**: After this phase and all automated verification passes, pause for manual
confirmation before proceeding.

---

## Phase 3: Inspection verification

### Overview

The NFR and guardrail sweep for the new markup, matching the shape S-02 and S-04 used. No production code
changes; findings that need a fix are either fixed here or recorded as carried-in work for S-07.

### Changes Required:

#### 1. Verification record

**File**: `context/changes/footer-contact/inspection.md` (new)

**Intent**: Record the evidence behind each NFR and guardrail claim so S-07 inherits a checked baseline
rather than re-running the whole sweep blind.

**Contract**: One section per NFR (performance/layout stability, keyboard and screen reader, no-JS,
cross-engine) and one for the copy guardrails, each stating what was checked, how, and the result. Any
defect found but deliberately not fixed is listed with the slice that owns it.

### Success Criteria:

#### Automated Verification:

- Full build clean from a cold start: `yarn build`
- Lint clean: `yarn lint`
- Zero JavaScript shipped for the footer: no `<script>` tag attributable to the footer in `dist/index.html`
- All four footer destinations resolve — `mailto:` address correct, both profile URLs return 200,
  `/karol_chrobok_cv.pdf` is present in `dist/`

#### Manual Verification:

- Page reads correctly with JavaScript disabled — every footer link present and clickable
- Footer text meets WCAG AA contrast (`text-secondary` on `page-bg`, and the outline links' label on their
  hover background)
- No layout shift after first paint when the footer enters the viewport
- The page renders correctly at 375px width and on desktop, in a Chromium and a WebKit browser
- Guardrail read-through: the footer states no availability, no contract form, no notice period, names no
  client, and makes no competency claim

---

## Testing Strategy

There is no test runner in this project and this slice does not add one — PRD §Non-Goals keeps the MVP at
zero moving parts, and every prior slice verified the same way.

### Automated checks:

- `yarn build` — `astro check` (types, unused props, template errors) then the production build
- `yarn lint` — ESLint flat config, including import sorting
- Greps over `src/` and `dist/` for the specific regressions this slice can cause: a stray `download`
  attribute, a duplicated contact literal, a hard-coded colour, a nested landmark

### Manual testing steps:

1. `yarn dev`, scroll to the footer at desktop width — Contact label aligned with Work and About
2. Narrow to 375px — label stacks above the content, link row wraps, nothing overflows horizontally
3. Tab from the last About link through every footer link — focus ring visible on each, order matches
   visual order
4. Screen reader over the footer — email announces as the address, LinkedIn and GitHub announce the new-tab
   suffix, CV announces as "View CV (PDF)"
5. Click the CV link in the footer, then the one in the hero — same file, same in-browser behaviour
6. Set browser text size to 200% — no label clipped by its button box
7. Disable JavaScript, reload — footer identical and every link operable

## Performance Considerations

The footer adds no JavaScript, no font, no image and no network request. `buttonStyles` is imported for its
class string only, exactly as `Hero.astro` and `About.astro` do, so nothing hydrates. The one performance-
adjacent risk is layout shift, which is bounded by the same rule as the rest of v1: no animation beyond
`transition-colors`.

## Migration Notes

None — no stored data, no URLs change, and the footer is not linked from anywhere yet. The `as` prop on
`Section.astro` is backwards-compatible by default, so no caller needs updating.

## References

- Roadmap slice: `context/foundation/roadmap.md` (S-05)
- Requirements: `context/foundation/prd.md` (FR-010, FR-011, §Access Control, §Guardrails)
- Design contract: `.claude/rules/design-system.md`, `context/foundation/design-notes.md`
- External-link and workaround precedent: `src/components/about/About.astro:38-45`
- Prior slice of the same shape: `context/archive/2026-07-27-about-and-journal/plan.md`
- Contact facts: `public/karol_chrobok_cv.pdf`, `pokerek_mind/kariera/personal-branding.md:37-38`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Shared contact constants and hero alignment

#### Automated

- [x] 1.1 Build and type-check pass: `yarn build`
- [x] 1.2 Lint passes: `yarn lint`
- [x] 1.3 No `download` attribute remains on a CV link
- [x] 1.4 Email and CV path appear exactly once each in `src/`

#### Manual

- [ ] 1.5 Hero CV link opens the PDF in the browser and reads "View CV (PDF)"
- [ ] 1.6 Hero "Email me" button still opens a mail composer
- [ ] 1.7 Hero otherwise renders unchanged at mobile and desktop width

### Phase 2: Section `as` prop and the footer contact block

#### Automated

- [ ] 2.1 Build and type-check pass: `yarn build`
- [ ] 2.2 Lint passes: `yarn lint`
- [ ] 2.3 No hard-coded colour utilities remain in `src/components` or `src/layouts`
- [ ] 2.4 One `id="contact"` anchor and no nested `<section>` inside `<footer>` in `dist/index.html`
- [ ] 2.5 Hero, Work and About still render as `<section id="…">` — unchanged by the `as` prop

#### Manual

- [ ] 2.6 Contact label aligns with Work and About on desktop, stacks below `md`
- [ ] 2.7 Every footer link reachable and operable by keyboard, focus ring visible, tab order correct
- [ ] 2.8 Screen reader announces the new-tab suffix on LinkedIn and GitHub, and the address on the email link
- [ ] 2.9 Footer CV link opens the same PDF as the hero, in the browser, same tab
- [ ] 2.10 No label clipped at 200% text zoom
- [ ] 2.11 Footer states no availability, start date, notice period or client name

### Phase 3: Inspection verification

#### Automated

- [ ] 3.1 Full build clean from a cold start: `yarn build`
- [ ] 3.2 Lint clean: `yarn lint`
- [ ] 3.3 Zero JavaScript shipped for the footer
- [ ] 3.4 All four footer destinations resolve

#### Manual

- [ ] 3.5 Page reads correctly with JavaScript disabled
- [ ] 3.6 Footer text meets WCAG AA contrast
- [ ] 3.7 No layout shift after first paint when the footer enters the viewport
- [ ] 3.8 Renders correctly at 375px and desktop, in a Chromium and a WebKit browser
- [ ] 3.9 Guardrail read-through passes
