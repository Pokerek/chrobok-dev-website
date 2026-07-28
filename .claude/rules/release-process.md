# Release Process

Which branch publishes, where work lands, what the v1 release event is. Read before opening any PR.

## `main` is production

`main` is the Vercel Production Branch. Anything merged into `main` is live on https://www.chrobok.dev
immediately. Feature branches must **never** target a PR at `main` — that publishes unreviewed,
unreleased work to the live site. The one documented exception is the `development` → `main` release
PR itself (see "Branch model" below): it targets `main` deliberately, as a review surface and Vercel
build gate, and is closed by a fast-forward push rather than the merge button.

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
4. A release is `development` → `main`. Open a PR with base `main` and head `development` for review
   and to trigger its Vercel preview build — `inspect` does not run against `main` (see "Repository
   constraints"), so that preview build is the only pre-promotion gate. Wait for it to report success.
5. Land the release with a fast-forward push of `development` onto `main`, **not** the "Squash and
   merge" button. Squashing here would create a commit that `development` never has, permanently
   forking the two branches at the exact moment their content is identical — the fast-forward is what
   keeps every future release a fast-forward too. GitHub marks the release PR merged on its own once
   the push lands.
6. Verify production: `main` and `development` resolve to the same commit, and
   https://www.chrobok.dev serves the new tree.

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

- **Squash is the only merge button, but not the only way to land a PR.** `allow_merge_commit: false`,
  `allow_rebase_merge: false` — "Squash and merge" is the only button GitHub offers, on every PR, and
  it is how every feature PR into `development` lands. The `development` → `main` release PR is the
  documented exception: it is closed via the fast-forward step in "Branch model" above, never the
  button. `main` also enforces `required_linear_history: true`, which the fast-forward step satisfies
  trivially since it creates no merge commit. `delete_branch_on_merge: true` means the head branch is
  deleted when a PR is merged through the button, so follow-up feature work needs a fresh branch.
- **`main` requires a PR from everyone except the repo owner.** `enforce_admins: false` is why the
  release ritual's fast-forward step is possible for the repo owner, who holds `admin` — this is a
  deliberate affordance recorded here on purpose, not a gap to close. It does not weaken branch
  deletion or history protection, which stay enforced. Anyone without admin still cannot push directly
  and still needs a PR; `required_approving_review_count` is 0, so no approval is needed — but the PR
  is.
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
