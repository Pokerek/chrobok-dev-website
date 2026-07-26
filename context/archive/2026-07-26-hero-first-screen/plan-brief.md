# Hero — First Screen — Plan Brief

> Full plan: `context/changes/hero-first-screen/plan.md`

## What & Why

The site's first screen is still a "Work in progress…" placeholder, which actively undercuts every CV,
LinkedIn and job-board profile that links to it. This slice replaces it with the hero: name, role title,
core stack, a one-line positioning statement, and a contact path — the four things a recruiter needs in
the seconds they spend deciding whether to keep reading. Roadmap **S-01**, covering US-01 and
FR-001/002/003.

## Starting Point

`src/pages/index.astro` is entirely placeholder markup — a `text-2xl` H1 saying "Work in progress...", a
journal sentence, and `/images/monk.webp`. Everything the hero needs already exists and is frozen by
F-01: the `Section` primitive with its collapsing `label | content` grid, the full token set, the
flattened radius scale, and a global `:focus-visible` ring. There is no header, no tag primitive, no CV
PDF and no test runner — all deliberate.

## Desired End State

Opening the site on a 375×667 phone with browser chrome visible shows, without any scrolling: **Karol
Chrobok**, **Frontend Developer**, **React · Next.js · TypeScript**, the positioning line, and two working
CTAs — a filled *Email* and an outline *CV*. No placeholder string survives anywhere in the build, and
the page is identical with JavaScript disabled.

## Key Decisions Made

| Decision            | Choice                                        | Why                                                                              | Source |
| ------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- | ------ |
| Positioning line    | Verbatim line + AI clarifier                  | Keeps the signature phrase while closing the "I don't use AI" misreading FR-002 flagged | Plan |
| Contact placement   | In-hero CTA pair, no header                   | Meets FR-003 without inventing structure S-06 will redesign anyway                | Plan   |
| CV link             | Wired to final path; file arrives later       | The roadmap's own stance; no rework, and the S-08 link check catches a forgotten file | Plan |
| Fold guarantee      | Viewport-height hero, copy sized to fit       | Makes the acceptance criterion structural rather than an accident of copy length  | Plan   |
| Viewport unit       | `min-h-svh`, not `dvh`                        | `dvh` resizes on URL-bar collapse — a layout shift after first paint, breaking CLS = 0 | Plan |
| Hero layout         | Full-width, no `label` slot                   | The opening statement isn't a labelled list entry; frees width on the tightest screen | Plan |
| Core stack          | Plain inline text line                        | Cheapest vertically, and avoids colliding with the tags S-02/S-03 land in parallel | Plan  |
| Placeholder         | Markup deleted; monk illustration reinstated  | Guardrail forbids placeholder *copy*; the illustration returned on desktop to fill the empty right column | Phase 1 |
| Illustration render | `astro:assets` `<Image>` + passthrough service | Emits intrinsic width/height (CLS), with no `sharp` dependency for an already-optimised webp | Phase 1 |
| Fold floor          | 375×667 (iPhone SE)                           | Smallest widely-used phone — if it fits here it fits everywhere real              | Plan   |
| Email address       | `karolchrobok@gmail.com`                      | Certainly real and monitored; a domain address would need routing that may not exist | Plan |
| CTA weighting       | Email filled, CV outline                      | Matches the "invite contact" voice guidance for the recruiter persona             | Plan   |
| CTA implementation  | `<a>` + `buttonStyles`, no React island       | NFR-3 requires full function with scripts disabled                                | Plan   |

## Scope

**In scope:** `Hero.astro` component; hero copy; email + CV CTAs; deletion of the placeholder markup from
`index.astro`; fold, keyboard, contrast and no-JS verification of the new markup.

**Out of scope:** header/nav (S-06), tag primitive (S-02/S-03), all other sections (S-02–S-05), the CV
PDF artifact, skip link and OG metadata (S-07 / declined), any test runner, and any edit to
`Section.astro`, the tokens or `globals.css` — the F-01 contract is frozen.

## Architecture / Approach

One new feature component, `src/components/hero/Hero.astro`, composed from the F-01 `Section` primitive
and styled only with existing tokens. `index.astro` becomes `Layout` → `<main>` → `<Hero />`. Copy lives
inline — the PRD rules out a content layer. CTAs are plain anchors carrying `buttonStyles(...)` through
`cn()`, so the slice ships zero client-side JavaScript.

## Phases at a Glance

| Phase                       | What it delivers                                              | Key risk                                                                     |
| --------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1. Hero section             | The component, the copy, both CTAs, placeholder deleted        | `.container` shrink-wrapping inside a flex section, silently breaking the desktop width |
| 2. First-screen verification| Proof of the no-scroll criterion plus a11y / no-JS / CLS checks| Copy overflowing the 375×667 budget, forcing an edit back into Phase 1        |

**Prerequisites:** F-01 and F-02 — both Done. Work happens on a `feat/…` branch off `development`.
**Estimated effort:** ~1 session across 2 phases.

## Open Risks & Assumptions

- ~~The CV link 404s on the preview~~ — **resolved during Phase 1.** The PDF landed at
  `public/karol_chrobok_cv.pdf` and serves `200 application/pdf`.
- **The fold budget is tight.** Heading, role, stack, a two-clause positioning line and two CTAs in
  ~560 usable pixels. If it doesn't fit, the AI clarifier is the first thing under pressure — and it is
  the one clause FR-002 says must not be cut. Spacing and type sizing give way first.
- **S-06 will likely add a second contact affordance** in the header, at which point the hero CTA pair
  may want trimming. Expected, not a defect.
- **Verification is entirely manual** beyond build/lint/grep. No test runner exists by design, so the
  fold criterion is only as reliable as the person checking it.

## Success Criteria (Summary)

- A first-time visitor on a phone can state the author's name, role and core stack, and reach an email
  address or the CV, without scrolling.
- No "Work in progress" or placeholder content appears anywhere in the built output.
- The page carries no availability, start date or notice period, works with scripts disabled, and shows
  no layout shift after first paint.
