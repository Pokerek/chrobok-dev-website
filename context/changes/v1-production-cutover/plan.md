# v1 Production Cutover Implementation Plan

## Overview

Publish v1 to https://www.chrobok.dev by fast-forwarding `main` to `development`, retiring the
"Work in progress…" placeholder. This is roadmap S-08, the north star: the only slice that changes
what a recruiter actually sees.

No application code changes. The placeholder disappears as a consequence of the fast-forward, not
as an edit. The work in this plan is (a) correcting release documentation that describes a merge
model this change replaces, (b) correcting a roadmap record that is factually stale, and (c)
executing the release ritual safely.

## Current State Analysis

**`main` is a strict ancestor of `development`.** 18 commits behind, 0 ahead, 95 files changed
(+7356 / −621). There is nothing to reconcile — `main` can be moved forward without rewriting or
merging anything.

**Production currently serves the placeholder.** `https://www.chrobok.dev` returns `200` with
`<title>Chrobok.dev</title>` and the string `Work in progress...`; `https://chrobok.dev` returns
`308` to the `www` host. The placeholder lives only at `main:src/pages/index.astro` plus
`main:public/images/monk.webp` — both already replaced/deleted on `development`.

**Both roadmap blockers on S-08 are already resolved, and the roadmap does not know it:**

- `public/karol_chrobok_cv.pdf` (115.8 KB) is committed and wired via `CV_PATH` at
  `src/constants/contact.constants.ts:3`. This was the hard blocker (PRD Open Question 3,
  `roadmap.md:259`).
- The `@astrojs/react` question (`roadmap.md:262-266`) is settled: React, `react-dom`,
  `@astrojs/react`, `@radix-ui/react-slot` and `lucide-react` are gone from `package.json`, and
  `git ls-tree -r --name-only HEAD` returns no `.tsx` or `.jsx` files.

`roadmap.md:60` and `roadmap.md:268` nonetheless still record S-08 as `blocked`.

**The release mechanism documented in `.claude/rules/release-process.md` is not the one being
used.** That file states "The single `development` → `main` PR is the v1 release event" and
"Squash is the only merge method". The repo settings confirm the constraint —
`allow_merge_commit: false`, `allow_rebase_merge: false`, `allow_squash_merge: true`,
`required_linear_history: true` — but a squash merge would put a commit on `main` that never
exists in `development`'s history, permanently forking the two branches at the exact moment they
are content-identical.

**A fast-forward push is available and is not blocked by protection.** `main`'s protection has
`enforce_admins: false`, and the repo owner holds `admin`. `allow_force_pushes: false` does not
apply because a fast-forward is not a force-push, and `required_linear_history: true` is satisfied
trivially because no merge commit is created. `git push origin development:main` therefore
succeeds and preserves all 18 commits.

**CI does not cover a PR into `main`.** `.github/workflows/inspect.yml` filters on
`pull_request: branches: [development]`, and `main`'s protection has `required_status_checks: null`.
The release PR gets no lint job. It does get a Vercel preview deployment, which runs
`astro check && astro build` — that is the build gate.

### Key Discoveries:

- `git merge-base --is-ancestor main development` succeeds — the fast-forward is legal today.
- `enforce_admins: false` on `main` is what makes the FF push possible; it is a deliberate
  affordance, not a misconfiguration, and nothing currently records that.
- The release SHA (`e5149e3`) has already built green as the `development` preview deployment, so
  the production build is not a first attempt at that tree.
- `delete_branch_on_merge: true` is set repo-wide. GitHub will auto-close the release PR as merged
  once the FF push lands; head-branch auto-deletion is tied to the merge action rather than
  push-detected merges, so `development` is expected to survive (see Open Risks).
- The finished page is five section components — `Hero`, `Work`, `Skills`, `About`, `Contact` in
  `src/pages/index.astro` — rendering the PRD's seven-step reading order (`prd.md:68-75`).

## Desired End State

`https://www.chrobok.dev` serves the complete page. No "Work in progress" string exists anywhere on
production. `git rev-parse main` equals `git rev-parse development`. The release documentation
describes the ritual that was actually performed, and roadmap S-08 is closed with its blockers
recorded as resolved rather than outstanding.

Verified by: the Phase 3 smoke checklist, and `git rev-parse main development` returning one SHA
twice.

## What We're NOT Doing

- **No application code changes.** Not a single file under `src/` is touched by this plan.
- **No CI workflow changes.** `inspect.yml` keeps its `branches: [development]` filter; the Vercel
  preview build on the release PR is the accepted gate.
- **No required status checks on `main`.** Arming a required check name on production with one PR
  of evidence that it fires is the exact failure mode `release-process.md` already warns about for
  `development`.
- **No full NFR runbook re-run.** S-07 passed it; `docs/nfr-inspection.md` stays available but this
  release does not re-execute it.
