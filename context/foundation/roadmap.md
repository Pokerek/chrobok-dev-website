---
project: "Chrobok.dev"
version: 1
status: draft
created: 2026-07-22
updated: 2026-07-26
prd_version: 1
main_goal: quality
top_blocker: time
---

# Roadmap: Chrobok.dev

> Derived from `context/foundation/prd.md` (v1) + `context/foundation/tech-stack.md` + an auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

`chrobok.dev` currently serves a "Work in progress…" page to every recruiter and hiring
manager who follows a link from a CV, LinkedIn, justjoin.it or nofluffjobs — a missing site
would read better than the one that is live. Three years on a single revenue-critical product
left a counted trail (~52 A/B experiments, ~60 locales, an end-to-end payments and
subscription flow) that today exists only inside a CV, so a reader who lands on the site can
see no role, no level, no proof and no way to make contact.

For a frontend craftsman the site *is* the artifact, not a description of one: the page being
well made is the one portfolio signal that copywriting cannot fake. The v1 is seven static
sections — hero, work, skills, about, journal, footer — with no backend, no stored content and
no third-party credentials, so nothing can break silently after release.

## North star

**S-08: A visitor at chrobok.dev sees the complete seven-section page instead of "Work in
progress…"** — the production cutover is the validation milestone because the PRD's primary
success criterion is exactly this, and because the author chose not to expose a half-built page
to recruiters at any point.

> "North star" here means: the smallest end-to-end outcome whose delivery proves the product
> hypothesis — placed as early as its Prerequisites allow, because everything else only matters
> if this lands. In this roadmap the north star sits *last* by deliberate choice: the release is
> a single cutover, so every content slice merges onto an integration branch first and nothing
> reaches production until all seven sections are there. The trade-off is accepted knowingly —
> it costs late feedback in exchange for never showing a recruiter a partial page.

## At a glance

| ID   | Change ID                 | Outcome (user can …)                                                        | Prerequisites                  | PRD refs                       | Status   |
| ---- | ------------------------- | --------------------------------------------------------------------------- | ------------------------------ | ------------------------------ | -------- |
| F-01 | design-system-contract    | (foundation) page skeleton + token contract settled; no ambiguity left       | —                              | §NFRs, §Guardrails             | done     |
| F-02 | v1-release-staging        | (foundation) v1 work merges without reaching production                      | —                              | §Success Criteria (primary)    | done     |
| F-03 | inspection-gate           | (foundation) build, types and lint gate every v1 merge; inspection checklist runnable | F-02                  | §NFRs, §Guardrails             | done |
| S-01 | hero-first-screen         | read name, role title, core stack and a positioning line, and reach email + CV, without scrolling | F-01, F-02   | US-01, FR-001, FR-002, FR-003  | done     |
| S-02 | work-proof-block          | read the commercial work with its ownership scope, numeric proof points and two-tier stack tags | F-01, F-02     | US-01, FR-004, FR-005, FR-006  | proposed |
| S-03 | skills-two-tier           | scan a grouped core/supporting technology list with no ratings or bars      | F-01, F-02                     | FR-007                         | proposed |
| S-04 | about-and-journal         | read the one-paragraph bio incl. teaching, and open the Instagram journal    | F-01, F-02                     | FR-008, FR-009                 | proposed |
| S-05 | footer-contact            | select the email as text and open LinkedIn, GitHub and the ungated CV PDF   | F-01, F-02                     | FR-010, FR-011                 | proposed |
| S-06 | sticky-section-nav        | jump to any section from a sticky header on every breakpoint                | S-01, S-02, S-03, S-04, S-05   | FR-012                         | proposed |
| S-07 | inspection-hardening-pass | reach every link by keyboard and screen reader, with scripts disabled, on a phone, in under a second | F-03, S-06     | US-01, §NFRs (all four)        | proposed |
| S-08 | v1-production-cutover     | see the complete seven-section page at chrobok.dev instead of the placeholder | S-07                          | US-01, §Success Criteria       | blocked  |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives
in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme            | Chain                                                        | Note                                                                                     |
| ------ | ---------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| A      | Content surface  | `F-01` → `S-01` / `S-02` / `S-03` / `S-04` / `S-05` (parallel) → `S-06` | Five section slices fan out once the token contract is settled; nav closes the stream once anchors exist. |
| B      | Ship & inspect   | `F-02` → `F-03` → `S-07` → `S-08`                            | Joins Stream A at `S-06` — the hardening pass needs the full page. Sequenced eagerly because `main_goal: quality`. |

