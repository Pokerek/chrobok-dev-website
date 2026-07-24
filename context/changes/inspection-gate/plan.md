# F-03 Inspection Gate — Implementation Plan

## Overview

Gate every merge into `development` on build, type-check **and lint** via required status checks,
and turn the four NFRs behind the "survives a technical inspection" guardrail into a repeatable
run. Build + type-check are already gated by Vercel (`yarn build` = `astro check && astro build`);
the only server-side gap is `eslint`, closed by a tiny lint-only GitHub Actions workflow. The NFR
checklist ships as a checked-in Markdown runbook plus one serve script — manual, not CI.

## Current State Analysis

- `development` has **zero** branch protection (protection endpoint returns 404). `main` is
  protected (PR required, `required_linear_history: true`, 0 approvals, force-push/deletion blocked,
  `enforce_admins: false`). Repo is `Pokerek/website-astro`; active `gh` account `Pokerek` has ADMIN.
- No `.github/` directory, no workflows, no `vercel.json`, no rulesets, no test runner. Vercel is
  wired purely via the dashboard Git integration.
- Vercel posts a commit status named **`Vercel`** on every PR into `development` (reflects the
  build/deploy = build + `astro check`). A separate `Vercel Preview Comments` check-run only posts
  comments and is not a gate.
- Local gates (`.husky/pre-commit`: `validate-branch-name` → `tsc --noEmit` → `lint-staged`;
  `.husky/commit-msg`: commitlint) are `--no-verify`-bypassable — not server-side enforcement.
- `yarn lint` (`eslint .`) passes clean on the current tree (verified) — the first gate PR will be green.

### Key Discoveries:

- The exact required-check string for the Vercel gate is `Vercel` (`research.md` §2).
- Astro 5 needs Node 18.20.8/20.3/22+; Astro 6 will require 22.12+ — pin **Node 22** to future-proof
  (`research.md` §3).
- **Deadlock trap**: a required check whose workflow has never reported blocks every PR forever
  (`.claude/rules/release-process.md:53-55`). Hence the merge-then-require ordering.
- **Prettier markdown debt** from F-02: ~20 `.md` files fail `prettier --check` (printWidth 120).
  The lint-only (`eslint .`) gate sidesteps this — do NOT add a repo-wide `prettier --check`
  (`context/archive/2026-07-23-v1-release-staging/change.md:77-102`).
- Vercel previews sit behind Deployment Protection (SSO) — a CI job cannot anonymously fetch a
  preview URL, so the NFR runbook targets a LOCAL build for the no-JS / engine checks.

## Desired End State

Every PR into `development` shows two required checks — `lint` (Actions) and `Vercel` (build +
types) — and cannot be squash-merged until both pass. A `docs/nfr-inspection.md` runbook exists that
the author runs once before the `development → main` cutover (S-08), covering all four NFRs + the
guardrail. Verify: `gh api repos/Pokerek/website-astro/branches/development/protection` returns
`required_status_checks.contexts` containing `lint` and `Vercel`; a test PR into `development` is
merge-blocked until both are green.

## What We're NOT Doing

- **No `astro check` in the Actions workflow** — Vercel already runs it; duplicating doubles the job
  for zero coverage gain. Types = Vercel, lint = Actions.
- **No automated NFR checks in CI** — no Lighthouse CI, axe-core, Playwright, pa11y, linkinator, or
  no-JS assertions. `top_blocker: time`; the runbook is the right altitude for a solo portfolio.
- **No `vercel.json`** — forbidden by release-process.md; Vercel infers everything.
- **No `push:` / scheduled workflow triggers** — the gate is the PR into `development`.
- **No repo-wide `prettier --check`** in the gate (pre-existing markdown debt would fail it).
- **No PR-review requirement on `development`** — only status checks (user decision). Direct pushes
  stay possible for the admin as an escape hatch.
- **No change to `main` protection** — out of scope; `main` is already protected.

## Implementation Approach

Two phases separated by a merge boundary. Phase 1 authors the three artifacts on a feature branch
and lands them in `development` via a normal PR — on that PR the `lint` check runs for the first
time (unblocked, because it is not yet required). Only after that PR is squash-merged does Phase 2
apply branch protection requiring `lint` + `Vercel`. This ordering is mandatory: declaring `lint`
required before it has ever reported would deadlock every PR.

## Critical Implementation Details