- **No broader roadmap reconciliation.** Open Questions 2 (OG metadata declined, but it shipped),
  4 and 5 stay as they are. Only S-08's own record is corrected.
- **No `tasks-linear.md` snapshot refresh.** That table is documented as point-in-time; Linear is
  the live source.
- **No `vercel.json`, no domain or DNS changes.** The apex → `www` 308 already works.

## Implementation Approach

Three phases, ordered by irreversibility.

Phase 1 changes only documentation, on a feature branch. Phase 2 lands that on `development`
through the normal squash-merge PR flow, including the `/10x-archive` bookkeeping — so that when
`main` moves, it moves to a tip where the record is already correct and complete. Phase 3 opens a
PR against `main` for review and for its Vercel build, then closes it with a fast-forward push
rather than the merge button, and verifies production.

Bookkeeping deliberately precedes the release: the alternative leaves `main` trailing `development`
by one commit until the next release. The cost is that the done-record briefly claims completion
before production proves it — accepted, because Vercel instant rollback makes the window short and
the record correctable.

## Critical Implementation Details

**The release PR is opened but never merged through GitHub.** Clicking "Squash and merge" — the
only button GitHub offers on this repo — produces exactly the divergent history the fast-forward
exists to avoid. The PR is a review surface and a build trigger; `git push origin development:main`
is what lands it, after which GitHub marks the PR merged on its own.

**Phase 2 must complete before Phase 3 begins.** `/pr-merge` squash-merges the feature branch into
`development`, which rewrites the tip SHA. Opening the release PR before that means releasing a
`development` that does not yet contain its own archive commit.

## Phase 1: Correct the release model and the roadmap record

### Overview

Bring `.claude/rules/release-process.md`, `CLAUDE.md` and the roadmap S-08 entry in line with the
release that is about to happen. Documentation-only; no `src/` changes.

### Changes Required:

#### 1. Release process rule

**File**: `.claude/rules/release-process.md`

**Intent**: The file currently defines the v1 release as "the single `development` → `main` PR"
merged by squash. Replace that with the fast-forward-push ritual, and record why it is permitted so
a future reader does not mistake `enforce_admins: false` for a hole to be plugged.

**Contract**: Three sections change.

- The `## main is production` section: the "do **not** target a PR at `main`" prohibition must be
  re-scoped. It applies to feature branches, always. The `development` → `main` release PR becomes
  the documented exception — opened for review and for its Vercel preview build, closed by push.
- The `## Branch model` numbered list gains the release ritual as an explicit sequence: open the PR
  against `main`, wait for the Vercel preview deployment to build green, then
  `git push origin development:main`, then verify production. State plainly that the merge button
  must not be used and why (squash forks the history at the moment the branches are identical).
- `## Repository constraints`: the "Squash is the only merge method" bullet is true of the *button*
  but no longer true of the release path. Qualify it, and add that `main`'s protection sets
  `enforce_admins: false`, which is what allows an admin's fast-forward push through — deliberate,
  and load-bearing for the release.

Keep the existing statement that `main` requires a PR: it still does for anyone without admin, and
the release ritual opens one anyway.

#### 2. Project instructions

**File**: `CLAUDE.md`

**Intent**: The `## CRITICAL: main is production` section says "**Never open a PR against `main`**
while v1 is being built", which directly contradicts the release ritual it is about to gain.

**Contract**: Narrow the prohibition to feature branches and point at
`.claude/rules/release-process.md` for the release exception. Do not expand this section — the rule
file owns the detail.

#### 3. Roadmap S-08 entry

**File**: `context/foundation/roadmap.md`

**Intent**: S-08 records two blockers that are resolved and a status that is wrong. Correct the
record before closing the item, so the archive reflects what actually happened rather than
retroactively erasing the blockers.

**Contract**: Four edits.

- `roadmap.md:60` (At a glance table, S-08 row): `blocked` → `ready`.
- `roadmap.md:259` (Blockers): the CV PDF exists at `public/karol_chrobok_cv.pdf` and is wired via
  `CV_PATH` in `src/constants/contact.constants.ts` — record it as resolved, dated, rather than
  deleting the line.
- `roadmap.md:260-266` (Unknowns): mark both resolved. The CV unknown resolves as above; the
  `@astrojs/react` unknown resolved in S-07 by dropping the integration, and the ~143 kB
  `client.*.js` bundle it describes no longer ships.
- `roadmap.md:268` (Status): `blocked` → `ready`. `/10x-archive` moves it to `done` in Phase 2.
- `roadmap.md:284` (Backlog Handoff row): `Ready for /10x-plan` `no` → `yes`; Notes "Blocked on the
  CV PDF" → the blocker's resolution.

### Success Criteria:

#### Automated Verification:

- Build and type-check pass: `yarn build`
- Lint passes: `yarn lint`
- No `src/` file is modified: `git diff --name-only development -- src/` is empty

