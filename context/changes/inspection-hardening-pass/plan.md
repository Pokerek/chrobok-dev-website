# Inspection Hardening Pass Implementation Plan

## Overview

S-07 is the last content slice before the v1 cutover. Its job is to make the four PRD
Non-Functional Requirements actually true — performance and zero layout shift, keyboard and
screen-reader reachability with WCAG AA contrast, full availability without JavaScript, and
correct rendering across the mainstream engines — and to pay down the accessibility debt that
S-04 and S-05 deliberately deferred into this slice.

Research turned up two regressions nobody had recorded, and they reorder the work: the site's
webfonts have never shipped to production, and the hero image is downloaded by phones that never
display it. The font finding is the headline — F-01's entire typographic identity is absent from
the deployed CSS.

## Current State Analysis

**The webfonts do not ship.** The built stylesheet (`dist/_astro/index.*.css`) declares
`font-family: Ramaraja, serif` and `font-family: IBM Plex Mono, monospace` but contains **zero
`@font-face` rules**, and no `.woff2` file exists anywhere in `dist/`. Two independent faults
compound:

1. `src/styles/globals.css:6-8` places three `@import '@fontsource/…'` statements *after* the
   `@tailwind` directives. CSS requires `@import` to precede all other rules, so PostCSS drops
   them silently — no error, no warning, no output.
2. `@fontsource/ramaraja/700.css` **does not exist**. The package ships weight 400 only
   (`node_modules/@fontsource/ramaraja/` contains `400.css`, `latin-400.css`, `telugu-400.css`
   and nothing else) — Ramaraja is a single-weight display serif. The import would have failed
   even in the right position.

The site therefore renders in the system serif and system monospace today. `globals.css:44` also
sets `font-weight: 700` on every heading, which against a 400-only family means synthetic
(faux) bold once the font is restored.

**The hero image is downloaded on phones and never shown.** `src/components/hero/Hero.astro:30`
renders `monk.webp` (21 KB) with `hidden … md:block`. `display: none` does not prevent the
fetch, so mobile visitors pay for an asset they cannot see — on the exact device the first NFR
targets.

**Accessibility debt carried in from S-04 and S-05** (`context/foundation/roadmap.md:220-248`):

- `src/ui/base/button/button.styles.ts:13` pins `h-10` on the `default` size. WCAG AA requires
  200% text resize without loss of content; at that zoom every button label wraps and overflows
  the fixed box. Worked around at the call sites with hand-copied `h-auto min-h-10` strings
  (`About.astro:39`, `Contact.astro:10`), each of which re-derives the `10` from the primitive
  with nothing linking the two values. `Hero.astro:25-26` has no workaround and clips today.
- Three link affordances exist with no owning component: the bordered skin, the external-link
  contract (`target="_blank"`, `rel="noopener noreferrer"` and an `sr-only` "(opens in a new
  tab)" span **inside** the anchor, at three call sites), and the inline text link, which uses
  raw `underline underline-offset-4` because `buttonStyles({ variant: 'link' })` still applies
  the `h-10 px-6` default size and CVA `defaultVariants` cannot be opted out of.

**Head metadata is thin.** `src/layouts/Layout.astro:17-24` has no OpenGraph or Twitter tags, no
canonical, a `<title>` of `"Chrobok.dev"` carrying neither name nor role, and a `viewport` meta
missing `initial-scale=1`. `docs/nfr-inspection.md:57` asks for exactly these. This matters
disproportionately because the primary persona receives the site as a pasted link.

**Dead React runtime.** There are **zero `client:` directives** in `src/`, and `button.tsx` /
`tag.tsx` are imported by nothing — only their `.styles.ts` siblings are consumed. `@astrojs/react`
nonetheless emits a 140 KB `dist/_astro/client.*.js` chunk that `index.html` never references.

**Type declarations are inconsistent.** Three `interface` declarations remain
(`Layout.astro:7`, `Section.astro:13`, `button.types.ts:5`) against `type` everywhere else, and
`.claude/rules/typescript.md` takes no position on which to use — nor does its `paths` glob
(`src/**/*.{ts,tsx}`) cover `.astro` files at all, so the TypeScript rules never load when
editing Astro frontmatter.

