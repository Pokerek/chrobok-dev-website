---
doc: author-profile
project: "chrobok.dev"
version: 1
status: living
created: 2026-07-20
source_of_record: pokerek_mind/kariera/ (second brain)
consumed_by: [10x-shape, 10x-prd, content work]
---

# Author Profile — Karol Chrobok

Input document for `/10x-shape`. This site's product **is the author**, so the shape
session needs a factual profile before it can define vision, persona, and scope.
Everything below is verified from the author's career inventory; anything uncertain is
listed under Open Questions rather than guessed.

**Update convention:** edit in place. When the underlying career material changes
(`pokerek_mind/kariera/`), mirror the change here.

## Identity

- **Name:** Karol Chrobok · Orzesze, Poland · remote-first · English B2
- **Role:** Frontend Developer — React / Next.js / TypeScript
- **Positioning line:** *"I don't generate code, I craft it."* — AI is used every day as a
  tool, but the result is owned by a human.
- **Direction:** frontend craftsman growing toward fullstack. **Deliberate decision
  (2026-07-20): the public title stays "Frontend".** Fullstack lives in the narrative
  ("room to grow toward fullstack"), never in the job title. Do not let site copy
  quietly re-open this — it was decided twice and closed.
- **Availability:** ASAP. Never state a specific month or notice period in public copy —
  it dates fast and anchors low.

## Audience (who this site is for)

1. **Recruiter / hiring manager** — primary. Arrives from a CV, LinkedIn, justjoin.it or
   nofluffjobs link, spends **seconds** deciding whether to keep reading. Needs, fast:
   what he does, at what level, with what proof, and how to contact him.
2. **Developer community** — secondary. Followers of the daily developer's journal, peers,
   potential referrers.

The site is the **only channel the author fully controls** — every other one (LinkedIn,
job boards, Instagram) is rented space with someone else's layout and limits.

## Proof points (verified, usable as content)

**[product] — Sology Software House · Aug 2023 – Jul 2026 · remote, B2B**
Sole primary frontend developer of a greenfield, multi-tenant/multi-brand international
rental marketplace, monetized via subscriptions.

- Joined as a junior with **no React/Next.js experience**; grew into independent owner of
  revenue-critical areas — registration & subscription funnel, payments, CRO.
- **614 pull requests (587 merged, ~95% merge rate)** over ~3 years, ~10–30 PRs/month.
- **~52 A/B experiments** in GrowthBook across the registration and subscription funnel —
  full lifecycle: designing variants, shipping winners as defaults, deleting losers.
- **Payments**: Rebilly framepay, Apple Pay, PayPal + end-to-end subscription flow
  (checkout, cancellation/reactivation, invoices, dashboard).
- **i18n at scale**: ~60 language-market locales (Lingui + Crowdin), full RTL (Arabic,
  Hebrew), new market/domain rollouts (DE, AU, CA).
- **SEO migrations**: legacy country platforms (DK, NL, GR, BE, IT, CZ, FI) moved to the
  new product via 301s and canonicalization, preserving organic traffic.

**Beyond code**

- **A decade of teaching** — maths tutoring since 2015, programming for kids on LEGO
  Education (WeDo 2.0, SPIKE Prime, EV3) 2020–2023. Teaches him to explain hard things
  simply. Currently an **underused differentiator**.
- **Developer's journal** — daily coding log on instagram.com/chrobok.dev since **Jan 2023**.
  Consistency is the whole value of that channel.
- **Earlier**: Junior Frontend Developer at Meetmedia (2019–2020) — hand-coded
  HTML/Sass/JS from PSD, no framework.

**Education:** secondary school (VIII LO Katowice, 2013–2016). **Self-taught path into IT** —
own it as part of the story, don't hide it.

## Skills

- **Languages:** TypeScript, JavaScript, HTML, CSS/Sass
- **Frameworks & UI:** React 18, Next.js (App Router), Tailwind CSS, Radix UI, Astro
- **Testing:** Jest, Testing Library, Playwright, Storybook
- **i18n & experimentation:** Lingui + Crowdin, GrowthBook
- **Backend & data:** Node.js, Ruby on Rails (API — minor changes), REST, Redis, JWT
- **Infra & tooling:** Git, Docker, AWS (S3, CloudWatch, Parameter Store), Sentry,
  GitHub Actions, ESLint/Prettier

**Honest gaps — do not overstate anywhere on the site:** SQL is shallow (in progress),
Node.js is supporting rather than primary, Rails limited to minor API changes.

## Voice & tone

- **English**, consistent with every other channel.
- First person, plain, concrete. Numbers over adjectives — "614 PRs, 95% merged" beats
  "highly productive".
- Craftsmanship over hype; calm and stoic, never salesy.
- **Invite contact, don't just describe.** The canonical recruiter message was rewritten
  precisely because it was 100% self-description with no CTA. Lower the barrier:
  "happy to talk even just to check the fit".
- **Don't narrow the audience** — "a team", not "a product team"; software houses and
  agencies must not be excluded (he works through one).

## Content assets already written (reuse, don't rewrite)

| Asset | Where (second brain) |
|---|---|
| Full CV, one page, EN, ATS-friendly | `kariera/04-cv-draft-en.md` |
| Canonical "About me" / recruiter message, EN | `kariera/06-wiadomosc-do-rekrutera.md` |
| Skills & experience inventory | `kariera/01-umiejetnosci-i-doswiadczenie.md` |
| [product] deep dive + CAR bullets | `kariera/02-doswiadczenie-[product].md`, `03-cv-bullety-car.md` |
| Brand state, audience, weak spots | `kariera/personal-branding.md` |

The shape session does **not** start from a blank page — the copy largely exists and needs
selecting and shaping, not writing from scratch.

## Constraints

- **Hard goal:** replace the current "Work in progress..." page **before the author is on
  the market** (available ASAP; the market push is already running).
- **Working hours:** no work after 18:00, no screens after 20:00. Speed comes from **narrow
  scope**, never from longer evenings. Any plan that assumes evening crunch is invalid.
- **Stack is set:** Astro 5 + Tailwind + shadcn/ui + TypeScript, yarn. Not up for
  re-selection in shape.
- Existing conventions live in `.github/instructions/` (overview, code quality, design system).

## What the site must achieve (author's stated intent, to be confirmed in shape)

1. Kill the "Work in progress" impression — it currently **undercuts** every profile that
   links to it.
2. Prove the craftsman positioning by **being** well-crafted, not by claiming it.
3. Give a recruiter, in one screen: who / what level / what proof / how to contact.
4. Be the one channel that outlives any job board profile.

## Open Questions for `/10x-shape`

- Does the site carry the **journal** (mirror/import from Instagram) or only link to it?
- Depth of the **projects/case-study** layer — [product] work is in private repos and under
  a client's product; how much can be shown?
- Is there a **PL** version, or English only (rest of the funnel is English)?
- Hosting and domain wiring for chrobok.dev — currently nothing is deployed.
- Is a **CV download** on the site wanted, and which artifact is canonical?

## Sources

Second brain `pokerek_mind`: `kariera/01`, `02`, `03`, `04-cv-draft-en`, `06-wiadomosc-do-rekrutera`,
`personal-branding.md`, `projekty/chrobok-dev.md`. Tracking issue: Pokerek/website-astro#13.