#### Manual Verification:

- `.claude/rules/release-process.md` describes the fast-forward ritual and matches the actual repo
  settings (`enforce_admins: false`, `allow_squash_merge` only, `required_linear_history: true`)
- `CLAUDE.md` and the rule file no longer contradict each other on PRs against `main`
- No roadmap entry outside S-08 was edited

**Implementation Note**: After completing this phase and all automated verification passes, pause
here for manual confirmation from the human that the manual testing was successful before
proceeding to the next phase.

---

## Phase 2: Pre-flight and land on `development`

### Overview

Get the documentation corrections and the change's own bookkeeping onto `development`, so that the
branch `main` is about to fast-forward to is complete. This is the last point at which anything is
reversible without touching production.

### Changes Required:

#### 1. Pre-flight build

**File**: — (no file changes)

**Intent**: Confirm the exact tree about to be published builds clean, using the same command Vercel
will run.

**Contract**: `yarn build` — which is `astro check && astro build`, per `package.json:15`. A type
error here is a failed production deploy later.

#### 2. Land on `development`

**File**: — (skill-driven; no manual file edits)

**Intent**: Open the feature PR, archive the change, squash-merge into `development`.

**Contract**: `/pr-ready v1-production-cutover` opens the PR against `development` and moves
CHR-38 to In Review. `/pr-merge v1-production-cutover` runs `/10x-archive` (which closes roadmap
S-08 to `done` and moves `context/changes/v1-production-cutover/` to
`context/archive/2026-07-28-v1-production-cutover/`), pushes that commit into the PR, waits for
`inspect` to pass, squash-merges with `--delete-branch`, and moves CHR-38 to Done.

Note the sequencing consequence accepted during planning: CHR-38 reaches Done before production is
live. If Phase 3 rolls back, the tracker is corrected manually.

### Success Criteria:

#### Automated Verification:

- Pre-flight build passes: `yarn build`
- The `inspect` workflow passes on the feature PR
- After merge, the change folder has moved:
  `test -d context/archive/2026-07-28-v1-production-cutover`
- After merge, `main` is still a strict ancestor of `development`:
  `git merge-base --is-ancestor main origin/development`

#### Manual Verification:

- The `development` preview deployment renders the full five-section page
- Roadmap S-08 reads `done` on `development`
- CHR-38 is Done in Linear

**Implementation Note**: After completing this phase and all automated verification passes, pause
here for manual confirmation from the human that the manual testing was successful before
proceeding to the next phase. Phase 3 is the irreversible one.

---

## Phase 3: Release PR, fast-forward push, verify production

### Overview

Open the release PR against `main` for review and its Vercel build, land it with a fast-forward
push, and verify the live site.

### Changes Required:

#### 1. Release PR

**File**: — (no file changes)

**Intent**: Create the review surface and trigger the Vercel preview build that serves as this
release's only pre-promotion gate.

**Contract**: `gh pr create --base main --head development` with a release summary covering the 18
commits and the placeholder retirement. The PR body must state that it will be closed by a
fast-forward push, not the merge button — the button is a live footgun on this PR.

Wait for the Vercel preview deployment to report success before proceeding. `inspect` will not run
here (`branches: [development]`).

#### 2. Fast-forward push

**File**: — (no file changes)

**Intent**: Move `main` to `development`'s tip without creating a commit that `development` lacks.

**Contract**: `git push origin development:main`. Succeeds because `main` is a strict ancestor and
`enforce_admins: false` lets an admin through branch protection. GitHub then auto-closes the release
PR as merged.

Verify with `git rev-parse origin/main origin/development` returning the same SHA twice.

#### 3. Production verification

**File**: — (no file changes)

**Intent**: Confirm the release did what it was for, covering exactly the failure modes this change
can produce.

**Contract**: The smoke checklist, against `https://www.chrobok.dev`:

- `200` and no `Work in progress` string in the response body
- All five sections present (`Hero`, `Work`, `Skills`, `About`, `Contact` anchors)
- `/karol_chrobok_cv.pdf` returns `200` with `content-type: application/pdf` — FR-011 depends on it
- `https://chrobok.dev` still returns `308` to the `www` host
- No `<script` tag in the served HTML — the zero-client-JS guarantee CLAUDE.md asserts

### Success Criteria:

#### Automated Verification:

- `main` and `development` point at the same commit:
  `[ "$(git rev-parse origin/main)" = "$(git rev-parse origin/development)" ]`
- Production returns 200: `curl -sf -o /dev/null https://www.chrobok.dev`
- Placeholder is gone: `curl -s https://www.chrobok.dev | grep -q 'Work in progress' && exit 1 || exit 0`
- CV PDF is reachable: `curl -sf -o /dev/null https://www.chrobok.dev/karol_chrobok_cv.pdf`
- Apex still redirects: `curl -s -o /dev/null -w '%{http_code}' https://chrobok.dev` returns `308`
- No client JS: `curl -s https://www.chrobok.dev | grep -q '<script' && exit 1 || exit 0`

