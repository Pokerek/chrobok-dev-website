---
applyTo: "**/*"
---

# Release Process Instructions

Purpose: state which branch publishes to production, where work lands, and what the v1 release
event is. Read this before opening any pull request.

## CRITICAL: `main` is production

**`main` is the Vercel Production Branch. Anything merged into `main` is live on
https://www.chrobok.dev immediately.**

Until the v1 cutover, `main` serves only the "Work in progress…" placeholder. Do **not** target a
pull request at `main` while v1 is being built — doing so publishes a partial page to the live site.

Note that GitHub's default branch is `development`, not `main`. These are two independent settings:
GitHub's default branch decides where new PRs are pointed by default; Vercel's Production Branch
decides what gets published. Never reason about one from the other.

## Branch model

| Branch | Role | Deploys to |
| --- | --- | --- |
| `main` | Production | https://www.chrobok.dev |
| `development` | Integration — GitHub default branch | Vercel branch **Preview** (stable per-branch URL) |
| `(feat\|fix\|chore\|docs)/…` | Feature branches | Vercel per-commit Preview |

Flow:

1. Branch off `development`. The branch name must satisfy `validate-branch-name` (enforced by
   `.husky/pre-commit`): `main`, `master`, `development`, or `(feat|fix|chore|docs)/…`.
2. Open the PR against **`development`**. Review it on the branch preview URL.
3. Merge into `development`. This rebuilds the `development` preview and leaves production
   untouched.
4. The single `development` → `main` PR is the v1 release event (roadmap S-08,
   `v1-production-cutover`). It happens once, after every slice has landed.

## Constraints discovered in research

- **The cutover PR must be squash or rebase.** `main` has `required_linear_history: true`, so
  GitHub rejects a merge commit. Choose "Squash and merge" or "Rebase and merge" on the
  `development` → `main` PR.
- **`main` requires a PR.** Force-push and branch deletion are blocked; direct pushes are rejected.
  `required_approving_review_count` is 0, so a solo approval is not needed — but the PR is.
- **`yarn build` runs `astro check` before `astro build`.** A type error therefore fails the Vercel
  deploy instead of shipping. This is a real safety net; do not "simplify" the `build` script by
  dropping `astro check`.
- **`development` is intentionally unprotected.** Required status checks are attached there by
  roadmap item F-03 (`inspection-gate`). Declaring required checks before the workflows exist would
  block every PR indefinitely, because GitHub waits forever on a check name that never reports.
- **There is no `.github/workflows/` directory and no `vercel.json`.** Vercel infers the framework
  from `astro` and the package manager from `yarn.lock`. Server-side PR gating is F-03's job, not
  something to add ad hoc.

## Local gates

`.husky/pre-commit` runs `validate-branch-name` → `tsc --noEmit` → `lint-staged`.
`.husky/commit-msg` runs commitlint, so commit messages must be Conventional Commits.

These are local-only and bypassable with `--no-verify`. Do not bypass them.