- **Ordering / lifecycle** — Phase 2 (branch protection) must run only AFTER the Phase 1 PR is
  squash-merged into `development`. The `lint` check name only becomes a valid, selectable required
  context once GitHub has observed it report at least once (on the Phase 1 PR).
- **Direct-push escape hatch** — the workflow triggers on `pull_request` only, so a direct push to
  `development` runs no lint and is un-gated. With `enforce_admins: false` the admin can push
  directly in a pinch; the normal, gated path is a PR. This is intentional per the user decision to
  not require PRs on `development`.

## Phase 1: Author the inspection-gate artifacts

### Overview

Create the lint-only CI workflow, the NFR runbook, and the serve script on a feature branch; open a
PR into `development` for final review; confirm `lint` runs green on the PR.

### Changes Required:

#### 1. Lint-only CI workflow

**File**: `.github/workflows/inspect.yml` (new; creates `.github/` from scratch)

**Intent**: Close the one server-side gap Vercel leaves — run `eslint` on every PR into
`development` so lint failures block the merge. Lint only; types/build stay with Vercel.

**Contract**: GitHub Actions workflow, single job whose id is `lint` (this id becomes the required
status-check name). Trigger `pull_request` with `branches: [development]`. Steps: checkout →
`actions/setup-node@v6` with `node-version: '22'` and `cache: 'yarn'` → `yarn install
--frozen-lockfile` → `yarn lint`. No `--fix` (a gate must not mutate), no `astro check`, no `push:`
trigger.

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

#### 2. NFR inspection runbook

**File**: `docs/nfr-inspection.md` (new; creates `docs/`)

**Intent**: Make the four NFRs + guardrail a repeatable checklist run once before the
`development → main` cutover (S-08), not a memory exercise. Manual, browser/DevTools + a couple of
CLI sanity checks.

**Contract**: Markdown runbook with a checkbox section per NFR mapping to concrete cheap checks:
- **Prep**: `development` preview green; `yarn build && yarn preview` (or `scripts/nfr-serve.sh`) clean.
- **NFR-1 Perf (<1s, no CLS)**: Chrome DevTools Lighthouse (mobile + desktop) on the preview — high
  Performance, **CLS = 0**, LCP < 1s; Performance panel shows no layout-shift bars; usable < 1s on
  throttled 4G.
- **NFR-2 A11y**: full keyboard Tab-through (reachable, visible focus, logical order, no trap); axe
  DevTools 0 critical/serious; VoiceOver spot check; contrast ≥ 4.5:1 (3:1 large text).
- **NFR-3 No-JS**: local build + disable JS + reload → full content, nav works, no blank islands;
  CLI sanity `curl -s localhost:4321 | grep -c "<main"` > 0.
- **NFR-4 Cross-engine (4×2)**: state explicitly there are **3 shipping engines** — Blink
  (Chrome + Edge), WebKit (Safari + iOS Safari), Gecko (Firefox + Firefox ESR) — so "4×2" is
  satisfied by current+previous of each; check layout/fonts/islands/console per engine.
- **Guardrail**: view-source semantic HTML, no TODO/placeholder/lorem, console clean, no 404 links,
  meta/OG/favicon present.

#### 3. NFR serve helper

**File**: `scripts/nfr-serve.sh` (new, executable `chmod +x`)

**Intent**: One-command local production build + static serve for the no-JS and cross-engine checks
that need the built `dist/`, not the dev server.

**Contract**: Bash script, `set -e`, runs `yarn build` then `yarn preview` (serves `./dist` on
`localhost:4321`). Referenced from the runbook's Prep + NFR-3 steps.

### Success Criteria:

#### Automated Verification:

- `yarn lint` passes locally: `yarn lint`
- Workflow YAML is well-formed (parses): `yq . .github/workflows/inspect.yml` or equivalent
- Serve script is executable and syntactically valid: `test -x scripts/nfr-serve.sh && bash -n scripts/nfr-serve.sh`
- The `lint` check runs and passes on the Phase 1 PR into `development` (visible via `gh pr checks <n>`)

#### Manual Verification:

- Runbook reads as genuinely runnable — each NFR maps to a concrete check the author can perform
- PR into `development` opened and reviewed as the final implementation (per user: PR = review vehicle)
- `Vercel` check is green on the same PR (build + `astro check` pass)

**Implementation Note**: After Phase 1's automated verification passes and the PR is squash-merged
into `development`, pause for confirmation before Phase 2 — branch protection can only reference
`lint` once it has reported on the merged PR.

---

## Phase 2: Apply `development` branch protection

