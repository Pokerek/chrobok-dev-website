---
name: pr-ready
description: Open the PR for a finished change and sync its Linear and GitHub-mirror tracker issues to "in review" — push the branch, create the PR with a generated summary/test plan, move the Linear issue to In Review with a link to the PR, and comment the PR link on the GitHub mirror issue. Trigger on "/pr-ready <change-id>" or natural-language completion announcements like "I finished implementing places-schema-foundation, prepare the PR" / "open a PR for this and sync the trackers".
argument-hint: "<change-id>"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - mcp__linear-server__get_issue
  - mcp__linear-server__save_issue
  - mcp__linear-server__list_issue_statuses
---

# /pr-ready — Ship a finished change

Take a change that's done being implemented and put it in front of reviewers: push the
branch, open the GitHub PR, and move its two tracker mirrors (Linear + the GitHub-issues
mirror) into "in review" so the backlog reflects reality. This is the
"I'm done coding, get it ready for review" button — it does not merge anything or touch
`roadmap.md` (that only changes at planning time or archive time, see "What this skill
deliberately does NOT do").

## Initial Response

If invoked with no argument, ask for the change-id:

```
Which change is ready for review? Give me its change-id (the kebab-case slug used for
its branch and context/changes/ folder), e.g.:

  /pr-ready places-schema-foundation

You can list in-flight changes with: ls context/changes/
```

Then wait. If the user instead describes what they did in prose ("I finished X, open the
PR"), extract the change-id from that description — match it against `ls context/changes/`
— and confirm your reading back to them in the plan step below rather than asking again.

## Step 1 — Resolve the change and its branch

1. Read `context/changes/<change-id>/change.md` frontmatter for `title` and `status`.
   - If the folder doesn't exist, list `context/changes/` and ask the user to pick the
     right slug — don't guess at a fuzzy match silently.
   - If `status` is not `implemented` or `impl_reviewed`, surface that as a heads-up
     (not a hard block — the user knows their own state better than the file does) and
     ask whether to continue.
2. Find the branch for this change. Roadmap items map to feature branches like
   `feat/F01-<change-id>` or `feat/<change-id>`; confirm with:
   ```bash
   git branch --list "*<change-id>*" "*$(echo <change-id> | tr '-' '_')*"
   git log --all --oneline --grep="<change-id>" -i | head -5
   ```
   If exactly one local branch matches, use it. If several match or none do, ask the user
   which branch to work from.
3. Check out that branch if it isn't already current, and confirm it's clean enough to
   ship:
   ```bash
   git status -sb
   git log main..HEAD --oneline   # commits this PR will carry
   ```
   If there are uncommitted changes, look at whether they plausibly belong to this change
   (touch the same files / folders) or look unrelated (e.g. editing CLAUDE.md, unrelated
   config, files for a different change). For anything that looks unrelated, **ask the
   user** how to handle it — leave it out, commit it separately first, or fold it in —
   the same way you would not want someone silently bundling drive-by edits into your PR.
   Do not decide this for them.

## Step 2 — Pre-flight: lint

Run the project's lint command (see CLAUDE.md — `npm run lint`). This is the same gate CI
runs; catching it now saves a review round-trip. If it reports errors, stop and report
them — don't push broken code. Warnings-only output is fine to proceed past.

## Step 3 — Check for an existing PR

```bash
gh pr list --head <branch> --json number,title,url,state
```

If an open PR already exists for this branch, skip straight to Step 6 (tracker sync) using
that PR's number and URL — re-creating it would fail anyway, and the user asked you to get
it "ready", which an existing open PR already is.

`gh` may be authenticated as multiple accounts (check `gh auth status`); if `gh pr
list`/`gh repo view` can't resolve the repo, `gh auth switch --user <owner-of-the-remote>`
— the remote's owner is in `git remote -v`.

## Step 4 — Push and open the PR

1. Push with upstream tracking: `git push -u origin <branch>`.
2. Build the PR body from what's actually in the branch, not boilerplate:
   - **Summary**: 2-4 bullets derived from `git log main..HEAD --reverse --format="- %s"`,
     grouped/rephrased into user-meaningful bullets (not a raw commit dump).
   - **Test plan**: pull verification steps from the change folder if it has them
     (`context/changes/<change-id>/plan.md` or similar — look for an existing test/manual
     check section) rather than inventing generic ones; fall back to a short checklist
     covering lint, the obvious manual smoke-check for what this change touches, and
     anything the change's "Risk" notes flagged.
3. Create it:
   ```bash
   gh pr create --base main --head <branch> --title "<type>: <concise title>" --body "$(cat <<'EOF'
   ## Summary
   - ...

   ## Test plan
   - [ ] ...
   EOF
   )"
   ```
   Capture the returned PR URL and number — you need both for Step 6.

## Step 5 — Show the plan before touching the trackers

You've now done the (effectively one-shot, hard-to-undo-cleanly) GitHub actions. Before
making the Linear/GitHub-mirror edits — which are easy to get wrong if the issue mapping
is stale — show the user one short summary of what you're about to do and proceed without
waiting for a reply, e.g.:

```
PR #19 is open: https://github.com/<owner>/<repo>/pull/19

Now syncing trackers:
  - Linear CHR-5 → move Todo → In Review, attach PR #19 link
  - GitHub mirror issue #1 → comment with the PR #19 link
```

This is a heads-up, not a gate — if the resolved issue numbers look wrong to the user
they can stop you, but otherwise keep moving. (If you're ever unsure which issue maps to
this change, that's when to actually stop and ask — see Step 6.1.)

## Step 6 — Sync the trackers

### 6.1 Resolve the issue mapping

Read `context/foundation/tasks-linear.md` and `context/foundation/tasks-github.md`. Both
carry an "Issue mapping (roadmap → …)" table keyed by **Change ID** (via the roadmap ID —
cross-reference `context/foundation/roadmap.md`'s `Change ID` column to get from
`<change-id>` to a roadmap ID like `F-01`/`S-02`, then to the table row). That row gives
you the Linear identifier (`CHR-N`) and the GitHub issue number (`#N`).

If you can't find an unambiguous row — the change-id isn't in the roadmap, or the tables
disagree — **stop and ask** which issues to update rather than guessing from branch names
or fuzzy title matches. A wrong tracker update (moving the wrong issue to "In Review") is
more confusing to untangle later than a short pause now.

### 6.2 Linear: move to "In Review" + attach the PR link

```
mcp__linear-server__get_issue        — fetch current state (sanity-check title/status)
mcp__linear-server__list_issue_statuses  — confirm "In Review" exists for this team
mcp__linear-server__save_issue       — id: <CHR-N>, state: "In Review",
                                        links: [{url: <PR URL>, title: "PR #<N>: <PR title>"}]
```

Only move it forward (Todo/Backlog → In Review). If the issue is already further along
(In Review, Done) leave its state alone — just add the link if missing — rather than
moving it backward.

### 6.3 GitHub mirror: comment with the PR link

```bash
gh issue comment <issue-number> --repo <owner>/<repo> --body "Implementation complete and in review: #<PR-number>"
```

Don't touch the issue's `status:*` label. Read `tasks-github.md`'s "Mapping decisions" /
label table first if you're unsure why — but the short version is that those labels mirror
`roadmap.md`'s **planning-readiness** status (`ready`/`proposed`/`blocked`), a different axis
than implementation/PR progress. There is no `status:in-review` in the taxonomy, and adding
one would be inventing a convention the user hasn't asked for. The GitHub-native way to
track "this issue has a PR in flight" is the cross-reference comment/link, which is what
you just added — same as Linear's `links` attachment, just GitHub's native mechanism for it.

## What this skill deliberately does NOT do

- **Doesn't touch `roadmap.md`.** Per its own documented convention (the `## Done` section
  note), the roadmap's `Status` column only changes at two points: when a slice becomes
  `ready` for planning, or when `/10x-archive` flips it to `done`. "PR opened, in review"
  is implementation-progress granularity that the roadmap deliberately doesn't track —
  that lives in the change folder's `change.md` (`status: impl_reviewed` etc.) and in
  Linear's workflow state. Resist the urge to "complete the picture" by editing it anyway.
- **Doesn't merge the PR or close the issues.** "Ready for review" is the end state this
  skill produces — closing/merging is a human (or separate, explicit) action.
- **Doesn't invent a `status:in-review` GitHub label.** See 6.3 — adding new conventions
  to a documented taxonomy is a decision for the user to make deliberately, not a side
  effect of getting a PR ready.
