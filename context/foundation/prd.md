---
project: "Chrobok.dev"
version: 1
status: draft
created: 2026-07-22
context_type: greenfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 1
  hard_deadline: null
  after_hours_only: false
---

# PRD — Chrobok.dev

## Vision & Problem Statement

A recruiter or hiring manager arrives at `chrobok.dev` from a CV, a LinkedIn profile,
justjoin.it or nofluffjobs, and lands on a page that says "Work in progress…". The site is
the only channel the author fully controls, and right now it actively undercuts every
profile that links to it — a missing site would read better than this one. Four failures
compound in that single screen: there is no proof of level (three years of counted delivery
on a revenue-critical product — ~52 A/B experiments, ~60 locales, an end-to-end payments and
subscription flow — lives only inside a CV and a recruiter message), no contact path to
click, and no signal of role or seniority, so a reader guesses — and guesses downward. The
cost is paid on rented ground: the narrative about the author survives only on LinkedIn, job
boards and Instagram, in someone else's layout and under someone else's limits.

The insight is that for a frontend craftsman the site *is* the artifact, not a description
of one. Craft is proven by the page being well made, never by copy claiming it is — this is
the one portfolio signal that cannot be faked by copywriting. Two things make that claim
payable here rather than aspirational: three years on a single revenue-critical product left
a *counted* trail, so the page can run on numbers where most portfolios run on adjectives;
and a decade of teaching (maths tutoring since 2015, LEGO Education programming for children
2020–2023) is a differentiator the author's own brand notes call underused — the ability to
explain hard things simply is exactly what a portfolio page has to do.

## User & Persona

**Primary persona — the recruiter / HR screener.** Non-technical, arrives from a CV,
LinkedIn, justjoin.it or nofluffjobs link, and spends seconds deciding whether to keep
reading while matching the author against an open role. They need four things fast: what he
does, at what level, with what proof, and how to reach him.

### Secondary persona

**Hiring manager / tech lead.** Technical, arrives after the screener has passed the profile
along, and wants depth — decisions, trade-offs, evidence behind the numbers.

**Resolution of the first-screen conflict (locked in Phase 1):** when the two personas want
different things in the same place, *the recruiter wins the first screen and the hiring
manager wins everything below it.* The hero is optimised for a five-second scan; technical
depth lives further down the page. One page, two layers.

**Third circle — the developer community.** Followers of the daily developer's journal on
instagram.com/chrobok.dev (running since Jan 2023), peers, potential referrers. They shape
the site's tone but not its layout priorities.

## Success Criteria

The MVP flow, locked in Phase 3. The visitor performs no actions beyond scrolling and one
click, so the flow is a reading order, not an interaction sequence:

```
1. arrives from a pasted link (CV / LinkedIn / justjoin.it / nofluffjobs)
2. hero        — who · what level · what stack · how to reach him
3. work        — Rentola + Meetmedia as text rows: dates, role, numbered bullets, stack tags
4. skills      — grouped list, no ratings, capped at what is defensible in an interview
5. about       — one paragraph, including the decade of teaching as a differentiator
6. journal     — one line and a link out to instagram.com/chrobok.dev
7. footer      — email as selectable text, LinkedIn, GitHub, CV PDF
```

Seven sections, nothing to run and nothing to keep in sync after launch — no stored content,
no third-party credentials, no scheduled refresh. Nothing in the MVP can break silently after
release. Copy is largely selection from material that already exists
(`kariera/03-cv-bullety-car.md`, `06-wiadomosc-do-rekrutera.md`), not writing from scratch.

### Primary

- The "Work in progress…" page no longer exists at chrobok.dev; all seven sections above ship.
- A first-time visitor can state, without leaving the page: the author's role, his level, his
  core stack, and at least one concrete numeric proof point — and can reach a contact channel
  from both the top and the bottom of the page.

### Secondary

- The section structure and design system are clean enough that adding case studies or a blog
  later is adding content, not rewriting the site. Matches the author's stated intent to close
  this as a main page and expand it only if worthwhile.

### Guardrails

