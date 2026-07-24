---
date: 2026-07-24T09:02:01Z
researcher: Claude (opus-4.8)
git_commit: 8730a60061489e21ca08270f078c787e4ff69ca6
branch: development
repository: website-astro
topic: "F-03 inspection-gate — server-side build/type/lint gate on development + repeatable NFR inspection run"
tags: [research, ci, branch-protection, vercel, github-actions, nfr, inspection-gate, F-03]
status: complete
last_updated: 2026-07-24
last_updated_by: Claude (opus-4.8)
---

# Research: F-03 inspection-gate

**Date**: 2026-07-24T09:02:01Z
**Researcher**: Claude (opus-4.8)
**Git Commit**: 8730a60061489e21ca08270f078c787e4ff69ca6
**Branch**: development
**Repository**: website-astro (GitHub: `Pokerek/website-astro`)

## Research Question

Implement roadmap item **F-03 (`inspection-gate`)**: gate every v1 merge into `development` on
build, type-check **and lint** via required status checks, and turn the NFR inspection checklist
behind the guardrails into a repeatable run rather than a memory exercise. `.github/` does not
exist yet — the workflow is created from scratch and wired as a required status check on
`development`.

## Summary

- **Build + type-check are already gated server-side by Vercel.** Vercel runs `yarn build`
  (`astro check && astro build`) on every PR preview; the deploy fails on a type error. The exact
  GitHub status context Vercel posts today is **`Vercel`** (a legacy commit status). Decision taken:
  use `Vercel` as (part of) the required check — no new CI for build/types.
- **The one real gap is `lint`.** Vercel does not run `eslint`, and `.husky/pre-commit`'s
  lint-staged is `--no-verify`-bypassable, so lint is not gated server-side. Closing it needs a new
  check source. Recommended: a tiny **lint-only** GitHub Actions workflow (`.github/workflows/inspect.yml`),
  registered as required check `lint` alongside `Vercel`.
- **NFR checklist stays manual** (user decision): a checked-in Markdown runbook (`docs/nfr-inspection.md`)
  plus one 2-line serve script for the no-JS check. Automating the four-engine matrix / Lighthouse /
  axe in CI is explicitly out of scope — `top_blocker: time`, and the roadmap flags the matrix as
  not worth automating for a static page.
- **Ordering is load-bearing.** A required check whose workflow has never reported deadlocks every
  PR forever. So: merge the workflow into `development` FIRST (it runs, unblocked, because it's not
  yet required), then declare `lint` (+ `Vercel`) required. This is exactly why F-02 left
  `development` unprotected.
- **Admin access confirmed.** Active `gh` account is **`Pokerek`** with **ADMIN** on
  `Pokerek/website-astro`. `development` currently has **zero** protection (clean slate). Note the
  repo is under `Pokerek`, NOT `Karol-Chrobok` (the global CLAUDE.md default `gh` account) — that
  owner 404s. Use the `Pokerek` account for branch-protection API calls.

## Detailed Findings

### 1. Current gate infrastructure (what exists today)

**Server-side gating: none.** No `.github/` directory at all, no workflows/Actions, no `*.yml`
outside `node_modules`/skills, no `vercel.json`, no `.vercel/`, no `.lighthouserc*`, no
pa11y/axe/linkinator/Playwright config, no `scripts/` dir, no test runner. Vercel is wired purely
through the dashboard Git integration (framework inferred from `astro`, package manager from
`yarn.lock`).

