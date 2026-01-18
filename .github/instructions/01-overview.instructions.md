---
applyTo: "**/*"
---

# Overview Instructions

Purpose: High-level map for AI agents working in this repo. Read this first, then jump to specialized files:
- **[Code Quality](./02-codeQuality.instructions.md)** - TypeScript, Tailwind, Astro, React, UI components
- **[Design System](./03-designSystem.instructions.md)** - Design system tokens and guidelines

## Stack Snapshot
- Astro 5.15.8
- TypeScript 5.5.3
- React 18.3.1
- Tailwind 3.4.6
- Shadcn/ui with class-variance-authority (CVA)
- **Package Manager: yarn (required)** - npm is not allowed

## CRITICAL: CODE LANGUAGE
- **ALWAYS generate code in English** - all code, comments, variable names, function names, and documentation should be in English

## Package Manager

**ALWAYS use yarn as the package manager for this project.**

- Installing dependencies: `yarn install` or `yarn`
- Adding packages: `yarn add <package-name>`
- Adding dev dependencies: `yarn add -D <package-name>`
- Running scripts: `yarn <script-name>`
- **DO NOT use npm** - the project is configured to reject npm usage

## Project Structure

When introducing changes to the project, always follow the directory structure below:

- `./src` - source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages
- `./src/pages/api` - API endpoints (Server Endpoints)
- `./src/middleware/index.ts` - Astro middleware
- `./src/components` - Components written in Astro (.astro) for static content and React (.tsx) for interactive elements
- `./src/ui/base` - Shadcn/ui components
- `./src/lib` - Services and helpers
- `./src/assets` - Static internal assets
- `./public` - Public assets

When modifying the directory structure, always update this section.

## Architecture

### Astro vs React Components
- Use Astro components (.astro) for static content and layout
- Implement React components (.tsx) only when interactivity is needed (hooks, state, event handlers)
- Never use "use client" directive - we use React with Astro, not Next.js

### Component Structure
- Each component in `src/ui/base/` has its own folder: `componentName/`
- Folder structure:
  ```
  componentName/
    - componentName.tsx          # Main component
    - componentName.types.ts     # TypeScript types
    - componentName.styles.ts    # CVA styles (ALWAYS separate file)
    - componentName.test.tsx     # Tests (optional)
  ```
- **ALWAYS** use a separate `.styles.ts` file for CVA variants
- Always use a separate `.types.ts` file for types
- Export types as `ComponentNameProps`
- Use `VariantProps<typeof componentStyles>` for style-related props
- For compound components: `ComponentName.SubComponentName`

## Coding Practices

### Guidelines for Clean Code
- Use feedback from linters to improve the code when making changes
- Prioritize error handling and edge cases
- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions to avoid deeply nested if statements
- Place the happy path last in the function for improved readability
- Avoid unnecessary else statements; use if-return pattern instead
- Use guard clauses to handle preconditions and invalid states early
- Implement proper error logging and user-friendly error messages
- Consider using custom error types or error factories for consistent error handling

## When Adding Anything
1. Check existing types and utilities - reuse when possible
2. Use utility types (Pick, Omit, Partial, etc.) instead of creating new types
3. Add validation with Zod schemas for API routes and forms
4. Linters run automatically - no need to manually check

Continue in the code quality files for detailed patterns and examples.
