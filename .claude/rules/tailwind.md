---
paths:
  - "src/**/*.{tsx,astro}"
  - "src/styles/**/*"
  - "tailwind.config.mjs"
---

# Tailwind CSS

## Basics

- Style with Tailwind utility classes. **Never use inline styles.**
- Combine classes with `cn()` from `styles/utils`.
- Use class-variance-authority (CVA) for components with style variants.
- **CVA definitions MUST live in a separate `componentName.styles.ts` file** — not inline in the component.
- Take colors and spacing from the tokens in `tailwind.config.mjs`, never hard-coded hex values.

## Pattern

`componentName.styles.ts`:

```typescript
import { cva } from 'class-variance-authority';

export const componentStyles = cva('base-classes', {
  variants: {
    variant: { default: 'default-classes', primary: 'primary-classes' },
    size: { sm: 'small-classes', md: 'medium-classes' },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});
```

`componentName.types.ts` — a `type`, never an `interface` (see `typescript.md`):

```typescript
import type { VariantProps } from 'class-variance-authority';

import type { componentStyles } from './componentName.styles';

export type ComponentNameProps = VariantProps<typeof componentStyles> & {
  class?: string;
};
```

`ComponentName.astro` — the props type is imported under the alias Astro requires:

```astro
---
import { componentStyles } from './componentName.styles';
import type { ComponentNameProps as Props } from './componentName.types';

const { variant, size, class: className } = Astro.props;
---

<div class:list={[componentStyles({ variant, size }), className]}>
  <slot />
</div>
```

Use `class:list` for the common case — it merges the CVA output with the caller's classes without
`cn()`. Reach for `cn()` only where tailwind-merge's conflict resolution is actually needed, such as
one CVA variant composing another (`src/ui/base/link/link.styles.ts`).

Expose `class` so callers can override; for anything complex, add a CVA variant rather than a long
inline class list.

## Layout and state

- Mobile-first: base styles for mobile, then `sm:` `md:` `lg:` `xl:` `2xl:`.
- Arbitrary values (`w-[123px]`) only for genuine one-offs.
- State variants: `hover:`, `focus-visible:`, `active:`, `disabled:`; `group`/`peer` for parent-based
  styling; `dark:` when dark mode is needed.
- `@layer` to organize base/components/utilities; `theme()` to read theme values from CSS.

## ARIA

- ARIA landmarks for page regions (main, navigation, search).
- Roles only on custom widgets that lack a semantic HTML equivalent — never duplicate native semantics.
- `aria-expanded` + `aria-controls` for accordions and dropdowns.
- `aria-live` (with an appropriate politeness) for dynamic content.
- `aria-hidden` for decorative or duplicated content.
- `aria-label` / `aria-labelledby` when there is no visible label; `aria-describedby` for helper text.
- `aria-current` for the active item in a set or navigation.
