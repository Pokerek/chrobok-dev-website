---
paths:
  - "src/**/*.{ts,tsx}"
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
