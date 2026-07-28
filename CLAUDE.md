# chrobok-dev-website

Personal site at https://www.chrobok.dev. Astro 5, Tailwind 3, TypeScript 5. **The page ships no client
JavaScript** — there is no UI framework and no islands. S-07 removed React once it was clear nothing on
the page needed it; keep it that way unless a requirement genuinely demands interactivity.

Detailed, file-scoped conventions live in `.claude/rules/` and load automatically when you touch matching
files (TypeScript, Astro, Tailwind, design system). Release rules load every session.

## CRITICAL: `main` is production

`main` is the Vercel Production Branch — anything merged there is live immediately. **Never open a PR
against `main`** while v1 is being built. Branch off `development`, PR into `development`. Full branch
model, gates and merge constraints: `.claude/rules/release-process.md`.

## CRITICAL: yarn only

`yarn` is the package manager. `preinstall` runs `only-allow yarn`, so npm is rejected outright.

- `yarn` / `yarn add <pkg>` / `yarn add -D <pkg>` / `yarn <script>`

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
- `src/components` — feature components (`.astro`)
- `src/ui/base` — design-system primitives
- `src/lib` — services and helpers; `src/middleware/index.ts` — Astro middleware
- `src/constants` — shared constant modules (`*.constants.ts`)
- `src/styles` — `globals.css`, `utils.ts` (`cn()`)
- `src/assets` — internal assets; `public/` — public assets

Some of these directories don't exist yet; create them at these paths rather than inventing new ones.
When the structure changes, update this section.

## Architecture

- Everything is an Astro component (`.astro`). There are no `client:` directives and no UI framework;
  the small amount of behaviour the page needs (the `<details>` mobile menu) is native HTML plus one
  inline script.
- Every `src/ui/base` component lives in its own folder:
  ```
  componentName/
    ComponentName.astro      # component, when it renders markup
    componentName.types.ts   # types, props exported as ComponentNameProps
    componentName.styles.ts  # CVA variants — ALWAYS a separate file
  ```
  A primitive that is only a style contract (`button`, `tag`) has no `.astro` file — it is the
  `.styles.ts`, plus a `.types.ts` only when there is a type worth exporting (`tag` exports
  `TagVariant`; `button` exports nothing, so it is a lone `.styles.ts`). These are consumed by
  feature components rather than rendered directly.
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

- Components `PascalCase`; utilities `camelCase`; constants `UPPER_SNAKE_CASE`
- Types in `*.types.ts`, `PascalCase`; component props as `ComponentNameProps`
- `.astro` props are imported under the alias Astro requires:
  `import type { LayoutProps as Props } from './layout.types';`

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
