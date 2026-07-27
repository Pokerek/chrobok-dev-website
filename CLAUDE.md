# chrobok-dev-website

Personal site at https://www.chrobok.dev. Astro 5 + React 18 islands, Tailwind 3, shadcn/ui, TypeScript 5.

Detailed, file-scoped conventions live in `.claude/rules/` and load automatically when you touch matching
files (TypeScript, React, Astro, Tailwind, design system, shadcn/ui). Release rules load every session.

## CRITICAL: `main` is production

`main` is the Vercel Production Branch — anything merged there is live immediately. **Never open a PR
against `main`** while v1 is being built. Branch off `development`, PR into `development`. Full branch
model, gates and merge constraints: `.claude/rules/release-process.md`.

## CRITICAL: yarn only

`yarn` is the package manager. `preinstall` runs `only-allow yarn`, so npm is rejected outright.

- `yarn` / `yarn add <pkg>` / `yarn add -D <pkg>` / `yarn <script>`
- Exception: `npx shadcn@latest add <component>` — a one-off generator, not a dependency install.

## CRITICAL: code is written in English

All code, comments, identifiers, and documentation in English, regardless of the conversation language.

## Commands

| Command      | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `yarn dev`   | Dev server                                                     |
| `yarn build` | `astro check && astro build` — never drop `astro check` from it |
| `yarn lint`  | ESLint (config: `eslint.config.js`)                            |
| `yarn format`| Prettier                                                       |

Linting and formatting also run automatically on commit via lint-staged — don't run them manually just to
check your work.

## Project structure

- `src/pages` — Astro pages; `src/pages/api` — Server Endpoints
- `src/layouts` — Astro layouts
- `src/components` — feature components (`.astro` static, `.tsx` interactive)
- `src/ui/base` — shadcn/ui + design-system primitives
- `src/lib` — services and helpers; `src/middleware/index.ts` — Astro middleware
- `src/styles` — `globals.css`, `utils.ts` (`cn()`)
- `src/assets` — internal assets; `public/` — public assets

Some of these directories don't exist yet; create them at these paths rather than inventing new ones.
When the structure changes, update this section.

## Architecture

- Astro components (`.astro`) for static content and layout. React (`.tsx`) **only** where interactivity
  is needed (state, hooks, event handlers).
- Never use the `"use client"` directive — this is Astro, not Next.js.
- Every `src/ui/base` component lives in its own folder:
  ```
  componentName/
    componentName.tsx        # component
    componentName.types.ts   # types, props exported as ComponentNameProps
    componentName.styles.ts  # CVA variants — ALWAYS a separate file
    componentName.test.tsx   # tests (optional)
  ```
- Compound components are namespaced: `ComponentName.SubComponentName`.
- **Feature components keep data and types out of the `.astro` file.** Module-scope constants go in a
  sibling `componentName.constants.ts`, types in `componentName.types.ts`. The `.astro` frontmatter
  should import and render — not declare the content it renders.
  ```
  skills/
    Skills.astro             # markup, imports its data
    skills.constants.ts      # SKILL_CATEGORIES, TIER_LEGEND, …
    skills.types.ts          # Tier, SkillCategory, …
  ```

## Naming

- Components `PascalCase`; hooks `useCamelCase`; utilities `camelCase`; constants `UPPER_SNAKE_CASE`
- Types in `*.types.ts`, `PascalCase`; component props as `ComponentNameProps`
- Tests `*.test.ts(x)` next to the file under test
- Components exported as `export const ComponentName = () => { ... }`

## Before adding anything

1. Check for an existing type or utility and reuse it; prefer utility types (`Pick`, `Omit`, `Partial`)
   over new declarations.
2. Validate API-route and form input with Zod.
3. Handle errors and edge cases first — guard clauses, early returns, happy path last, no unnecessary
   `else`.
4. Never commit secrets; config goes through `import.meta.env`.
5. Semantic HTML first, `aria-*` only where semantics are missing.

<!-- Keep this file under ~200 lines; put file-scoped detail in .claude/rules/ with a `paths:`
     frontmatter instead. -->
