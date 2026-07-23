# AI Instructions

This file is an index. Authoritative, modular instructions live under `./instructions/` to prevent divergence.

## TODO: migrate this instruction set to Claude Code

**This layout (`.github/copilot-instructions.md` + `.github/instructions/*.instructions.md` with
`applyTo:` frontmatter) is GitHub Copilot's convention. The project now uses Claude Code, which does
not read these files automatically** — there is no `CLAUDE.md` or `AGENTS.md` at the repo root, so
the content below is currently invisible to the agent actually doing the work.

The content itself is still correct and worth keeping; only the delivery mechanism is wrong. Migrate
it — e.g. a root `CLAUDE.md`/`AGENTS.md` that owns or imports these modules — and then decide whether
the Copilot-shaped files stay as a mirror or are removed. Until that happens, treat this set as
documentation a human must point the agent at, not as instructions that load on their own.

## Instruction Modules

- **[Overview](./instructions/01-overview.instructions.md)** - High-level map for AI agents. Read this first, then jump to specialized files.
- **[Code Quality](./instructions/02-codeQuality.instructions.md)** - TypeScript, Tailwind, Astro, React, UI components
- **[Design System](./instructions/03-designSystem.instructions.md)** - Design system tokens and guidelines
- **[Release Process](./instructions/04-releaseProcess.instructions.md)** - Branch model, which branch publishes, PR targets, release gates

For complete details, always refer to the specialized instruction files linked above.
