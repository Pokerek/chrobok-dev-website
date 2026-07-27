# Work — The Proof Block — Plan Brief

> Full plan: `context/changes/work-proof-block/plan.md`

## What & Why

The hero that shipped in S-01 deliberately carries the bare title "Frontend Developer" with no seniority
calibration — FR-001's resolution moved that job here. This slice builds the Work section: the Rentola
role with its ownership scope, four outcome-based numbers, and stack tags split into honest core and
supporting tiers, plus Meetmedia as a closing line. Roadmap **S-02**, covering US-01 and FR-004/005/006.
If this block doesn't state the level explicitly, nothing on the page does and the reader guesses down.

## Starting Point

`src/pages/index.astro` renders `Layout → <main> → <Hero />` and stops. Everything the section needs from
F-01 exists and is frozen: the `Section` primitive with its `label | content` grid, the full token set,
the flattened radius scale, and a global `:focus-visible` ring. Missing: any tag primitive —
`src/ui/base/` holds only `button/`, and the hero plan deferred tags to "S-02/S-03". No test runner
exists, by design.

## Desired End State

Scrolling past the hero reveals a section labelled **Work**. A reader can state that the author was the
sole frontend developer of a greenfield multi-tenant rental marketplace owning the registration and
subscription funnel, payments and CRO; can read four proof points each led by a number; and can see in
words which technologies are core and which are supporting. The section ships zero JavaScript and adds
no focusable element.

## Key Decisions Made

| Decision            | Choice                                              | Why                                                                                       | Source   |
| ------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Proof points        | All four (A/B, locales, SEO migrations, payments)   | Exactly what FR-005 names as "the numbers shown"                                            | Plan     |
| Proof-point format  | Quantified bullets, number leading each line        | The count is the first thing scanned on every row; collapses cleanly on a phone             | Plan     |
| Seniority signal    | Ownership scope **plus** the junior→owner growth arc | Author profile says the self-taught path is "part of the story, don't hide it"              | Plan     |
| Scope wording order | Scope first, arc second                             | A skimmer meets the ownership claim before the word "junior" — mitigates anchoring down     | Plan     |
| Tag component       | Shared primitive at `src/ui/base/tag/`              | S-03 runs in parallel and needs the same vocabulary; a settled contract beats two divergent ones | Plan |
| Tier distinction    | Labelled rows ("Core" / "Supporting"), identical tags | FR-006's whole point is stating proficiency honestly — a fill difference only implies it  | Plan     |
| Meetmedia           | One closing line, stack named in prose               | Satisfies FR-004's "closing line" and FR-006's stack requirement using existing copy verbatim | Plan   |
| Dates               | Exact months, `Aug 2023 – Jul 2026`                  | Matches CV and LinkedIn; the no-inflation guardrail is sharper than the inferred-availability risk | Plan |
| Section layout      | Uses the `Section` `label` slot                      | First exercise of the F-01 label pattern — sets the convention S-03–S-05 follow             | Plan     |
| Tag rendering       | `tagStyles()` applied to `<li>` in Astro             | Mirrors how Hero uses `buttonStyles()`; keeps React out of the page's module graph          | Plan     |
| `h3` sizing         | Type utility at the call site                        | The scale sizes only `h1`/`h2`; `globals.css` is F-01-frozen and must not gain an `h3` rule | Plan     |

## Scope

**In scope:** `src/ui/base/tag/` primitive (styles, types, component); `src/components/work/Work.astro`;
all Work copy; mounting the section in `index.astro`; a11y, no-JS, contrast, mobile and guardrail
verification of the new markup.

**Out of scope:** Skills (S-03), About/journal (S-04), footer (S-05), sticky nav (S-06); any edit to
`Section.astro`, `globals.css` or `tailwind.config.mjs`; tag interactivity; case studies; a test runner;
OG metadata.

## Architecture / Approach

Two additions, both composed from frozen F-01 pieces. `Tag` follows the `button/` folder contract
(`.styles.ts` CVA, `.types.ts`, `.tsx` with `forwardRef`) and exists so S-03 inherits a settled
component. `Work.astro` fills the `Section` `label` slot with its `<h2>`, then lays out heading → meta
line → ownership scope → four bullets → two captioned tag rows → Meetmedia line. Tags are `<li>` elements
carrying `tagStyles()`; the React component is not rendered, so no client JavaScript enters the build.

## Phases at a Glance

| Phase                    | What it delivers                                          | Key risk                                                                     |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1. Tag primitive         | `src/ui/base/tag/` — the contract S-03 inherits            | Over-building a variant axis the design deliberately doesn't have               |
| 2. Work section          | `Work.astro`, all copy, tiered tags, mounted in the page   | The `h3` silently rendering at UA default size; the label grid falling through to one column |
| 3. Inspection verification | Proof of a11y, no-JS, contrast, CLS and both guardrails  | Manual-only verification — no test runner exists, so it's only as good as the checker |

**Prerequisites:** F-01 and F-02 — both Done. Work happens on `feat/work-proof-block`, already branched
from `development` at `82a3d55`.
**Estimated effort:** ~1 session across 3 phases.

## Open Risks & Assumptions

- **The exact end date is an inferred availability signal.** `Aug 2023 – Jul 2026` ends this month, so a
  reader can deduce the author is on the market — which the PRD forbids stating "of any kind". Decided in
  favour of CV agreement, since employment dates are standard CV content and a mismatch with LinkedIn
  reads as inflation. Revisit if the date drifts further from the present.
- **"Junior" appears in the one block that exists to stop the reader guessing downward.** Mitigated by
  ordering scope before the arc, but a fast skimmer could still catch the word first.
- **`text-sm` is 0.4px off the documented 0.9rem accent token.** Accepted rather than shipping an
  arbitrary value or editing frozen config — recorded so a review reads it as a decision, not drift.
- **Verification is entirely manual** beyond build, lint and greps. No test runner exists by design.
- **S-03 may want a `tier` variant on `Tag`.** This slice ships none, because the tiers are distinguished
  by caption. Adding one later is additive, not a rewrite.

## Success Criteria (Summary)

- A reader can state the author's level from the Work block alone — ownership scope, not a self-assigned
  title — and can read at least four outcome-based proof points, two of them counted.
- Core and supporting technologies are distinguishable in words, so no reader infers uniform proficiency
  across React and Ruby on Rails.
- The section ships zero JavaScript, adds no focusable element, causes no layout shift, and states no
  availability, start date or notice period.
