---
change_id: footer-contact
title: Footer contact
status: implemented
created: 2026-07-27
updated: 2026-07-27
archived_at: null
---

## Notes

<!-- Free-form notes for this change: links, ad-hoc context, decisions that don't belong in research/frame/plan. -->

**2026-07-27 — contact block moved out of the footer.** Planned as a rewritten `Footer.astro` on a new `as`
prop for `Section.astro`; implemented instead as a separate `src/components/contact/Contact.astro` rendered
last inside `<main>`, with `Footer.astro` and `Section.astro` left exactly as they shipped. Consequence: the
footer's raw `mt-2 pt-2 text-center` spacing, which `design-notes.md` flagged for "the first content pass",
stays open as S-07 work. (The `border-black` that `design-notes.md` also flagged was already fixed — that
record was stale.)

**2026-07-27 — carried-in work for S-07: extract a `Link` component.** This slice added a third and fourth
copy of the bordered-link skin and the external-link `sr-only` pattern, both re-derived by hand at every
call site. Recorded in full under S-07 in `context/foundation/roadmap.md` — the last planned slice before
the S-08 production cutover, so it lands before v1 ships rather than after.
