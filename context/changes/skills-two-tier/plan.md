# Skills — Two Honest Tiers Implementation Plan

## Overview

Build the Skills section (roadmap S-03, FR-007, Linear CHR-33): a grouped technology list split into a
**core** tier and a **supporting** tier, each sub-grouped by category, with no ratings, levels, bars or
percentages. The section is the page's answer to "what does he actually bring", and the tier split is the
mechanism that keeps a supporting technology from reading as strongly as React.

The build is one `.astro` component reusing two primitives that already exist. The substance of this slice
is the content decision: every chip on the page must be defensible in an interview, which makes
`~/Documents/GitHub/priv/pokerek_mind/kariera/02-umiejetnosci.md` — not the PRD — the source of record for
what may appear.

## Current State Analysis

- `src/pages/index.astro` mounts `Hero` and `Work`. There is no Skills section and no `src/components/skills/`.
- **The exact rendering pattern already ships.** `src/components/work/SologyRole.astro:4-15,49-64` holds a
  `STACK_TIERS` array of `{ id, caption, items }` and renders each tier as a `<p id>` caption plus a
  `<ul role="list" aria-labelledby={id}>` of `tagStyles` chips. S-03 inherits this contract; the only delta
  is a category level nested inside each tier.
- `src/components/layout/Section.astro` supplies the `<section id>` scroll anchor, the container, and the
  `label | content` grid that collapses below `md`. Sections own their own heading levels.
- `src/ui/base/tag/tag.styles.ts` is a single exported class string (`tagStyles`), not a CVA — the design
  deliberately has no variant axis. Nothing in this slice should add one.
- **Content conflict discovered.** PRD FR-007 (`context/foundation/prd.md:179-185`) states the supporting
  tier "covers Node.js, **Rails, SQL** and infrastructure tooling". The vault's level inventory rates Ruby
  on Rails, SQL, Docker and Redis as *liznięte* with an explicit **"Nie wpisywać jako skill"**, and records
  Redis and Docker as *downgraded* on 2026-07-21 after an evidence audit. FR-007 is a pre-audit paraphrase;
  the vault is the source of record ([[kariera-vault-governs-site-copy]]). Resolved in this plan: the vault
  wins, FR-007 gets a correction note.
- **Two vault entries FR-007 never mentions are load-bearing.** `CSS` is core in its own right and is
  flagged in the vault as the intended counter to "only knows React". `Claude Code` was added as **core** on
  2026-07-23 and is the only concrete referent for the hero's claim at `src/components/hero/Hero.astro:23-25`
  ("I don't generate code, I craft it. AI is a tool I use every day").

## Desired End State

Visiting `/`, a reader scrolls past Work into a `#skills` section headed **Skills**, containing two labelled
bands. Each band has a heading, a one-line gloss saying what membership in that band means, and beneath it
several captioned rows of technology chips grouped by category. Nothing on the page states a level, a year
count, a percentage or a bar. Every chip is traceable to a `core` or `uzupełniające` row in the vault, and no
chip contradicts how the same technology is tiered in the Work section directly above it.

Verified by: `yarn build` passing, the section reachable and readable by keyboard and with scripts disabled,
and a chip-by-chip diff against `02-umiejetnosci.md`.

### Key Discoveries:

- Tier + chip render pattern to copy: `src/components/work/SologyRole.astro:49-64`.
- Caption/list ARIA wiring to preserve: `<p id>` + `<ul role="list" aria-labelledby>` —
  `src/components/work/MeetmediaRole.astro:30-35`.
- `globals.css:26-45` styles `h1` and `h2` explicitly but **not `h3`** — `Work.astro`'s role headings carry
  `class="text-2xl"` for that reason (`SologyRole.astro:20`). An unsized `h3` renders at UA default.
- Spacing tokens available: `space-y-section`, `space-y-element`, `space-y-tight`, `gap-tight`, `gap-grid`
  (`tailwind.config.mjs:29-38`). `tight` is the in-block step used for chip rows.
- Every named border radius resolves to `0` — chips are square by construction, nothing to opt out of.
- Tier-assignment cross-check: `SologyRole.astro` already tiers TypeScript, React, Next.js, Tailwind CSS,
  CSS and Jest as core, and Node.js, Playwright, Radix UI, Storybook, AWS and Sentry as supporting. The
  Skills section must agree with all twelve.

## What We're NOT Doing

