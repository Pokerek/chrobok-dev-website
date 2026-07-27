# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Prefer good names over comments

- **Context**: All source in `src/` — any TypeScript, React or Astro file, components, primitives and helpers alike.
- **Problem**: Comments restate what the code already says, then drift out of sync when the code changes — a stale comment misleads worse than no comment at all.
- **Rule**: Don't write explanatory comments by default — rely on good names. Comment only where the code cannot carry the reason: a non-obvious constraint, a workaround, or a decision that would otherwise look like a mistake.
- **Applies to**: implement, impl-review