**What is already correct** and must not be disturbed: contrast passes comfortably (`#333333` on
`#FAFAFA` ≈ 12.6:1, `#000000` on `#F0F0F0` ≈ 18.9:1); the skip link (`Layout.astro:26-31`); the
global `:focus-visible` ring contract (`globals.css:33-35`); heading hierarchy; `role="list"` +
`aria-labelledby` on every tag group; the `prefers-reduced-motion` guard on smooth scrolling
(`globals.css:16-20`); and the `<details>` mobile menu, which is native and works with scripts
disabled.

## Desired End State

The deployed page renders in Ramaraja and IBM Plex Mono with no layout shift after first paint;
phones fetch no asset they cannot see; every link on the page is produced by one component that
cannot forget the external-link contract; a pasted link renders a titled preview card; the build
emits no JavaScript at all; and `docs/nfr-inspection.md` has been run end to end with its result
recorded in the PR.

Verified by: `@font-face` and `.woff2` present in `dist/`; `dist/_astro/*.js` absent;
`grep -c 'h-auto min-h-10' src/` returning 0; `yarn build` and `yarn lint` clean; and a ticked
inspection checklist pasted into the PR.

### Key Discoveries:

- The `@import` placement bug and the nonexistent `700.css` are independent — fixing one without
  the other still ships no fonts (`src/styles/globals.css:6-8`).
- `@fontsource/ramaraja/400.css` pulls in **both** the latin (15 KB) and telugu (139 KB) subsets.
  The latin-only entrypoints (`latin-400.css`) are what this page needs.
- `TagVariant` in `src/ui/base/tag/tag.types.ts:7` is imported by `Skills.astro:6` and
  `SologyRole.astro:4` — that file must survive the React removal; only `TagProps` (line 5) and
  its `react` import go.
- `lucide-react` is imported by nothing; `@radix-ui/react-slot` only by the dead `button.tsx:3`.
- ImageMagick (`magick`) is already on the machine, so the OG image needs no new dependency.
- `context/changes/astro-constants-extraction/change.md` parks "does the convention cover
  `interface Props`?" as its open question. This plan answers it (Props move to a sibling
  `.types.ts`) for the three components it touches; the frontmatter *data* extraction stays that
  change's work.

## What We're NOT Doing

- **Frontmatter constants extraction.** `Skills.astro`, `SologyRole.astro`, `MeetmediaRole.astro`
  and `Hero.astro` keep their module-scope data in frontmatter — that is
  `context/changes/astro-constants-extraction/`'s scope, not this slice's.
- **Dark mode.** `tailwind.config.mjs:6` sets `darkMode: ['class']` with no palette and no
  consumer. Not an NFR; WCAG AA is a contrast requirement and the light palette already passes.
- **Automated a11y or performance CI.** No axe-core, Lighthouse CI or Playwright in the gate.
  `docs/nfr-inspection.md:61-67` argues this case and F-03 settled it deliberately.
- **`robots.txt` and `sitemap.xml`.** Neither is an NFR, and a single-page site gains close to
  nothing from a sitemap.
- **Re-opening the F-01 typography choice.** Ramaraja stays; only its weight handling changes.
- **Content or copy edits.** No section text changes except the `<title>` and meta description.

## Implementation Approach

Five phases, ordered so that the riskiest change lands first and the verification lands last.

Phase 1 restores the fonts, because introducing real webfonts changes what "no layout shift"
means for every later measurement — checking CLS before the fonts exist would validate nothing.
It also settles the type conventions first so the new component in Phase 2 inherits them.

Phases 2 through 4 are independent of each other and touch disjoint file sets. Phase 4 (React
removal) is deliberately last among the code phases and self-contained, so it can be dropped
without disturbing any NFR work if it proves larger than expected.

Phase 5 is the human inspection run. It is a real gate, not a formality: it is the only step that
establishes the slice's outcome, and anything it finds is fixed inside this slice rather than
during the release.

## Critical Implementation Details

