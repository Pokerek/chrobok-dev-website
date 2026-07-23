# Release Process

Which branch publishes, where work lands, what the v1 release event is. Read before opening any PR.

## `main` is production

`main` is the Vercel Production Branch. Anything merged into `main` is live on https://www.chrobok.dev
immediately. Until the v1 cutover, `main` serves only the "Work in progress…" placeholder — do **not**
target a PR at `main`, that publishes a partial page to the live site.

GitHub's default branch is `development`, not `main`. These are independent settings: GitHub's default
branch decides where new PRs point; Vercel's Production Branch decides what gets published. Never reason
about one from the other.

## Branch model

| Branch                       | Role                                | Deploys to                                        |
| ---------------------------- | ----------------------------------- | ------------------------------------------------- |
| `main`                       | Production                          | https://www.chrobok.dev                           |
| `development`                | Integration — GitHub default branch | Vercel branch **Preview** (stable per-branch URL) |
| `(feat\|fix\|chore\|docs)/…` | Feature branches                    | Vercel per-commit Preview                         |

1. Branch off `development`. The name must satisfy `validate-branch-name` (enforced by
   `.husky/pre-commit`): `main`, `master`, `development`, or `(feat|fix|chore|docs)/…`.
2. Open the PR against **`development`**. Review it on the branch preview URL.
3. Merge into `development` — rebuilds the `development` preview, leaves production untouched.
4. The single `development` → `main` PR is the v1 release event (roadmap S-08,
   `v1-production-cutover`). It happens once, after every slice has landed.

## Reviewing work in progress

Stable `development` preview, the review target for every v1 slice:

```
https://website-astro-git-development-karol-chroboks-projects.vercel.app
```

Preview deployments sit behind Vercel Deployment Protection: the URL returns `302` to `vercel.com/sso-api`
unless you're logged into the Vercel account. That's a feature — a half-built page isn't publicly reachable
even by someone holding the link. For outside reviewers, generate a shareable link from the Vercel
dashboard instead of pasting the URL.

## Repository constraints

- **Squash is the only merge method.** `allow_merge_commit: false`, `allow_rebase_merge: false` — "Squash
  and merge" is the only button GitHub offers, on every PR. `main` also enforces
  `required_linear_history: true`. `delete_branch_on_merge: true` means the head branch is deleted on
  merge, so follow-up work needs a fresh branch.
- **`main` requires a PR.** Force-push and branch deletion are blocked; direct pushes are rejected.
  `required_approving_review_count` is 0, so no approval is needed — but the PR is.
- **`yarn build` runs `astro check` before `astro build`.** A type error fails the Vercel deploy instead
  of shipping. Do not "simplify" the `build` script by dropping `astro check`.
- **`development` is intentionally unprotected.** Required status checks are attached there by roadmap
  item F-03 (`inspection-gate`). Declaring required checks before the workflows exist would block every
  PR indefinitely — GitHub waits forever on a check name that never reports.
- **No `.github/workflows/` and no `vercel.json`.** Vercel infers the framework from `astro` and the
  package manager from `yarn.lock`. Server-side PR gating is F-03's job, not something to add ad hoc.

## Local gates

`.husky/pre-commit` runs `validate-branch-name` → `tsc --noEmit` → `lint-staged`.
`.husky/commit-msg` runs commitlint, so commit messages must be Conventional Commits.

These are local-only and bypassable with `--no-verify`. Do not bypass them.
