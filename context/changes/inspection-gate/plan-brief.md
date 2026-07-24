# F-03 Inspection Gate — Plan Brief

> Full plan: `context/changes/inspection-gate/plan.md`
> Research: `context/changes/inspection-gate/research.md`

## What & Why

Roadmap F-03: gate every merge into `development` on build, type-check **and lint**, and make the
NFR inspection checklist a repeatable run rather than a memory exercise. It converts the
"site survives a technical inspection" guardrail from a promise into a check that fails loudly.

## Starting Point

`development` has zero branch protection; `main` is already protected. Build + type-check already
run on every PR via Vercel (`yarn build` = `astro check && astro build`, posted as the `Vercel`
commit status). Lint has no server-side gate — only a bypassable husky hook. No `.github/`, no CI,
no test runner exist yet.

## Desired End State

Every PR into `development` carries two required checks — `lint` (a new tiny Actions workflow) and
`Vercel` (build + types) — and can't be squash-merged until both pass. A `docs/nfr-inspection.md`
runbook exists that the author runs once before the `development → main` cutover, covering all four
NFRs (perf/no-CLS, a11y, no-JS, cross-engine) plus the guardrail.

## Key Decisions Made

| Decision                     | Choice                                  | Why (1 sentence)                                                              | Source   |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| Build/type gate mechanism    | Vercel deploy status (`Vercel`)         | Vercel already runs `astro check && astro build`; no new CI needed.          | Research |
| Lint gate mechanism          | Tiny lint-only Actions workflow         | Vercel doesn't run eslint; husky is bypassable — a ~15-line job closes it.    | Research |
| `astro check` in workflow    | No — leave types to Vercel              | Duplicating doubles job time for zero coverage gain.                          | Research |
| Node version                 | Node 22                                 | Valid for Astro 5, future-proofs the Astro 6 (22.12+) bump.                   | Research |
| NFR checklist                | Manual Markdown runbook + serve script  | `top_blocker: time`; CI'd NFRs aren't worth it for a solo static page.       | Plan     |
| Required checks              | `lint` + `Vercel`                       | Full build+types+lint coverage exactly as the F-03 outcome requires.         | Plan     |
| PR-review requirement        | None — status checks only               | Keeps a direct-push escape hatch; normal path is still a gated PR.            | Plan     |
| `strict` / `enforce_admins`  | Both OFF                                | Avoids forced rebuilds under squash-only; parity with `main`.                | Plan     |

## Scope

**In scope:** lint-only CI workflow; `development` branch protection (`lint` + `Vercel`); NFR
runbook + serve script.

**Out of scope:** automating NFRs in CI (Lighthouse/axe/Playwright/no-JS); `vercel.json`;
`push:`/scheduled triggers; repo-wide `prettier --check`; any change to `main` protection; a
PR-review requirement on `development`.

## Architecture / Approach

Two phases across a merge boundary. **Phase 1** authors three files (`.github/workflows/inspect.yml`,
`docs/nfr-inspection.md`, `scripts/nfr-serve.sh`) and lands them in `development` via a PR — on that
PR `lint` runs for the first time, unblocked. **Phase 2** applies branch protection requiring
`lint` + `Vercel` via `gh api`, but only after the Phase 1 PR is squash-merged. The order is
mandatory: requiring `lint` before it has ever reported would deadlock every PR.

## Phases at a Glance

| Phase                          | What it delivers                                        | Key risk                                              |
| ------------------------------ | ------------------------------------------------------- | ----------------------------------------------------- |
| 1. Author gate artifacts       | Workflow + NFR runbook + serve script, merged via PR    | First PR must be green (`yarn lint` verified clean)   |
| 2. Apply branch protection     | `development` requires `lint` + `Vercel`                | Must run AFTER merge, else required-check deadlock     |

**Prerequisites:** F-02 done (it deliberately left `development` unprotected as the attachment
point). Admin `gh` access via the `Pokerek` account (verified). `yarn lint` passes clean today.
**Estimated effort:** ~1 session, 2 phases.

## Open Risks & Assumptions

- Direct pushes to `development` bypass lint (workflow is PR-only); this is an intentional
  admin escape hatch given no PR-review requirement.
- Vercel previews sit behind Deployment Protection (SSO) — the runbook targets a LOCAL build for the
  no-JS / cross-engine checks, not the anonymous preview URL.
- Uses the `Pokerek` account (repo owner), NOT the global-default `Karol-Chrobok`, which 404s here.

## Success Criteria (Summary)

- A PR into `development` cannot squash-merge until `lint` and `Vercel` are both green.
- `docs/nfr-inspection.md` is a concrete, runnable checklist the author executes before the v1 cutover.
- Nothing about `main` or the existing Vercel deploy flow changed.