**`url()` cannot take a `var()`.** The natural Astro idiom for hashed asset paths — importing the
woff2 with `?url` and passing it into a `<style define:vars>` block — does not work, because
`src: url(var(--font-url))` is invalid CSS in every engine. This is why Phase 1 commits the font
files to `public/fonts/` and writes plain `@font-face` paths instead. It has a second benefit
that matters more: the `<link rel="preload">` `href` must match the `@font-face` `src` **byte for
byte**, or the browser fetches the font twice and logs a console warning — which the "console is
clean" check at `docs/nfr-inspection.md:55` would then fail on.

**`font-display: optional` only works if the font is preloaded.** `optional` gives the font a
~100ms block period and then never swaps. Without a preload the font reliably loses that race and
never renders at all — the page would permanently show fallback faces. Every family and weight
the first screen uses must therefore be preloaded, including IBM Plex Mono 500 (used by
`buttonStyles` and `tagStyles`, both visible above the fold). Three files, ~44 KB total.

**Astro requires the local props type to be named `Props`.** Moving props to a sibling file means
importing under an alias — `import type { LayoutProps as Props } from './layout.types'` — not
renaming the local binding.

## Phase 1: Typography Restoration and Type Conventions

### Overview

Make the webfonts reach production for the first time, without introducing the layout shift the
first NFR forbids. Settle `type`-over-`interface` and the sibling-`.types.ts` convention here so
the component added in Phase 2 is written correctly the first time.

### Changes Required:

#### 1. Font assets

**File**: `public/fonts/` (new directory)

**Intent**: Ship the three latin-subset font files the page needs, at stable paths that a preload
link and an `@font-face` rule can both name identically.

**Contract**: Copy from `node_modules/@fontsource/`, preserving filenames:
`ramaraja-latin-400-normal.woff2`, `ibm-plex-mono-latin-400-normal.woff2`,
`ibm-plex-mono-latin-500-normal.woff2`. Latin subsets only — the telugu subset is 139 KB and this
page has no Telugu content. `.woff` fallbacks are not needed; every engine in the NFR matrix has
supported `woff2` for years.

#### 2. Font face declarations

**File**: `src/styles/globals.css`

**Intent**: Replace the three dropped `@import` statements with hand-written `@font-face` rules
that this project controls, so `font-display` can be set to `optional` (fontsource hardcodes
`swap`). Remove the heading weight that would force faux bold on a 400-only family.

**Contract**: Delete lines 5-8 (the comment and three `@import`s). Add three `@font-face` blocks —
`Ramaraja` 400, `IBM Plex Mono` 400 and 500 — each with `font-display: optional`,
`src: url('/fonts/<name>.woff2') format('woff2')` and a `unicode-range` matching the latin subset.
Remove `font-weight: 700` from the `h1`–`h6` block (line 44). `@font-face` must appear before
`@layer base`, and `@tailwind` directives stay at the top.

#### 3. Font preloads

**File**: `src/layouts/Layout.astro`

**Intent**: Start all three font fetches in the document head so `font-display: optional` can win
its block period and render the real faces on first paint.

**Contract**: Three `<link rel="preload" as="font" type="font/woff2" crossorigin>` tags in
`<head>`, with `href` values byte-identical to the `src` URLs in `globals.css`. `crossorigin` is
required on font preloads even for same-origin fonts; omitting it causes a duplicate fetch.

#### 4. Heading weight call site

**File**: `src/components/navigation/Navigation.astro`

**Intent**: Drop the wordmark's `font-bold`, which would render as faux bold now that Ramaraja
ships at its single designed weight.

**Contract**: Remove `font-bold` from the anchor class list on line 8. `font-heading` and
`text-xl` stay.

#### 5. Props types moved to siblings

**Files**: `src/layouts/Layout.astro` + `src/layouts/layout.types.ts` (new);
`src/components/layout/Section.astro` + `src/components/layout/section.types.ts` (new)

**Intent**: Convert the two `interface Props` declarations to exported `type` aliases in sibling
files, per the naming convention in CLAUDE.md.

**Contract**: `layout.types.ts` exports `LayoutProps` (`title: string; description: string`);
`section.types.ts` exports `SectionProps` (`id: string; class?: string`). Each `.astro` file
imports under the alias Astro requires:

```ts
import type { LayoutProps as Props } from './layout.types';
```

#### 6. Remaining interface

**File**: `src/ui/base/button/button.types.ts`

