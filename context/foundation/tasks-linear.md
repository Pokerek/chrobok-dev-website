---
project: "Chrobok.dev"
task_system: linear
workspace: chrobok-dev
team: Chrobok-dev (CHR)
linear_project: chrobok-dev-website
created: 2026-07-23
source_of_record: context/foundation/roadmap.md
mirrors: none (Linear-only — no GitHub-issues mirror in this project)
---

# Task Management: Linear

This project's backlog is mirrored into **Linear** (workspace `chrobok-dev`, team **Chrobok-dev** /
key `CHR`, project **chrobok-dev-website**). `roadmap.md` remains the human source-of-record; the
Linear issues are its single live mirror. This file documents the Linear-side conventions so future
migrations/edits — and the `/pr-ready` and `/pr-merge` skills — stay consistent.

Unlike the sibling `10x-Travel` project, this mirror is intentionally lean: no GitHub mirror, no custom
labels, no project milestones. Status is carried entirely by the Linear workflow state.

## Tooling

- **Linear MCP server** (`mcp__plugin_linear_linear__*`): `save_issue`, plus `list_issues` /
  `list_issue_statuses` / `get_issue` for verification.
- The team and the `chrobok-dev-website` project already existed in the workspace; the 11 issues were
  created from `roadmap.md` (one per roadmap item), with empty label sets.

## Issue mapping (roadmap → Linear)

Keyed by roadmap ID. The **Change ID** column lets the skills resolve a `<change-id>` (branch /
`context/changes/` slug) straight to the Linear identifier without a second lookup. The **State** column
is a point-in-time snapshot — Linear is the live source of truth for workflow state.

| Linear | Roadmap ID | Change ID                 | Title (short)                    | State snapshot |
| ------ | ---------- | ------------------------- | -------------------------------- | -------------- |
| CHR-28 | F-01       | design-system-contract    | Design-system & layout contract  | In Review      |
| CHR-29 | F-02       | v1-release-staging        | v1 release staging               | Done           |
| CHR-30 | F-03       | inspection-gate           | Inspection gate                  | Backlog        |
| CHR-31 | S-01       | hero-first-screen         | Hero — first screen              | Backlog        |
| CHR-32 | S-02       | work-proof-block          | Work — proof block               | Backlog        |
| CHR-33 | S-03       | skills-two-tier           | Skills — two tiers               | Backlog        |
| CHR-34 | S-04       | about-and-journal         | About & journal                  | Backlog        |
| CHR-35 | S-05       | footer-contact            | Footer contact                   | Backlog        |
| CHR-36 | S-06       | sticky-section-nav        | Sticky section nav               | Backlog        |
| CHR-37 | S-07       | inspection-hardening-pass | Inspection hardening pass        | Backlog        |
| CHR-38 | S-08       | v1-production-cutover     | v1 production cutover (★ north)  | Backlog        |

## Conventions

- **One issue per roadmap item.** Title and body mirror the roadmap; body carries Outcome, Change ID,
  PRD refs, Prerequisites, Unknowns and Risk verbatim.
- **Status lives in the workflow state**, not in a label. Team states: `Backlog`, `Todo`,
  `In Progress`, `In Review`, `Done`, `Canceled`, `Duplicate`. A slice that becomes ready moves
  Backlog → Todo → In Progress → In Review → Done.
- **No custom labels or milestones.** They exist in the `10x-Travel` mirror but were deliberately not
  recreated here — this v1 is a single linear sequence, so the workflow state alone is enough.

## Status flow driven by the skills

The Linear workflow state is the implementation-progress axis, distinct from the roadmap's
planning-readiness `Status` (which only `/10x-plan` and `/10x-archive` touch).

- **`/pr-ready`** moves the issue **Todo/Backlog → In Review** and attaches the PR link. Forward-only —
  an issue already In Review/Done keeps its state; the link is still attached if missing.
- **`/pr-merge`** moves the issue **→ Done** after the squash-merge lands.

## GitHub is not used

This project has **no** GitHub-issues mirror and no `tasks-github.md`. Issues live only in Linear.
`/pr-ready` and `/pr-merge` skip every GitHub-mirror step here — the PR itself (opened against
`development`) plus the Linear state change are the whole tracker surface. Do not create a
`tasks-github.md` or comment on GitHub issues for this repo.

## Keeping doc and issues in sync

`roadmap.md` stays the source-of-record. When a roadmap item changes status (a slice becomes `ready`,
or is archived via `/10x-archive`), move the Linear workflow state **and** edit `roadmap.md`; keep them
from drifting. If a new roadmap item is mirrored into Linear, append its row to the table above — the
skills treat this table as the mapping source of record and do not edit it themselves.
