---
doc: design-notes
project: "chrobok.dev"
version: 1
status: living
created: 2026-07-20
source_of_record: tailwind.config.mjs + src/styles/globals.css (code wins)
consumed_by: [10x-shape, 10x-prd, implementation]
---

# Design Notes — chrobok.dev

Input document for `/10x-shape`. Companion to [`author-profile.md`](./author-profile.md):
that file says **who** the site is for and what it must prove, this one says **how it
should look** and what is already built.

The visual direction was decided long before this repo's flow started — it lives in a
Notion page (Jan 2026) and is already partially implemented in the Tailwind theme. This
document consolidates both so the shape session doesn't re-open a settled decision.

**Update convention:** edit in place. `tailwind.config.mjs` and `globals.css` are the
source of record for token *values*; this file records intent, origin and open risks.

## Direction

**Minimalist, near-brutalist portfolio.** Off-white page, black hairline borders, hard
square corners, monospace body, no decorative animation. The design carries the
positioning from the author profile — *"I don't generate code, I craft it"* — by being
restrained and precise rather than by decorating itself.

- **Visual reference:** https://www.gracesportfolio.com/ (supplied by the author)
- **Superseded (2024, do not use):** an earlier note proposed *Playwrite FR Moderne* as
  the display font and Firebase for content storage. Both are out: the font conflicts with
  the Ramaraja/IBM Plex Mono pairing below, and Firebase has no role in a static v1.

## Tokens

Origin: Notion "🌐 Strona chrobok.dev" (2026-01). Already implemented in
`tailwind.config.mjs` / `globals.css` unless marked otherwise.

### Colour

| Token | Value | Use |
|---|---|---|
| `page-bg` | `#FAFAFA` | Page background (applied on `<body>`) |
| `element-bg` | `#F0F0F0` | Cards, buttons, tags |
| `text-primary` | `#000000` | Body and headings |
| `text-secondary` | `#333333` | Supporting copy |
| `border-default` | `#000000` | All borders |
| `hover-bg` | `#E8E8E8` | Hover state on interactive surfaces |

No dark mode in scope. `darkMode: ['class']` is Tailwind's default scaffold, not a
requirement — nothing implements it.

### Typography

- **Headings** — Ramaraja 700, `letter-spacing: -0.02em`, `line-height: 1.2`.
  H1 `2.5rem` / 40px, H2 `1.75rem` / 28px. **H3–H6 are undefined** — they currently
  inherit H2's declaration block with no size, so they render at browser default. Define
  a scale in shape if the content needs deeper nesting; otherwise design around H1/H2 only.
- **Body** — IBM Plex Mono 400, 16px, `line-height: 1.7`, `letter-spacing: 0`.
- **Accents** (buttons, tags) — IBM Plex Mono 500, 14.4px / `0.9rem`,
  `letter-spacing: 0.02em`. **The accent letter-spacing is not implemented** — the button
  uses `font-medium` but no tracking utility.

Only the used weights are imported (`ramaraja/700`, `ibm-plex-mono/400`, `/500`). Keep it
that way — every extra weight is a font file on a page whose whole argument is craft.

### Layout & spacing

| Token | Value | Intent |
|---|---|---|
| `container` | `2rem` / 32px | Container padding |
| `section` | `2rem` / 32px | Vertical rhythm between sections |
| `element` | `1.5rem` / 24px | Between elements inside a section |
| `card` | `1.5rem` / 24px | Card padding |
| `gap-grid` | `3rem` / 48px | Gap between the two main columns |

The Notion source specifies a **2-column grid** as the primary layout. Nothing implements
it yet — the placeholder page is a centred flex box. Treat the 2-column grid as the
desktop default and decide its mobile collapse in shape.

### Borders & shape

`1px solid #000000`, **`border-radius: 0` everywhere**. This is the single most
identity-defining rule in the system — see the risk below.

## What is already built

- `src/layouts/Layout.astro` — html shell, `bg-page-bg` on `<body>`, imports `globals.css`
- `src/components/footer/Footer.astro` — top border + copyright line
- `src/ui/base/button/` — CVA button, three variants (`default`, `outline`, `link`),
  four sizes, `forwardRef`, types and styles split into their own files
- `src/pages/index.astro` — the "Work in progress…" placeholder the whole project exists
  to delete
- Component conventions: [`.claude/rules/design-system.md`](../../.claude/rules/design-system.md) —
  path-scoped to `src/ui/base/**`, so it loads automatically when a primitive is edited

## Risks to settle before implementation

1. **shadcn/ui fights this theme.** `components.json` is configured with
   `baseColor: "slate"` and `cssVariables: true`, so anything pulled in via the shadcn CLI
   emits `bg-background` / `text-foreground` / `rounded-md` — CSS variables that **do not
   exist** in `globals.css`, and a radius that is not zero. Every shadcn component must be
   rewritten onto these tokens on the way in, or the CLI should not be used at all. The
   existing button was hand-written correctly and is the pattern to follow.
2. **`borderRadius: { DEFAULT: '0px' }` only overrides `rounded`.** `rounded-md`,
   `rounded-lg`, `rounded-full` still resolve to stock Tailwind values. Either flatten the
   whole `borderRadius` scale to `0px` or lint against those utilities — otherwise a single
   copied snippet silently breaks the sharp-corner identity.
3. **Hard-coded values are already creeping in.** `Footer.astro` uses `border-black`
   instead of `border-border-default`, and `index.astro` uses `text-2xl` on an H1 that the
   type scale already sizes. Fix on the first content pass.
4. **`gap-grid` is defined under `theme.extend.gap`,** which only produces `gap-*`
   utilities — it is unavailable as `space-x-grid` or as padding. Fine as long as the
   2-column layout uses `gap`.
5. **No focus-visible ring colour is defined.** The button declares
   `focus-visible:ring-2` with no token, so it falls back to Tailwind's default blue —
   the only non-palette colour that would appear on the site. Pick a token (black ring,
   offset in `page-bg`) before shipping.

## Open questions for `/10x-shape`

- Does the 2-column grid hold as the page skeleton, or is it a section-level pattern only?
- What is the mobile behaviour — single column stack, and at which breakpoint?
- Are images used at all (the placeholder ships `/images/monk.webp`), and if so, do they
  get the same black hairline border treatment?
- Ramaraja is a light, calligraphic serif at 700 — does it read as *craftsmanship* or as
  *decorative* against a monospace body? Worth one visual check before the copy pass, since
  it sets the whole tone. Reverting is cheap now and expensive later.
- Is any motion allowed at all (the theme loads `tailwindcss-animate`), or is
  `transition-colors` on hover the hard ceiling?

## Sources

- Notion: "🌐 Strona chrobok.dev" (2026-01) — design system, the authoritative source
- Notion: "👨‍💻 chrobok.dev - page" (2024-06) — earlier, superseded direction
- Second brain: `pokerek_mind/projekty/chrobok-dev.md`
- Tracking issue: Pokerek/website-astro#13