**Intent**: Convert the last `interface` to a `type` intersection. Done here rather than skipped
so that the codebase is consistent whether or not Phase 4 lands.

**Contract**: `ButtonProps` becomes an intersection of `ButtonHTMLAttributes<HTMLButtonElement>`,
`VariantProps<typeof buttonStyles>` and `{ asChild?: boolean }`.

#### 7. Convention rule

**File**: `.claude/rules/typescript.md`

**Intent**: Record `type` over `interface` and the sibling-file placement so the convention holds,
and fix the gap where these rules never load for `.astro` frontmatter.

**Contract**: Add `src/**/*.astro` to the `paths` frontmatter list, and a Conventions bullet
stating that types are declared with `type`, not `interface`, and live in a sibling `.types.ts`.

### Success Criteria:

#### Automated Verification:

- Build passes: `yarn build`
- Lint passes: `yarn lint`
- Fonts are bundled: `grep -c "@font-face" dist/_astro/*.css` returns 3
- Font files are served: `ls dist/fonts/*.woff2` lists 3 files
- No stale imports: `grep -rc "@fontsource" src/` returns 0
- No interfaces remain: `grep -rc "interface " src/` returns 0
- Telugu subset absent: `ls dist/fonts/ | grep -c telugu` returns 0

#### Manual Verification:

- Headings render in Ramaraja and body text in IBM Plex Mono on the preview URL
- Headings show no synthetic-bold smearing at `h1` size
- A hard reload with an empty cache shows no visible reflow as text settles
- Console is free of font-preload warnings (a warning here means a `href`/`src` mismatch)

**Implementation Note**: Pause after this phase for manual confirmation before proceeding.

---

## Phase 2: Link Primitive and Button Height

### Overview

Fix the button-height bug at its source, then introduce the `Link` component that makes the
external-link accessibility contract structural rather than remembered, and migrate all six call
sites onto it.

### Changes Required:

#### 1. Button height

**File**: `src/ui/base/button/button.styles.ts`

**Intent**: Let button boxes grow with wrapped labels instead of clipping them at 200% text zoom.
This knowingly edits F-01-frozen `src/ui/base` — the freeze is lifted for this one line, as
`context/foundation/roadmap.md:225-227` prescribes.

**Contract**: In `size.default`, `h-10` becomes `min-h-10`. The `sm`, `lg` and `icon` sizes are
unchanged — `icon` is a fixed square by design.

#### 2. Link styles

**File**: `src/components/layout/link.styles.ts` (new)

**Intent**: Own the two link skins in one CVA definition. The `bordered` variant composes
`buttonStyles({ variant: 'outline' })` rather than restating it, so the bordered skin keeps a
single source of truth and the `min-h-10` fix above propagates to every link automatically.

**Contract**: `linkStyles` exports a CVA with `variant: 'bordered' | 'inline'`, defaulting to
`inline`. `bordered` composes the outline button styles plus `text-center`; `inline` is
`underline underline-offset-4`. No focus styles — `globals.css:33-35` applies the ring globally.

#### 3. Link types

**File**: `src/components/layout/link.types.ts` (new)

**Contract**: `LinkProps` intersects `HTMLAttributes<'a'>` (from `astro/types`),
`VariantProps<typeof linkStyles>`, and `{ href: string; external?: boolean }`.

#### 4. Link component

**File**: `src/components/layout/Link.astro` (new)

**Intent**: Render an anchor whose `external` flag emits the target, the rel and the
screen-reader suffix as one indivisible unit — the three cannot drift apart, which
`context/foundation/roadmap.md:236-238` records as S-04's key risk.

**Contract**: Renders `<a href>` with `class:list={[linkStyles({ variant }), className]}` and
passes through remaining attributes. When `external` is true it adds
`target="_blank" rel="noopener noreferrer"` and appends
`<span class="sr-only"> (opens in a new tab)</span>` **after the `<slot />` and inside the
anchor**. A comment should state why the three are coupled, or a later reader will separate them.

#### 5. Call-site migration

**Files**: `src/components/hero/Hero.astro`, `src/components/about/About.astro`,
`src/components/contact/Contact.astro`

**Intent**: Route all six links through `Link` and delete every hand-copied style string.