- **The site survives a technical inspection.** Fast, accessible, responsive, no error output
  surfaced to the visitor. The positioning claim is craftsmanship; a site that fails inspection
  refutes that claim harder than any copy can support it, and this is precisely what a tech
  lead checks.
- **The public title stays "Frontend".** Decided twice and closed. Site copy must not quietly
  re-open fullstack — that thread lives in the narrative ("room to grow"), never in the title.
- **No overstated competencies.** SQL is shallow, Node.js is supporting rather than primary,
  Rails is limited to minor API changes. The site, the CV and GitHub must agree; disagreement
  reads as CV inflation and is checked by technical screeners.
- **No availability information of any kind.** Not a date, not a notice period, not an "ASAP".
  Deliberate departure from the market research (which ranks availability highly for the
  PL/EU remote market) — the author's position is that this belongs in a conversation, not in
  a portfolio. Trade-off recorded in Open Questions.

## User Stories

### US-01: A recruiter decides whether to keep reading

- **Given** a recruiter who has just opened a chrobok.dev link pasted into a chat, a CV or a
  job-board profile, most likely on a phone
- **When** the page finishes loading and they read the first screen without scrolling
- **Then** they can state the author's name, his role, his core stack, and can reach an email
  address or the CV in one interaction

#### Acceptance Criteria

- Name, role title, core stack and a contact affordance are all present without scrolling, at
  mobile viewport sizes as well as desktop
- The page carries no "Work in progress" or placeholder content of any kind
- Scrolling to the Work section reveals the seniority signal (ownership scope) and at least one
  outcome-based number
- Nothing on the page states availability, a start date or a notice period

## Functional Requirements

Actor is *Visitor* throughout — the recruiter and the tech lead see the same page and differ
only in how far they scroll. Each FR carries the Socratic counter-argument raised in Phase 4.5
and its resolution.

### Identity (first screen)

- FR-001: Visitor can read the author's name, role title and core stack above the fold. Priority: must-have
  > Socrates: Counter-argument considered: "'Frontend Developer' with no seniority calibration
  > reads junior, and an unclear level is guessed downward." Resolution: the hero keeps the bare
  > title — seniority is calibrated in the Work section instead. **This makes FR-004 load-bearing
  > for FR-001**: if Work does not carry the level explicitly, nothing on the page does.

- FR-002: Visitor can read a one-line positioning statement framing how the author works. Priority: must-have
  > Socrates: Counter-argument considered: "an AI-adjacent craft claim can read as defensive in
  > 2026, when teams expect fluency with AI tooling." Resolution: reframed to the author's own
  > formulation — AI is used daily as a tool, the result is owned by a human — rather than a line
  > that can be read as "I don't use AI".

- FR-003: Visitor can reach the email address and the CV from the header, above the fold. Priority: must-have
  > Socrates: No counter-argument; it stands as written. A missing contact path was one of the
  > four Phase 1 pains and is the most frequently reported defect in portfolio reviews.

### Work

- FR-004: Visitor can read the author's commercial work as a single Work block dominated by the Rentola role, with the earlier Meetmedia role as a closing line. Priority: must-have
  > Socrates: Counter-argument considered: "two roles are too thin for a timeline format, and the
  > 2020–2023 gap becomes a compositional element." Resolution: dropped the timeline shape —
  > visual weight now follows substantive weight. Per FR-001, this block also carries the
  > seniority signal (ownership scope: sole frontend developer of a greenfield multi-tenant
  > marketplace, owning the registration/subscription funnel, payments and CRO).

- FR-005: Visitor can read outcome-based numeric proof points attached to the Rentola role. Priority: must-have
  > Socrates: Counter-argument considered: "614 PRs is an activity metric, not an impact metric,
  > and a technical reader may read it as metric-gaming." Resolution: the PR count is dropped
  > from the site entirely. The numbers shown are outcome metrics — ~52 A/B experiments across
  > the registration and subscription funnel, ~60 language-market locales including full RTL,
  > SEO migrations of legacy country platforms that preserved organic traffic, and the
  > end-to-end payments and subscription flow.

