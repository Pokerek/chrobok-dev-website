# V1 Release Staging Implementation Plan

## Overview

Establish — and *prove* — that v1 work can merge and deploy to a reviewable URL without `chrobok.dev` ever showing a partial page. `main` stays the production branch serving the "Work in progress…" placeholder until the S-08 cutover; `development` accumulates the five content slices behind a Vercel branch preview.

This is roadmap item **F-02** (`v1-release-staging`). It is the mechanism the north star S-08 depends on: without it, the auto-deploy-on-merge behaviour publishes every partial section straight to production, contradicting the deliberately-chosen one-pass release.

The change is deliberately small in the repo and large in *certainty*. Most of the machinery already exists; what does not exist is any evidence that it behaves the way the roadmap claims.

## Current State Analysis

Researched 2026-07-23 against the live repo and the GitHub API.

**Branch topology — already partly in place, undocumented:**

- Two long-lived branches exist: `main` and `development`. Working tree is on `development`, clean.
- `development` is the **GitHub default branch** (`gh repo view` → `defaultBranchRef.name = development`).
- `development` is exactly one commit ahead of `main` (`c5b902e feat: add husky config (#12)`); `main` has nothing `development` lacks. Application source is byte-identical on both.
- PR history shows a recent shift: #8–#11 all targeted `main`; #12 targeted `development`. The integration-branch model has already started, without being written down anywhere.

**Protection — asymmetric:**

- `main` is protected: PR required (`required_approving_review_count: 0`), `required_linear_history: true`, `allow_force_pushes: false`, `allow_deletions: false`, `required_conversation_resolution: true`, `enforce_admins: false`.
- `development` has **no protection at all** (API returns 404 "Branch not protected").

**CI and gating:**

- `.github/workflows/` **does not exist**. The roadmap baseline says it is "empty" — it is absent. Nothing runs server-side on any PR.
- Local gates exist and are real but bypassable: `.husky/pre-commit` runs `npx validate-branch-name` → `npx tsc --noEmit` → `npx lint-staged`; `.husky/commit-msg` runs commitlint. All are skippable with `git commit --no-verify` and none run on a PR.
- `package.json:build` is `astro check && astro build`, so any Vercel build already type-checks as a side effect. `validate-branch-name` pattern permits `main`, `master`, `development`, and `(feat|fix|chore|docs)/…`.

**Deployment:**

- No `vercel.json` and no `.vercel/` directory. Vercel is wired purely through the dashboard Git integration. The `vercel` CLI is not installed locally.
- Vercel infers the framework from `astro`, and the package manager from `yarn.lock` (`packageManager: yarn@1.22.22` is also declared).

**The load-bearing unknown this plan exists to close:**

The roadmap baseline asserts "Merging to `main` publishes with no gate in front of it." **This was never verified and may be inverted.** Vercel's Production Branch is a dashboard setting fixed at project-import time; it is *not* updated when GitHub's default branch changes. Since GitHub's default is now `development`, there are two possible live states with opposite consequences:

- Production Branch = `main` → merges to `development` already produce previews, and F-02 is largely already true but undocumented and unproven.
- Production Branch = `development` → **every merge to `development` is already publishing live to chrobok.dev**, which is exactly the failure this foundation exists to prevent. PR #12 would then already have been a production release.

This cannot be resolved from the repo. It is resolved in Phase 1 by direct observation.

## Desired End State

1. Vercel's Production Branch is `main`, confirmed by observation rather than assumption.
2. `main` remains protected with its current ruleset; `development` remains unprotected by deliberate choice.
3. The branch model and release rule are written down in the repo where both a human and an AI agent will find them.
4. The roadmap's baseline no longer contains claims contradicted by observation.
5. A real merge into `development` has been observed to rebuild the branch preview while leaving `chrobok.dev` unchanged.

Verified by: the Phase 3 smoke test, which is the only step that tests the mechanism end-to-end with a live merge.

### Key Discoveries:

- `development` is already the default branch and already receives PRs (#12) — this change documents and hardens an in-flight model rather than introducing one.
- `main` already carries the entire production gate (`main` protection ruleset) — no new protection work is required.
- `required_linear_history: true` on `main` means the S-08 cutover PR must be **squash or rebase**; a merge commit will be rejected. Worth knowing now, not at cutover.
- `package.json:build` already runs `astro check`, so a broken type reaching production fails the Vercel build rather than deploying — a meaningful safety net that exists by accident and should be recorded so nobody removes it.
- `.github/copilot-instructions.md` is an index that is already out of date: it lists two modules while `01-overview.instructions.md` links three (Design System is missing from the index). Adding a fourth module must not repeat that mistake.

## What We're NOT Doing

- **No CI workflow file.** `.github/workflows/` stays absent. Build/type/lint gating on PRs is roadmap item **F-03** (`inspection-gate`), which is explicitly sequenced after F-02. Pulling it in here would merge two roadmap items.
- **No branch protection on `development`.** Deferred to F-03, which will need protection there anyway as the attachment point for required status checks. Declaring required checks before those checks exist would block every PR indefinitely — GitHub waits forever on a check name that never reports.
- **No `vercel.json`.** Vercel already infers framework and package manager correctly, and a pinned `buildCommand` would silently override `package.json` the next time the build script changes.
- **No custom staging subdomain.** Vercel's auto-generated stable branch URL is used as-is; no DNS work and no `noindex` handling to own.
- **No content changes.** `src/pages/index.astro` keeps the placeholder — deleting it is S-08's job.
- **No changes to the husky hooks, eslint config, or `package.json` scripts.**

## Implementation Approach

Observe first, then document, then prove. The ordering is not cosmetic:

Phase 1 must precede Phase 2 because if Vercel's Production Branch turns out to be `development`, then Phase 2's own documentation commit — merged into `development` — would itself be a production deploy. The settings have to be correct before *anything* merges.

Phase 3 deliberately reuses Phase 2's commit as its test payload instead of inventing a throwaway one. A docs-only commit is the ideal probe: it changes the deployed output not at all, so if the wiring is inverted, the smoke test reveals it at zero cost to the live site.

## Critical Implementation Details

**Timing & lifecycle.** Vercel's Production Branch setting and GitHub's default branch are independent. Changing GitHub's default branch to `development` (already done, at some earlier point) did **not** repoint Vercel. Any reasoning that treats "default branch" and "production branch" as the same thing is wrong here, and that conflation is the most likely source of the roadmap's unverified claim.

**Debug & observability.** The two branches currently build byte-identical output, so comparing rendered HTML cannot distinguish which branch is serving production. The smoke test therefore has to key on *build activity* (does a new deployment appear, and against which branch) rather than on page content.

## Phase 1: Observe and correct the release topology

### Overview

Establish the actual live state of the Vercel and GitHub settings, record it, and correct it if it does not match the intended topology. No repo files change in this phase — it is observation plus at most one dashboard edit.

### Changes Required:

#### 1. Vercel Production Branch (dashboard — outside the repo)

**File**: none — Vercel dashboard, Project → Settings → Git

**Intent**: Determine what the Production Branch is actually set to, and set it to `main` if it is not. This closes the unknown that makes the roadmap's baseline unverifiable, and is the single setting the entire one-pass-release strategy rests on.

**Contract**: Production Branch = `main`. All other branches, including `development`, produce Preview deployments. Record the *observed pre-change value* — it is needed for Phase 2's roadmap correction and determines whether PR #12 was already a production release.

#### 2. GitHub protection state (dashboard/API — outside the repo)

**File**: none — GitHub → Settings → Branches, or `gh api repos/Pokerek/website-astro/branches/main/protection`

**Intent**: Confirm `main`'s existing ruleset is intact and that `development` is still unprotected, so Phase 3's smoke test runs against a known configuration rather than a drifting one.

**Contract**: `main` — PR required, `required_linear_history: true`, force-push and deletion blocked. `development` — no protection (404 from the protection endpoint is the expected, correct result).

#### 3. Scratch record of observed state

**File**: `context/changes/v1-release-staging/change.md` (`## Notes` section)

**Intent**: Write down what was observed before anything was changed, so Phase 2 documents reality and the roadmap correction is grounded in evidence rather than in this plan's expectations.

**Contract**: Notes gain the observed pre-change Production Branch value, whether it was edited, and the date of observation.

### Success Criteria:

#### Automated Verification:

- `main` protection is intact: `gh api repos/Pokerek/website-astro/branches/main/protection` returns `required_linear_history.enabled: true` and `allow_force_pushes.enabled: false`
- `development` is unprotected: `gh api repos/Pokerek/website-astro/branches/development/protection` returns HTTP 404
- Working tree is clean apart from `change.md`: `git status --short`

#### Manual Verification:

- Vercel Project → Settings → Git shows Production Branch = `main`
- The pre-change observed value is recorded in `change.md` Notes, including whether an edit was required
- `https://www.chrobok.dev` still serves the "Work in progress…" placeholder and returns HTTP 200

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. If the observed Production Branch was `development`, flag it explicitly — it means PR #12 already published to production and the roadmap's risk framing was understated.

---

## Phase 2: Document the release model in the repo

### Overview

Write the branch model and release rule where both a human and an AI agent will find them, and correct the two roadmap baseline claims that observation has now contradicted. Docs-only — no source, config, or dependency changes.

### Changes Required:

#### 1. Release-process instruction module

**File**: `.github/instructions/04-releaseProcess.instructions.md` (new)

**Intent**: Give agents and future-you an authoritative statement of which branch publishes, where slice PRs land, and what the v1 release event is — so nobody targets a PR at `main` mid-build and ships a partial page.

**Contract**: Follows the existing module convention — YAML frontmatter with `applyTo: "**/*"`, matching the sibling files. Content covers: `main` = production (serves chrobok.dev), `development` = integration (Vercel branch preview), feature branches follow the `validate-branch-name` pattern `(feat|fix|chore|docs)/…` and PR into `development`, and the single `development` → `main` PR is the S-08 cutover. Records two constraints discovered in research: the cutover PR must be squash or rebase because `main` enforces linear history, and `yarn build` runs `astro check` so a type error fails the deploy rather than shipping.

#### 2. Instruction index

**File**: `.github/copilot-instructions.md`

**Intent**: Register the new module in the index so it is discoverable through the documented entry point.

**Contract**: Add a `- **[Release Process](./instructions/04-releaseProcess.instructions.md)**` bullet to the Instruction Modules list. While here, add the missing `- **[Design System](./instructions/03-designSystem.instructions.md)**` entry — the index currently lists two modules while `01-overview.instructions.md` links three, and leaving that gap while adding a fourth entrenches the divergence the file's own header warns against.

#### 3. Overview cross-reference

**File**: `.github/instructions/01-overview.instructions.md`

**Intent**: The overview is the documented "read this first" file and already links the specialised modules; the release module has to be reachable from it or agents will not find it.

**Contract**: Add the release-process module to the module list at the top of the file, alongside Code Quality and Design System.

#### 4. Roadmap baseline correction

**File**: `context/foundation/roadmap.md`

**Intent**: Two baseline claims are contradicted by research and one is now resolved, and leaving them stale would misinform every downstream slice that reads the baseline as ground truth.

**Contract**: In the `## Baseline` section's Deploy/infra bullet: replace "`.github/workflows/` is empty" with the accurate statement that it is absent, and replace the unverified "Merging to `main` publishes with no gate in front of it" with the Phase 1 observed behaviour. Add the branch topology fact the baseline omits entirely — that `development` exists, is the GitHub default branch, and is already receiving PRs. Update F-02's `Status:` from `ready` to reflect the work being in flight, and update the frontmatter `updated:` date.

#### 5. Change record

**File**: `context/changes/v1-release-staging/change.md`

**Intent**: Keep the change identity file honest about status.

**Contract**: `status: planned` → `in-progress` (or the project's equivalent in-flight value), `updated: 2026-07-23`.

### Success Criteria:

#### Automated Verification:

- Type check passes: `npx tsc --noEmit`
- Lint passes: `yarn lint`
- Build passes: `yarn build`
- Formatting is clean: `npx prettier --check "**/*.md"`
- The new module exists: `test -f .github/instructions/04-releaseProcess.instructions.md`
- Every module linked from the index resolves to a real file (no broken relative links in `.github/copilot-instructions.md`)
- No source or config files were touched: `git diff --name-only main...HEAD` lists only `.github/**/*.md` and `context/**/*.md`

#### Manual Verification:

- The release module states unambiguously which branch publishes to chrobok.dev — a reader who knows nothing about this change can answer that question from it alone
- The roadmap baseline no longer contains the "`.github/workflows/` is empty" or unverified-publish claims
- Commit message passes commitlint (conventional format, `docs:` type) and the branch name satisfies `validate-branch-name`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Prove the insulation with a live smoke test

### Overview

Merge Phase 2's docs-only commit into `development` through a PR and observe the two things that must be true: the branch preview rebuilds, and production does not. This is the step that converts the whole foundation from a configured intention into an observed fact.

### Changes Required:

#### 1. Pull request into `development`

**File**: none — GitHub PR

**Intent**: Exercise the real merge path the five content slices will use, with a payload that cannot damage the live site even if the wiring turns out to be inverted.

**Contract**: Base `development`, head the Phase 2 feature branch (`docs/…` per the `validate-branch-name` pattern). Merged, not squashed-into-`main`; `main` is not touched in this phase.

#### 2. Production baseline capture (before the merge)

**File**: none — captured to the scratchpad, not the repo

**Intent**: Because both branches build identical output, "production is unchanged" needs a *before* value to compare against. Without capturing it first, the smoke test cannot distinguish "production didn't deploy" from "production deployed the same thing".

**Contract**: Record, before merging, the production response's `etag`/`last-modified` and `x-vercel-id` headers plus a hash of the served HTML. Compare the same values after the merge. A changed `age`/`x-vercel-cache` value is expected noise; a changed `etag` or `last-modified` on the HTML document is a failure signal.

### Success Criteria:

#### Automated Verification:

- Production still responds 200: `curl -sSI https://www.chrobok.dev | head -1`
- Production HTML is unchanged from the pre-merge capture: `curl -sS https://www.chrobok.dev | shasum` matches the baseline hash
- Production `last-modified` / `etag` headers match the pre-merge capture
- `main` did not move: `git fetch origin && git rev-parse origin/main` equals its pre-merge value
- `development` contains the docs commit: `git log --oneline origin/development -1`

#### Manual Verification:

- Vercel shows a **Preview** deployment (not Production) for the `development` merge, with the branch shown as `development`
- The `development` branch preview URL loads and serves the placeholder page — confirming the preview environment actually builds this project successfully
- No new **Production** deployment appears in Vercel's deployment list for this merge
- `https://www.chrobok.dev` still shows "Work in progress…" in a real browser
- The stable `development` preview URL is recorded in `change.md` Notes, so S-01 through S-07 have a known review target

**Implementation Note**: This is the final phase. If any production-side check fails, stop — the topology is inverted and S-01 must not start. Treat that as a Phase 1 regression, not a Phase 3 defect.

---

## Testing Strategy

There is no application code in this change, so the testing strategy is observational rather than unit-based.

### Unit Tests:

- None. No source files change, and the repo has no test runner (recorded in the roadmap baseline as deliberate for v1).

### Integration Tests:

- Phase 3's smoke test *is* the integration test: a real PR through the real merge path against the real deployment platform.

### Manual Testing Steps:

1. Before merging Phase 2, capture the production baseline: response headers and an HTML hash for `https://www.chrobok.dev`.
2. Open and merge the Phase 2 PR into `development`.
3. Watch the Vercel deployment list — confirm exactly one new deployment appears and it is labelled Preview against branch `development`.
4. Load the `development` branch preview URL; confirm it builds and serves the placeholder.
5. Re-fetch production; confirm status, hash and `last-modified` are identical to the baseline.
6. Confirm in a browser that `chrobok.dev` still shows "Work in progress…".

## Performance Considerations

None. No runtime code changes, no added dependencies, no change to the build. `yarn build` continues to run `astro check && astro build`.

## Migration Notes

No data or schema. The only migration is procedural, and it is already partly complete: PRs #8–#11 targeted `main` and #12 targeted `development`. From this change onward, `main` receives exactly one PR before the cutover — the S-08 promotion — and every other v1 PR targets `development`.

If Phase 1 finds Vercel's Production Branch set to `development`, note that PR #12 was already published to production. That has no content consequence (both branches serve identical output) but it does mean the window in which a partial page could have shipped was already open, and the roadmap's risk framing for F-02 was understated rather than precautionary.

## References

- Roadmap item: `context/foundation/roadmap.md` — F-02 (`v1-release-staging`), Streams table (Stream B), Baseline
- PRD: `context/foundation/prd.md` — §Success Criteria (primary), §Guardrails ("the site survives a technical inspection")
- Downstream dependency: F-03 (`inspection-gate`) owns CI gating and `development` branch protection
- North star: S-08 (`v1-production-cutover`) is the single `development` → `main` promotion this foundation enables
- Existing instruction modules: `.github/instructions/01-overview.instructions.md`, `.github/copilot-instructions.md`
- Local gates: `.husky/pre-commit`, `.husky/commit-msg`, `package.json` (`build`, `lint`, `validate-branch-name`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Observe and correct the release topology

#### Automated

- [x] 1.1 `main` protection intact (`required_linear_history`, no force-push) — fdd1fcc
- [x] 1.2 `development` unprotected (protection endpoint returns 404) — fdd1fcc
- [x] 1.3 Working tree clean apart from `change.md` — fdd1fcc

#### Manual

- [x] 1.4 Vercel Production Branch = `main` — fdd1fcc
- [x] 1.5 Pre-change observed value recorded in `change.md` Notes — fdd1fcc
- [x] 1.6 `https://www.chrobok.dev` serves the placeholder and returns 200 — fdd1fcc

### Phase 2: Document the release model in the repo

#### Automated

- [x] 2.1 Type check passes (`npx tsc --noEmit`)
- [x] 2.2 Lint passes (`yarn lint`)
- [x] 2.3 Build passes (`yarn build`)
- [x] 2.4 Markdown formatting clean (`npx prettier --check "**/*.md"`)
- [x] 2.5 `.github/instructions/04-releaseProcess.instructions.md` exists
- [x] 2.6 All index links in `copilot-instructions.md` resolve to real files
- [x] 2.7 Diff touches only `.github/**/*.md` and `context/**/*.md` (checked against `origin/development`, the real merge base; `main...HEAD` also shows PR #12's husky/commitlint files, which this change did not touch)

#### Manual

- [x] 2.8 Release module unambiguously names the publishing branch
- [x] 2.9 Roadmap baseline no longer contains the stale workflows/publish claims
- [x] 2.10 Commit message passes commitlint; branch name passes `validate-branch-name`

### Phase 3: Prove the insulation with a live smoke test

#### Automated

- [ ] 3.1 Production responds 200
- [ ] 3.2 Production HTML hash matches pre-merge baseline
- [ ] 3.3 Production `last-modified` / `etag` match pre-merge baseline
- [ ] 3.4 `origin/main` unmoved
- [ ] 3.5 `origin/development` contains the docs commit

#### Manual

- [ ] 3.6 Vercel shows a Preview deployment for branch `development`
- [ ] 3.7 The `development` preview URL builds and serves the placeholder
- [ ] 3.8 No new Production deployment appeared for this merge
- [ ] 3.9 `chrobok.dev` still shows "Work in progress…" in a browser
- [ ] 3.10 Stable `development` preview URL recorded in `change.md` Notes
