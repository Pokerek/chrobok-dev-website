---
name: pr-merge
description: Close out a reviewed change end-to-end — archive it, squash-merge its PR to main, and bring the trackers to their terminal state. Runs /10x-archive (which closes the matching roadmap item and commits the folder move), pushes that commit into the PR, waits for all GitHub checks to pass, squash-merges with --delete-branch, then moves the Linear issue to Done and closes the GitHub-mirror issue. This is the counterpart to /pr-ready (which only opens the PR + moves trackers to "in review"). Trigger on "/pr-merge <change-id>" or natural-language close-out requests like "the PR for places-schema-foundation is approved, merge it and close everything out" / "squash and merge this and archive the change" / "land this PR".
argument-hint: "<change-id>"
allowed-tools:
  - Read
  - Glob
  - Bash
  - AskUserQuestion
  - Skill
  - mcp__linear-server__get_issue
  - mcp__linear-server__save_issue
  - mcp__linear-server__list_issue_statuses
---

# /pr-merge — Land and close out a reviewed change

Take a change whose PR has been reviewed and approved and finish it: archive the change
folder (which also closes its roadmap item), squash-merge the PR onto `main`, delete the
branch, and move both tracker mirrors to their done/closed state. This is the
"it's approved, ship it and close everything out" button — the back half of the lifecycle
whose front half is `/pr-ready`.

The hard part of this skill is **ordering and gates**, not the individual commands. Each
step has a reason it comes where it does — read the "why" notes, because doing these out
of order (e.g. merging before the archive commit is pushed, or merging on red CI) produces
messes that are annoying to untangle: orphaned archive commits, a `main` that's missing the
folder move, or a closed issue for a change that didn't actually merge.

## Initial Response

If invoked with no argument, ask for the change-id:

```
Which change should I merge and close out? Give me its change-id (the kebab-case slug used
for its branch and context/changes/ folder), e.g.:

  /pr-merge places-schema-foundation

You can list in-flight changes with: ls context/changes/
```

Then wait. If the user instead describes the situation in prose ("the PR for X is approved,
merge it"), extract the change-id, match it against `ls context/changes/`, and confirm your
reading in the plan step rather than asking again.

## Step 1 — Resolve the change, its branch, and its open PR

This skill only makes sense once `/pr-ready` has already run, so the precondition is an
**open PR**. Establish all three anchors before touching anything.

1. Read `context/changes/<change-id>/change.md` frontmatter for `title` and `status`.
   - If `context/changes/<change-id>/` doesn't exist, **check whether it's already
     archived** before giving up: look for a folder `context/archive/*-<change-id>/`
     (the archive layout is `context/archive/<created-date>-<change-id>/`). If exactly one
     matches, the change was archived in an earlier session — note "**already archived at
     `<path>`**", set an `already_archived` flag for Step 2, and read `title`/`status` from
     that folder's `change.md` instead. This is a normal state: `/10x-archive` and the
     merge can happen in separate sittings, and re-archiving would just error.
   - If neither `context/changes/<change-id>/` nor an `context/archive/*-<change-id>/`
     folder exists, list `context/changes/` and ask the user to pick the right slug —
     don't guess at a fuzzy match.
   - `status` should be `impl_reviewed` (review happened) or `archived` (already closed
     out). If it's anything else, surface it as a heads-up and ask whether to continue —
     the user knows their own state, but merging something that was never reviewed is worth
     a deliberate "yes".
2. Find the branch (same resolution as `/pr-ready`):
   ```bash
   git branch --list "*<change-id>*" "*$(echo <change-id> | tr '-' '_')*"
   ```
   If exactly one local branch matches, use it; if several or none, ask which branch.
3. Find the open PR for that branch:
   ```bash
   gh pr list --head <branch> --state open --json number,title,url,reviewDecision,statusCheckRollup
   ```
   - **No open PR** → stop and tell the user to run `/pr-ready <change-id>` first. This
     skill closes things out; it does not open the PR.
   - If `reviewDecision` is `CHANGES_REQUESTED` or there's no approving review yet, say so
     and ask whether to merge anyway — "reviewed and approved" is the assumed precondition,
     so a missing approval is worth flagging, not silently merging past.

   `gh` may be authenticated as multiple accounts (`gh auth status`); if it can't resolve
   the repo, `gh auth switch --user <owner-of-the-remote>` — the owner is in `git remote -v`.

## Step 2 — Show the plan, then archive

You're about to take irreversible-ish actions (a commit, a force-of-history merge, a branch
deletion, two issue state changes). Show the user one short plan and proceed — this is a
heads-up, not a gate, but it's their last easy chance to stop you if a resolved number looks
wrong:

```
Closing out <change-id> (PR #<n>, "<pr title>"):
  1. /10x-archive <change-id>      → closes roadmap item, commits the folder move
  2. push the archive commit into PR #<n>, wait for CI to go green
  3. squash-merge PR #<n> --delete-branch
  4. Linear <CHR-n> → Done · GitHub mirror issue #<n> → closed
```

**If Step 1 set the `already_archived` flag, skip the archive entirely** — note "archive
already done in a prior session, its commit is part of the PR history; proceeding to push +
merge" and go straight to Step 3. Re-running `/10x-archive` on an archived change just
errors (`already archived`), so don't.

