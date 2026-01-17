---
applyTo: "src/**/*.ts, src/**/*.tsx"
---

# TypeScript

## Type Reuse
- **ALWAYS** check existing types before creating new ones
- Reuse types from related domains when possible
- Use utility types (`Pick`, `Omit`, `Partial`, `Record`, `Exclude`, etc.) instead of duplicating types

## Utility Types Usage
- Use `Omit<T, K>` to exclude properties from a type
- Use `Pick<T, K>` to select specific properties from a type
- Use `Partial<T>` to make all properties optional
- Use `Record<K, V>` to create an object type with specific keys and values
- Use `Exclude<T, U>` to exclude types from a union
- Use `Extract<T, U>` to extract types from a union

## Imports
- **ALWAYS** use `type` imports for types: `import type { ... }`

## Unused Variables
- Prefix unused variables with `_`: `const _unused = ...`

## Types File Organization
- Export types in separate `.types.ts` files
- Use `PascalCase` with `Types` suffix or in `*.types.ts` file
- Export component props as `ComponentNameProps`


