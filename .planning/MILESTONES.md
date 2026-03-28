# Milestones

## v1.0 MVP (Shipped: 2026-03-28)

**Phases completed:** 7 phases, 24 plans, 24 tasks

**Key accomplishments:**

- pnpm + Turborepo monorepo established with @aeorank/core exporting 7 TypeScript interfaces, 5 constants, and 5 utility functions that all other packages depend on
- HTML parser (cheerio), rate-limited HTTP fetcher (p-limit), sitemap+BFS URL discovery, and robots.txt AI crawler access detection — all TDD with 16 parser tests and 6 scanner tests
- 12-dimension weighted scoring engine with deterministic pure functions: scorers return 0-10 per dimension, calculateAeoScore() produces 0-100 weighted score with letter grade (A+ through F)
- 8 pure generator functions producing llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, and sitemap-ai.xml from any ScanResult — no disk I/O, deterministic output
- `scan()` convenience API wires scanner → scorer → generators end-to-end, verified by 11 integration tests and 3 determinism tests (10 identical runs), 120 total tests passing in @aeorank/core
- Status:
- Status:
- Status:
- Next.js 16 App Router with Clerk auth (proxy.ts pattern), Supabase client via native Clerk accessToken() integration, SSRF-safe URL validation, and complete 3-table database schema with RLS
- QStash-powered async scan pipeline with AddSiteForm, ScanStatus polling, and 12-dimension ScoreBreakdown — the complete add-site-to-see-score loop
- Stripe Embedded Checkout with webhook sync: users upgrade via modal checkout at /upgrade, subscriptions table updated by webhook on checkout.session.completed and subscription lifecycle events
- Recharts 30-day score sparkline and JSZip-powered authenticated file download — site detail page now shows AEO progress history and one-click delivery of all 8 generated files
- Auto-advanced human verification gate for the complete SaaS loop: sign-up, scan, score, history chart, ZIP download, Stripe checkout — all Phase 5 DASH requirements marked complete
- 105 tests passing across 8 vitest files in @aeorank/core; all 20 INFRA/SCAN/SCORE/GEN requirements verified PASS with primary source evidence
- 55/55 CLI tests pass confirming all 5 Phase 2 requirements; all 9 Phase 3 site/docs requirements verified against live source tree with PASS-CODE-COMPLETE for deployment-pending items
- 34 Phase 1-3 requirements updated from "Pending verification" to verified status in REQUIREMENTS.md traceability table; coverage increased from 9/40 to 39/40
- Step-by-step Marketplace publication guide for aeorank/action@v1 covering separate repo creation, v1.0.0 release, Marketplace listing, v1 major tag, and post-publish verification

---
