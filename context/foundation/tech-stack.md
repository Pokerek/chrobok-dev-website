---
starter_id: astro
package_manager: yarn
project_name: chrobok-dev
hints:
  language_family: js
  team_size: solo
  deployment_target: vercel
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: verified
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: true
    conventions: true
    docs_current: false
    can_judge_agent: false
  has_auth: false
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---

## Why this stack

Solo build, one-week window, and a PRD with zero technology-forcing features —
no auth, no payments, no realtime, no AI, no background jobs. That absence is
the whole decision: the recommended default for `(web, js)` bundles a hosted
database and auth the PRD's Non-Goals explicitly forbid, so the custom path led
to the plain `astro` card instead — content-first, ships zero JS by default,
`for: [website, blog, docs, landing]`, and clears all four agent-friendly gates
with `verified` scaffolding confidence. Zero-JS-by-default is load-bearing, not
cosmetic: the PRD requires every link and every piece of information to remain
available without the browser executing scripts. This also ratifies what is
already standing — Astro 5, TypeScript, Tailwind, a React island, deployed on
Vercel — so nothing is rebuilt. `package_manager` records `yarn`, not the
card's `npm`, because the repo enforces yarn via `only-allow`. The five-point
self-check returned two falses: dependency drift (Astro 5 against a current
Astro 6), scheduled as a Foundations slice before content work; and
agent-judgement confidence, to be compensated with Astro conventions in
`CLAUDE.md` / `AGENTS.md`. Neither is a quality-gate failure, so
`quality_override` stays false.
