---
paths:
  - "src/**/*.{ts,tsx}"
  - "src/**/*.astro"
---

# TypeScript

## Type reuse

- **ALWAYS** check for an existing type before creating a new one; reuse types from related domains.
- Prefer utility types over duplicating shapes: `Omit<T, K>`, `Pick<T, K>`, `Partial<T>`, `Record<K, V>`,
  `Exclude<T, U>`, `Extract<T, U>`.

## Imports

- **ALWAYS** use type-only imports for types: `import type { ... } from '...'`.
- Import order is enforced by `eslint-plugin-simple-import-sort` — let `--fix` sort it.

## Conventions

- Prefix intentionally unused variables with `_`: `const _unused = ...`.
- Types live in a sibling `.types.ts` file, `PascalCase`; component props exported as `ComponentNameProps`.
- Declare types with `type`, never `interface` — including `.astro` component props. Compose with
  intersections (`A & B`) where you would have reached for `extends`.
- `.astro` props are no exception: the shape goes in the sibling `.types.ts` and the component imports it
  under the name Astro requires — `import type { LayoutProps as Props } from './layout.types';`. Astro
  resolves the local type named `Props`, so alias on import rather than renaming the exported type.