Otherwise, **invoke the `/10x-archive` skill** with the change-id (via the Skill tool). Run
it **while checked out on the feature branch** so its `chore(archive): close <change-id>`
commit lands on the branch — and therefore inside this PR. That's the whole reason archive
comes before the merge: we want the folder move + roadmap close to be part of the squashed
history on `main`, not stranded on a branch that's about to be deleted.

`/10x-archive` has its own warn-and-confirm gate (incomplete progress, missing impl-review,
etc.) and a hard block on uncommitted changes. **Respect its outcome:**

- If archive **completes** (folder moved, commit created) → continue to Step 3.
- If archive is **cancelled / blocked / the user picks "Resume implementation"** → STOP
  here. Do not merge. A change that wasn't clean enough to archive isn't ready to land.

## Step 3 — Push the archive commit into the PR

```bash
git push
```

The PR now contains the archive commit. Confirm `git status -sb` shows the branch is not
ahead of its upstream anymore (everything is pushed). If `git push` reports the branch is
behind / rejected, the remote moved — stop and let the user reconcile rather than force-pushing.

## Step 4 — Gate on green CI

This is the user's explicit "check that all checks have passed" gate, and it runs *after*
the push so it validates the exact content that will merge:

```bash
gh pr checks <number> --watch --fail-fast
```

`--watch` blocks until every check finishes; `--fail-fast` makes it exit non-zero the moment
one fails. Read the exit code:

- **Exit 0** → all checks green, continue to Step 5.
- **Non-zero** → checks failed or were cancelled. STOP and report which ones (`gh pr checks
  <number>` for the table). Do not merge red CI — fixing on `main` after the fact is exactly
  the round-trip this gate exists to prevent.

If the repo has **no checks configured** (`gh pr checks` says "no checks"), there's nothing
to gate on — note that and continue.

## Step 5 — Squash-merge and delete the branch

```bash
gh pr merge <number> --squash --delete-branch
```

Squash keeps `main` to one commit per change. `--delete-branch` removes the merged branch
(remote + local) — `gh` switches you to `main` as part of this. Confirm the merge landed:

```bash
gh pr view <number> --json state,mergedAt   # state should be MERGED
```

If the merge fails (e.g. branch protection needs an approval `gh` can't satisfy, or a
late-arriving conflict), STOP and report — don't retry with bypass flags.

## Step 6 — Bring the trackers to their terminal state

The roadmap item is already closed (that happened inside `/10x-archive`). What's left is the
two issue mirrors. Use the same mapping logic `/pr-ready` uses.

### 6.1 Resolve the issue mapping

Read `context/foundation/tasks-linear.md` and `context/foundation/tasks-github.md`. Both
carry an "Issue mapping" table keyed via the roadmap ID. Cross-reference
`context/foundation/roadmap.md`'s **Change ID** column to get from `<change-id>` to a
roadmap ID (`F-01` / `S-02`), then to the Linear identifier (`CHR-n`) and the GitHub issue
number (`#n`).

If you can't find an unambiguous row — the change-id isn't in the roadmap, or the tables
disagree — **stop and ask** which issues to update. Moving/closing the wrong issue is more
confusing to untangle than a short pause now.

### 6.2 Linear: move to "Done"

```
mcp__linear-server__get_issue           — fetch current state (sanity-check title)
mcp__linear-server__list_issue_statuses — confirm the team's "Done" (completed) state name
mcp__linear-server__save_issue          — id: <CHR-n>, state: "Done"
```

Only move forward. If it's already Done, leave it. If it's still in an early state
(Backlog/Todo) rather than In Review, that's odd for something you just merged — flag it but
still move it to Done, since the merge is ground truth.

### 6.3 GitHub mirror: close the issue

The GitHub mirror's `status:*` labels track *planning readiness* (`ready`/`proposed`/
`blocked`), not implementation progress — there's no `status:done`, so closing the issue is
the canonical "this is done" signal (see `tasks-github.md` → "Keeping doc and issues in
sync", which says to close the issue when a change is archived). Close it with a comment that
points at the merge:

```bash
gh issue close <issue-number> --repo <owner>/<repo> --reason completed \
  --comment "Merged to main via #<PR-number> and archived."
```

## Step 7 — Confirm

Print a short close-out summary so the user sees the whole lifecycle ended cleanly:

```
✓ Closed out <change-id>
  archived:  context/archive/<date>-<change-id>/   (roadmap item closed by /10x-archive)
  merged:    PR #<n> squashed onto main, branch deleted
  Linear:    <CHR-n> → Done
  GitHub:    issue #<n> → closed
```

## What this skill deliberately does NOT do

- **Doesn't open the PR or do the review.** It assumes `/pr-ready` already opened the PR and
  a human reviewed it. No open PR → it sends you to `/pr-ready` and stops.
- **Doesn't merge on red CI or without an approval** without an explicit "yes". The gates in
  Steps 1 and 4 exist because un-gated merges are the expensive mistake here.
- **Doesn't re-close the roadmap item.** `/10x-archive` owns the roadmap (`Status: done` +
  `## Done` entry); duplicating that here would just risk drift.
- **Doesn't rewrite the `tasks-github.md` / `tasks-linear.md` markdown tables.** It treats
  them as the issue-mapping source of record (same as `/pr-ready`) and brings the *live*
  trackers they describe to their terminal state. If you want the markdown tables themselves
  edited on merge, that's a deliberate convention change to ask for, not a side effect.
- **Doesn't use merge-bypass flags** (`--admin`, `--no-verify`, signing bypass). If branch
  protection blocks the merge, that's a signal to surface, not to override.
```