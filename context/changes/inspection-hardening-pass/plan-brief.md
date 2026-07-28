# Inspection Hardening Pass — Plan Brief

> Full plan: `context/changes/inspection-hardening-pass/plan.md`

## What & Why

S-07 is the last content slice before the v1 cutover. It makes the four PRD Non-Functional
Requirements actually true — sub-second read with no layout shift, full keyboard and
screen-reader reachability at WCAG AA contrast, complete availability without JavaScript, and
correct rendering across the mainstream engines — and retires the accessibility debt S-04 and
S-05 deliberately deferred into it. This is where the craftsmanship positioning is paid or
refuted.

## Starting Point

Five content sections and the sticky nav are built and merged. Research found two regressions
nobody had recorded. **The webfonts have never shipped**: the built CSS names Ramaraja and IBM
Plex Mono but contains zero `@font-face` rules, because the `@fontsource` imports sit after the
`@tailwind` directives (so PostCSS silently drops them) *and* because `@fontsource/ramaraja/700.css`
does not exist — the package ships weight 400 only. The site renders in system serif and monospace
today. **The hero image is downloaded on phones and never displayed** (`hidden md:block` does not
prevent the fetch). On top of that: `button.styles.ts` pins `h-10` so labels clip at 200% zoom;
three link affordances are hand-re-derived at six call sites with no owning component; the `<head>`
has no OpenGraph tags or canonical; and a 140 KB React chunk is built for a page with zero islands.

## Desired End State

The deployed page renders in its real typefaces with no shift after first paint; phones fetch
nothing they cannot see; every link comes from one component that cannot forget the external-link
contract; a pasted link renders a titled preview card; the build emits no JavaScript at all; and
`docs/nfr-inspection.md` has been run end to end with the ticked checklist in the PR.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Font loading | Preload + `font-display: optional` | Makes a post-paint shift structurally impossible, which is what the NFR literally demands | Plan |
| Heading weight | Ramaraja 400, drop the `700` rules | Avoids synthetic bold on a single-weight display serif | Plan |
| Font declarations | Hand-written `@font-face`, files in `public/fonts/` | `url(var())` is invalid CSS, and preload `href` must match `src` byte for byte | Plan |
| `Link` component home | `src/components/layout/Link.astro` | Zero JS on a page that ships none; precedented by `Section.astro` | Roadmap + Plan |
| `Link` API | `variant` + `external` flag | Keeps skin and external contract orthogonal; a bordered external link is what About and Contact actually need | Plan |
| Button clipping | `h-10` → `min-h-10` at the source | Retires the hand-copied `10` at every call site; lifts the F-01 freeze for one line | Roadmap |
| Bordered skin | `linkStyles` composes `buttonStyles` | One source of truth, so the `min-h-10` fix propagates automatically | Plan |
| Hero image | `<picture>` with a `min-width: 768px` source | Unmatched media is never fetched, and intrinsic dimensions survive | Plan |
| Metadata | Full OG/Twitter set with an image | Closes the runbook item; the paste path is how the persona receives the site | Plan |
| OG image | Derived from `monk.webp` via a committed script | No new dependency (ImageMagick present), no second external blocker | Plan |
| React | Removed entirely | Zero islands exist; makes the no-JS property structural | Plan |
| Types | `type` over `interface`, in sibling `.types.ts` | Also fixes `typescript.md`'s `paths` never matching `.astro` | Plan |
| Browser matrix | One real check per engine + iOS | Three engines is the real matrix; previous versions argued, not run | Plan |
| Runbook | Run fully in this slice | Only an actual run establishes the outcome; defects are cheaper here than at release | Plan |

## Scope

**In scope:** font restoration and preloading · `type`/`interface` conventions and the rule that
holds them · `min-h-10` button fix · `Link.astro` primitive and six call-site migrations · head
metadata, canonical, OG image, page title · mobile hero payload · React and dead-component removal
· the full inspection run and its fixes.

**Out of scope:** frontmatter constants extraction (owned by `astro-constants-extraction`) · dark
mode · automated a11y/perf CI (settled by F-03) · `robots.txt` and `sitemap.xml` · re-opening the
F-01 typography choice · content and copy edits.

## Architecture / Approach

Five phases ordered so the riskiest change lands first and verification lands last. Phase 1 goes
first because introducing real webfonts changes what "no layout shift" means for every later
measurement — checking CLS before the fonts exist would validate nothing — and it settles the type
conventions so Phase 2's new component inherits them. Phases 2-4 touch disjoint file sets and are
independent. Phase 4 is deliberately last among the code phases and fully self-contained, so it
can be dropped without disturbing any NFR work.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Typography + type conventions | Webfonts reach production for the first time; `type` convention recorded | Real fonts introduce the swap-CLS that did not exist before; `optional` degrades to fallback on a cold slow connection |
| 2. Link primitive + button height | One component owns all three link affordances; 200% zoom stops clipping | Six call sites migrate at once; a missed `sr-only` suffix silently unlabels a change of context |
| 3. Head metadata + hero payload | Real preview card; phones stop fetching the hero image | `<picture>` fallback must not reintroduce CLS; OG image is a committed binary |
| 4. Zero-JS build surface | No JavaScript emitted; dead components gone | Reverses an F-01 stack decision and invalidates CLAUDE.md plus two rule files |
| 5. Inspection run | Runbook executed, result recorded in the PR | Manual and non-delegable; a late finding could reopen an earlier phase |

**Prerequisites:** F-03 (runbook and gate — done) and S-06 (sticky nav — done). Branch
`feat/inspection-hardening-pass` is cut from `development`. A phone and Chrome, Safari and Firefox
installed, for Phase 5.

**Estimated effort:** ~3-4 sessions across five phases; Phase 5 is the long pole because it is
human-paced.

## Open Risks & Assumptions

- `font-display: optional` means a genuinely cold, slow first visit renders in fallback faces for
  that pageview. Accepted deliberately in exchange for a guaranteed-zero CLS.
- The OG card carries no name or role text — `og:title` and `og:description` supply those, and
  every scraper renders them beside the image. If the text-free card looks weak in practice, the
  generation script makes adding text a small follow-up.
- Removing React invalidates CLAUDE.md's stack line, `components.json`, the `jsx` settings in
  `tsconfig.json`, the ESLint React plugin, and `.claude/rules/react.md` + `ui-shadcn.md`. All are
  treated as Phase 4 deliverables, not follow-up work. If it proves larger than expected, Phase 4
  can be dropped whole.
- Phase 1's manual checks depend on judging reflow by eye. Lighthouse in Phase 5 is the real
  measurement, so a Phase 1 pass is provisional until then.
- Edge and the previous-version browser line are covered by written argument rather than a run.
- The CV PDF blocker (PRD Open Question 3) belongs to S-08, not here, but still gates release.

## Success Criteria (Summary)

- A recruiter opening the pasted link on a phone reads the page in under a second, in its real
  typefaces, with nothing moving under their thumb.
- Every link and every piece of content is reachable by keyboard alone and announced correctly by
  a screen reader — including "opens in a new tab" on the three external links.
- The completed `docs/nfr-inspection.md` checklist is in the PR, with every box ticked.