- FR-006: Visitor can see stack tags attached to each role, split into core and supporting tiers. Priority: must-have
  > Socrates: Counter-argument considered: "flat tags imply equal proficiency — a 'Ruby on Rails'
  > tag reads as strongly as 'React', colliding with the no-overstatement guardrail." Resolution:
  > tags carry a two-tier split (see FR-007); one resolution covers both FRs.

### Skills

- FR-007: Visitor can scan a grouped technology list split into a core tier (defensible in any interview) and a supporting tier (used, but not primary), with no ratings, levels, bars or percentages. Priority: must-have
  > Socrates: Counter-argument considered: "a list with no levels forces the reader to assume
  > uniform proficiency, while the author's own notes call SQL shallow, Node.js supporting and
  > Rails limited to minor API changes." Resolution: two honest tiers instead of one flat wall.
  > Core covers TypeScript, React, Next.js, Tailwind and the testing stack; supporting covers
  > Node.js, Rails, SQL and infrastructure tooling. No numeric self-assessment of any kind —
  > percentage bars are an explicitly rejected junior signal.
  >
  > **Correction (2026-07-27, S-03):** the shipped section departs from the example list above in
  > four ways. (1) SQL is excluded, as are Docker and Redis — `kariera/02-umiejetnosci.md` rates
  > all three *liznięte* under an explicit "nie wpisywać jako skill", and records Docker and Redis
  > as downgraded after the 2026-07-21 evidence audit. (2) Ruby on Rails does ship, in the
  > supporting tier as this entry specifies, despite carrying that same vault ruling. (3) Core
  > additionally carries CSS, JavaScript, HTML, Astro, REST APIs, Lingui, GrowthBook, Git, GitHub,
  > Claude Code and Cursor, none of which this entry names; and the testing stack splits rather
  > than moving wholesale — Jest and Testing Library are core, Playwright and Storybook supporting.
  > (4) The two tiers are expressed as one category-grouped list whose chips carry the tier
  > themselves — solid for core, dashed for supporting, decoded by a legend — rather than as two
  > separate bands. The requirement itself is unchanged: two honest tiers, no ratings, levels, bars
  > or percentages.

### About

- FR-008: Visitor can read a short bio paragraph, placed after Work, that includes the teaching background in one sentence. Priority: must-have
  > Socrates: Counter-argument considered: "a long About pushes proof down the page, and
  > 'projects buried under a long About' is a documented anti-pattern." Resolution: About already
  > sits after Work in the locked flow, so the anti-pattern does not apply; the binding
  > constraint is length discipline — one paragraph, teaching in a single sentence.

### Journal

- FR-009: Visitor can open the developer's journal on Instagram from a labelled link. Priority: must-have
  > Socrates: No counter-argument; it stands as written. Daily consistency since Jan 2023 is
  > proof that cannot be faked, and the link costs one line.

### Contact

- FR-010: Visitor can select the email address as text and open the author's LinkedIn and GitHub profiles from the footer. Priority: must-have
  > Socrates: No counter-argument; it stands as written.

- FR-011: Visitor can download the author's CV as a PDF from a direct link, with no gate. Priority: must-have
  > Socrates: No counter-argument; it stands as written. Note the external dependency: the
  > canonical CV currently exists as markdown in the author's second brain, and producing the
  > PDF is tracked as a separate task ("prepare resume"). This FR can block release on work
  > that lives outside this repository.

### Navigation

- FR-012: Visitor can jump to any section from a sticky header navigation. Priority: must-have
  > Socrates: Counter-argument considered: "a sticky header eats first-screen area on mobile,
  > where a recruiter most often opens a pasted link, and none of the six strong engineer
  > portfolios reviewed carry section navigation at all." Resolution: sticky on every breakpoint,
  > risk accepted deliberately in exchange for uniform behaviour and less conditional code.

## Non-Functional Requirements

All four are outside-observable properties, which matters here more than usual: the guardrail
says the site must survive technical inspection, and these are what an inspecting tech lead
actually measures.

- Content is readable in under one second on a phone over a typical mobile connection, and the
  layout does not shift after first paint.
