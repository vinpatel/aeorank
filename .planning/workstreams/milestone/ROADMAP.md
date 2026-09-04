# Roadmap: AEOrank

## Milestones

- ✅ **v1.0 MVP** — Phases 1-7 (shipped 2026-03-28) — [Archive](milestones/v1.0-ROADMAP.md)
- ✅ **v2.0 Competitive Parity** — Phases 8-16 (shipped 2026-03-28) — [Archive](milestones/v2.0-ROADMAP.md)
- 🔨 **v3.0 Developer Parity** — Phases 17-25 (started 2026-08-15) — [Roadmap](../../milestones/v3.0-ROADMAP.md)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

<details>
<summary>✅ v1.0 MVP (Phases 1-7) — SHIPPED 2026-03-28</summary>

- [x] Phase 1: Core Engine (5/5 plans) — completed 2026-03-24
- [x] Phase 2: CLI (3/3 plans) — completed 2026-03-14
- [x] Phase 3: Web Presence (4/4 plans) — completed 2026-03-14
- [x] Phase 4: GitHub Action (2/2 plans) — completed 2026-03-14
- [x] Phase 5: SaaS Dashboard (5/5 plans) — completed 2026-03-14
- [x] Phase 6: Retroactive Verification (3/3 plans) — completed 2026-03-15
- [x] Phase 7: Marketing Content & Deployment (2/2 plans) — completed 2026-03-15

</details>

<details>
<summary>✅ v2.0 Competitive Parity (Phases 8-16) — SHIPPED 2026-03-28</summary>

- [x] Phase 8: Answer Readiness (2/2 plans) — completed 2026-03-28
- [x] Phase 9: Content Structure Expansion (2/2 plans) — completed 2026-03-28
- [x] Phase 10: Trust & Authority Expansion (1/1 plan) — completed 2026-03-28
- [x] Phase 11: Technical Foundation Expansion (2/2 plans) — completed 2026-03-28
- [x] Phase 12: AI Discovery Expansion (2/2 plans) — completed 2026-03-28
- [x] Phase 13: Weight Migration & Score Gates (2/2 plans) — completed 2026-03-28
- [x] Phase 14: New File Generators (1/1 plan) — completed 2026-03-28
- [x] Phase 15: Dashboard & Docs Updates (3/3 plans) — completed 2026-03-28
- [x] Phase 16: Per-Page Scoring (2/2 plans) — completed 2026-03-28

</details>

### 🔨 v3.0 Developer Parity (Phases 17-25) — IN PROGRESS

Scope from `.planning/COMPETITIVE-PARITY.md`. Tier 0 monitoring (prompt tracking,
citations, share-of-voice, sentiment, prompt volume) explicitly deferred — see
PROJECT.md Out of Scope.

### Phase 17: Launch Blockers
**Goal**: Make the repository survive inspection by a hostile technical evaluator on launch day. Clear the 242 open Dependabot alerts (7 critical, 101 high — up 3× from the 80 recorded in April), correct the false "675 tests, 0 Dependabot / CodeQL alerts" claim sitting in the drafted Show HN body in LAUNCH.md, reconcile the contradictory test counts (docs say 288/637/675 against 39 test files) to one CI-measured number, land the uncommitted `fix/scan-callback-url` branch including its Supabase migration and keep-alive cron route, and verify the three deploy targets are actually live.
**Depends on**: None
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):
  1. `gh api repos/vinpatel/aeorank/dependabot/alerts?state=open` returns zero alerts of severity `critical` and zero of severity `high`
  2. An automated dependency-update cadence is configured and demonstrably runs, so alert debt cannot silently triple again
  3. Every numeric claim in `LAUNCH.md`, `README.md`, and `apps/marketing/` traces to a command or API call that reproduces it
  4. CI emits one authoritative test count, and every doc and badge citing a count reads from that source rather than a hand-edit
  5. `fix/scan-callback-url` is merged to `main` with `supabase/migrations/` applied and `apps/web/app/api/cron/keep-alive/` deployed
  6. aeorank.dev, docs.aeorank.dev, and app.aeorank.dev all return 200, and the GitHub Action resolves on the Marketplace
**Plans:** 10 plans across 6 waves

