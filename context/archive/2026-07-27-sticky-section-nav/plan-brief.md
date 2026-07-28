# Sticky Section Navigation (S-06) — Plan Brief

> Full plan: `context/changes/sticky-section-nav/plan.md`

## What & Why

Roadmap slice **S-06**, covering **FR-012**: a sticky header, on every breakpoint, from which a visitor can
jump to any section. It is the first global chrome the site has had — everything shipped so far lives inside
`<main>` — so the slice also settles how the page skeleton reserves space for a persistent bar without
breaking the anchor landings `Section.astro` has emitted since F-01.

## Starting Point

Four anchors exist (`#hero`, `#work`, `#skills`, `#about`), all emitted by `src/components/layout/Section.astro:24`.
There is deliberately no `#journal` (S-04's call, flagged in the roadmap as "do not rediscover"). S-05
`footer-contact` is in flight on its own branch and owns `#contact`, so on this branch that one anchor does
not resolve yet. `scroll-mt-section` (2rem) was sized when nothing was sticky; `Hero.astro:14` reserves a
full viewport; `<main>` lives in the page rather than the layout; and the page ships zero JavaScript.

## Desired End State

On a phone, the hero still fits the first screen complete — name, role, stack, positioning line, both
buttons — with a hairline bar pinned above it carrying the wordmark and a **Menu** disclosure. Tapping Menu
reveals Work / Skills / About / Contact; a tap scrolls to the section, lands it clear of the bar, and closes
the menu. From `md` up the same four links sit inline. With scripts disabled everything still works, except
the menu stays open after a tap.

## Key Decisions Made

| Decision                | Choice                                                     | Why (1 sentence)                                                                            |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| S-05 dependency         | Link to `#contact`, never create it — S-05 owns the anchor   | The two branches touch disjoint files, so the merge is clean and neither slice waits on the other |
| Nav items               | Work · Skills · About · Contact, wordmark → `#hero`         | Fewest items that still cover every section; Home costs a slot the wordmark already provides    |
| Journal                 | No `#journal` anchor, not listed                            | S-04 settled it; the roadmap explicitly instructs this slice not to reopen it                   |
| Mobile pattern          | Native `<details>`/`<summary>` disclosure below `md`         | Keeps the bar tiny on the recruiter's viewport and needs no script to open or close             |
| Stickiness              | Pinned from the top; the hero shrinks to fit                | Literal reading of FR-012 — one behaviour, no conditional code, nav reachable on first paint    |
| Scroll offset           | New `header`/`anchor` spacing tokens from one constant       | Both the bar height and the anchor offset read one value, so they cannot drift apart            |
| Active state            | None                                                        | Scroll-spy would be the first hydrated JavaScript on the page for a decorative cue              |
| Motion                  | Smooth scroll, guarded by `prefers-reduced-motion`           | A long jump reads as movement rather than a teleport; the guard covers the accessibility case   |
| Menu close on tap       | Three-line `is:inline` script                                | Fixes the one genuinely broken interaction and degrades to "menu stays open" without scripts    |
| Header left / bypass    | Wordmark linking to `#hero`, plus a skip link                | Covers Home without a nav slot and closes the WCAG bypass-blocks gap before S-07 finds it       |

## Scope

**In scope:** `src/components/navigation/` (component + constants + types); the header-height constant and
the two derived spacing tokens; the `scroll-mt` swap in `Section.astro`; guarded smooth scroll in
`globals.css`; `<main>` moving into `Layout.astro`; the skip link; the hero's height correction; the NFR
sweep.

**Out of scope:** active-section highlighting, scroll-spy, any React island; a `#journal` anchor; **any
change to `Footer.astro`, including the `#contact` id** (S-05's branch); hide-on-scroll or
shrink-on-scroll; `tabindex="-1"` on anchor targets; any change to `src/ui/base/**`; a test runner; OG
metadata; dark mode.

## Architecture / Approach

One constant in `tailwind.config.mjs` derives `spacing.header` (the bar) and `spacing.anchor` (bar +
section rhythm), which `Section.astro` consumes as `scroll-mt-anchor` and `Hero.astro` subtracts from
`100svh`. `Navigation.astro` renders a `sticky top-0` header wrapping the existing `container`, holding a
wordmark and one `<nav aria-label="Sections">` with two lists driven by the same `NAV_ITEMS` constant —
`hidden md:flex` inline, and a `md:hidden` `<details>` whose panel is absolutely positioned against the
header so the bar's height never changes. `Layout.astro` mounts the skip link, the header, then
`<main id="main-content">`.

## Phases at a Glance

| Phase                       | What it delivers                                                     | Key risk                                                                            |
| --------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1. Anchor & token foundation | Tokens, anchor offset, smooth scroll, `<main>` in layout             | Renaming a token on the shared primitive silently misses a call site                     |
| 2. Navigation component      | The sticky bar, skip link, disclosure, hero height correction        | Tailwind eating the spaces in the hero's `calc()`, dropping the declaration with no error |
| 3. Inspection verification   | Evidence for FR-012 and all four NFRs                                | Manual beyond build, lint and greps — no test runner exists                              |

**Prerequisites:** F-01, F-02, S-01–S-04 — all done. S-05 runs in parallel on its own branch and owns
`#contact`; this slice links to it and creates nothing in the footer, so the two branches never touch the
same file. Work happens on `feat/sticky-section-nav`, branched from `development` at `16813fb`.
**Estimated effort:** ~1–2 sessions across 3 phases.

## Open Risks & Assumptions

- **The bar costs first-screen area on mobile** — accepted deliberately in FR-012's Socratic note, and paid
  for here by shrinking the hero's reserved height. Whether the hero still reads well is a preview
  judgement, not something the plan can settle.
- **The Contact link is inert on this branch.** It resolves only once S-05 merges into `development` — so
  FR-012 closes on the integration branch, not on this preview. Two things to verify there: that S-05's
  footer `id` is exactly `contact`, and that if S-05 adopts the `Section` primitive it inherits
  `scroll-mt-anchor` rather than reintroducing `scroll-mt-section`.
- **Anchor navigation and keyboard focus.** No `tabindex="-1"` is added — browsers move the sequential focus
  starting point to a fragment target on their own. If Phase 3 finds an engine that does not, adding it to
  `Section.astro` is a one-line fix, otherwise it is S-07's call.
- **Smooth scroll widens the v1 motion ceiling** that F-01 set at `transition-colors`. Guarded by
  `prefers-reduced-motion`, and revertible in one line.
- **`spacing.anchor` assumes a closed menu.** The disclosure panel is absolutely positioned specifically so
  the assumption holds; a future change that lets the bar grow breaks every landing at once.
- **Verification is manual beyond build, lint and greps.** No test runner exists, by design.

## Success Criteria (Summary)

- From any scroll position, on any breakpoint, a visitor reaches Work, Skills or About in one interaction —
  two on mobile, counting the Menu tap — and lands with the section heading fully visible. Contact joins
  them when S-05 merges.
- The hero still shows name, role, stack, positioning line and both buttons without scrolling on a phone.
- The nav is fully usable by keyboard, announced as a named navigation landmark, and works with scripts
  disabled; the page gains no hydrated JavaScript and no layout shift.