- Every piece of content and every link is reachable by keyboard alone and announced by a
  screen reader; text contrast meets WCAG AA.
- Every piece of information and every link remains available to a visitor whose browser does
  not execute the page's scripts.
- The page renders correctly on the latest two major versions of the four mainstream browser
  engines, on desktop and mobile.

## Business Logic

The product applies no domain rule — it makes no decision on the visitor's behalf.

This is recorded deliberately, not as a gap. A portfolio page is a content artifact, not an
application: there is no recommendation, prioritisation, classification, validation, scoring,
workflow or calculation to perform, and inventing one would add cost without adding value. The
value is editorial and craft — which content is selected, how it is ordered, and how well the
page is made. The empty-CRUD anti-pattern does not apply, because the product is not CRUD
either; nothing is created, updated or deleted by anyone but the author, through the
repository.

One candidate rule was considered and declined for the MVP: deriving both the page and the CV
PDF from a single content source of truth, so the two cannot diverge. It would convert the
"site, CV and GitHub must agree" guardrail from a promise into a mechanism. It was declined
because PDF generation is a separate piece of work that does not fit the one-week window.
Recorded in Open Questions as a candidate for the expansion phase.

## Access Control

Fully public; no authentication, no accounts, no sessions, no roles. Every visitor sees
everything. There is no admin panel — content is authored in the repository and shipped by
releasing, so the editing "role" is repository write access, not an application role.

The CV is a directly linked PDF with no gate: no email capture, no form, no tracking wall.
The decision is deliberate — the primary persona is a recruiter deciding in seconds, and a
gate adds friction on exactly the path the site exists to shorten.

## Non-Goals

- **No internationalisation and no Polish version.** The site ships in English only. The whole
  funnel is English, and English is what remote employers screen for; a Polish version is
  optional in a way English is not. Note the irony worth preserving: i18n across ~60 locales is
  one of the author's strongest proof points — it belongs in the Work section, not in this
  site's build.
- **No stored content, no content-management surface, no admin panel.** Seven sections of
  static content have nothing to store; content lives in the repository and editing is a
  commit. This explicitly closes the "research about database" task for the scope of this MVP —
  it is the single most likely place for a one-week build to become a one-month build.
- **No per-project case-study subpages and no on-site blog.** Project depth and long-form
  writing stay out of v1; the case-study variant was the most expensive option considered in
  Phase 3. A blog is also an ongoing commitment — a handful of stale posts is a worse signal
  than no blog section at all.
- **No contact form, no newsletter, no analytics.** Everything requiring a submission target, a
  cookie-consent flow or a third-party account is excluded. This keeps the MVP at zero moving
  parts, so nothing can break silently after launch.

## Open Questions

1. **Availability is deliberately absent from the site.** Market research for PL/EU remote
   hiring ranks availability, contract form (B2B vs UoP) and timezone as high-value, low-cost
   elements that pre-qualify a screening call. The author has ruled all of it out as
   out-of-place in a portfolio. Owner: author. Not blocking — revisit only if inbound arrives
   with repeated questions about terms.

2. **Open Graph / link-preview metadata was declined for v1.** The author reviewed the item and
   chose not to add it. Worth recording because it acts *before* anyone clicks: the site's
   distribution model is a link pasted by hand into recruiter chats, LinkedIn and job-board
   profiles, and without preview metadata and an image that preview renders empty. Cost is a few
   meta tags and one image. Owner: author. Not blocking.

3. **The CV PDF does not yet exist.** FR-011 depends on an artifact produced outside this
   repository ("prepare resume"). Owner: author. Blocking for release, not for planning.

4. **Single content source of truth for page + CV** — declined for the MVP window, but it is the
   only mechanism that would make the "site, CV and GitHub must agree" guardrail self-enforcing
   rather than manually maintained. Owner: author. Revisit in the expansion phase.

5. **`author-profile.md:138` is stale.** It records "Hosting and domain wiring for chrobok.dev —
   currently nothing is deployed", but a placeholder page is live at https://www.chrobok.dev.
   Owner: author. Fix on the next edit of that document.