- Not adding a new `src/ui/base` primitive or any React island — this section has no interactive state.
- Not showing levels, years, star ratings, progress bars, percentages or a proficiency matrix in any form.
- Not listing Ruby, SQL, Docker, Redis, jQuery, PHP, Cypress, Vitest, TanStack Query, JWT or Postman — all
  are *liznięte*, *brak*, or explicitly retracted in the vault.
- Not listing Figma, Crowdin or ESLint/Prettier — Figma and Crowdin have no level row in the vault at all,
  ESLint/Prettier is marked "higiena, nie skill".
- Not editing shipped S-02 *copy* — the role bullets, headings and dates stay as they are. The Work stack
  tags do change (see the Phase 1 amendment).
- Not adding the section to a navigation component — the sticky nav is S-06 and consumes the `#skills`
  anchor this slice creates.
- Not touching `src/components/about`, the journal or the footer — S-04 and S-05.
- Not adding tests — the repo has no test runner; verification for this slice is `yarn build` plus manual
  inspection, matching S-01 and S-02.

## Implementation Approach

One new component, `src/components/skills/Skills.astro`, holding its content as a module-scope constant and
rendering it with the tier pattern already proven in Work. The data shape gains one level over
`SologyRole.astro`'s: tier → categories → items, so the component maps twice.

Heading structure inside the section: `<h2 slot="label">Skills</h2>` for the section itself, `<h3>` per tier
(explicitly sized), and category captions as `<p id>` elements referenced by `aria-labelledby` on their list —
captions are not headings, so the document outline stays `h2 → h3` and does not gain a noisy fourth level for
what is a list label.

Content is transcribed from the vault once, at implementation time, and then verified against it again in
Phase 3. The PRD correction in Phase 2 exists so that the divergence between FR-007's example list and what
ships is recorded where the next reader looks, rather than in this change folder alone.

## Critical Implementation Details

**Heading size.** `globals.css` gives `h1` and `h2` an explicit `font-size` and stops there. An `h3` written
without a size class inherits the UA default and renders *smaller than body text* against the 28px `h2` — the
failure looks like a styling oversight but is invisible in the markup. (Superseded by the Phase 1 amendment:
the merged section has no `h3` at all. Kept because it still binds any future heading added here.)

**Category captions must not become headings.** Using `<h4>` for the category captions would technically
validate, but it puts "Languages" and "Testing" into the document outline at the same weight as content
sections, and a screen-reader heading list for a one-page site then fills with list labels. Keep them as
`<p id>` + `aria-labelledby`, matching the two shipped role components.

**Unique ids.** Every caption id is a document-level identifier, and `SologyRole.astro` already owns
`sology-stack-core` and `sology-stack-supporting`. Skills ids must be namespaced (`skills-core-languages`,
…) or the `aria-labelledby` references silently bind to the wrong element.

## Phase 1: Skills section

### Overview

Create the component with its full content and mount it in the page.

### Amendment (2026-07-27, during implementation)

The approved design — two tier bands, each with an `h3` heading and a gloss, categories nested inside — was
replaced at the author's direction by a **single merged section where the tier rides on the chip itself**.
Three consequences, all authorised:

1. `tagStyles` becomes a CVA with a `tier` axis (`core` → `border-solid`, `supporting` → `border-dashed`,
   default `core`). This reverses the plan's "not adding a CVA variant axis" exclusion.
2. Categories become the primary axis; each category row mixes core and supporting chips. A legend in the
   `label` slot — sample chip plus meaning, core row first — carries the honesty signal the tier headings
   used to carry.
3. The Work stack tags are restyled to the same vocabulary, so dashed never means two different things on
   one page. This reverses the plan's "not editing `SologyRole.astro`" exclusion. Role copy is untouched.

Content also moved during implementation, at the author's direction and **against** the vault in eight
places. Ruby on Rails returns to the supporting tier — reversing this change's founding "vault wins"
decision and landing back on what FR-007 originally specified. The full divergence list is in the Todoist
task raised for reconciling the vault (see References).

### Changes Required:

#### 1. Tag primitive — tier variant

**File**: `src/ui/base/tag/tag.styles.ts`, `tag.types.ts`, `tag.tsx`

**Intent**: Give the chip a two-value tier axis so a single list can carry both tiers visually.

**Contract**: `tagStyles` becomes `cva(<current base classes>, { variants: { tier: { core: 'border-solid',
supporting: 'border-dashed' } }, defaultVariants: { tier: 'core' } })`. `TagProps` gains
`VariantProps<typeof tagStyles>`; `Tag` destructures `tier` and passes it through `cn(tagStyles({ tier }), …)`.
Existing call sites become `tagStyles()` and render byte-identically.

