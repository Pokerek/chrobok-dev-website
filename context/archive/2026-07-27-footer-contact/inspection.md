# Footer Contact (S-05) — Inspection Record

Evidence behind each NFR and guardrail claim for this slice, so S-07 inherits a checked baseline rather
than re-running the sweep blind. Scope: the new `src/components/contact/Contact.astro` section and the
`Hero.astro` CV-link change. Date: 2026-07-27. Commits: `b4dbfa5` (phase 1), `8bddea5` (phase 2).

> **Scope note.** The slice was planned as a footer rewrite and implemented as a separate
> `<section id="contact">` inside `<main>`, with `Footer.astro` left as it shipped. Every criterion below
> that the plan wrote against "the footer" is evaluated against the contact section instead. `Footer.astro`
> is unchanged by this slice and was not re-inspected.

## Performance and layout stability

**Checked:** whether the new section adds any JavaScript, font, image or network request, and whether
anything in it can shift layout after first paint.

**How:** `rm -rf dist && yarn build` from cold, then counted `<script>` tags in `dist/index.html` and in the
contact section specifically; read the rendered class list for animation or transition utilities. Then
served the production build with `yarn preview` and measured real `layout-shift` entries in Chrome via a
buffered `PerformanceObserver` across a full page load.

**Result: pass.**

- Zero `<script>` tags in the contact section — and zero on the entire page, confirmed both in the built
  HTML and at runtime (`document.querySelectorAll('script').length === 0`).
- **Measured CLS: 0.0000, with zero `layout-shift` entries** over a full load of the production build.
- No font, image or network request added. `buttonStyles` is imported for its class string only, exactly as
  `Hero.astro` and `About.astro` do, so nothing hydrates.
- The only motion in the section is `transition-colors`, inherited from the `buttonStyles` base. No fade,
  slide, scale or scroll-reveal, so there is nothing to shift after first paint.
- Cold build completes clean: `astro check` 0 errors, 0 warnings.

**Measurement trap, recorded for S-07.** The same measurement against `yarn dev` reports **4 script tags and
CLS 0.130** — entirely the Astro dev toolbar and HMR client, none of which ship. Any future CLS or
"zero JS" check must run against `yarn preview` (or `dist/`), never the dev server, or it will report a
failure that does not exist in production.

**Not verified here:** the "under a second on a phone" figure. That is a field measurement S-07 owns; this
slice only establishes that it adds nothing to the budget.

## Keyboard and screen reader

**Checked:** that every interactive element in the section is a real link, is reachable in visual order,
shows the focus ring, and carries an accessible name that includes the change of context.

**How:** drove the production build in Chrome — pressed real `Tab` keys from the last About link and
recorded `document.activeElement` and the computed focus ring at each stop; read the rendered markup and
the `sr-only` span's computed style to establish what the accessible name resolves to.

**Result: pass.** Keyboard behaviour measured below; the accessible names were verified structurally here
and **confirmed by the author against a real screen reader** (plan row 2.8).

- **Tab order, measured:** About journal → `mailto:karolchrobok@gmail.com` → LinkedIn → GitHub → CV. Matches
  visual order exactly, in one pass, with no keyboard trap and no focus landing on a non-interactive node.
- **Focus ring rendered at every stop.** Computed
  `box-shadow: rgb(250,250,250) 0 0 0 2px, rgba(0,0,0,0.5) 0 0 0 4px` — the global
  `:focus-visible { @apply outline-none ring-2 ring-offset-2 }` rule from `globals.css`, with a `page-bg`
  offset. Visible in screenshots on all four links. See the finding below about its alpha.
- All four affordances are plain `<a href>` elements — no `div` with a click handler, no `role`, no
  `tabindex`.
- **The `sr-only` "(opens in a new tab)" span resolves into the accessible name.** It is inside the anchor,
  and its computed style is `display: block; visibility: visible; position: absolute; width: 1px;
  clip: rect(0,0,0,0)` — the standard visually-hidden technique, which the accessible-name computation
  includes (it excludes only `display: none` and `visibility: hidden`). Both `textContent` and `innerText`
  return `"LinkedIn (opens in a new tab)"` and `"GitHub (opens in a new tab)"`. This was the plan's key
  risk; the placement is correct.
- **Caveat, since resolved:** Chrome's accessibility-tree dump reports these links as plain `"LinkedIn"` /
  `"GitHub"`. That is the dump tool's name derivation, not the page — the already-shipped `About.astro`
  journal link, which uses the identical S-04 pattern, reports the same way. The author's screen-reader
  pass confirmed the suffix is announced. Anyone re-running this check should not read that dump as a
  defect.
- The email link's accessible name is the address itself (`karolchrobok@gmail.com`), which is also its
  visible, selectable text — FR-010's requirement.
- The CV link has no `target`, no `rel` and no `download`, so it carries no new-tab announcement, correctly.
- Section heading is a real `<h2>Contact</h2>` in the `label` slot, matching the Work and About pattern, so
  the section appears in a screen reader's heading list.

### Finding: the focus ring renders at 50% alpha, not the solid token