#### Manual Verification:

- The page renders correctly on a phone and on desktop
- The Vercel dashboard shows the production deployment as Ready and promoted
- The release PR shows as merged on GitHub, and `development` still exists as a branch
- Sticky section navigation jumps to each section on the live site

## Testing Strategy

There are no automated tests in this repository, and this change adds no code, so testing is the
build gate plus the production smoke checklist.

### Manual Testing Steps:

1. `yarn build` locally before opening the release PR
2. Confirm the Vercel preview deployment on the release PR reports success
3. After the fast-forward push, run the six automated smoke checks in Phase 3
4. Load `https://www.chrobok.dev` on a phone and on desktop and scroll the full page
5. Click the CV link and confirm the PDF opens

## Migration Notes

**Rollback**: Vercel instant rollback — promote the previous production deployment (the placeholder)
from the Vercel dashboard. Recovery is seconds and touches no git history, which matters because
`main` forbids force-pushes. Git and production drift until a fix lands; that is the accepted cost.

Do not attempt to roll back by resetting `main` — `allow_force_pushes: false` blocks it, and
`enforce_admins: false` does not help because a reset is a non-fast-forward push.

**After the release**, `main` and `development` are identical and every subsequent release is
another fast-forward. This is the property the squash merge would have destroyed.

## Open Risks & Assumptions

- **The merge button is live on the release PR.** GitHub offers "Squash and merge" and nothing
  prevents a click. Mitigation: the PR body states it must not be used. If it is clicked, the
  fast-forward property is lost permanently and `development` must be reset to `main`.
- **`delete_branch_on_merge: true` may delete `development`.** Auto-deletion is tied to the merge
  action rather than push-detected merges, so this is not expected. If it happens, `main` and
  `development` are identical at that instant, so `git push origin main:development` restores it
  with nothing lost.
- **The production build is Vercel's first build of this tree on `main`.** The same SHA already
  built green as the `development` preview, so the risk is low; if it fails, Vercel does not promote
  and the placeholder keeps serving.
- **CHR-38 reaches Done before production is verified**, a consequence of the bookkeeping-first
  sequencing. Corrected manually if Phase 3 rolls back.
- **Assumption**: the Vercel Production Branch is still `main`. Not verifiable from this repo — no
  `vercel.json` exists and the setting lives in the dashboard. If it has changed, the fast-forward
  push publishes nothing.

## References

- Roadmap slice: `context/foundation/roadmap.md:252-268` (S-08)
- Release rules being rewritten: `.claude/rules/release-process.md`
- PRD success criteria closed by this release: `context/foundation/prd.md:63-92`
- CV path wired at: `src/constants/contact.constants.ts:3`
- NFR runbook (available, not re-run): `docs/nfr-inspection.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Correct the release model and the roadmap record

#### Automated

- [x] 1.1 Build and type-check pass: `yarn build`
- [x] 1.2 Lint passes: `yarn lint`
- [x] 1.3 No `src/` file is modified

#### Manual

- [ ] 1.4 Release rule describes the fast-forward ritual and matches actual repo settings
- [ ] 1.5 `CLAUDE.md` and the rule file no longer contradict each other on PRs against `main`
- [ ] 1.6 No roadmap entry outside S-08 was edited

### Phase 2: Pre-flight and land on `development`

#### Automated

- [ ] 2.1 Pre-flight build passes: `yarn build`
- [ ] 2.2 The `inspect` workflow passes on the feature PR
- [ ] 2.3 Change folder has moved to `context/archive/2026-07-28-v1-production-cutover`
- [ ] 2.4 `main` is still a strict ancestor of `development`

#### Manual

- [ ] 2.5 The `development` preview renders the full five-section page
- [ ] 2.6 Roadmap S-08 reads `done` on `development`
- [ ] 2.7 CHR-38 is Done in Linear

### Phase 3: Release PR, fast-forward push, verify production

#### Automated

- [ ] 3.1 `main` and `development` point at the same commit
- [ ] 3.2 Production returns 200
- [ ] 3.3 Placeholder string is gone from production
- [ ] 3.4 CV PDF is reachable at `/karol_chrobok_cv.pdf`
- [ ] 3.5 Apex still returns 308 to the `www` host
- [ ] 3.6 No `<script` tag in the served HTML

#### Manual

- [ ] 3.7 The page renders correctly on a phone and on desktop
- [ ] 3.8 Vercel shows the production deployment Ready and promoted
- [ ] 3.9 The release PR shows as merged and `development` still exists
- [ ] 3.10 Sticky section navigation jumps to each section on the live site
