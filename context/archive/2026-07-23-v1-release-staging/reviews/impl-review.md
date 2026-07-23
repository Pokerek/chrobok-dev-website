<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: V1 Release Staging

- **Plan**: `context/changes/v1-release-staging/plan.md`
- **Scope**: All 3 phases
- **Date**: 2026-07-23
- **Verdict**: NEEDS ATTENTION (both warnings fixed during triage)
- **Findings**: 0 critical, 2 warnings, 3 observations

## Verdicts

| Dimension           | Verdict                  |
| ------------------- | ------------------------ |
| Plan Adherence      | PASS                     |
| Scope Discipline    | WARNING                  |
| Safety & Quality    | PASS                     |
| Architecture        | PASS                     |
| Pattern Consistency | PASS                     |
| Success Criteria    | PASS (26/26 re-verified) |

## Method

Reviewed inline rather than via sub-agents: the diff is 6 markdown files with no source code, so
a safety or pattern scan had nothing to bite on. All 26 automated success criteria were re-run
from scratch, not taken on trust from the implementation run.

Scope guardrails from "What We're NOT Doing" all held: `.github/workflows/` still absent, no
`vercel.json`, and zero changes to `src/`, `package.json`, `.husky/`, or the eslint config.

## Findings

### F1 — Release module offers a merge method the repo disallows

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `.github/instructions/04-releaseProcess.instructions.md`
- **Detail**: The Constraints section said the cutover PR must be "squash or rebase" and told the
  reader to choose "Squash and merge" or "Rebase and merge". The repo has
  `allow_rebase_merge: false` and `allow_merge_commit: false` — squash is the only method
  available. The stated cause was also wrong: the restriction is repo-wide, not a consequence of
  `main`'s `required_linear_history`. Hit for real in Phase 3 when `gh pr merge --merge` was
  rejected. Misleading at exactly the moment it matters — the S-08 cutover.
- **Fix**: State that squash is the only permitted method repo-wide, note `main`'s linear-history
  rule as a separate fact, and record `delete_branch_on_merge: true`.
- **Decision**: FIXED

### F2 — Preview SSO protection recorded only where it will be archived

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: `.github/instructions/04-releaseProcess.instructions.md`
- **Detail**: The branch table promised a "stable per-branch URL" without naming it, and omitted
  that it sits behind Vercel Deployment Protection. That finding lived only in `change.md` Notes,
  which `/10x-archive` relocates to `context/archive/` — away from where S-01..S-07 will look.
  F-02 exists to give the slices a known review target; the durable artifact named none.
- **Fix A ⭐ Recommended**: Add a "Where to review work in progress" section with the stable URL
  and the SSO caveat.
  - Strength: Puts the review target in the file slices actually read; survives archiving.
  - Tradeoff: A URL in a doc can go stale if the project is renamed.
  - Confidence: HIGH — the URL is verified to resolve.
  - Blind spot: Whether a project URL belongs in a tracked file at all.
- **Fix B**: Leave it in `change.md` only.
  - Strength: Keeps the module about policy, not environment detail.
  - Tradeoff: The information is effectively lost at archive time.
  - Confidence: MEDIUM.
  - Blind spot: None significant.
- **Decision**: FIXED via Fix A

### F3 — Unplanned Copilot→Claude Code TODO block

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Scope Discipline
- **Location**: `.github/copilot-instructions.md`
- **Detail**: Not in the plan; added at the user's direction during Phase 2 manual verification and
  documented in `change.md` as a deliberate call. Flagged for completeness only.
- **Decision**: NO ACTION

### F4 — Roadmap F-02 status is stale and off-vocabulary

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Adherence
- **Location**: `context/foundation/roadmap.md`
- **Detail**: Set to "in progress", a value the roadmap's existing vocabulary
  (proposed/ready/blocked) doesn't use, and now stale against `change.md`'s `implemented`.
  `/10x-archive` owns closing this to `done`, so it self-resolves on the next step.
- **Decision**: NO ACTION — resolved by `/10x-archive`

### F5 — Phase 3 squash deviation

- **Severity**: 📝 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Adherence
- **Location**: N/A
- **Detail**: The plan said "merged, not squashed"; the repo permits squash only. The plan's actual
  intent — that `main` is not touched — held. Documented in `change.md`.
- **Decision**: NO ACTION