`tailwind.config.mjs` sets `ringColor.DEFAULT` to the `focus-ring` token (`#000000`) and its comment states
the ring "renders correctly without ever hard-coding a colour". In practice Tailwind composes that with its
default `ringOpacity` of `0.5`, so the ring paints as `rgba(0,0,0,0.5)` — effectively `#7D7D7D` over
`page-bg`.

- **Measured contrast: 3.94:1** against `page-bg`. WCAG 2.2 SC 1.4.11 requires 3:1, so this **passes** — but
  on a 0.94 margin instead of the 17.12 the config's intent implies (solid black would be 20.12:1).
- Pre-existing F-01 configuration behaviour, not introduced by this slice; every focusable element on the
  page is affected identically. Recorded for S-07, which owns the design-system pass.

## No-JavaScript

**Checked:** that the section is fully present and operable with scripts disabled.

**How:** counted `<script>` tags in the built HTML and at runtime in the served production build; read the
markup for JS-dependent affordances.

**Result: pass, by proof rather than by sample.** The production page contains **zero** `<script>` tags, so
its JS-disabled rendering is byte-identical to its JS-enabled rendering — there is nothing to disable. Every
contact affordance is a static `<a href>` present in the served HTML. No copy-to-clipboard button, no
obfuscated email, no progressive enhancement to fall back from.

## Destinations

**Checked:** that all four destinations resolve to what the copy claims.

**How:** extracted every `href` from the contact section in `dist/index.html`; `curl` for the profile URLs;
a real browser load for LinkedIn; `ls` for the CV in the build output.

**Result: pass.**

| Destination | Value | Evidence |
| --- | --- | --- |
| Email | `mailto:karolchrobok@gmail.com` | Matches `EMAIL` in `contact.constants.ts`; the only copy in `src/` |
| LinkedIn | `https://www.linkedin.com/in/karol-chrobok` | Browser load renders "Karol Chrobok \| LinkedIn"; public profile URL on the page matches exactly |
| GitHub | `https://github.com/Pokerek` | `curl` returns `200` |
| CV | `/karol_chrobok_cv.pdf` | Present in `dist/` at 115.8 KB; identical path to the hero's link |

**Note:** `curl` against the LinkedIn URL returns `999`, LinkedIn's anti-automation status. That is not a
dead link — the browser load above confirms the profile. Anyone re-running this check with `curl` alone
should expect `999` and not treat it as a regression.

## Contrast

**Checked:** WCAG AA contrast for every colour pair the section renders.

**How:** computed the WCAG 2.1 relative-luminance ratio for each token pair from `tailwind.config.mjs`.

**Result: pass, with large margin.** AA needs 4.5:1 for body text and 3:1 for UI boundaries.

| Pair | Ratio | Requirement |
| --- | --- | --- |
| `text-secondary` `#333333` on `page-bg` `#FAFAFA` (location, copyright) | 12.10:1 | 4.5:1 |
| `text-primary` `#000000` on `page-bg` `#FAFAFA` (email, link labels) | 20.12:1 | 4.5:1 |
| Link label `#000000` on `hover-bg`/`element-bg` `#F0F0F0` | 18.43:1 | 4.5:1 |
| `border-default` `#000000` on `page-bg` (link borders) | 20.12:1 | 3:1 |
| `focus-ring` `#000000` on `page-bg` offset | 20.12:1 | 3:1 |

## Cross-engine and viewport

**Checked:** layout at desktop and 375px, behaviour at 200% text zoom, and whether anything relies on an
engine-specific or recent-only CSS feature.

**How:** drove the production build in Chrome at 1440px and at a 375px document width, measuring element
geometry directly rather than eyeballing screenshots. Chrome clamps its window to a 500px minimum, so the
375px case was produced by constraining the document to 375px — both cases sit below the `md` breakpoint, so
the collapsed layout under test is the same one a phone gets.

**Result: pass.** Measured in Chromium at every width below; **WebKit confirmed by the author** (plan row
3.8).

- **Desktop (1440px):** the Contact `<h2>` and the About `<h2>` share an identical `x` of **44.5px** — the
  labels align, which was the plan's alignment criterion.
- **Below `md`:** the label stacks above the content column, both at `x = 32px`, label bottom `343` above
  content top `391`. No overlap.
- **375px:** no horizontal overflow (`scrollWidth === clientWidth === 375`); the widest child's right edge
  is **343px**, inside the container's 32px padding. The link row wraps to two lines — LinkedIn and GitHub
  share a row, CV drops below.
- **200% text zoom** (root font-size 32px): **nothing clipped.** Every link reports
  `scrollHeight <= clientHeight` and `scrollWidth <= clientWidth`, and there is no horizontal overflow. The
  link boxes grow from 40px to 88px tall, which is exactly what the `h-auto min-h-10` override exists to
  allow — the hero's two buttons pass the same check at 80px.
- The section uses `grid`, `flex flex-wrap`, `space-y-*` and `min-h-*` only — all baseline in Chromium,
  WebKit and Gecko for years. No `:has()`, no container query, no subgrid, no `svh` (the one `min-h-svh` on
  the page is in `Hero.astro`, untouched here).
