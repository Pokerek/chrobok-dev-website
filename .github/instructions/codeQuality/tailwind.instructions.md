---
applyTo: "src/**/*.tsx, src/**/*.astro"
---

# Tailwind CSS

## General Guidelines

### Astro vs React Components
- Use Astro components (.astro) for static content and layout
- Implement React components (.tsx) only when interactivity is needed (hooks, state, event handlers)

## Basic Usage
- Use Tailwind utility classes for styling
- Use `cn()` function from `styles/utils` to combine classes
- Use class-variance-authority (CVA) for components with style variants
- **CVA styles MUST be in separate `componentName.styles.ts` file**

## Example: Using cn()

```typescript
import { cn } from 'styles/utils';

export const Component = ({ className }: { className?: string }) => {
  return <div className={cn('base-classes', className)}>Content</div>;
};
```

## Example: CVA Styles (Separate File Required)

**File: `componentName.styles.ts`**
```typescript
import { cva } from 'class-variance-authority';

export const componentStyles = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      primary: 'primary-classes',
    },
    size: {
      sm: 'small-classes',
      md: 'medium-classes',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});
```

**File: `componentName.tsx`**
```typescript
import type { VariantProps } from 'class-variance-authority';
import { cn } from 'styles/utils';
import { componentStyles } from './componentName.styles';

interface ComponentProps extends VariantProps<typeof componentStyles> {
  className?: string;
}

export const Component = ({ variant, size, className }: ComponentProps) => {
  return (
    <div className={cn(componentStyles({ variant, size }), className)}>
      Content
    </div>
  );
};
```

## Responsive Design
- Use responsive variants (sm:, md:, lg:, xl:, 2xl:) for adaptive designs
- Mobile-first approach: base styles for mobile, then add breakpoints
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs

## Interactive Elements
- Leverage state variants (hover:, focus-visible:, active:, disabled:) for interactive elements
- Use group and peer utilities for parent-based styling
- Implement dark mode with the dark: variant when needed

## Advanced Techniques
- Use the @layer directive to organize styles into components, utilities, and base layers
- Implement the Tailwind configuration file for customizing theme, plugins, and variants
- Leverage the theme() function in CSS for accessing Tailwind theme values

## Colors and Custom Values
- Use CSS variables from `tailwind.config.mjs` for colors
- Use custom spacing/sizing values from `tailwind.config.mjs`
- Do not use inline styles - always use Tailwind classes

## Complex Styles
- For complex styles, use CVA in separate `.styles.ts` file instead of long class lists
- Use `className` prop to override default styles

## Accessibility

### ARIA Best Practices
- Use ARIA landmarks to identify regions of the page (main, navigation, search, etc.)
- Apply appropriate ARIA roles to custom interface elements that lack semantic HTML equivalents
- Set aria-expanded and aria-controls for expandable content like accordions and dropdowns
- Use aria-live regions with appropriate politeness settings for dynamic content updates
- Implement aria-hidden to hide decorative or duplicative content from screen readers
- Apply aria-label or aria-labelledby for elements without visible text labels
- Use aria-describedby to associate descriptive text with form inputs or complex elements
- Implement aria-current for indicating the current item in a set, navigation, or process
- Avoid redundant ARIA that duplicates the semantics of native HTML elements