#### 2. Skills component

**File**: `src/components/skills/Skills.astro`

**Intent**: Render the vault's skill inventory as one category-grouped list whose chips carry their own
tier, preceded by a legend that decodes the two chip styles.

**Contract**: `type Tier = NonNullable<VariantProps<typeof tagStyles>['tier']>` derived from the CVA so the
data cannot drift from the variant axis. Two constants: `TIER_LEGEND`
(`{ tier: Tier; label: string; meaning: string }[]`) and `SKILL_CATEGORIES`
(`{ id: string; caption: string; items: { name: string; tier: Tier }[] }[]`).

Rendered inside `<Section id="skills">`. The `label` slot holds `<h2>Skills</h2>` above a `<dl>` legend —
one `<div>` per entry with the sample chip as `<dt class={tagStyles({ tier })}>` and its meaning as `<dd>`,
core first. The content slot holds one block per category: `<p id={category.id}>` caption plus
`<ul role="list" aria-labelledby={category.id} class="flex flex-wrap gap-tight">` of
`<li class={tagStyles({ tier: item.tier })}>`. Supporting chips carry a `<span class="sr-only">` "(supporting)"
suffix, because a dashed border is a purely visual signal. All ids prefixed `skills-`.

The content as shipped:

| Category | Core | Supporting |
| --- | --- | --- |
| Languages | TypeScript, JavaScript, HTML, CSS | — |
| Frameworks & UI | React 19, Next.js 14, Astro, Tailwind CSS | Radix UI, Sass |
| Testing & docs | Jest, Testing Library | Playwright, Storybook |
| Backend & data | REST APIs | Node.js, next-auth, Ruby on Rails |
| i18n & experimentation | Lingui, GrowthBook | — |
| Infrastructure | — | AWS, Sentry |
| Tooling | Git, GitHub | — |
| AI-assisted development | Claude Code, Cursor | — |

Legend wording may be adjusted for tone but must keep two properties: it states what membership in the tier
means, and it does not name a level, a year count or a number.

#### 3. Work stack tags

**File**: `src/components/work/SologyRole.astro`, `src/components/work/MeetmediaRole.astro`

**Intent**: Keep one visual vocabulary on the page — a dashed chip means "supporting" everywhere.

**Contract**: `SologyRole`'s `STACK_TIERS` entries gain a `tier` field driving `tagStyles({ tier: tier.tier })`;
Ruby on Rails joins its supporting items. `MeetmediaRole`'s untiered historical stack uses `tagStyles()`
(solid, unchanged). No role copy, heading, date or bullet is touched.

#### 4. Page mount

**File**: `src/pages/index.astro`

**Intent**: Place Skills in the locked page flow — after Work, before the sections S-04 and S-05 will add.

**Contract**: `import Skills from '../components/skills/Skills.astro';` and `<Skills />` immediately after
`<Work />` inside `<main>`.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- Section renders at the `#skills` anchor in the built output

#### Manual Verification:

- Both tiers render with heading, gloss and all category rows; tier headings are visibly larger than body
  text and do not out-weigh the `h2`
- Chip rows wrap cleanly at 320px, at the `md` breakpoint boundary, and at container max width
- No rating, bar, percentage, year count or level appears anywhere in the section

---

## Phase 2: Spec reconciliation

### Overview

Record the vault-wins decision in the PRD so FR-007's example list stops contradicting the shipped page.

### Changes Required:

#### 1. FR-007 correction note

**File**: `context/foundation/prd.md`

**Intent**: FR-007's Socrates resolution names Rails **and SQL** as supporting-tier members and describes a
core tier that omits several things that shipped. Rails is on the page as specified; SQL is not. Append a
dated correction under FR-007 recording where the shipped section departs from its example list and why,
leaving the requirement itself (two tiers, no ratings) intact.

**Contract**: A `> **Correction (2026-07-27, S-03):**` blockquote appended to the FR-007 entry, in the same
blockquote style as the existing `> Socrates:` notes. It records: SQL, Docker and Redis are excluded as
*liznięte* per `kariera/02-umiejetnosci.md`; Ruby on Rails ships as supporting per FR-007 despite the same
ruling; CSS, Astro, Git/GitHub and the AI tooling join core, none of which FR-007 names; and the two tiers
are expressed as one merged list with a chip-level variant rather than two bands. Does not alter the FR-007
requirement line.

### Success Criteria:

#### Automated Verification:

- No build impact: `yarn build` still passes