**Contract**: `Hero.astro:25-26` — two `variant="bordered"` links (mailto, CV). `About.astro:38-45`
— one `variant="bordered" external` link; delete the inline `sr-only` span and the
`cn`/`buttonStyles` imports. `Contact.astro:19` — `variant="inline"` mailto; `:26,:30` —
`variant="bordered" external`; `:34` — `variant="bordered"` CV; delete the `linkStyles` const at
line 10 and its comment, plus the `cn` and `buttonStyles` imports. After this, no `.astro` file
imports `buttonStyles` directly.

### Success Criteria:

#### Automated Verification:

- Build passes: `yarn build`
- Lint passes: `yarn lint`
- No hand-copied overrides remain: `grep -rc "h-auto min-h-10" src/` returns 0
- No direct button styling in sections: `grep -rlc "buttonStyles" src/components/` returns 0
- Every external link carries the suffix: occurrences of `noopener noreferrer` and of
  `opens in a new tab` in `dist/index.html` are equal and both are 3

#### Manual Verification:

- At 200% browser text zoom, no button or link label is clipped anywhere on the page
- Tab order is unchanged and every link still shows the focus ring
- VoiceOver announces "Journal on Instagram, opens in a new tab" as one link name (and likewise
  for LinkedIn and GitHub)
- The bordered links are visually identical to before the migration

**Implementation Note**: Pause after this phase for manual confirmation before proceeding.

---

## Phase 3: Head Metadata and Hero Payload

### Overview

Make a pasted link render a real preview card, and stop phones downloading an image they never
display.

### Changes Required:

#### 1. Site URL

**File**: `astro.config.mjs`

**Intent**: `Astro.site` must be set before a canonical or absolute `og:url` can be built.

**Contract**: Add `site: 'https://www.chrobok.dev'` to the config object.

#### 2. OG image

**File**: `public/og-image.png` (new), `scripts/generate-og-image.sh` (new)

**Intent**: Produce the 1200×630 preview image from the existing `monk.webp` asset, with a
committed script so it can be regenerated rather than being an unreproducible binary.

**Contract**: The script uses ImageMagick (already installed) to composite
`src/assets/monk.webp` centred on a 1200×630 `#FAFAFA` canvas with the design system's black
border, writing `public/og-image.png`. Run once; commit both the script and the PNG. Note that the
card carries no name or role text — `og:title` and `og:description` supply those, and every
scraper renders them beside the image.

#### 3. Head metadata

**File**: `src/layouts/Layout.astro`, `src/layouts/layout.types.ts`

**Intent**: Add the tags `docs/nfr-inspection.md:57` checks for, and fix the viewport tag.

**Contract**: `viewport` becomes `width=device-width, initial-scale=1`. Add
`<link rel="canonical">` built from `Astro.site`; `og:type`, `og:url`, `og:title`,
`og:description`, `og:image` (absolute URL), `og:image:width`, `og:image:height`; and
`twitter:card` set to `summary_large_image`. `og:title`/`og:description` reuse the existing
`title` and `description` props rather than introducing new ones.

#### 4. Page title

**File**: `src/pages/index.astro`

**Intent**: A title carrying the name and role, since it is what a browser tab, a search result
and a preview card all display.

**Contract**: `title` becomes `"Karol Chrobok — Frontend Developer"`. The description prop is
rewritten to a recruiter-facing sentence naming the core stack.

#### 5. Hero image

**File**: `src/components/hero/Hero.astro`

**Intent**: Prevent the mobile fetch while keeping the intrinsic dimensions that protect CLS.

**Contract**: Wrap the image in `<picture>`. A `<source media="(min-width: 768px)">` carries
`monk.src` — so below that width nothing matches and the asset is never requested. The `<img>`
fallback uses an inline transparent-pixel data URI (zero network cost) and keeps `alt=""`,
`width={monk.width}`, `height={monk.height}` and the existing utility classes. `hidden md:block`
moves to the `<picture>` element.

### Success Criteria:

#### Automated Verification:

- Build passes: `yarn build`
- Lint passes: `yarn lint`
- OG tags present: `grep -c 'property="og:' dist/index.html` returns at least 7
- Canonical present: `grep -c 'rel="canonical"' dist/index.html` returns 1
- OG image exists and is correctly sized: `magick identify public/og-image.png` reports 1200x630
- Hero image is behind a media source: `grep -c 'media="(min-width: 768px)"' dist/index.html`
  returns 1