Plans:
- [ ] 17-01-PLAN.md — Land `fix/scan-callback-url`: keep-alive cron, Supabase unique-constraint migration, and repair of the 3 pre-existing `pnpm typecheck` failures every later gate depends on (wave 1)
- [ ] 17-02-PLAN.md — SEC-01 lever A: delete 11 unused framework devDependency names across 8 manifests, measure delta (wave 2)
- [ ] 17-03-PLAN.md — Scope biome to real source, then CI pipeline: test gate, `pnpm audit` gate, advisory lint job, authoritative test count from the vitest JSON reporter (wave 2)
- [ ] 17-04-PLAN.md — SEC-06: liveness script for public surfaces + credential-gated human checklist (wave 2)
- [ ] 17-05-PLAN.md — SEC-01 lever B: raise `pnpm.overrides` floors and patch direct deps, measure delta (wave 3)
- [ ] 17-06-PLAN.md — Marketing pricing, tier names, and competitor claims reconciled to canonical sources (wave 3)
- [ ] 17-07-PLAN.md — Marketing pillar weights derived from `@aeorank/core`; test count and scoreboard cadence made true (wave 3)
- [ ] 17-08-PLAN.md — SEC-01 lever B': isolated Astro 5.18.1 -> 7.2.2 migration (wave 4)
- [ ] 17-09-PLAN.md — README / LAUNCH.md / PROJECT.md claim corrections + CI claim-drift guard (wave 5)
- [ ] 17-10-PLAN.md — SEC-02: enable Dependabot security updates, grouped `dependabot.yml`, branch protection with bot-only exemption behind a human consent gate (wave 6)

### Phase 18: Public API
**Goal**: Turn the $99 API tier from a pricing-page promise into a product. All five competitors ship an API; AEOrank has advertised one since v1.0 while `apps/web/app/api/*` remains entirely internal, session-authenticated dashboard plumbing.
**Depends on**: Phase 17
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07
**Success Criteria** (what must be TRUE):
  1. A user can mint a named, scoped API key in the dashboard and revoke it, with revocation taking effect on the next request
  2. `curl` with a bearer key can start a scan, poll its status, and read back score, grade, and all 36 dimension results
  3. All 9 generated files are retrievable per scan over the API
  4. Exceeding a plan's quota returns HTTP 429 with quota headers, and the enforced limit matches the tier in `lib/plan.ts`
  5. The docs site serves an OpenAPI spec that validates against the spec linter, plus a reference page
**Plans:** TBD

### Phase 19: MCP Server
**Goal**: Make AEOrank callable from inside AI coding agents. Otterly is the only competitor with an MCP surface and their audience is marketers; ours is developers already working inside agents.
**Depends on**: Phase 18
**Requirements**: MCP-01, MCP-02, MCP-03
**Success Criteria** (what must be TRUE):
  1. An agent in Claude Code can call a scan tool against a URL and receive a structured score result
  2. Scan results and generated files are exposed as MCP resources the agent can read
  3. A fresh install succeeds from the published docs alone for Claude Code, Claude Desktop, and a generic MCP client
**Plans:** TBD

### Phase 20: Crawler Analytics
**Goal**: Let users see which AI bots actually fetch their pages, not merely whether robots rules permit it. Four of five competitors ship this and three added it since April — it went from a Profound-only feature to table stakes in one quarter.
**Depends on**: Phase 17
**Requirements**: CRAWL-01, CRAWL-02, CRAWL-03, CRAWL-04
**Success Criteria** (what must be TRUE):
  1. A user can connect a Vercel or Cloudflare log source to a site from the dashboard
  2. The dashboard charts AI crawler hits broken down by bot over time
  3. Non-200 responses served to AI bots are surfaced as errors with the affected URLs listed
  4. A user can compare pages AI crawlers actually fetch against pages present in the sitemap
**Plans:** TBD

### Phase 21: Alerts
**Goal**: Make regressions reach the user without them logging in — the main reason monitoring tools retain.
**Depends on**: Phase 20
**Requirements**: ALERT-01, ALERT-02, ALERT-03, ALERT-04
**Success Criteria** (what must be TRUE):
  1. An AEO score drop past a user-configured threshold fires an alert
  2. A newly blocked AI crawler or a robots.txt regression fires an alert
  3. A previously present generated file going missing or stale fires an alert
  4. Each alert routes to email, Slack, or an outbound webhook, and delivery is verifiable in logs
