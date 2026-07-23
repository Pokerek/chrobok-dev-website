---
change_id: v1-release-staging
title: V1 release staging
status: archived
created: 2026-07-23
updated: 2026-07-23
archived_at: 2026-07-23T16:29:17Z
---

## Notes

<!-- Free-form notes for this change: links, ad-hoc context, decisions that don't belong in research/frame/plan. -->

### Phase 1 — observed release topology (2026-07-23)

**Vercel Production Branch — observed pre-change value: `main`. No edit was required.**

The plan flagged this as the load-bearing unknown: if the Production Branch had been `development`,
every merge to `development` would already have been publishing live to chrobok.dev. It was not.

Evidence (GitHub Deployments API, `gh api repos/Pokerek/website-astro/deployments`), which records the
environment Vercel targets for each ref:

| Ref | Branch | Vercel environment |
| --- | --- | --- |
| `5a9b9ce` (`docs: add roadmap v1`) | tip of `origin/main` | **Production** |
| `c5b902e` (`feat: add husky config (#12)`) | tip of `origin/development` | **Preview** |
| `6b63754` (`docs: add plan for v1-release-staging`) | `docs/v1-release-staging` | **Preview** |

`development` produced a Preview, not a Production, deployment. Production Branch is therefore `main`,
even though GitHub's default branch is `development` — the two settings are independent, as expected.

**Consequence:** PR #12 was *not* a production release. The roadmap's F-02 risk framing was
precautionary rather than understated, and no partial-page window was ever open.

**GitHub protection, confirmed intact:**

- `main` — PR required (`required_approving_review_count: 0`), `required_linear_history: true`,
  `allow_force_pushes: false`, `allow_deletions: false`.
- `development` — unprotected; the protection endpoint returns HTTP 404, which is the intended state
  until F-03 (`inspection-gate`) attaches required status checks.

### Phase 3 — smoke test result (2026-07-23)

**Passed. The insulation is now an observed fact, not a configured intention.**

PR #14 (`docs: document the v1 release model`) merged into `development` as `34f4636`.

| Check | Before | After |
| --- | --- | --- |
| `origin/main` | `5a9b9ce` | `5a9b9ce` — unmoved |
| `origin/development` | `c5b902e` | `34f4636` |
| chrobok.dev status | 200 | 200 |
| chrobok.dev `etag` | `"3ed38505cf3185439ceea33a74be45ab"` | identical |
| chrobok.dev `last-modified` | `Wed, 22 Jul 2026 15:13:42 GMT` | identical |
| chrobok.dev HTML `shasum` | `34695f98d998730b2786a5fbeeab733c8abc44e1` | identical |

The merge produced **exactly one** new deployment, environment **Preview**, ref `34f4636`. The most
recent Production deployment is still `5a9b9ce` from 2026-07-22 — `main`'s tip. Slices S-01 to S-07
can merge into `development` without any risk of reaching the live site.

**Stable `development` review target:**
`https://website-astro-git-development-karol-chroboks-projects.vercel.app`

**Vercel Deployment Protection is enabled on previews.** Both the stable branch URL and the
per-commit URL (`https://website-astro-evejxvncr-karol-chroboks-projects.vercel.app`) return
`302` to `vercel.com/sso-api`; they are reachable only while logged into the Vercel account. This
was not anticipated in the plan and cuts both ways: it strengthens F-02's goal, since a half-built
page is not publicly reachable even by URL, but it means any third party asked to review a slice
preview needs either a Vercel login or a shareable link generated from the dashboard.

**Deviation from plan:** the plan specified "merged, not squashed". The repo allows squash only
(`allow_merge_commit: false`, `allow_rebase_merge: false`), so PR #14 was squash-merged. The plan's
intent — that `main` is not touched — held. Note that `delete_branch_on_merge: true`, so the
feature branch was auto-deleted; trailing bookkeeping commits need a fresh branch.

### Post-archive correction: Progress row 2.4 was a false pass

Added after archiving, deliberately breaking the read-only convention, because leaving a
falsely-checked criterion in the record is worse than an out-of-order edit.

**Progress row 2.4 ("Markdown formatting clean — `npx prettier --check "**/*.md"`") is marked
`[x]` but the check never passed.** The `rtk` CLI wrapper rewrote prettier's output to
`Prettier: All files formatted correctly` while the underlying command was exiting non-zero.
Running it via `rtk proxy npx prettier --check "**/*.md"` reveals 20 failing files.

Cause: `.prettierrc.json` sets `printWidth: 120`, and most markdown in this repo wraps narrower.
Fourteen of the twenty files are untouched by this change (`README.md`, four
`context/foundation/*.md`, `.github/instructions/02`/`03` and all five `codeQuality/*`, both
`.claude/skills/*`). Two more — `01-overview.instructions.md` and `roadmap.md` — were verified
already dirty at `6b63754`, before this change began. The criterion was therefore unachievable
as written: satisfying it required a repo-wide markdown reformat that "What We're NOT Doing"
explicitly excluded. Prettier is also not wired into `lint-staged` for `.md`, so nothing enforces it.

Resolution: `04-releaseProcess.instructions.md` — the one genuinely new file — was formatted so
this change adds no debt. Note that prettier normalized its frontmatter to `applyTo: '**/*'`
(single quotes, per `singleQuote: true`), which differs cosmetically from the double-quoted
siblings; YAML treats them identically.

Two follow-ups worth their own change: decide whether markdown is in prettier's remit at all
(and if so, reformat the repo and add `*.md` to `lint-staged`), and treat `rtk`-filtered output
as unverified whenever a check's exit code actually matters.

### Follow-up out of scope for this change

**The `.github/instructions/` set targets GitHub Copilot, but the project now uses Claude Code.**
Raised during Phase 2 manual verification. The `copilot-instructions.md` +
`*.instructions.md` + `applyTo:` frontmatter layout is Copilot's convention; Claude Code does not
load it, and there is no `CLAUDE.md`/`AGENTS.md` at the repo root — so all four modules, including
the new release-process one, are currently invisible to the agent doing the work.

Decision for this change: keep the module where it is (it follows the existing convention and the
content is correct), and record the gap rather than silently expand F-02's scope into an
instruction-system migration. A TODO block at the top of `.github/copilot-instructions.md` states
the problem and the fix. The migration itself wants its own change.

**Production baseline (pre-Phase-3 merge), captured 2026-07-23:**

- `HTTP/2 200`, serves `Work in progress...`
- `etag: "3ed38505cf3185439ceea33a74be45ab"`
- `last-modified: Wed, 22 Jul 2026 15:13:42 GMT`
- HTML `shasum`: `34695f98d998730b2786a5fbeeab733c8abc44e1`
