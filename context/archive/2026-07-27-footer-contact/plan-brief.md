# Footer Contact (S-05) — Plan Brief

> Full plan: `context/changes/footer-contact/plan.md`

## What & Why

Roadmap slice **S-05**, covering **FR-010** and **FR-011**: the email as selectable text, the LinkedIn and
GitHub profiles, and the CV as a direct ungated PDF — all from the footer. Together with S-01 this closes
the PRD's primary success criterion that a contact channel is reachable from *both* the top and the bottom
of the page. Along the way the contact facts stop being hard-coded twice, which is the drift the roadmap
recorded as this slice's one unknown.

## Starting Point

`Footer.astro` is nine lines — a top border and a copyright line — rendered by `Layout.astro` outside
`<main>`. It carries two of the three hard-coded values `design-notes.md` flagged for "the first content
pass": `border-black` instead of the token, and raw `mt-2 pt-2` spacing. `Hero.astro` declares `EMAIL`,
`CV_PATH` and `CV_FILENAME` as local constants. Everything else the slice needs already exists and is
frozen by F-01: the `Section` primitive, the token set, the global focus ring, and `buttonStyles()` used as
a link skin so no React reaches the page.

**The CV blocker is resolved** — `public/karol_chrobok_cv.pdf` exists and the hero already links it. The
roadmap and PRD Open Question 3 still record it as external and blocking; that record is stale.

## Desired End State

Scrolling to the bottom reveals a block labelled **Contact**, its label aligned with Work and About on
desktop and stacked below `md`. The full email address is visible, selectable and clickable; three bordered
links lead to LinkedIn, GitHub and the CV; a location line and the copyright close the page. LinkedIn and
GitHub open in a new tab with the context change announced to a screen reader; the CV opens the PDF in the
same tab, no download prompt, no gate. Zero JavaScript.

## Key Decisions Made

| Decision           | Choice                                                        | Why (1 sentence)                                                                          |
| ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Structure          | Extend `Footer.astro` in place, `id="contact"`                | Matches the PRD flow (step 7 is the footer), keeps one `<footer>` landmark, and hands S-06 its seventh anchor |
| Grid reuse         | Add an `as` prop to `Section.astro`                            | One definition of the F-01 skeleton — the footer cannot drift from the other sections       |
| Email affordance   | `mailto:` link whose visible label is the full address        | Selectable as text per FR-010, clickable for anyone with a mail client, mirrors the hero    |
| Link presentation  | Three bordered outline links in a wrapping row                 | The page's one established clickable affordance, with 40px targets for the phone-first criterion |
| CV behaviour       | Plain same-tab link, no `download` — **in the hero too**       | A recruiter can read it immediately, which is the low-friction path FR-011's no-gate rationale points at |
| CV label           | "View CV (PDF)"                                                | Describes what now actually happens, and names the format before the click                  |
| Contact facts      | One `src/constants/contact.constants.ts`                       | Closes the roadmap's recorded S-05 unknown by construction rather than by remembering        |
| Extra footer copy  | Copyright line kept; location line added                       | Location pre-qualifies a screening call on timezone; availability stays out per the guardrail |
| External links     | New tab + inner `sr-only` announcement                         | The pattern `About.astro:38-45` already established for a third-party destination            |
| Copy source        | `pokerek_mind/kariera/` and the CV PDF, never `author-profile.md` | The vault is post-audit; `author-profile.md` is the pre-audit snapshot S-04 flagged        |
| Button height fix  | Repeat the `h-auto min-h-10` call-site workaround              | `src/ui/base/**` is F-01-frozen; the durable fix is already recorded as S-07 carried-in work |

## Scope

**In scope:** `src/constants/contact.constants.ts`; the `as` prop on `Section.astro`; the `Footer.astro`
rewrite incl. its two F-01 token fixes; realigning `Hero.astro` to the shared constants and the new CV
behaviour and label; the `CLAUDE.md` structure line; the inspection record.

**Out of scope:** moving `JOURNAL_URL` out of `About.astro`; fixing `h-10` in `button.styles.ts`; a contact
form, email obfuscation, copy-to-clipboard, social icons or any JavaScript; the sticky nav (S-06); a
"built with" line; availability, contract form or notice period; `index.astro`, `globals.css`,
`tailwind.config.mjs`, `src/ui/base/**`; regenerating the CV PDF.

## Architecture / Approach

One new constants module, one widened primitive, one rewritten component, one realigned component.
`Section.astro` gains `as?: 'section' | 'footer'` defaulting to `'section'`, so the footer inherits the
container, the `label | content` grid, the gap and the scroll anchor instead of copying six classes — and
Hero, Work and About render byte-identical markup. `Footer.astro` then becomes `Section as="footer"` with
an `<h2>Contact</h2>` label and a content column of email, location, link row and copyright. The email is a
plain underlined anchor rather than `buttonStyles({ variant: 'link' })`, because CVA's `defaultVariants`
still apply the `h-10 px-6` size to that variant and cannot be opted out of.

## Phases at a Glance

| Phase                            | What it delivers                                                    | Key risk                                                                     |
| -------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1. Constants + hero alignment    | The shared module; hero on it, `download` dropped, relabelled       | A behaviour change to a shipped section — the CV now opens instead of saving     |
| 2. `as` prop + footer block      | The contact block, on the F-01 skeleton, with the token fixes       | The `as` prop touches a primitive three shipped sections depend on               |
| 3. Inspection verification       | NFR and guardrail evidence, recorded for S-07                       | Manual beyond build, lint and greps — no test runner exists, by design           |

**Prerequisites:** F-01 and F-02 — both Done. Work happens on `feat/footer-contact`, already branched from
`development` at `ecff873`.
**Estimated effort:** ~1 session across 3 phases.

## Open Risks & Assumptions

- **The roadmap and PRD still call the CV an external blocker.** It is not — the PDF is committed and
  linked. S-08's blocking unknown should close when this slice lands; someone has to actually edit those
  records.
- **The CV PDF's header reads "Available ASAP".** The no-availability guardrail binds the page, and the
  page stays clean — but a recruiter following the link one click later sees a start-date claim. Author's
  artifact, outside this repository; flagged, not acted on.
- **The location line sits next to a guardrail.** "Silesia, Poland — remote" is location, not availability,
  and was chosen deliberately; if it reads as terms-in-a-portfolio on the preview, deleting it is one line.
- **Dropping `download` diverges from how S-01 shipped.** Mobile browsers vary in how they render an inline
  PDF, so this is worth one check on a real phone rather than only in a desktop devtools viewport.
- **Three more copies of the `h-auto min-h-10` workaround** now hand-copy the `10` from
  `button.styles.ts`, with nothing linking the values. It strengthens the S-07 case rather than weakening
  it, but it is debt taken on knowingly.
- **Verification is manual beyond build, lint and greps.** No test runner exists, by design.

## Success Criteria (Summary)

- A reader at the bottom of the page can copy the email, open both profiles, and read the CV — without a
  form, a gate or a download prompt.
- The footer is fully operable by keyboard and correctly announced by a screen reader, ships zero
  JavaScript, and causes no layout shift.
- The email and the CV path exist in exactly one place in the source, and the hero and footer describe the
  CV identically.
