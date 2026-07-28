---
paths:
  - "src/ui/base/**/*"
  - "src/styles/globals.css"
  - "tailwind.config.mjs"
---

# Design System

Tokens are configured in `tailwind.config.mjs` (colors, fonts, spacing) and `src/styles/globals.css`
(`@font-face` declarations, base typography). Read those before inventing a value.

## Principles

- **Fonts**: Ramaraja 400 for headings (`font-heading`), IBM Plex Mono 400/500 for body/accents
  (`font-body`). This pair is the frozen v1 typography contract — do not swap it while building sections.
  Ramaraja is a single-weight display serif: never put `font-bold` (or any weight utility) on
  `font-heading`, or the browser renders synthetic bold.
- **Colors**: token names only — `page-bg`, `element-bg`, `hover-bg`, `text-primary`, `text-secondary`,
  `border-default`, `focus-ring` (used as `bg-page-bg`, `text-text-primary`, `border-border-default`, …).
- **Border radius**: **every** named radius resolves to `0` — `rounded`, `rounded-md`, `rounded-lg`,
  `rounded-full` are all square. Corners are never rounded in v1; don't reintroduce a rounded value.
- **Spacing**: token scale — `p-card`, `gap-grid`, `space-y-element`, `space-y-tight`/`gap-tight`,
  `section`, `container`. `tight` (0.5rem) is the sub-element step: rhythm *inside* a block (heading and
  its meta line, list items, chip rows), where `element` (1.5rem) is too wide.

## Layout skeleton (F-01 contract)

- **Container**: centered, `2rem` horizontal padding, max width `1400px` at `2xl` (Tailwind `container`).
- **Grid**: the page skeleton is section-level, not a global two-column frame. Use the `Section` primitive
  at `src/ui/base/section/Section.astro`: a semantic `<section>` with a scroll anchor plus the container.
  Fill the `label` slot to get the `label | content` two-column layout (`md:grid-cols-section`), which
  **collapses to a single column below `md`**; omit the `label` slot for a full-width section.
- Sections own their own heading level and ARIA — pass headings as slot content, don't let the primitive
  impose them.

## Focus & motion

- **Focus ring**: keyboard focus is handled globally by the `:focus-visible` rule in `globals.css`
  (`ring-2 ring-offset-2`). The ring colour is the `focus-ring` token and the offset is `page-bg`, both set
  as ring defaults in `tailwind.config.mjs`. Don't add `ring-<color>` at call sites; don't remove the ring.
- **Motion**: `transition-colors` on hover/focus only. No fade-in, slide, scale, scroll-reveal or parallax
  in v1 — this protects the "no layout shift after first paint" NFR.

## No hard-coded values

Colours, spacing, radius and ring all come from tokens — never a raw hex, px, or `border-black`. Any
snippet copied in from outside (a component gallery, a blog post, a generator) must be re-pointed at the
named tokens above before it compiles against anything real.

## Checklist for a new or modified `src/ui/base` component

- [ ] Folder structure: `ComponentName.astro` (when it renders markup) plus `.types.ts` and `.styles.ts`.
      A primitive that is only a style contract (`button`, `tag`) needs no `.astro` file.
- [ ] CVA variants in the `.styles.ts` file; `class:list` at the call site, `cn()` only where
      tailwind-merge's conflict resolution is needed
- [ ] Design-system color, font, and spacing tokens — no raw values
- [ ] Square corners (radius 0)
- [ ] No `client:` directive and no framework import — this page ships no client JavaScript
- [ ] Props declared with `type` in `.types.ts`, exported as `ComponentNameProps`
- [ ] Accessible: semantic element or correct ARIA, keyboard navigable