#### Manual Verification:

- DevTools network panel at a 375px viewport, hard reload: `monk.webp` is **not** requested
- At a 1280px viewport it is requested and renders as before, with no layout shift
- The preview card renders correctly in a link-preview validator (or by pasting into a private
  Slack or LinkedIn message)
- Page title reads correctly in the browser tab

**Implementation Note**: Pause after this phase for manual confirmation before proceeding.

---

## Phase 4: Zero-JS Build Surface

### Overview

Remove the React runtime and the dead components it exists for, so the zero-JavaScript property
is structural rather than incidental. This phase is self-contained and can be dropped without
affecting Phases 1-3 or 5.

### Changes Required:

#### 1. Dead components

**Files**: `src/ui/base/button/button.tsx`, `src/ui/base/button/button.types.ts`,
`src/ui/base/tag/tag.tsx`, `src/ui/base/tag/tag.types.ts`

**Intent**: Delete the two unused React components. Preserve the type that live code depends on.

**Contract**: Delete `button.tsx`, `button.types.ts` and `tag.tsx` outright. **Keep**
`tag.types.ts` but remove `TagProps` and its `import type { HTMLAttributes } from 'react'` —
`TagVariant` (line 7) must survive, as `Skills.astro:6` and `SologyRole.astro:4` import it.
`button.styles.ts` and `tag.styles.ts` both stay; they are consumed by live code.

#### 2. Dependencies

**File**: `package.json`

**Contract**: Remove `@astrojs/react`, `react`, `react-dom`, `@radix-ui/react-slot` and
`lucide-react` from `dependencies`; remove `@types/react`, `@types/react-dom` and
`eslint-plugin-react` from `devDependencies`. Keep `class-variance-authority`, `clsx` and
`tailwind-merge` — CVA and `cn()` are framework-agnostic and still in use. Run `yarn` to refresh
the lockfile.

#### 3. Build and tooling config

**Files**: `astro.config.mjs`, `tsconfig.json`, `eslint.config.js`, `components.json`

**Contract**: `astro.config.mjs` — drop the `react` import and its entry in `integrations`.
`tsconfig.json` — drop `jsx` and `jsxImportSource`. `eslint.config.js` — drop the `reactPlugin`
import (line 7), the `reactPlugin.configs.flat['jsx-runtime']` entry (line 40) and the
`'react/display-name': 'off'` rule (line 107). Delete `components.json` — shadcn/ui cannot
generate into a project without React.

#### 4. Documentation

**Files**: `CLAUDE.md`, `.claude/rules/react.md`, `.claude/rules/ui-shadcn.md`,
`.claude/rules/astro.md`

**Intent**: The stack description and two whole rule files become false the moment React is
removed; leaving them is worse than the dead code this phase deletes.

**Contract**: `CLAUDE.md` — the stack line drops React and shadcn/ui; the Architecture section
drops the React-islands and `"use client"` bullets; the `src/ui/base` folder convention drops the
`componentName.tsx` entry, leaving styles and types; the "yarn only" `npx shadcn` exception is
removed. Delete `.claude/rules/react.md` and `.claude/rules/ui-shadcn.md`. `.claude/rules/astro.md`
— line 11's "hydrate a React island" clause is rewritten to state the page ships no client
JavaScript.

### Success Criteria:

#### Automated Verification:

- Build passes: `yarn build`
- Lint passes: `yarn lint`
- No JavaScript is emitted: `ls dist/_astro/*.js` finds nothing
- No React remains in source: `grep -rc "react" src/` returns 0
- No React remains in the manifest: `grep -c "react" package.json` returns 0
- The surviving type is intact: `grep -c "TagVariant" src/ui/base/tag/tag.types.ts` returns 1

#### Manual Verification:

- The rendered page is visually identical to Phase 3's output
- The mobile `<details>` menu still opens, and its inline script still closes it on link click
- CLAUDE.md and `.claude/rules/` describe the stack as it now is

**Implementation Note**: Pause after this phase for manual confirmation before proceeding.

---