History note: a `.github/instructions/` + `.github/copilot-instructions.md` set existed during F-02
but was migrated to `.claude/rules/` in commit `4c78c4c` (#16). So `.github/` is now entirely
absent; F-03 creates it from scratch.

**Local gates (local-only, `--no-verify`-bypassable — none run on a PR):**
- `.husky/pre-commit`: `npx validate-branch-name` → `npx tsc --noEmit` → `npx lint-staged`
- `.husky/commit-msg`: `npx --no-install commitlint --edit $1`
- `commitlint.config.js`: extends `@commitlint/config-conventional`
- `package.json` `lint-staged`: `src/**/*.{astro,js,jsx,ts,tsx,md}` → `eslint --fix`;
  `src/**/*.{astro,js,jsx,ts,tsx,json,md,css}` → `prettier --write`
- `package.json` scripts: `build` = `astro check && astro build`; `lint` = `eslint .`;
  `lint:fix` = `eslint . --fix`; `format` = `prettier --write "**/*.{...}"`
- `validate-branch-name.pattern`: `^(main|master|development|(feat|fix|chore|docs)\/[a-zA-Z0-9][a-zA-Z0-9_-]*)$`
- `eslint.config.js` (flat): `@eslint/js` + `typescript-eslint` + `eslint-plugin-astro` recommended,
  React jsx-runtime, prettier plugin; custom `simple-import-sort`, `consistent-type-imports`,
  `no-unused-vars`, `no-console: warn`, padding-before-return.
- `tsconfig.json`: extends `astro/tsconfigs/strict`. `astro.config.mjs`: static output, React +
  Tailwind, no adapter.

### 2. GitHub + Vercel ground truth (live, via `gh`)

- **`gh` account:** active is **`Pokerek`** (scopes `repo`, `read:org`, `admin:public_key`, `gist`);
  `Karol-Chrobok` is logged in but inactive. Repo = **`Pokerek/website-astro`**;
  `Karol-Chrobok/website-astro` 404s. `viewerPermission: ADMIN`.
- **Merge settings:** `mergeCommitAllowed:false`, `rebaseMergeAllowed:false`, `squashMergeAllowed:true`,
  `deleteBranchOnMerge:true`, default branch `development`. (Squash-only.)
- **`development` protection:** `GET .../branches/development/protection` → **404 Branch not
  protected**. Zero protection — greenfield.
- **`main` protection (classic):** `required_pull_request_reviews` present with
  `required_approving_review_count: 0`, `dismiss_stale_reviews: true`; **`required_status_checks`
  absent**; `required_linear_history.enabled: true`; `enforce_admins.enabled: false`;
  `allow_force_pushes.enabled:false`; `allow_deletions.enabled:false`;
  `required_conversation_resolution.enabled: true`.
- **Vercel check strings (from recent PRs #16–#18 into development):**
  - **`Vercel`** — a commit **status** (`state: success`, target_url to the Vercel deployment).
    This reflects the build/deploy outcome (build + `astro check`). **This is the string to register
    as required.**
  - `Vercel Preview Comments` — a check-**run** (app slug `vercel`), preview comments only, NOT a
    build gate. Do not require it.
- **No GitHub Actions exist** (`gh run list` empty; `actions/workflows` total_count 0). **No rulesets**
  (`rulesets` → `[]`); protection is classic branch protection.

### 3. Minimal lint gate — recommended approach

**Option A (dedicated lint-only workflow) — chosen.** Option B (fold lint into Vercel's build via
`vercel.json`, or rely on husky) is rejected: `vercel.json` is explicitly forbidden by
release-process.md and couples lint to deploy; husky is bypassable. A ~15-line Actions workflow is
cheaper and clearer.

**Do NOT run `astro check` in this workflow** — Vercel's `yarn build` already runs it; duplicating
doubles the job runtime for zero coverage gain. One source of truth per concern: **types = Vercel,
lint = Actions.**

**Node version:** Astro 5 needs Node 18.20.8 / 20.3 / 22.0+. Astro 6 (upcoming) drops 18/20 and
requires 22.12+. Pin **Node 22** — valid now, future-proofs the v6 bump. (context7 `/withastro/docs`.)

Proposed `.github/workflows/inspect.yml`:

```yaml
name: inspect

on:
  pull_request:
    branches: [development]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn lint
```

- `cache: 'yarn'` supports Yarn Classic (context7 `/actions/setup-node`); keys off `yarn.lock`.
- `yarn install --frozen-lockfile` = the fail-if-lockfile-would-change equivalent of `npm ci`.
- `yarn lint` runs `eslint .` verbatim — no `--fix` (a gate reports, must not mutate). The exposed
  status-check name is the job id **`lint`**.

### 4. Required-check ordering (deadlock avoidance)

1. Branch `feat/…` off `development`, add `.github/workflows/inspect.yml` (+ NFR runbook + serve
   script), open PR into `development`. The `lint` check runs for the first time here, unblocked
   (not yet required). Squash-merge.
2. THEN add branch protection on `development` requiring status checks **`lint`** and **`Vercel`**.
   Only checks GitHub has actually observed reporting are valid to require.
3. From then on every PR into `development` must pass `lint` (Actions) + `Vercel` (build + types).

This is the exact deadlock release-process.md and F-02's plan warned about ("GitHub waits forever on
a check name that never reports").

### 5. Manual NFR inspection runbook (user decision: manual, not CI)

**Form:** a checked-in Markdown runbook at `docs/nfr-inspection.md`, run once before the
`development → main` cutover (S-08) and pasted into the cutover PR with boxes ticked. Plus one tiny
`scripts/nfr-serve.sh` (`yarn build && yarn preview`) that the no-JS + engine checks need.

Mapping the four NFRs (prd.md:220-233) + guardrail (prd.md:96-101) to cheap checks:
- **NFR-1 Perf (<1s, no CLS):** Chrome DevTools Lighthouse (mobile+desktop) on preview — Perf high,
  **CLS = 0**, LCP < 1s; Performance panel shows no layout-shift bars; usable <1s on throttled 4G.
- **NFR-2 A11y (keyboard + SR + WCAG AA):** full Tab-through (reachable, visible focus, logical
  order, no trap); axe DevTools 0 critical/serious; VoiceOver spot check; contrast ≥ 4.5:1 (3:1 large).
- **NFR-3 No-JS:** `yarn build && yarn preview`, disable JS + reload → full content, nav works, no
  blank islands; CLI sanity `curl -s localhost:4321 | grep -c "<main"` > 0.
- **NFR-4 Cross-engine (4×2):** there are only **3 shipping engines** — Blink (Chrome + Edge),
  WebKit (Safari + iOS Safari), Gecko (Firefox + Firefox ESR). The runbook states this explicitly so
  the author doesn't hunt a nonexistent fourth engine. Check layout, fonts, islands, console clean.
- **Guardrail:** view-source semantic HTML, no TODO/placeholder/lorem, console clean, no 404 links,
  meta/OG/favicon present.

### 6. What we deliberately do NOT automate

- **Type-check in Actions** — Vercel owns it. **NFR matrix in CI** (Lighthouse CI, axe-core,
  Playwright, no-JS assertions) — setup+maintenance cost dwarfs value for a solo portfolio;
  `top_blocker: time`; a runbook run once at cutover is the right altitude (CI'd NFRs = v2 if the
  site grows). **`push:` trigger / nightly** — the gate is the PR; linting `main` or scheduled runs
  add noise without extra protection. **Husky as a "gate"** — kept as fast local feedback only,
  intentionally bypassable, not counted as enforcement.

## Code References

- `package.json:15` — `build`: `astro check && astro build` (Vercel's build; types gated here)
- `package.json:18` — `lint`: `eslint .` (the command the Actions gate runs)
- `package.json:22-25` — `lint-staged` (local, bypassable)
- `.husky/pre-commit`, `.husky/commit-msg` — local gates
- `eslint.config.js`, `tsconfig.json` (extends `astro/tsconfigs/strict`), `astro.config.mjs`
- `context/foundation/roadmap.md:52, 81-82, 118-130, 241` — F-03 scope, unknowns, prereqs
- `context/foundation/prd.md:96-106, 220-233` — Guardrails + the four NFRs
- `.claude/rules/release-process.md:43-64` — repository constraints + local gates (authoritative)
- `context/foundation/tasks-linear.md:39` — tracker row **CHR-30** (F-03, currently Backlog)

## Architecture Insights

- **Separation of concerns per check:** Vercel = build + types (already free), Actions = lint (the
  only gap). Avoid duplicating `astro check` in Actions.
- **The gate is the PR into `development`.** No `push`/nightly triggers. Squash-only merges mean the
  required checks run on the PR head; `development` protection is the enforcement point (F-03), `main`
  is already protected separately.
- **Vercel `Vercel` context is a commit status, not a check-run** — both are requirable by name;
  register `Vercel`.
- **Two-step deploy of the gate itself** (workflow lands unprotected → then required) is mandatory,
  not stylistic — it's the only way to avoid the never-reports deadlock.

## Historical Context (from prior changes — F-02)

- `context/archive/2026-07-23-v1-release-staging/plan.md:67-68, 288-289` — F-02 explicitly left
  `development` unprotected and no CI, naming F-03 as owner of "CI gating and `development` branch
  protection", with the same never-reports deadlock rationale.
- `context/archive/2026-07-23-v1-release-staging/plan-brief.md:26, 34, 60` — decision table:
  "Protection on `development` | None — harden `main` only | F-03 will add protection when it has
  status checks to attach."
- `context/archive/2026-07-23-v1-release-staging/change.md:36-41` — recorded live protection state:
  `main` protected, `development` 404 (intended until F-03). Matches this research's live findings.
- `context/archive/2026-07-23-v1-release-staging/change.md:65-70` — Vercel Preview Deployment
  Protection (SSO) is ON; preview URLs `302` to `vercel.com/sso-api`. A CI job cannot anonymously
  fetch a preview — the NFR runbook therefore targets a LOCAL build (`yarn preview`) for the no-JS /
  engine checks, and a logged-in browser for the Lighthouse/axe steps.
- `context/archive/2026-07-23-v1-release-staging/change.md:77-102` — **`prettier --check "**/*.md"`
  false-pass debt:** ~20 markdown files fail `prettier --check` (printWidth 120) because prettier
  isn't wired for repo-wide `.md`. Consequence for F-03: **do NOT add a repo-wide `prettier --check`
  to the workflow** — it would fail on pre-existing files. The chosen lint-only (`eslint .`) gate
  sidesteps this.

## Open Questions

- **Should `development` protection also set `required_pull_request_reviews` (0 approvals, PR
  required) to mirror `main`, or only required status checks?** The roadmap outcome only asks for the
  build/type/lint gate; adding a PR requirement on `development` is a small extra that matches `main`'s
  posture. Decide in planning. (Leaning: require status checks + PR, 0 approvals, `strict` off to
  avoid forced rebases on squash-only.)
- **`enforce_admins` on `development`?** `main` has it off. Keeping it off lets the author bypass in a
  pinch; keeping parity with `main` is simplest. Decide in planning.
- **`strict` (require branches up to date before merge)?** With squash-only + a fast-moving solo repo,
  `strict: true` forces a rebuild on every base change. Lean `strict: false`.

## Related Research

- None prior for this change. Upstream context: `context/archive/2026-07-23-v1-release-staging/`
  (F-02, the prerequisite) and `context/foundation/roadmap.md` §F-03.

## Tracker

- Linear-only (no GitHub-issues mirror): **CHR-30 · F-03 · inspection-gate · "Inspection gate" ·
  Backlog** (`context/foundation/tasks-linear.md:39`). `/pr-ready` → In Review, `/pr-merge` → Done.
