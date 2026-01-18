---
applyTo: "src/ui/base/**/*.tsx"
---

# Design System Instructions

This file contains general guidelines for working with the design system.

## Design System Foundation

All design system tokens (colors, typography, spacing, border radius) are configured in:
- **[tailwind.config.mjs](../../tailwind.config.mjs)** - Tailwind theme configuration with colors, fonts, spacing tokens
- **[src/styles/globals.css](../../src/styles/globals.css)** - Font imports and base typography styles

### Key Design Principles
- **Fonts**: Ramaraja (headings), IBM Plex Mono (body/accents)
- **Colors**: Custom tokens (page-bg, element-bg, hover-bg, text-primary, text-secondary, border-default)
- **Border radius**: 0px by default (square corners)
- **Spacing**: Custom tokens (section, element, card, container, grid)

## Coding Guidelines

### Using Tailwind Classes
- Use design system tokens: `bg-page-bg`, `text-text-primary`, `border-border-default`, etc.
- Font classes: `font-heading` for headings, `font-body` for body text
- Spacing classes: `p-card`, `gap-grid`, `space-y-element`, etc.
- Border radius is always 0 by default - no need to specify

## Design System Checklist

When creating or modifying components:
- [ ] Component follows folder structure (separate .tsx, .types.ts, .styles.ts)
- [ ] Uses design system color tokens (page-bg, element-bg, hover-bg, etc.)
- [ ] Uses design system fonts (font-heading or font-body)
- [ ] Uses design system spacing tokens when applicable
- [ ] Border radius is 0 (square corners)
- [ ] Implements forwardRef pattern
- [ ] Has displayName set
- [ ] Types exported as ComponentNameProps
- [ ] CVA styles in separate .styles.ts file
- [ ] Uses cn() utility for class combining
- [ ] Accessible (ARIA attributes, keyboard navigation)

## Reference

For detailed component implementation instructions, see:
- [Code Quality Guidelines](./02-codeQuality.instructions.md) 