### Overview

After the Phase 1 PR is squash-merged, require `lint` + `Vercel` on `development` so future merges
are gated. Config only — applied via `gh api`, not committed.

### Changes Required:

#### 1. Branch protection rule on `development`

**File**: none (GitHub config via `gh api`, account `Pokerek`)

**Intent**: Enforce the gate — every future PR into `development` must pass `lint` and `Vercel`
before it can be squash-merged.

**Contract**: `PUT repos/Pokerek/website-astro/branches/development/protection` with:
`required_status_checks: { strict: false, contexts: ["lint", "Vercel"] }`,
`enforce_admins: false`, `required_pull_request_reviews: null`, `restrictions: null`. No PR-review
requirement, `strict` off (avoids forced rebuilds under squash-only), admins not enforced (parity
with `main`, keeps a direct-push escape hatch).

### Success Criteria:

#### Automated Verification:

- Protection is set: `gh api repos/Pokerek/website-astro/branches/development/protection --jq '.required_status_checks.contexts'` returns `["lint","Vercel"]` (order-independent)
- `strict` is false: `... --jq '.required_status_checks.strict'` → `false`
- Admins not enforced: `... --jq '.enforce_admins.enabled'` → `false`
- No PR-review requirement present: `... --jq '.required_pull_request_reviews'` → `null` / absent

#### Manual Verification:

- A subsequent PR into `development` shows both `lint` and `Vercel` as required and is
  merge-blocked until both pass
- Squash-and-merge remains the only merge button (unchanged repo-level setting)

**Implementation Note**: This phase runs against live GitHub config. Confirm the active `gh` account
is `Pokerek` (`gh auth status`) before the `PUT` — `Karol-Chrobok/website-astro` does not exist.

---

## Testing Strategy

### Automated:

- `yarn lint` green locally and on the PR (the gate's own subject).
- Workflow + script static validation (YAML parse, `bash -n`, executable bit).
- Post-Phase-2 API assertions on the protection payload.

### Manual Testing Steps:

1. Open the Phase 1 PR into `development`; confirm `lint` and `Vercel` both report and pass.
2. Squash-merge; confirm `.github/workflows/inspect.yml`, `docs/nfr-inspection.md`,
   `scripts/nfr-serve.sh` are on `development`.
3. Apply Phase 2 protection; open a trivial throwaway PR into `development` and confirm the merge
   button is blocked until checks pass (then close it).
4. Walk the NFR runbook end-to-end once against the `development` preview to confirm it's runnable.

## Migration Notes

None — additive. No existing config is changed; `main` protection is untouched. Rollback is deleting
the workflow file and removing the `development` protection rule (`gh api -X DELETE
.../branches/development/protection`).

## References

- Research: `context/changes/inspection-gate/research.md`
- Roadmap F-03: `context/foundation/roadmap.md:118-130`
- Constraints: `.claude/rules/release-process.md:43-64`
- NFRs / guardrail: `context/foundation/prd.md:96-106, 220-233`
- F-02 groundwork: `context/archive/2026-07-23-v1-release-staging/{plan.md:67-68,288-289, change.md:36-41,77-102}`
- Tracker: `context/foundation/tasks-linear.md:39` (CHR-30)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Author the inspection-gate artifacts

#### Automated

- [x] 1.1 `yarn lint` passes locally — 4fb7f4c
- [x] 1.2 Workflow YAML is well-formed (parses) — 4fb7f4c
- [x] 1.3 Serve script is executable and syntactically valid (`test -x` + `bash -n`) — 4fb7f4c
- [x] 1.4 `lint` check runs and passes on the Phase 1 PR into `development` — 4fb7f4c

#### Manual

- [x] 1.5 Runbook reads as genuinely runnable — each NFR maps to a concrete check — 4fb7f4c
- [x] 1.6 PR into `development` opened and reviewed as the final implementation
- [x] 1.7 `Vercel` check green on the same PR — 4fb7f4c

### Phase 2: Apply `development` branch protection

#### Automated

- [ ] 2.1 Protection contexts return `["lint","Vercel"]`
- [ ] 2.2 `required_status_checks.strict` is `false`
- [ ] 2.3 `enforce_admins.enabled` is `false`
- [ ] 2.4 `required_pull_request_reviews` is null/absent

#### Manual

- [ ] 2.5 A subsequent PR into `development` shows both checks required and is merge-blocked until green
- [ ] 2.6 Squash-and-merge remains the only merge button
