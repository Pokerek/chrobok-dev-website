---
paths:
  - "src/ui/base/**/*"
  - "src/styles/globals.css"
  - "tailwind.config.mjs"
---

# Design System

Tokens are configured in `tailwind.config.mjs` (colors, fonts, spacing) and `src/styles/globals.css`
(font imports, base typography). Read those before inventing a value.

## Principles

- **Fonts**: Ramaraja for headings (`font-heading`), IBM Plex Mono for body/accents (`font-body`).
- **Colors**: token names only — `page-bg`, `element-bg`, `hover-bg`, `text-primary`, `text-secondary`,
  `border-default` (used as `bg-page-bg`, `text-text-primary`, `border-border-default`, …).
- **Border radius**: 0 by default — square corners, no need to specify.
- **Spacing**: token scale — `p-card`, `gap-grid`, `space-y-element`, `section`, `container`.

## Checklist for a new or modified `src/ui/base` component

- [ ] Folder structure: separate `.tsx`, `.types.ts`, `.styles.ts`
- [ ] CVA variants in the `.styles.ts` file, combined via `cn()`
- [ ] Design-system color, font, and spacing tokens — no raw values
- [ ] Square corners (radius 0)
- [ ] `forwardRef` pattern, with `displayName` set
- [ ] Props exported as `ComponentNameProps`
- [ ] Accessible: semantic element or correct ARIA, keyboard navigable
