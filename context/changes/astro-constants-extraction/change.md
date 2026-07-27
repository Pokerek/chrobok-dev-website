---
change_id: astro-constants-extraction
title: Extract .astro constants and types into sibling files
status: new
created: 2026-07-27
updated: 2026-07-27
archived_at: null
---

## Notes

Extract module-scope constants and types out of feature `.astro` frontmatter into sibling
`componentName.constants.ts` / `componentName.types.ts` files, per the CLAUDE.md Architecture
convention added alongside this change.

Known targets (as of 2026-07-27, after S-03 lands):

| File | In frontmatter today |
| --- | --- |
| `src/components/skills/Skills.astro` | `Tier`, `TIER_VARIANT`, `TIER_LEGEND`, `SKILL_CATEGORIES` — ~85 lines of data |
| `src/components/work/SologyRole.astro` | `STACK_TIERS` |
| `src/components/work/MeetmediaRole.astro` | `STACK_CAPTION_ID`, `STACK` |
| `src/components/hero/Hero.astro` | `EMAIL`, `CV_PATH`, `CV_FILENAME` |
| `src/components/about/About.astro` | `JOURNAL_URL` |
| `src/components/footer/Footer.astro` | 1 constant |

Open question to settle at planning time: does the convention cover the `interface Props` that every
`.astro` component with props declares (`src/components/layout/Section.astro:13`), or only domain types
and content constants? `Section.astro`'s `const { id } = Astro.props` and `hasLabel` are runtime locals
and stay in frontmatter either way.

Depends on S-03 (`skills-two-tier`, PR #25) being merged — `Skills.astro` is the largest target and is
still in review.