## Phase 5: Inspection Run

### Overview

Execute `docs/nfr-inspection.md` end to end against the `development` preview. This is the step
that establishes the slice's outcome; the preceding phases only make it likely to pass.

### Changes Required:

#### 1. Runbook execution

**File**: `docs/nfr-inspection.md` (executed, not edited)

**Intent**: Run every section — Prep, NFR-1 through NFR-4, and the Guardrail block — and record
the result where the reviewer can see it.

**Contract**: The browser matrix is resolved as one real check per engine: Chrome, Safari and
Firefox at current version, plus Safari on iOS on a real phone. Edge and the previous-version
line are covered by a written argument in the PR rather than a run — every feature this page uses
(`svh` units, `:focus-visible`, `<details>`, `<picture>`) is years past its baseline. The
completed checklist is pasted into the PR body.

#### 2. Runbook amendment

**File**: `docs/nfr-inspection.md`

**Intent**: Record the browser-matrix resolution so S-08's run does not re-litigate it, closing
the open question at `context/foundation/roadmap.md:219`.

**Contract**: The NFR-4 section states the one-real-check-per-engine rule and the reasoning for
the previous-version argument. No other section changes.

#### 3. Defect fixes

**Files**: as discovered

**Intent**: Anything the run surfaces is fixed inside this slice.

**Contract**: Each fix is a separate commit referencing the checklist item that found it. If a
defect is large enough to be its own slice, it is recorded in `change.md` and raised rather than
absorbed silently.

### Success Criteria:

#### Automated Verification:

- Build passes: `yarn build`
- Lint passes: `yarn lint`
- Static content is present without scripts: `dist/index.html` contains `<main`, all four section
  anchors, and every link `href`

#### Manual Verification:

- Lighthouse Mobile **and** Desktop: CLS = 0, LCP < 1s, Performance high
- axe DevTools: 0 critical and 0 serious violations
- Full keyboard tab-through: everything reachable, visible focus ring, logical order, no trap
- VoiceOver spot check: headings and links announce meaningful names
- JavaScript disabled: full content renders, nav anchors work, no blank regions
- Chrome, Safari, Firefox and iOS Safari: layout intact, fonts load, console clean
- View source: semantic HTML, no placeholder or TODO text, all links resolve
- The ticked checklist is in the PR body

---

## Testing Strategy

This project has no test runner, and adding one is out of scope. Verification is the build gate
plus the runbook.

### Automated (per phase):

- `yarn build` (`astro check && astro build`) — type errors fail the Vercel deploy
- `yarn lint`
- Targeted `grep`/`ls` assertions against `dist/`, listed per phase above. These are the closest
  thing to a regression test here: each one encodes a specific defect this plan fixes, so
  re-running them later catches a reintroduction.

### Manual Testing Steps:

1. After Phase 1, hard-reload with an empty cache and watch for text reflow.
2. After Phase 2, set browser text zoom to 200% and inspect every button and link for clipping.
3. After Phase 3, open DevTools at a 375px viewport and confirm `monk.webp` is not requested.
4. After Phase 4, confirm the page is unchanged and the mobile menu still works.
5. Phase 5 is the full runbook.

## Performance Considerations

The font restoration adds ~44 KB of woff2 to the critical path where the page previously loaded
none. This is the deliberate cost of the design identity, bounded three ways: latin subsets only
(the telugu subset alone would have been 139 KB), `font-display: optional` so a slow connection
degrades to fallback text rather than to a blocked render, and preload so the fetch starts with
the document.

Offsetting it: Phase 3 removes a 21 KB image request from every mobile visit, and Phase 4 removes
a 140 KB JavaScript chunk from the deploy. Net payload on mobile goes down.

## Migration Notes

No data, no persistence, no consumers. The only migration concern is documentation drift — Phase 4
changes what the project *is*, and CLAUDE.md plus `.claude/rules/` are treated as deliverables of
that phase rather than follow-up work.

## References

- Roadmap slice: `context/foundation/roadmap.md:210-250` (S-07, including both carried-in items)
- NFRs: `context/foundation/prd.md:220-233`
- Runbook and serve script: `docs/nfr-inspection.md`, `scripts/nfr-serve.sh` (from F-03)
- Release constraints: `.claude/rules/release-process.md` — PR targets `development`, never `main`
- Adjacent change: `context/changes/astro-constants-extraction/change.md` — owns the frontmatter
  data extraction; its open question about `Props` placement is answered by Phase 1

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Typography Restoration and Type Conventions