#### Manual Verification:

- FR-007's requirement line is unchanged and the correction reads as an amendment, not a rewrite
- A reader arriving at FR-007 cold can tell why the shipped page omits Rails and SQL

---

## Phase 3: Inspection verification

### Overview

Prove the section against the NFRs and against the guardrail that motivates the whole slice.

### Changes Required:

No code changes expected. Any defect found here is fixed in place and re-verified.

### Success Criteria:

#### Automated Verification:

- Build, type-check and lint clean on the final state: `yarn build` and `yarn lint`

#### Manual Verification:

- **Vault cross-check**: every chip is traceable to a `core` or `uzupełniające` row in
  `~/Documents/GitHub/priv/pokerek_mind/kariera/02-umiejetnosci.md`; no *liznięte*, *brak* or struck-through
  entry appears
- **Internal consistency**: no technology is tiered core in Skills and supporting in `SologyRole.astro`, or
  the reverse
- **Confidentiality**: no client or product name and no internal repo identifier appears in the section
- **Keyboard and screen reader**: the section is reachable in tab order without traps, and each chip list is
  announced with its category caption via `aria-labelledby`
- **No-JS**: with scripts disabled, the full section renders with all content
- **Contrast**: caption and gloss text on `element-bg` and `page-bg` meets WCAG AA
- **No CLS**: no layout shift after first paint; the section adds no motion beyond the global hover
  transitions

**Implementation Note**: After each phase's automated verification passes, pause for manual confirmation from
the human before proceeding to the next phase.

---

## Testing Strategy

The repo has no test runner and this slice adds none — consistent with S-01 and S-02, where verification is
`yarn build` (which runs `astro check`) plus manual inspection.

### Manual Testing Steps:

1. `yarn dev`, open `/`, scroll to Skills — confirm two tiers, glosses, and every category row.
2. Narrow to 320px and confirm chip rows wrap and the section grid collapses to one column below `md`.
3. Tab through the page and confirm the section introduces no focus trap and no unexpected stop.
4. Disable JavaScript, reload, confirm the section is fully present.
5. Open `02-umiejetnosci.md` beside the rendered page and check every chip against its level row.
6. Compare Skills tier membership against the `STACK_TIERS` in `SologyRole.astro` for the twelve shared
   technologies.

## Performance Considerations

Static markup with no images, no scripts and no new fonts. The only cost is page height.

## Migration Notes

None. New section, additive; the `#skills` anchor is the interface S-06 will consume.

## References

- Roadmap slice: `context/foundation/roadmap.md:160-170` (S-03)
- Requirement: `context/foundation/prd.md:179-185` (FR-007)
- Content source of record: `~/Documents/GitHub/priv/pokerek_mind/kariera/02-umiejetnosci.md`
- Pattern to follow: `src/components/work/SologyRole.astro:49-64`
- Prior slice for structure and verification shape: `context/archive/2026-07-27-work-proof-block/plan.md`
- Tracker: Linear CHR-33 (`context/foundation/tasks-linear.md:42`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Skills section

#### Automated

- [x] 1.1 Build and type-check pass: `yarn build`
- [x] 1.2 Lint passes: `yarn lint`
- [x] 1.3 Section renders at the `#skills` anchor in the built output

#### Manual

- [x] 1.4 Legend and all category rows render; solid/dashed chip variants legible
- [x] 1.5 Chip rows wrap cleanly at 320px, at the `md` boundary, and at container max width
- [x] 1.6 No rating, bar, percentage, year count or level appears anywhere in the section

### Phase 2: Spec reconciliation

#### Automated

- [ ] 2.1 No build impact: `yarn build` still passes

#### Manual

- [ ] 2.2 FR-007's requirement line unchanged; correction reads as an amendment
- [ ] 2.3 A cold reader can tell why the shipped page omits Rails and SQL

### Phase 3: Inspection verification

#### Automated

- [ ] 3.1 Build, type-check and lint clean on the final state

#### Manual

- [ ] 3.2 Vault cross-check: every chip traceable to a core or uzupełniające row
- [ ] 3.3 Internal consistency: no tier contradiction with `SologyRole.astro`
- [ ] 3.4 Confidentiality: no client, product or internal repo name in the section
- [ ] 3.5 Keyboard and screen reader: no trap; chip lists announced with their caption
- [ ] 3.6 No-JS: full section renders with scripts disabled
- [ ] 3.7 Contrast: caption and gloss text meets WCAG AA
- [ ] 3.8 No CLS: no layout shift after first paint, no added motion
