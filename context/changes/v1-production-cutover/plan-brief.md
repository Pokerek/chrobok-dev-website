# v1 Production Cutover — Plan Brief

> Full plan: `context/changes/v1-production-cutover/plan.md`

## What & Why

Publish v1 to https://www.chrobok.dev and retire the "Work in progress…" placeholder. This is
roadmap S-08, the north star — the only slice that changes what a recruiter actually sees, and the
slice that closes both of the PRD's primary success criteria.

## Starting Point

`main` is a strict ancestor of `development`: 18 commits behind, 0 ahead, 95 files changed. The
finished five-section page already exists on `development`; the placeholder exists only on `main`.
Production serves it today — `www` returns 200 with "Work in progress...", apex 308s to `www`.
Both blockers the roadmap records against S-08 are already resolved: the CV PDF is committed and
wired, and `@astrojs/react` was dropped in S-07. The roadmap still says `blocked`.

## Desired End State

`https://www.chrobok.dev` serves the complete page with no placeholder content anywhere.
`git rev-parse main` equals `git rev-parse development`. The release documentation describes the
ritual that was actually performed, and S-08 is closed with its blockers recorded as resolved.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Release mechanism | Open a PR against `main`, then land it with `git push origin development:main` | A squash merge would put a commit on `main` that `development` never has, forking the branches at the moment they are identical; the FF preserves all 18 commits and makes every future release an FF too. |
| Why the FF is permitted | `enforce_admins: false` on `main` + admin rights | An FF is not a force-push, and no merge commit is created, so `allow_force_pushes: false` and `required_linear_history: true` are both satisfied. |
| CI gating | None added — rely on the Vercel build | The release PR gets a Vercel preview deployment running `astro check && astro build`; arming a required status check on production with one PR of evidence is the footgun the release rules already warn about. |
| Pre-flight | `yarn build` only | Same command Vercel runs; the release SHA has already built green as the `development` preview. |
| Rollback | Vercel instant rollback to the previous production deployment | Seconds to recover with no git surgery — `main` forbids force-pushes, so a git-side reset is not available. |
| Sequencing | Bookkeeping onto `development` first, then the FF | Leaves `main` exactly equal to `development` with nothing trailing; accepted cost is that the done-record briefly precedes proof. |
| Docs scope | Release model + S-08 only | Fixes what this change invalidates without turning a release into a documentation sweep. |
| Post-release check | Smoke checklist on `www` | Targets what this release can break — placeholder string, five sections, CV PDF, apex redirect, zero client JS. |

## Scope

**In scope:**

- Rewrite `.claude/rules/release-process.md` for the fast-forward release ritual
- Narrow `CLAUDE.md`'s "never PR against `main`" rule to feature branches
- Correct roadmap S-08: status `blocked` → `ready`, both blockers recorded as resolved
- Open the release PR, fast-forward `main`, verify production

**Out of scope:**

- Any change under `src/` — the placeholder disappears as a consequence of the FF, not an edit
- CI workflow changes; required status checks on `main`
- Re-running the full `docs/nfr-inspection.md` runbook (S-07 passed it)
- Roadmap Open Questions 2/4/5; the `tasks-linear.md` state snapshot
- `vercel.json`, domain or DNS changes

## Architecture / Approach

Three phases ordered by irreversibility. Phase 1 is documentation-only on a feature branch. Phase 2
lands it on `development` through the normal squash-merge flow, including `/10x-archive`, so the
branch `main` fast-forwards to is already complete. Phase 3 opens a PR against `main` — for review
and for its Vercel build — then closes it with a push rather than the merge button, and verifies
the live site.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Correct the release model and roadmap record | Release rules match the ritual; S-08 records reality | Doc-only, low risk; contradiction between `CLAUDE.md` and the rule file if only one is edited |
| 2. Pre-flight and land on `development` | `development` tip contains the docs and the archive commit | Last reversible point; `/pr-merge` moves CHR-38 to Done before production is live |
| 3. Release PR, FF push, verify production | v1 live at www.chrobok.dev | The "Squash and merge" button is live on the release PR and one click destroys the FF property |

**Prerequisites:** S-07 done (it is); CV PDF committed (it is); admin on the repo (confirmed);
Vercel Production Branch still `main` (assumed — dashboard-only setting).
**Estimated effort:** ~1 session across 3 phases; the release itself is minutes.

## Open Risks & Assumptions

- The GitHub merge button is live on the release PR; clicking it permanently loses the
  fast-forward property and forces a `development` reset.
- `delete_branch_on_merge: true` may — though it is not expected to — delete `development` when the
  push auto-closes the PR; recovery is `git push origin main:development`, losing nothing.
- CHR-38 reaches Done before production is verified, a consequence of bookkeeping-first sequencing.
- Assumption: the Vercel Production Branch is still `main`. Not verifiable from this repo; if it
  changed, the FF push publishes nothing.

## Success Criteria (Summary)

- A visitor at chrobok.dev sees the complete page — no "Work in progress" anywhere
- The CV PDF opens from the live site (FR-011 hangs on this exact path)
- `main` and `development` point at the same commit, so the next release is also a fast-forward