**Plans:** TBD

### Phase 22: Reports & Exports
**Goal**: Let scan data leave the product in the formats buyers ask for. Every competitor exports CSV; AEOrank ships a ZIP of generated files and nothing else.
**Depends on**: Phase 18
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04
**Success Criteria** (what must be TRUE):
  1. CSV export of a scan opens in a spreadsheet with one row per dimension
  2. JSON export is schema-stable and matches the shape the API returns
  3. A PDF report renders score, pillar breakdown, and fix list, and is shareable by link
  4. A user can schedule a recurring report and receive it on the chosen cadence
**Plans:** TBD

### Phase 23: Integrations
**Goal**: Make AEOrank install where the site already lives. Google Search Console in particular closes the loop competitors sell hard — correlating AEO score against actual AI-referral traffic.
**Depends on**: Phase 18, Phase 20
**Requirements**: CONN-01, CONN-02, CONN-03, CONN-04
**Success Criteria** (what must be TRUE):
  1. A user can OAuth into Google Search Console and see AI-referral traffic beside AEO score
  2. GA4 connects and reports traffic as a source
  3. The Vercel integration installs AEOrank against a project without leaving Vercel
  4. The Cloudflare integration installs against a zone without leaving Cloudflare
**Plans:** TBD

### Phase 24: Geo & Language
**Goal**: Stop scanning implicitly US-English-only. Three of five competitors sell multi-region and multi-language explicitly, and today non-English sites receive silently wrong scores — worse than a missing feature.
**Depends on**: Phase 17
**Requirements**: GEO-01, GEO-02
**Success Criteria** (what must be TRUE):
  1. A user can select a scan region and the scan demonstrably originates from it
  2. A non-English fixture site is not penalised by any of the 36 criteria for being non-English
**Plans:** TBD

### Phase 25: Defend the Moat
**Goal**: Keep the ground nobody else holds. Scrunch's AXP and Otterly's GEO URL audits are the first competitor moves into AEOrank's generation and deterministic-audit territory; this answers both and finally ships the scoreboard.
**Depends on**: Phase 20
**Requirements**: DEF-01, DEF-02, DEF-03
**Success Criteria** (what must be TRUE):
  1. Edge middleware serves an AI-optimised variant to identified AI crawlers and the normal page to humans, verified by user-agent test
  2. A reproducible benchmark comparing AEOrank audit depth to Otterly's GEO URL audit is published
  3. The 100-funded-startup scoreboard is live at a public URL and linked from the marketing site
**Plans:** TBD

### Tracked Debt (v3.0)

Quantified, deliberately de-gated debt carried out of a completed phase. Recorded here rather
than only in a phase SUMMARY so it survives the phase closing.

- **Repo-wide biome cleanup** — origin: Phase 17, plan 17-03 Task 1. After `biome.json` is
  scoped to real source (excluding `.astro`, `.next`, `.vercel`, `.planning`), roughly
  **MEASURE-IN-17-03** real lint errors remain in real source files (measured 2026-08-15:
  364 across ~251 files — 116 `noNonNullAssertion`, 98 `format`, 78 `organizeImports`, 18
  `noSvgWithoutTitle`, 11 `noUnusedTemplateLiteral`, 10 `useLiteralKeys`, 9 `noExplicitAny`,
  24 assorted; 176 safe-autofixable). Phase 17 runs `pnpm lint` as a `continue-on-error` CI
  job and deliberately does NOT make it a required status check — a required check with
  hundreds of known failures would make the repository permanently unmergeable, and clearing
  them repo-wide would have collided with the file ownership of five other Phase 17 plans.
  No document, badge, or copy line claims the codebase is lint-clean. Plan 17-03 Task 1 must
  replace the `MEASURE-IN-17-03` placeholder above with the count it actually measures.
  Also recorded as a deferred idea in `phases/17-launch-blockers/17-CONTEXT.md`.
  **Close-out condition:** `pnpm lint` exits 0 and `lint` is added to the required status
  checks on the `main` ruleset.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-7 | v1.0 | 24/24 | Complete | 2026-03-28 |
| 8-16 | v2.0 | 17/17 | Complete | 2026-03-28 |
| 17-25 | v3.0 | 0/— | In progress | — |
