# v1 NFR Inspection Runbook

Run this once before the `development → main` cutover (roadmap S-08). Paste the checklist into the
cutover PR and tick every box. Target the Vercel `development` preview URL unless a step says
"local build".

The four NFRs are outside-observable properties — they are what an inspecting tech lead actually
measures, and together they are the "site survives a technical inspection" guardrail
(`context/foundation/prd.md:96-106, 220-233`).

## Prep

- [ ] Deploy is green on the `development` preview
- [ ] `yarn build && yarn preview` runs clean locally — or run `scripts/nfr-serve.sh`
      (needed for the no-JS and cross-engine checks, which require the built `dist/`)

## NFR-1 — Performance: first paint < 1s, no layout shift

- [ ] Chrome DevTools → Lighthouse (run Mobile **and** Desktop) on the preview URL:
      Performance high, **CLS = 0**, LCP < 1s
- [ ] DevTools → Performance panel: record a load, confirm no layout-shift bars
- [ ] Network throttled to "Fast 4G": content is readable in under a second

## NFR-2 — Accessibility: keyboard + screen reader + WCAG-AA contrast

- [ ] Tab through the entire page: every interactive element is reachable, has a visible focus
      ring, follows a logical order, and there is no keyboard trap
- [ ] axe DevTools (browser extension) scan: 0 critical / serious violations
- [ ] VoiceOver (Cmd+F5) spot check: headings, links, and any control announce meaningful names
- [ ] Contrast: axe covers most of it; manually confirm any custom fg/bg pair meets ≥ 4.5:1
      (3:1 for large text)

## NFR-3 — No-JS availability

- [ ] `yarn build && yarn preview` (or `scripts/nfr-serve.sh`)
- [ ] DevTools → Command Palette → "Disable JavaScript", reload: full content renders, nav links
      work, no blank islands
- [ ] CLI sanity: `curl -s localhost:4321 | grep -c "<main"` returns > 0, and key headings/links
      are present in the raw HTML

## NFR-4 — Cross-engine: latest two versions of the mainstream engines

There are only **three shipping browser engines** — "4 engines × 2 versions" is satisfied by testing
current + previous of each. Do not burn time hunting a nonexistent fourth engine. Automating the
full matrix is deliberately out of scope (see the note below).

- [ ] **Blink** — Chrome (current) and Edge (current Chromium)
- [ ] **WebKit** — Safari (current, desktop) and Safari on iOS (current)
- [ ] **Gecko** — Firefox (current) and Firefox ESR (the "previous" line)
- [ ] For each: layout intact, fonts load, interactive islands work, no console errors

## Guardrail — "survives a technical inspection"

- [ ] View source: semantic HTML; no leaked TODO / placeholder / lorem text
- [ ] Console is clean (no errors or warnings) across every engine above
- [ ] All links resolve (no 404s); external links carry the intended `rel` / `target`
- [ ] Meta / OpenGraph tags and favicon are present

---

## What this runbook deliberately does NOT automate, and why

`top_blocker: time`. For a solo static portfolio the setup and maintenance cost of CI-automating
these NFRs dwarfs their value — a checklist run once at the cutover is the right altitude.
Automating the perf budget (Lighthouse CI), a11y (axe-core), no-JS assertions, and the cross-engine
matrix (Playwright) is a v2 concern if the site grows. The automated gate on `development` covers
build + type-check (Vercel) and lint (GitHub Actions); these NFRs are the manual complement.