## Baseline

What's already in place in the codebase as of 2026-07-22 (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — Astro 5.15 + TypeScript + Tailwind 3 + a React 18 island; `src/layouts/Layout.astro`, `src/components/footer/Footer.astro`, and a CVA design-system seed at `src/ui/base/button/`. `src/pages/index.astro` is the "Work in progress…" placeholder this roadmap exists to delete.
- **Backend / API:** absent — no routes and no adapter in `astro.config.mjs` (static output). Deliberate, per PRD §Non-Goals.
- **Data:** absent — no schema, no migrations, no content collections. Deliberate, per PRD §Non-Goals.
- **Auth:** absent — deliberate, per PRD §Access Control (fully public, no accounts).
- **Deploy / infra:** partial — live on Vercel at https://www.chrobok.dev via the Git integration, but `.github/workflows/` does not exist (there is no `.github/` directory at all) and there is no `vercel.json`. Vercel's Production Branch is `main` — verified 2026-07-23 against the GitHub Deployments API, which shows `origin/main` deploying to Production and `origin/development` to Preview. Merging to `main` therefore publishes straight to the live site with no server-side gate in front of it; merging to `development` does not.
- **Branch topology:** present — two long-lived branches. `development` is the **GitHub default branch** and already receives PRs (#12 landed there; #8–#11 predate the shift and targeted `main`). `main` is protected: PR required, `required_linear_history: true`, force-push and deletion blocked. `development` is deliberately unprotected until F-03 attaches required status checks.
- **Agent instructions:** present — `CLAUDE.md` at the repo root (project facts, the `main`-is-production and yarn-only rules, structure, naming) plus `.claude/rules/` (`release-process.md` unscoped so it loads every session; `typescript`, `react`, `astro`, `tailwind`, `design-system`, `ui-shadcn` scoped via `paths:` frontmatter).
- **Observability:** absent — deliberate, per PRD §Non-Goals (no analytics, no vendor accounts).
- **Verification / testing:** absent — no test runner and no accessibility or performance check. `yarn build` runs `astro check`, and `eslint` is configured with a flat config. Recorded because all four NFRs are outside-observable properties an inspecting tech lead measures directly.

## Foundations

### F-01: Design-system and layout contract

- **Outcome:** (foundation) the page skeleton and token contract are settled — grid and its mobile collapse, the border-radius scale, the focus-visible ring, and the rule for keeping hard-coded values out — so no content slice has to re-open a visual decision.
- **Change ID:** `design-system-contract`
- **PRD refs:** §Non-Functional Requirements (keyboard reachability, WCAG AA contrast, no layout shift after first paint), §Guardrails ("the site survives a technical inspection")
- **Unlocks:** S-01, S-02, S-03, S-04, S-05 can all be built without re-deciding layout; retires four recorded design risks (shadcn token clash, radius scale leaking through `rounded-md`/`rounded-lg`, hard-coded `border-black` in `Footer.astro`, undefined focus-ring colour); establishes the contrast and focus-state baseline S-07 verifies against.
- **Prerequisites:** —
- **Parallel with:** F-02
- **Blockers:** —
- **Unknowns:**
  - Does the 2-column grid hold as the whole page skeleton, or only as a section-level pattern, and at which breakpoint does it collapse? — Owner: author. Block: no.
  - Does Ramaraja 700 against IBM Plex Mono read as craftsmanship or as decoration? Reverting is cheap now and expensive after five sections are built. — Owner: author. Block: no.
  - Is any motion allowed beyond `transition-colors` on hover? — Owner: author. Block: no.
- **Risk:** Sequenced first because `main_goal: quality` and because every content slice inherits these decisions; the failure mode is settling them implicitly inside S-01 and then retro-fitting four other sections.
- **Status:** done

### F-02: v1 release staging

- **Outcome:** (foundation) v1 work merges and deploys to a preview without touching production — `main` keeps serving the placeholder until the cutover.
- **Change ID:** `v1-release-staging`
- **PRD refs:** §Success Criteria (primary — all seven sections ship together)
- **Unlocks:** S-01 through S-07 can merge and be reviewed on a real URL without exposing a half-built page to a recruiter; this is the mechanism the north star S-08 depends on.
- **Prerequisites:** —
- **Parallel with:** F-01
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Without it, the baseline's auto-deploy-on-merge behaviour publishes every partial section straight to chrobok.dev, which contradicts the chosen one-pass release; the risk of the foundation itself is that a long-lived branch drifts, which is bounded by the one-week window.
- **Status:** done

### F-03: Inspection gate

- **Outcome:** (foundation) every v1 merge is gated on build, type-check and lint, and the inspection checklist behind the NFRs is a repeatable run rather than a memory exercise.
- **Change ID:** `inspection-gate`
- **PRD refs:** §Non-Functional Requirements (all four), §Guardrails ("the site survives a technical inspection")
- **Unlocks:** S-07 has something to run instead of a manual sweep; converts the craftsmanship guardrail from a promise into a check that fails loudly.
- **Prerequisites:** F-02
- **Parallel with:** S-01, S-02, S-03, S-04, S-05
- **Blockers:** —
- **Unknowns:**
  - Which checks are automated versus checked by hand — the four-engine matrix in particular may not be worth automating for a static page. — Owner: author. Block: no.
- **Risk:** Sequenced before the hardening pass because `main_goal: quality` says inspection gates are not deferred behind content; the scope risk is that a CI setup grows past the minimum this page needs, which `top_blocker: time` makes expensive.
- **Status:** done

## Slices

### S-01: Hero — the first screen

- **Outcome:** Visitor can read the author's name, role title and core stack, read the one-line positioning statement, and reach the email address and the CV — all without scrolling, on a phone as well as on desktop.
- **Change ID:** `hero-first-screen`
- **PRD refs:** US-01, FR-001, FR-002, FR-003
- **Prerequisites:** F-01, F-02
- **Parallel with:** S-02, S-03, S-04, S-05, F-03
- **Blockers:** The CV link's target artifact does not exist yet (PRD Open Question 3) — the link can be wired to its final path, but the file arrives from outside this repository.
- **Unknowns:**
  - Does the positioning line use the author's own AI formulation verbatim, or a shortened variant that still avoids reading as "I don't use AI"? — Owner: author. Block: no.
- **Risk:** This screen carries the acceptance criteria of the only user story, so its failure mode is silent — it can look finished while missing one of the four things a recruiter needs; note that FR-001's resolution deliberately leaves seniority *out* of the hero, which makes S-02 load-bearing for it.
- **Status:** done

### S-02: Work — the proof block

- **Outcome:** Visitor can read the commercial work as a single block dominated by the Rentola role, including the ownership scope that signals seniority, the outcome-based numbers, and stack tags split into core and supporting tiers.
- **Change ID:** `work-proof-block`
- **PRD refs:** US-01, FR-004, FR-005, FR-006
- **Prerequisites:** F-01, F-02
- **Parallel with:** S-01, S-03, S-04, S-05, F-03
- **Blockers:** —
- **Unknowns:**
  - Which of the four candidate numbers (A/B experiments, locales, SEO migrations, payments flow) make the cut, given that the PR count was removed as an activity metric? — Owner: author. Block: no.
- **Risk:** The single place on the page where level is calibrated — if the ownership scope is not explicit here, nothing on the page states seniority and the reader guesses downward; the opposite failure is overstating, which collides with the no-overstated-competencies guardrail.
- **Status:** proposed

### S-03: Skills — two honest tiers

- **Outcome:** Visitor can scan a grouped technology list split into a core tier and a supporting tier, with no ratings, levels, bars or percentages.
- **Change ID:** `skills-two-tier`
- **PRD refs:** FR-007
- **Prerequisites:** F-01, F-02
- **Parallel with:** S-01, S-02, S-04, S-05, F-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** The tier split is the mechanism that keeps SQL, Node.js and Rails from reading as strongly as React; collapsing it back to one flat list would quietly break the no-overstatement guardrail that the site, the CV and GitHub must jointly satisfy.
- **Status:** proposed

### S-04: About and journal

- **Outcome:** Visitor can read a short bio paragraph that includes the decade of teaching in one sentence, and can open the developer's journal on Instagram from a labelled link.
- **Change ID:** `about-and-journal`
- **PRD refs:** FR-008, FR-009
- **Prerequisites:** F-01, F-02
- **Parallel with:** S-01, S-02, S-03, S-05, F-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Two adjacent, low-weight sections combined so neither becomes a one-line slice; the risk is length discipline — a long About pushes the proof further down the page.
- **Status:** proposed

### S-05: Footer contact

- **Outcome:** Visitor can select the email address as text and open the LinkedIn profile, the GitHub profile and the CV PDF — the last as a direct, ungated download.
- **Change ID:** `footer-contact`
- **PRD refs:** FR-010, FR-011
- **Prerequisites:** F-01, F-02
- **Parallel with:** S-01, S-02, S-03, S-04, F-03
- **Blockers:** The CV PDF is produced outside this repository (PRD Open Question 3, "prepare resume"). Owner: author.
- **Unknowns:**
  - What is the CV's public path and filename, so both this slice and S-01 link to the same target? — Owner: author. Block: no.
- **Risk:** Together with S-01 this satisfies the success criterion that a contact channel is reachable from both the top and the bottom of the page; the external CV artifact means the slice can be fully built and still not be releasable.
- **Status:** proposed

### S-06: Sticky section navigation

- **Outcome:** Visitor can jump to any of the seven sections from a sticky header, on every breakpoint.
- **Change ID:** `sticky-section-nav`
- **PRD refs:** FR-012
- **Prerequisites:** S-01, S-02, S-03, S-04, S-05
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Sequenced last among content slices because it needs every section anchor to exist; the accepted trade-off recorded in FR-012 is that a sticky header eats first-screen area on mobile, which is exactly where the recruiter opens the pasted link — worth re-checking against S-01 once both are on the preview.
- **Status:** proposed

### S-07: Inspection hardening pass

- **Outcome:** Visitor can reach every piece of content and every link by keyboard alone and with a screen reader, still gets all information and links with scripts disabled, sees text meeting WCAG AA contrast, and reads the page in under a second on a phone with no layout shift after first paint.
- **Change ID:** `inspection-hardening-pass`
- **PRD refs:** US-01 (mobile viewport acceptance criterion), §Non-Functional Requirements (all four)
- **Prerequisites:** F-03, S-06
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Which browser/engine combinations get a real manual check versus a reasoned assumption? — Owner: author. Block: no.
- **Risk:** This is where the craftsmanship claim is either paid or refuted — a site that fails inspection damages the positioning harder than any copy supports it; the competing risk is that a `quality` bias turns this into open-ended polishing against a one-week window.
- **Status:** proposed

### S-08: v1 production cutover

- **Outcome:** Visitor arriving at chrobok.dev from a pasted link sees the complete seven-section page, with no "Work in progress" or placeholder content anywhere on it.
- **Change ID:** `v1-production-cutover`
- **PRD refs:** US-01, §Success Criteria (primary — both criteria close here)
- **Prerequisites:** S-07
- **Parallel with:** —
- **Blockers:** The CV PDF must exist at its public path before release (PRD Open Question 3). Owner: author.
- **Unknowns:**
  - Is the CV PDF final and published at the path S-01 and S-05 link to? — Owner: author. Block: yes.
- **Risk:** The north star, and the only slice that changes what a recruiter actually sees; releasing it with a dead CV link would break FR-011 on the exact path the site exists to shorten, which is why the unknown above blocks rather than warns.
- **Status:** blocked

## Backlog Handoff

| Roadmap ID | Change ID                 | Suggested issue title                                             | Ready for `/10x-plan` | Notes |
| ---------- | ------------------------- | ----------------------------------------------------------------- | --------------------- | ----- |
| F-01       | design-system-contract    | Settle the design-system and layout contract before content work  | yes                   | Run `/10x-plan design-system-contract` |
| F-02       | v1-release-staging        | Stage v1 so merges do not publish to production                   | yes                   | Run `/10x-plan v1-release-staging` |
| F-03       | inspection-gate           | Gate v1 merges on build, types and lint; make the NFR checklist runnable | no             | Needs F-02 |
| S-01       | hero-first-screen         | Hero: name, role, stack, positioning line, contact above the fold | no                    | Needs F-01, F-02 |
| S-02       | work-proof-block          | Work block: ownership scope, outcome numbers, two-tier stack tags | no                    | Needs F-01, F-02 |
| S-03       | skills-two-tier           | Skills: core and supporting tiers, no ratings                     | no                    | Needs F-01, F-02 |
| S-04       | about-and-journal         | About paragraph with teaching, plus the Instagram journal link    | no                    | Needs F-01, F-02 |
| S-05       | footer-contact            | Footer: selectable email, LinkedIn, GitHub, ungated CV PDF        | no                    | Needs F-01, F-02; CV artifact external |
| S-06       | sticky-section-nav        | Sticky section navigation across all breakpoints                  | no                    | Needs all five section slices |
| S-07       | inspection-hardening-pass | Accessibility, no-JS, performance and cross-engine hardening pass | no                    | Needs F-03, S-06 |
| S-08       | v1-production-cutover     | Cut v1 over to production and delete the placeholder              | no                    | Blocked on the CV PDF |

## Open Roadmap Questions

1. **Availability is deliberately absent from the site.** Market research for PL/EU remote hiring ranks availability, contract form (B2B vs UoP) and timezone as high-value, low-cost elements that pre-qualify a screening call; the author has ruled all of it out as out-of-place in a portfolio. Owner: author. Block: none — revisit only if inbound arrives with repeated questions about terms.
2. **Open Graph / link-preview metadata was declined for v1.** It acts *before* anyone clicks, and the site's whole distribution model is a link pasted by hand into recruiter chats and job-board profiles, so the preview currently renders empty. Cost is a few meta tags and one image. Owner: author. Block: none — would attach to S-01 if reopened.
3. **The CV PDF does not yet exist.** FR-011 depends on an artifact produced outside this repository ("prepare resume"). Owner: author. Block: S-08 (and the release readiness of S-01 and S-05).
4. **Single content source of truth for page + CV** — declined for the MVP window, but it is the only mechanism that would make the "site, CV and GitHub must agree" guardrail self-enforcing rather than manually maintained. Owner: author. Block: none — expansion phase.
5. **`author-profile.md:138` is stale.** It records "Hosting and domain wiring for chrobok.dev — currently nothing is deployed", but a placeholder page is live at https://www.chrobok.dev. Owner: author. Block: none — fix on the next edit of that document.

## Parked

- **Internationalisation and a Polish version** — Why parked: PRD §Non-Goals. The funnel is English and English is what remote employers screen for; the i18n proof point belongs in the Work section, not in this site's build.
- **Stored content, a content-management surface, an admin panel** — Why parked: PRD §Non-Goals. Seven sections of static content have nothing to store, and this is the single most likely place for a one-week build to become a one-month build.
- **Per-project case-study subpages and an on-site blog** — Why parked: PRD §Non-Goals. The most expensive option considered, and a handful of stale posts is a worse signal than no blog at all.
- **Contact form, newsletter, analytics** — Why parked: PRD §Non-Goals. Anything needing a submission target, a cookie-consent flow or a third-party account keeps the MVP above zero moving parts.
- **Open Graph / link-preview metadata and image** — Why parked: PRD Open Question 2, declined for v1 by the author. Recorded here because `top_blocker: time` makes it a natural first re-entry once v1 is live.
- **Dark mode** — Why parked: `design-notes.md` records it as out of scope; `darkMode: ['class']` is Tailwind scaffold, not a requirement.
- **Deriving the page and the CV PDF from one content source** — Why parked: PRD §Business Logic, declined for the MVP window; leading candidate for the expansion phase.

## Done

- **F-02: (foundation) v1 work merges and deploys to a preview without touching production — `main` keeps serving the placeholder until the cutover.** — Archived 2026-07-23 → `context/archive/2026-07-23-v1-release-staging/`. Lesson: —.
- **F-01: (foundation) the page skeleton and token contract are settled — grid and its mobile collapse, the border-radius scale, the focus-visible ring, and the rule for keeping hard-coded values out — so no content slice has to re-open a visual decision.** — Archived 2026-07-24 → `context/archive/2026-07-24-design-system-contract/`. Lesson: —.
- **F-03: (foundation) every v1 merge is gated on build, type-check and lint, and the inspection checklist behind the NFRs is a repeatable run rather than a memory exercise.** — Archived 2026-07-24 → `context/archive/2026-07-24-inspection-gate/`. Lesson: —.
- **S-01: Visitor can read the author's name, role title and core stack, read the one-line positioning statement, and reach the email address and the CV — all without scrolling, on a phone as well as on desktop.** — Archived 2026-07-26 → `context/archive/2026-07-26-hero-first-screen/`. Lesson: —.
