---
paths:
  - "src/**/*.{tsx,astro}"
  - "components.json"
---

# shadcn/ui

UI primitives come from shadcn/ui, configured in `components.json`: `default` style, `slate` base color,
CSS variables for theming.

## Using components

Installed components live in `src/ui/base` (the `ui` alias). Import through the alias:

```tsx
import { Button } from '@/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/base/card';
```

```tsx
<Button variant="outline">Click me</Button>
```

Check `src/ui/base` before assuming a component exists — most of the catalog is not installed.

## Installing more

Full catalog: https://ui.shadcn.com/r

```bash
npx shadcn@latest add accordion
```

This is the one sanctioned `npx` call in a yarn-only repo — it runs a generator that writes files rather
than installing project dependencies. Any package it pulls in afterwards goes through `yarn add`.
`npx shadcn-ui@latest` is deprecated; use `npx shadcn@latest`.

After generating a component, bring it in line with the house style before committing: own folder,
CVA moved into `componentName.styles.ts`, types in `componentName.types.ts`, design-system tokens
instead of the generated defaults.
