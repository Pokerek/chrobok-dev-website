# Skills — Two Honest Tiers — Plan Brief

> Full plan: `context/changes/skills-two-tier/plan.md`

## What & Why

Build the Skills section (roadmap S-03, FR-007, Linear CHR-33): a grouped technology list split into a
**core** tier and a **supporting** tier, with no ratings, levels, bars or percentages. The tier split is the
mechanism that keeps a supporting technology from reading as strongly as React — collapsing it back to one
flat list would quietly break the no-overstatement guardrail the site, the CV and the portals must jointly
satisfy.

## Starting Point

`index.astro` mounts Hero and Work; there is no Skills section. The rendering pattern this slice needs
already ships in `SologyRole.astro:49-64` — a tier array rendered as caption plus a chip list wired with
`aria-labelledby`. `Section.astro` supplies the anchor and grid, `tagStyles` supplies the chip. The build is
one component; the work is the content decision behind it.

## Desired End State

A reader scrolling past Work reaches a `#skills` section with two labelled bands. Each band has a heading, a
one-line gloss saying what membership in it means, and captioned rows of technology chips grouped by
category. Every chip is traceable to a `core` or `uzupełniające` row in the vault, and no chip contradicts
how the same technology is tiered in the Work section above it.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Source of truth for tier membership | The `kariera/02-umiejetnosci.md` vault, not FR-007 | FR-007 puts Rails and SQL in supporting; the vault marks both *liznięte* with an explicit do-not-list, so following the PRD would ship the claims the 2026-07-21 audit removed. |
| Rails, SQL, Docker, Redis | Omitted entirely, not softened | A tag reads as a skill claim regardless of surrounding prose; there is no honest way to show them. |
| Internal layout | Categories nested inside each tier | Scannable by category and matches the CV block a recruiter may be holding beside the page. |
| Category sets | Only the categories each tier actually has | Avoids one-chip filler rows like "Languages: Sass". |
| Tier headings | Caption plus a one-line gloss | "Supporting" is ambiguous alone — a reader could take it as "supporting technologies of the core stack" rather than a proficiency statement. |
| AI tooling | Claude Code in core, in its own category | The vault rates it core, and it is the only concrete referent for the hero's "AI is a tool I use every day". |
| Breadth | Everything vault-eligible (~23 chips) | The vault's level definitions already are the defensibility test; a second trim would have no written rule behind it. |
| Overlap with Work | Accepted | The two sections answer different questions — "used on that job" vs "what I bring" — and re-opening shipped S-02 copy costs more than eight repeated words. |
| Verification | `yarn build` plus manual inspection | No test runner exists; this matches how S-01 and S-02 were verified. |

## Scope

**In scope:** `src/components/skills/Skills.astro` with its full content; mounting it in `index.astro` after
Work; a dated FR-007 correction note in the PRD; an inspection pass covering a11y, no-JS, contrast, CLS and
the vault cross-check.

**Out of scope:** any new `src/ui/base` primitive or CVA variant; any React island; edits to `SologyRole.astro`
or other shipped S-02 copy; the sticky nav (S-06, which will consume the `#skills` anchor); About, journal and
footer (S-04, S-05); tests.

## Architecture / Approach

One `.astro` component holding a module-scope `SKILL_TIERS` constant shaped tier → categories → items, and
rendering it with a double `map` inside the existing `Section` primitive. Headings run `h2` (section) → `h3`
(tier); category captions stay `<p id>` referenced by `aria-labelledby` so list labels never enter the
document outline. All caption ids are namespaced `skills-` because `SologyRole.astro` already owns
`sology-stack-*` on the same page.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Skills section | The component, its content, and the page mount | An unsized `h3` — `globals.css` styles only `h1`/`h2`, so a tier heading without a size class renders smaller than body text |
| 2. Spec reconciliation | Dated FR-007 correction in the PRD | Over-editing the requirement instead of appending an amendment |
| 3. Inspection verification | Proof of a11y, no-JS, contrast, CLS, and chip-by-chip vault agreement | Manual-only — no runner exists, so it is only as good as the checker |

**Prerequisites:** F-01 (design-system contract) and F-02 (release staging), both done. Read access to
`~/Documents/GitHub/priv/pokerek_mind/kariera/02-umiejetnosci.md`.
**Estimated effort:** ~1 session; Phase 1 is the bulk, Phases 2 and 3 are short.

## Open Risks & Assumptions

- The vault snapshot is dated 2026-07-21/23. If a level changed since, the shipped chips go stale silently —
  Phase 3's cross-check is the only guard.
- Assumes the vault's confidentiality and retraction rules extend to the website, which is an extension the
  author made on 2026-07-27 rather than something the vault's own scope line says.
- With every vault-eligible item shown and categories nested, this becomes the second-tallest section on the
  page; if it reads as heavy on the preview, the fix is trimming supporting, not removing the tier split.
- FR-007's example list stays wrong anywhere it is quoted outside the PRD.

## Success Criteria (Summary)

- A reader can scan the whole stack in one pass and tell core from supporting without any number on screen.
- Nothing on the page is a claim the author would have to walk back in a technical interview.
- The section is fully readable by keyboard, by screen reader, and with JavaScript disabled.
