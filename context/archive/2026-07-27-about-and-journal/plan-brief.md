# About and Journal (S-04) — Plan Brief

> Full plan: `context/changes/about-and-journal/plan.md`

## What & Why

Roadmap slice **S-04**, covering **FR-008** and **FR-009**: a short bio paragraph carrying the decade of
teaching in one sentence, plus a labelled link out to the developer's journal at
`instagram.com/chrobok.dev`. Teaching is the differentiator the author's own brand notes call underused —
the ability to explain hard things simply is exactly what a portfolio page has to do — and 3.5 years of
daily journal entries is proof that copywriting cannot fake. Two adjacent low-weight sections combined so
neither becomes a one-line slice.

## Starting Point

`src/pages/index.astro` renders `Layout → <main> → <Hero /> → <Work />` and stops. Everything this slice
composes from is already built and frozen by F-01: the `Section` primitive with its `label | content`
grid, the full token set, the global `:focus-visible` ring, and `buttonStyles()` — which `Hero.astro`
already uses as a link skin, so no React reaches the page. `Work.astro` set the section convention this
one mirrors. Missing: the component, the copy, and its mount point. Nothing else.

## Desired End State

Scrolling past Work reveals a section labelled **About**. A reader learns the author has taught for a
decade — maths and programming — and that this is where his ability to explain hard things simply comes
from; then sees a bordered link naming the developer's journal and its destination, which opens Instagram
in a new tab with the context change announced to a screen reader. The section repeats nothing from Work:
no client, no role scope, no stack, no numbers. One paragraph, one link, zero JavaScript.

## Key Decisions Made

| Decision           | Choice                                                        | Why (1 sentence)                                                                                     |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Section structure  | One `#about` section, journal inside it                       | Avoids a genuinely thin one-line `#journal` section; the trade-off is recorded under Open Risks           |
| Bio content        | "Beyond code" — the person, not the CV                        | Says something Work cannot; lifted from the audited text already live on LinkedIn and justjoin.it        |
| Teaching sentence  | A decade, maths and programming, no dates                     | Vault text verbatim, so the site agrees with the portals by construction rather than by inspection        |
| Journal claim      | Daily, since January 2023 — no counts                         | Consistency is FR-009's whole rationale; the ~492 post count is flagged un-audited in the vault           |
| Link presentation  | Bordered link row below the paragraph                         | Reuses the hero's outline-button shape — the page's one established "this is clickable" affordance        |
| Link target        | New tab, announced via an `sr-only` suffix                     | Keeps the page open behind a third-party destination without failing the screen-reader NFR                |
| Copy source        | `pokerek_mind/kariera/`, never this repo's `author-profile.md` | The vault is post-audit; `author-profile.md` still carries all three retracted claims                     |
| Vault bio reuse    | Only the "Beyond code" paragraph                              | The vault's main bio names the client verbatim, which the confidentiality rule forbids on the site        |
| New primitive      | None                                                          | The journal link is an `<a>` wearing `buttonStyles()`, exactly as the hero's two links are                |

## Scope

**In scope:** `src/components/about/About.astro`; the bio and journal copy; the journal link row; mounting
the section in `index.astro`; a11y, no-JS, contrast, mobile and guardrail verification of the new markup.

**Out of scope:** a separate `#journal` section or anchor; Skills (S-03), footer (S-05), sticky nav (S-06);
any edit to `Section.astro`, `globals.css`, `tailwind.config.mjs` or `src/ui/base/**`; author photo,
Instagram embed or feed; post/follower counts; a test runner; OG metadata.

## Architecture / Approach

One new file and a two-line edit. `About.astro` fills the `Section` `label` slot with its `<h2>`, then
renders a `max-w-3xl` column holding one `<p>` (teaching sentence + journal sentence) and a `flex` link
row. The anchor carries `target="_blank" rel="noopener noreferrer"` with an `sr-only` span **inside** it,
so the accessible name ends "(opens in a new tab)" — placed outside the anchor it would announce as stray
text and the link would stay unannounced. `buttonStyles()` is imported for its class string only, so the
JavaScript payload stays at zero.

## Phases at a Glance

| Phase                      | What it delivers                                              | Key risk                                                                              |
| -------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1. About section           | The component, the copy, the link row, mounted in the page    | The `sr-only` span landing outside the anchor, silently defeating the announcement        |
| 2. Inspection verification | Evidence for the four NFRs and the three copy guardrails      | Manual-only beyond build, lint and greps — no test runner exists, so it's only as good as the checker |

**Prerequisites:** F-01 and F-02 — both Done. Work happens on `feat/about-and-journal`, already branched
from `development` at `089cb26`.
**Estimated effort:** ~1 short session across 2 phases — the smallest content slice in v1.

## Open Risks & Assumptions

- **The merged section deviates from the PRD's locked flow,** which lists About (5) and Journal (6) as
  separate steps. FR-008 and FR-009 are both still satisfied — the paragraph and the labelled link both
  ship — but the page carries one `#about` anchor where the flow implies two. **Consequence for S-06:** the
  sticky nav will list "About" and no "Journal"; that slice should not rediscover this as a gap.
- **The section is deliberately short** — two sentences. It is the least dense block on the page, which is
  the intended read of the roadmap's length-discipline risk, but it can also read as underweight next to
  the Work block directly above it. Worth one look on the preview before the cutover.
- **`target="_blank"` is a deliberate accessibility cost**, paid down with the `sr-only` announcement.
  If the S-07 hardening pass disagrees, reverting to a plain `href` is a one-line change.
- **Verification is manual beyond build, lint and greps.** No test runner exists, by design.
- **`context/foundation/author-profile.md` remains a trap for future slices** — it is a pre-audit snapshot
  containing the client name, the "sole frontend developer" claim and the PR counter. This plan sources
  copy from the `kariera/` vault instead; S-05 must do the same.

## Success Criteria (Summary)

- A reader can state that the author has taught for a decade and can open the developer's journal from a
  link that names both the thing and its destination.
- Nothing in the section repeats Work, states availability, names a client, or renders an unverified
  number.
- The section adds zero JavaScript, causes no layout shift, and is fully reachable and correctly announced
  by keyboard and screen reader.
