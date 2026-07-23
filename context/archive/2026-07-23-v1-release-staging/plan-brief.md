# V1 Release Staging — Plan Brief

> Full plan: `context/changes/v1-release-staging/plan.md`

## What & Why

Roadmap item **F-02**. The v1 release is deliberately a single cutover: all seven sections ship at once, and no recruiter ever sees a partial page. That strategy only works if merging v1 work does *not* publish to `chrobok.dev` — so this change establishes `main` as production (still serving the placeholder) and `development` as the integration branch behind a Vercel preview, then **proves** it with a live merge.

## Starting Point

More is already in place than the roadmap records, and one recorded fact is wrong. `development` already exists, is the **GitHub default branch**, and already receives PRs (#12; #8–#11 went to `main`). `main` is the only protected branch — PR required, linear history, no force-push. `.github/workflows/` does not exist (the roadmap says "empty"), so nothing gates a PR server-side; the husky hooks that do run (`tsc --noEmit`, lint-staged, commitlint) are bypassable with `--no-verify`. There is no `vercel.json` — deployment is dashboard-only.

The critical gap: the roadmap asserts "merging to `main` publishes", but **nobody has verified this**. Vercel's Production Branch is fixed at import time and is *not* updated when GitHub's default branch changes — and the default is now `development`. If Vercel is pointed at `development`, every merge is already a live release and PR #12 already shipped to production.

## Desired End State

`main` publishes to `chrobok.dev` and keeps serving "Work in progress…" until S-08. The five content slices merge into `development` and are reviewed on a stable Vercel branch preview. The branch model is written down where an agent will find it, the roadmap's stale baseline is corrected, and a real merge has been *observed* to rebuild the preview while leaving production untouched.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Vercel Production Branch | `main` | Matches the one-pass cutover, and `main` already carries the full protection ruleset. |
| Branch model | feature → `development` → `main` at cutover | Documents the model already in flight (PR #12) rather than inventing a new one. |
| Reviewable URL | Vercel's stable `development` branch preview | Zero config, no DNS, no `noindex` handling to own. |
| Protection on `development` | None — harden `main` only | `development` is staging; F-03 will add protection when it has status checks to attach. |
| Repo artifacts | Documentation only | Vercel already infers Astro + yarn correctly; a pinned `vercel.json` would silently override `package.json`. |
| Proof of insulation | Live smoke test on this change's own docs commit | Tests the real mechanism at zero risk — a docs commit can't damage the site even if the wiring is inverted. |

## Scope

**In scope:** Verifying and correcting the Vercel Production Branch; confirming `main`'s protection; a new `.github/instructions/04-releaseProcess.instructions.md` module plus index wiring; correcting the roadmap's baseline; a live merge smoke test.

**Out of scope:** Any CI workflow file (that is F-03); branch protection on `development` (F-03); `vercel.json`; a custom staging subdomain; any content change — `index.astro` keeps the placeholder until S-08.

## Architecture / Approach

```
feat|fix|chore|docs/*  ──PR──▶  development  ──▶  Vercel Preview (stable branch URL)
                                     │
                                     └──PR (squash/rebase, S-08 only)──▶  main  ──▶  chrobok.dev
```

Observe → document → prove. Phase 1 precedes Phase 2 because if Vercel is pointed at `development`, Phase 2's own merge would be a production deploy. Phase 3 reuses Phase 2's docs commit as its test payload rather than inventing a throwaway one.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Observe & correct topology | The real Vercel/GitHub state, recorded; Production Branch = `main` | The setting may be inverted — if so, production was already exposed and this is urgent, not routine |
| 2. Document the release model | Release-process instruction module, index wiring, corrected roadmap baseline | Docs that drift from dashboard settings nothing in the repo enforces |
| 3. Prove insulation | An observed merge: preview rebuilds, production does not | Both branches build identical output, so the test must key on build activity, not page content |

**Prerequisites:** Vercel dashboard access (the CLI is not installed); `gh` authenticated as `Pokerek` (confirmed).
**Estimated effort:** ~1 session; docs-only diff plus two dashboard checks and one merge.

## Open Risks & Assumptions

- **The Vercel Production Branch value is unknown until Phase 1.** If it is `development`, PR #12 already published to production and the roadmap's risk framing for F-02 was understated.
- **Nothing in the repo enforces the topology.** By choice — if the dashboard setting changes later, only the docs would disagree, silently. F-03 partially closes this.
- **`required_linear_history` on `main`** means the S-08 cutover PR must be squash or rebase; a merge commit will be rejected at the worst possible moment if not known in advance.
- **`development` stays unprotected**, so a direct push can bypass the PR review step the model assumes.

## Success Criteria (Summary)

- A merge into `development` produces a Vercel **Preview** deployment and **no** Production deployment — observed, not assumed.
- `chrobok.dev` is byte-identical before and after that merge and still shows "Work in progress…".
- A stable preview URL is recorded that S-01 through S-07 can be reviewed on.