- The `label | content` grid collapses through the `Section` primitive's existing
  `grid-cols-1 md:grid-cols-section`, the same mechanism Work and About already ship — so the narrow-width
  behaviour is inherited, not newly written.

**WebKit: author-confirmed, not machine-measured here.** No WebKit browser was available in this
environment, so the WebKit half of the criterion was checked by the author rather than instrumented. The
utilities in use carry no known WebKit divergence, which is consistent with that result. S-07's recorded
unknown ("which browser/engine combinations get a real manual check versus a reasoned assumption?") should
note that S-05's WebKit evidence is a human pass, not a repeatable measurement.

## Destination click-through

**Checked:** that the CV link actually opens the PDF in the browser, in the same tab, from both ends of the
page, and that both ends resolve to the same file.

**How:** clicked each CV link in Chrome against the production build and observed the resulting tab.

**Result: pass.**

- **Contact CV link:** same tab (tab id unchanged), navigates to `/karol_chrobok_cv.pdf`, renders in
  Chrome's built-in PDF viewer. No download prompt, no save dialog, no gate.
- **Hero CV link:** identical behaviour, identical URL. Both ends of the page point at the same artifact and
  label it the same way ("View CV (PDF)") — the drift this slice existed to close.
- The rendered PDF's header confirms the "Available ASAP" line already flagged below.
- **The `mailto:` link was not clicked here** — activating it launches the operating system's mail client,
  outside the page's contract and outside this environment. Verified instead that the `href` is exactly
  `mailto:karolchrobok@gmail.com` in both the hero and the contact section, sourced from the single `EMAIL`
  constant. The author confirmed the composer opens correctly (plan row 1.6).

## Hero regression

**Checked:** that realigning the hero to the shared constants changed nothing but the CV link's behaviour
and label.

**How:** `git diff ecff873 HEAD -- src/components/hero/Hero.astro`, plus rendering the hero at 1440px and
375px.

**Result: pass.** The diff is 2 insertions, 5 deletions, confined to the import line, the three deleted
local constants, and the CV anchor's `href` source, label and `download` attribute. **No layout class,
no spacing token and no element changed.** A visual regression is therefore structurally impossible, and the
rendered hero confirms it: correct at 1440px, no overflow at 375px, buttons wrapping as before.

## Copy guardrails

**Checked:** that the section states no availability, start date, notice period, contract form or client
name, and makes no competency claim.

**How:** read every string the section renders, including the values in `contact.constants.ts`.

**Result: pass.** The complete rendered copy is: `Contact`, `karolchrobok@gmail.com`,
`Silesia, Poland — remote`, `LinkedIn`, `GitHub`, `View CV (PDF)`, and the two `sr-only` new-tab suffixes.

- No availability, start date or notice period. "remote" is a work-mode statement, not a date or a term.
- No contract form or rate.
- No client named.
- No competency or seniority claim — the section states facts and destinations only.

## Defects found and not fixed

| Finding | Owner |
| --- | --- |
| `Footer.astro` keeps raw `mt-2 pt-2 text-center` spacing instead of the token scale. `design-notes.md` flagged it for "the first content pass"; this slice was to be that pass, but the mid-implementation decision to leave the footer alone reopened it. (The `border-black` also flagged there was already fixed — that record was stale.) | S-07 |
| `button.styles.ts` pins `h-10`, worked around at four call sites with `cn(buttonStyles(...), 'h-auto min-h-10 …')`, each hand-copying the `10`. | S-07 (already recorded) |
| The focus ring paints at `rgba(0,0,0,0.5)`, not the solid `focus-ring` token — Tailwind's default `ringOpacity: 0.5` composes with the configured colour. Measured 3.94:1, so SC 1.4.11 passes, but on a 0.94 margin instead of 17.12. The comment in `tailwind.config.mjs` claiming the ring renders correctly "without ever hard-coding a colour" is only half true. Pre-existing F-01 behaviour, page-wide. | S-07 |
| WebKit, the screen-reader pass and the `mailto:` composer were confirmed by the author rather than instrumented here — no WebKit browser, screen reader or mail client in this environment. The results are pass; the *evidence* is human, so re-running this sweep will not reproduce them automatically. | S-07 (its already-recorded unknown) |
| Measuring CLS or script count against `yarn dev` reports 4 scripts and CLS 0.130 from the Astro dev toolbar. Always measure against `yarn preview` / `dist/`. | Note for S-07, not a defect |
| No component owns the three link affordances (bordered skin, external-link contract, inline text link), so the `sr-only` placement is enforced by care rather than by structure. Recorded in full under S-07 in `roadmap.md`. | S-07 |
| The CV PDF's own header and the LinkedIn profile's About section both read "Available ASAP". The no-availability guardrail binds the page and the page is clean, but a reader following either link sees a start-date claim one click later. Author's artifacts, outside this repository. | Author, not a code change |
| The roadmap (S-05 "Blockers", S-08) and PRD Open Question 3 still record the CV PDF as a blocking external dependency. It exists at `public/karol_chrobok_cv.pdf` and both the hero and the contact section link it. Those records are stale. | S-08 |
