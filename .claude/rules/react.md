---
paths:
  - "src/**/*.tsx"
---

# React

- Functional components with hooks; no class components.
- Never use the `"use client"` directive — React runs as Astro islands, this is not Next.js.
- Reach for a React component only when the UI needs state, hooks, or event handlers; otherwise use
  `.astro`.
- Extract logic into custom hooks placed next to the component that uses them.
- `React.memo()` for expensive components that re-render often with the same props.
- `React.lazy()` + `Suspense` for code-splitting.
- `useCallback` for handlers passed to children; `useMemo` for expensive calculations.
- `useId()` for unique IDs in accessibility attributes.
- `useTransition` for non-urgent updates; `useOptimistic` for optimistic form UI.
