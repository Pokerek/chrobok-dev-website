---
applyTo: "src/**/*.ts, src/**/*.tsx"
---

# Code Quality

This file references specialized code quality files. For complete details, refer to:
- **[TypeScript](./codeQuality/typescript.instructions.md)** - Type reuse, utility types, imports
- **[Tailwind](./codeQuality/tailwind.instructions.md)** - Styling with Tailwind CSS and CVA
- **[Astro](./codeQuality/astro.instructions.md)** - Astro-specific patterns
- **[React](./codeQuality/react.instructions.md)** - React hooks and patterns
- **[UI Components](./codeQuality/ui-shadcn.instructions.md)** - Shadcn/ui usage

## Naming Conventions

### Files and Folders
- Components: `PascalCase` (e.g., `Button.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useQueryParams.ts`)
- Utilities: `camelCase` (e.g., `formatDate.ts`)
- Types: `PascalCase` with `Types` suffix or in `*.types.ts` file
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_URL.ts`)
- Unit tests: `*.test.ts` or `*.test.tsx` next to the file being tested (e.g., `componentName.test.tsx`, `functionName.test.ts`)

### Components
- Export as `export const ComponentName = () => { ... }`
- For compound components: `ComponentName.SubComponentName`

### Functions
- `camelCase` for functions
- `PascalCase` for React components

## Best Practices

### Accessibility
- Use semantic HTML
- Add `aria-*` attributes when needed
- Test with screen readers

### Security
- **NEVER** commit secrets to repo
- Use environment variables for config
- Validate user data with Zod

## Linting
- Linters run automatically - no need to manually check
- ESLint and Prettier configured in `eslint.config.mjs`