#### Automated

- [ ] 1.1 Build passes: `yarn build`
- [ ] 1.2 Lint passes: `yarn lint`
- [ ] 1.3 Fonts are bundled: 3 `@font-face` rules in `dist/_astro/*.css`
- [ ] 1.4 Font files are served: 3 woff2 files in `dist/fonts/`
- [ ] 1.5 No stale imports: no `@fontsource` references in `src/`
- [ ] 1.6 No interfaces remain in `src/`
- [ ] 1.7 Telugu subset absent from `dist/fonts/`

#### Manual

- [ ] 1.8 Headings render in Ramaraja, body in IBM Plex Mono on the preview
- [ ] 1.9 No synthetic-bold smearing at `h1` size
- [ ] 1.10 Empty-cache reload shows no visible reflow
- [ ] 1.11 Console free of font-preload warnings

### Phase 2: Link Primitive and Button Height

#### Automated

- [ ] 2.1 Build passes: `yarn build`
- [ ] 2.2 Lint passes: `yarn lint`
- [ ] 2.3 No `h-auto min-h-10` overrides remain in `src/`
- [ ] 2.4 No `buttonStyles` imports remain in `src/components/`
- [ ] 2.5 `noopener noreferrer` and `opens in a new tab` counts are equal and both 3

#### Manual

- [ ] 2.6 No clipped labels at 200% text zoom
- [ ] 2.7 Tab order unchanged, focus ring on every link
- [ ] 2.8 VoiceOver announces the external-link suffix as part of the link name
- [ ] 2.9 Bordered links visually identical to before migration

### Phase 3: Head Metadata and Hero Payload

#### Automated

- [ ] 3.1 Build passes: `yarn build`
- [ ] 3.2 Lint passes: `yarn lint`
- [ ] 3.3 At least 7 `og:` tags in `dist/index.html`
- [ ] 3.4 Canonical link present in `dist/index.html`
- [ ] 3.5 `public/og-image.png` is 1200x630
- [ ] 3.6 Hero image sits behind a `min-width: 768px` media source

#### Manual

- [ ] 3.7 `monk.webp` not requested at a 375px viewport
- [ ] 3.8 Requested and rendered at 1280px with no layout shift
- [ ] 3.9 Preview card renders correctly in a validator or private message
- [ ] 3.10 Page title reads correctly in the browser tab

### Phase 4: Zero-JS Build Surface

#### Automated

- [ ] 4.1 Build passes: `yarn build`
- [ ] 4.2 Lint passes: `yarn lint`
- [ ] 4.3 No `.js` files emitted to `dist/_astro/`
- [ ] 4.4 No `react` references in `src/`
- [ ] 4.5 No `react` references in `package.json`
- [ ] 4.6 `TagVariant` still exported from `tag.types.ts`

#### Manual

- [ ] 4.7 Rendered page visually identical to Phase 3 output
- [ ] 4.8 Mobile `<details>` menu opens and closes on link click
- [ ] 4.9 CLAUDE.md and `.claude/rules/` describe the stack as it now is

### Phase 5: Inspection Run

#### Automated

- [ ] 5.1 Build passes: `yarn build`
- [ ] 5.2 Lint passes: `yarn lint`
- [ ] 5.3 `dist/index.html` contains `<main`, all four anchors and every link href

#### Manual

- [ ] 5.4 Lighthouse Mobile and Desktop: CLS = 0, LCP < 1s, Performance high
- [ ] 5.5 axe DevTools: 0 critical, 0 serious
- [ ] 5.6 Full keyboard tab-through passes
- [ ] 5.7 VoiceOver spot check passes
- [ ] 5.8 JavaScript disabled: full content and working nav anchors
- [ ] 5.9 Chrome, Safari, Firefox and iOS Safari all render correctly with clean consoles
- [ ] 5.10 View source: semantic HTML, no placeholder text, all links resolve
- [ ] 5.11 Ticked checklist pasted into the PR body
