# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-28
**Phases:** 7 | **Plans:** 24 | **Timeline:** 14 days (2026-03-14 → 2026-03-28)

### What Was Built
- @aeorank/core: 12-dimension scoring engine + 8 file generators (120 tests, deterministic)
- @aeorank/cli: Zero-config CLI with colored output, JSON mode, init command (55 tests)
- Marketing site: Astro 5 + Tailwind CSS 4, zero-JS by default, terminal demo island
- Docs site: Starlight with 17 pages, Pagefind search, all 8 file format docs
- GitHub Action: Composite action for CI — Check Run + PR comment with upsert
- SaaS Dashboard: Next.js 16, Clerk auth, Supabase, QStash async scans, Stripe billing
- Full verification: 40/40 requirements verified with source evidence

### What Worked
- Pure @aeorank/core (no I/O) made it trivially reusable across CLI, Action, and Dashboard
- TDD on core (120 tests) caught bugs early — scoring engine was rock-solid from Phase 1
- Phase numbering continuity (no restart per milestone) kept references stable
- Retroactive verification (Phase 6) caught real issues vs claiming requirements were met

### What Was Inefficient
- CLI phase summaries had empty one-liner fields ("Status:") — summary extraction incomplete
- Phase 6 plan count inconsistency (ROADMAP said "TBD" but 3 plans existed on disk)
- action.yml referenced wrong npm package name — integration test gap between Phase 2 and Phase 4
- plan.ts used wrong column name for scan limits — no integration test for billing enforcement
- Phase details in ROADMAP.md were never updated for Phase 6 (still said "Plans: TBD")

### Patterns Established
- Proxy.ts pattern for Clerk middleware in Next.js 16 (not middleware.ts)
- QStash callback pattern: service-role Supabase client, user_id set at enqueue time
- Lazy factory pattern for Stripe/QStash clients (avoids env var evaluation at build time)
- PASS-CODE-COMPLETE status for requirements that need external deployment steps

### Key Lessons
1. Cross-phase integration checks should happen during development, not just at audit — the action.yml bug existed since Phase 4 but wasn't caught until the v1.0 audit
2. Column name mismatches between application code and database schema need automated validation — the plan.ts bug silently bypassed all billing enforcement
3. Summary extraction tools need validation — empty one-liner fields indicate incomplete phase summaries

### Cost Observations
- 136 commits across 14 days
- 389 files, 71,538 insertions
- 22,459 LOC TypeScript/Astro
- Accelerating velocity: early phases (core) ~18min/plan, later phases (marketing) ~5min/plan

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 7 |
| Plans | 24 |
| Requirements | 40 |
| Requirements satisfied | 40/40 |
| Tests | 175+ |
| LOC | 22,459 |
| Timeline | 14 days |
| Integration bugs found at audit | 2 |

## Milestone: v2.0 — Competitive Parity

**Shipped:** 2026-03-28
**Phases:** 9 | **Plans:** 17 | **Timeline:** Same day as v1.0 completion (~3 hours)

### What Was Built
- 24 new scoring dimensions (12→36 total) across 5 pillars
- Percentage-based weight system with coherence + duplication score gates
- ai.txt generator + enriched llms-full.txt (Q&A, definitions, entities)
- Pillar-grouped UI across dashboard, CLI, docs, marketing
- Per-page scoring (0-75 scale) with CLI --page flag and dashboard breakdown

### What Worked
- Consistent scorer pattern from Phase 8 made Phases 9-12 fast — each new dimension was copy-paste-modify
- TDD for every scorer caught issues immediately
- SCORING_ROADMAP.md as detailed spec eliminated need for discuss phases on infrastructure work
- Parallel Wave 1 execution for Phase 15 (dashboard + docs/marketing in parallel)
- Autonomous mode sustained 9 phases without manual intervention

### What Was Inefficient
- WGHT-01/WGHT-02 not marked complete by Phase 13 executor — caught at audit
- Phase 13 weight migration took longest (~40min) due to test update cascade
- CLI integration test mock not updated for 9 files — caught by regression test
- No VERIFICATION.md for phases 10-16 — relied on test passing as implicit verification

### Patterns Established
- PILLAR_GROUPS constant in core as single source of truth for UI/CLI grouping
- Server/client component split to avoid Turbopack bundling @aeorank/core in browser
- Hardcoded dimension name maps in dashboard components (avoids core import)
- PAGE_SCORE_MAX=75 exported from core for consumer display

### Key Lessons
1. Infrastructure phases (pure scoring functions) can be fully automated — no discuss phase needed when specs are detailed
2. Weight migration is the hardest kind of refactor — touching scoring formula cascades to every test
3. Regression test suite is essential for multi-phase work — caught the CLI mock issue immediately

### Cost Observations
- 85 commits in ~3 hours
- 93 files changed, 13,551 insertions
- 637 tests (up from 479 at start of v2.0)
- 9 phases executed autonomously without manual intervention

## Cross-Milestone Trends

| Metric | v1.0 | v2.0 |
|--------|------|------|
| Phases | 7 | 9 |
| Plans | 24 | 17 |
| Requirements | 40 | 40 |
| Requirements satisfied | 40/40 | 40/40 |
| Tests | 479 | 637 |
| LOC | 22,459 | ~36,000 |
| Timeline | 14 days | 3 hours |
| Integration bugs at audit | 2 | 0 |
