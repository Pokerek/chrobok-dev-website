---
change_id: about-and-journal
title: About and journal
status: implemented
created: 2026-07-27
updated: 2026-07-27
archived_at: null
---

## Notes

### 2026-07-27 — About copy expanded to two paragraphs (deviation from plan.md)

`plan.md` Phase 1 specifies a single two-sentence paragraph, and `plan-brief.md` records "one
paragraph" as a Key Decision. During implementation the author judged the section too thin and
directed a longer version: **two titled blocks — the teaching/maths path, then the journal.**

Shipped instead of the planned copy:

1. **Teaching** — opens with the audited vault sentence verbatim (the planned copy in full), then
   expands: maths tutoring first and ongoing, then two and a half years of LEGO robotics classes for
   children, the common craft behind both, and debugging as a habit learned there.
2. **Developer's journal** — daily since January 2023, what the entries contain, and consistency as
   the point. The link row moved inside this block, directly under the paragraph it belongs to.

Each block carries an `<h3>`, giving the section an `h2 About → h3 / h3` hierarchy with no skipped
level. The `h3`s are sized with `text-2xl` at the call site, mirroring `SologyRole.astro` and
`MeetmediaRole.astro` — `globals.css` sizes only `h1`/`h2` and is F-01-frozen, so the call-site
utility is the established workaround rather than new drift.

### 2026-07-27 — Journal button clipped its label on mobile

Manual check at 375px found the link's label wrapping to a second line that overflowed the button
box. Root cause: `buttonStyles` pins `h-10` (a fixed 2.5rem) on the `default` size, so a wrapped
label has nowhere to go. At 375px the container leaves ~311px and "Read the journal on Instagram"
needs ~326px at the body's 16px.

Fixed at the call site, in two parts:

- **Label shortened** to "Journal on Instagram" (~240px), which fits on one line down to 320px and
  still names both the thing and its destination, as FR-009 requires.
- **Button made wrap-tolerant** — `cn(buttonStyles(...), 'h-auto min-h-10 text-center')`. `twMerge`
  strips `h-10`; `min-h-10` preserves the 40px touch target. This is not belt-and-braces: WCAG AA
  requires 200% text resize without loss of content, and at that zoom *any* label wraps and would
  clip against a fixed height.

**Latent elsewhere — for S-07.** `Hero.astro`'s two buttons carry the same unmodified `h-10` and
will clip identically at 200% zoom. Not fixed here: `src/ui/base/**` is F-01-frozen and out of this
slice's scope, and the durable fix is `h-10` → `min-h-10` in `button.styles.ts` itself, which
belongs to the hardening pass.

### Constraints held across the copy rewrite

Constraints held: no dates (durations only, so the 2020–2023 gap is not
foregrounded), no unverified counts, no client name, no availability, nothing repeated from Work.
The plan's Phase 1 block is left as written so `/10x-impl-review` sees the drift rather than a
retrofitted spec.
