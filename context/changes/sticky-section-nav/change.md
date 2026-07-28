---
change_id: sticky-section-nav
title: Sticky section navigation across all breakpoints (S-06)
status: impl_reviewed
created: 2026-07-27
updated: 2026-07-28
archived_at: null
---

## Notes

Roadmap S-06 / PRD FR-012. Planned 2026-07-27.

**Parallel with S-05.** `footer-contact` is being built on its own branch and owns the `#contact` anchor.
This slice links to `#contact` and does not create it — `Footer.astro` is not touched here at all. The
consequence: on `feat/sticky-section-nav` the Contact link is inert, and FR-012 only closes once both
branches are on `development`.
