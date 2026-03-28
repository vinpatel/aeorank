---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Competitive Parity
status: verifying
stopped_at: Completed 09-02-PLAN.md — 3 final Content Structure scorers added (tables-lists, definition-patterns, entity-disambiguation), DIMENSION_DEFS at 25 entries, all 180 tests passing
last_updated: "2026-03-28T19:08:10.835Z"
last_activity: 2026-03-28
progress:
  total_phases: 9
  completed_phases: 2
  total_plans: 4
  completed_plans: 4
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-28)

**Core value:** A developer runs `npx aeorank-cli scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.
**Current focus:** Phase 09 — content-structure-expansion

## Current Position

Phase: 10
Plan: Not started
Milestone: v2.0 Competitive Parity — Phases 8-16
Status: Phase complete — ready for verification
Last activity: 2026-03-28

Progress: [####################] (Phase 7 — 2/3 plans done)

## Performance Metrics

**Velocity:**

- Total plans completed: 12
- Average duration: ~10 min per plan
- Total execution time: ~2.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 — Core Engine | 5 | ~1.5h | ~18min |
| 2 — CLI | 3 | ~35min | ~12min |
| 3 — Web Presence | 4 | ~20min | ~5min |

**Recent Trend:**

- Last 4 plans: 03-01 through 03-04
- Trend: accelerating (content/config plans faster than code plans)

*Updated after each plan completion*

| Phase 04-github-action P01 | 78s | 2 tasks | 2 files |
| Phase 04-github-action P02 | 27s | 2 tasks | 1 files |
| Phase 05-saas-dashboard P01 | 306s | 2 tasks | 15 files |
| Phase 05-saas-dashboard P02 | 20min | 2 tasks | 9 files |
| Phase 05-saas-dashboard P03 | 4min | 2 tasks | 8 files |
| Phase 05-saas-dashboard P04 | 2min | 2 tasks | 5 files |
| Phase 05-saas-dashboard P05 | 1min | 1 task | 0 files |
| Phase 06-retroactive-verification P02 | 4min | 2 tasks | 2 files |
| Phase 06-retroactive-verification P01 | 112s | 1 tasks | 1 files |
| Phase 06-retroactive-verification P03 | 120 | 1 tasks | 2 files |
| Phase 07 P01 | 64s | 2 tasks | 5 files |
| Phase 07 P02 | 59s | 1 task | 1 file |
| Phase 01-core-engine P01 | 15min | 2 tasks | 19 files |
| Phase 01-core-engine P02 | 15min | 2 tasks | 11 files |
| Phase 01-core-engine P03 | 20 | 2 tasks | 6 files |
| Phase 01-core-engine P04 | 20min | 2 tasks | 11 files |
| Phase 08 P01 | 8min | 2 tasks | 8 files |
| Phase 08 P02 | 5min | 2 tasks | 7 files |
| Phase 09 P01 | 5min | 2 tasks | 10 files |
| Phase 09 P02 | 3min | 2 tasks | 7 files |

## Phase 4 Deliverables

### Composite GitHub Action (`aeorank/action@v1`)

- **action.yml:** Composite action with 4 steps — scan, Check Run, find-comment, upsert-comment
- **Inputs:** url (required), token (default: github.token), fail-below (default: 0)
- **Check Run:** Posts to GitHub Checks API via actions/github-script@v8; dimension table in output.text
- **PR Comment:** Upserts via peter-evans/find-comment@v3 + create-or-update-comment@v5 with hidden marker
- **Fail-below:** Failure conclusion when score < threshold, regardless of raw score band
- **README.md:** 163-line Marketplace listing with quick start, permissions, full workflow, fork PR notes

### Requirements covered

GHA-01, GHA-02, GHA-03, GHA-04, GHA-05

## Phase 1 Deliverables

### @aeorank/core package

- **Scanner:** URL fetcher with rate limiting, HTML parser (cheerio), robots.txt parser, sitemap+BFS URL discovery
- **Scorer:** 12 weighted dimensions, letter grades (A+ through F), pass/warn/fail status per dimension
- **Generators:** All 8 output files (llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml)
- **Integration:** `scan()` convenience API wiring all three stages together
- **Tests:** 105 tests across 8 test files (utils, parser, scanner, dimensions, scorer, generators, integration, determinism)
- **Build:** Dual ESM/CJS output with .d.ts via tsup. Biome lint/format clean.

### Requirements covered

REQ-01, REQ-02, REQ-03, REQ-07, REQ-09, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20

## Phase 2 Deliverables

### @aeorank/cli package

- **Scan command:** `aeorank scan <url>` with colored score display, dimension table, next-steps recommendations
- **JSON mode:** `--format json` for CI piping — clean JSON to stdout
- **Init command:** `aeorank init` creates template aeorank.config.js
- **Config loading:** Merges defaults < user config < CLI flags
- **Error handling:** Every error has actionable suggestion (URL, network, timeout, permission)
- **File output:** Writes all 8 generated files to `--output` dir with overwrite protection
- **Build:** Single 11KB ESM bundle via tsup with node shebang
- **Tests:** 55 tests across 6 test files (errors, score-display, scan, config, init, integration)

### Requirements covered

CLI-01, CLI-02, CLI-03, CLI-04, CLI-05

## Phase 3 Deliverables

### @aeorank/marketing site

- **Framework:** Astro 5 + Tailwind CSS 4 (via @tailwindcss/vite) + Preact
- **Design:** 37signals aesthetic — #FAF9F7 bg, #111 text, Inter font, solid black buttons
- **Homepage:** Hero, How It Works, Files List, Scoring Explainer, Pricing, FAQ, CTA
- **Terminal demo:** Preact island with typing animation (client:visible, ~4KB gzipped)
- **Zero JS:** No JavaScript in HTML output except the terminal demo island
- **Deploy:** GitHub Pages via withastro/action@v5 (aeorank.dev)

### @aeorank/docs site

- **Framework:** Astro 5 + Starlight with Pagefind search
- **Content:** 17 pages — getting started, CLI reference, 8 file docs, scoring explainer
- **Search:** Pagefind indexed 1069 words across 17 pages
- **Deploy:** GitHub Pages via peaceiris/actions-gh-pages to aeorank/docs repo (docs.aeorank.dev)

### GitHub Actions

- `deploy-marketing.yml` — builds + deploys marketing on push to main
- `deploy-docs.yml` — builds + pushes docs to external repo on push to main
- Path-based triggers prevent unnecessary builds

### Requirements covered

SITE-01, SITE-02, SITE-03, SITE-04, DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05

## Phase 6 Deliverables

### Retroactive Verification

- **01-VERIFICATION.md:** Phase 1 (Core Engine) — 20/20 requirements verified PASS
- **02-VERIFICATION.md:** Phase 2 (CLI) — 5/5 requirements verified PASS
- **03-VERIFICATION.md:** Phase 3 (Web Presence) — 9/9 requirements verified (7 PASS, 2 PASS-CODE-COMPLETE)
- **Traceability:** REQUIREMENTS.md updated with verified status for all 34 Phase 1-3 requirements
- **Coverage:** Verified count increased from 9/40 to 39/40

### Requirements covered

INFRA-01, INFRA-02, INFRA-03, SCAN-01 through SCAN-04, SCORE-01 through SCORE-05, GEN-01 through GEN-08, CLI-01 through CLI-05, SITE-01 through SITE-04, DOCS-01 through DOCS-05

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-phase]: Use Next.js 16 (not 15 — 16 is current stable as of 2026-03-14)
- [Pre-phase]: Use Astro 5.18.x for marketing/docs (not 4 as originally planned)
- [Pre-phase]: `@aeorank/core` must be a pure package with no I/O — guarantees score determinism across CLI, GHA, and dashboard
- [Pre-phase]: Scoring must weight structural/deterministic signals at 80%+ to prevent score drift
- [Phase 1]: robots-parser requires full URLs (not paths) for isAllowed checks
- [Phase 1]: robots-parser TypeScript types need type assertion workaround for NodeNext resolution
- [Phase 1]: tsup exports require "types" condition before "import"/"require" in package.json
- [Phase 2]: chalk suppresses ANSI in non-TTY — tests verify content not color codes
- [Phase 2]: @aeorank/core marked external in CLI tsup config (workspace dep, not bundled)
- [Phase 3]: Used @tailwindcss/vite (not deprecated @astrojs/tailwind) for Tailwind CSS 4
- [Phase 3]: GitHub Pages limits 1 custom domain per repo — docs deploys to separate aeorank/docs repo
- [Phase 3]: Starlight uses default theme (not customized to match marketing site brand)
- [Phase 04-github-action]: Use env: block to pass large JSON scan result to github-script (not template interpolation)
- [Phase 04-github-action]: Use AEORANK_EOF as multiline delimiter to avoid collision with generic EOF
- [Phase 04-github-action]: Use context.payload.pull_request.head.sha on PR events, not context.sha (merge commit)
- [Phase 04-github-action]: Check conclusion: failure(<40 or fail-below), neutral(40-69), success(70+)
- [Phase 04-github-action]: Use fail-below: 0 in self-test so example.com scan never fails on score
- [Phase 05-saas-dashboard]: Clerk v6 auth.protect() API: auth param in clerkMiddleware is AuthFn with protect() as direct property, not auth().protect()
- [Phase 05-saas-dashboard]: proxy.ts confirmed for Next.js 16 middleware; PROXY_FILENAME constant exists alongside MIDDLEWARE_FILENAME in Next.js 16 constants
- [Phase 05-saas-dashboard]: Supabase client uses Clerk native accessToken() integration (not deprecated JWT template)
- [Phase 05-saas-dashboard P02]: QStash client must be a lazy factory (getQStashClient) not singleton — next build evaluates modules without env vars present
- [Phase 05-saas-dashboard P02]: Service-role Supabase client required in /api/scan/process — QStash callbacks are unauthenticated HTTP, user_id was set at enqueue time
- [Phase 05-saas-dashboard]: Stripe client must be a lazy factory (getStripeClient) not singleton — next build evaluates modules without env vars
- [Phase 05-saas-dashboard]: Stripe v20 current_period_end is on SubscriptionItem not Subscription top-level
- [Phase 05-saas-dashboard]: Stripe webhook returns 200 on handler errors to prevent Stripe retry storms on transient DB failures
- [Phase 05-saas-dashboard]: JSZip arraybuffer output type required for Next.js Route Handler Response BodyInit compatibility (nodebuffer and uint8array both fail TypeScript strict mode)
- [Phase 05-saas-dashboard P05]: checkpoint:human-verify auto-approved via workflow.auto_advance=true (yolo mode); all DASH requirements marked complete
- [Phase 06-retroactive-verification]: CLI-01 through CLI-05 all PASS — 55/55 CLI tests passing, source evidence confirmed for each requirement
- [Phase 06-retroactive-verification]: SITE-01 and DOCS-01 marked PASS-CODE-COMPLETE (not FAIL) — code and workflows ready, manual GitHub Pages/DNS/deploy key setup pending
- [Phase 06-retroactive-verification]: SCAN-03 marked PASS with MEDIUM confidence caveat: per-request timeout (30s) is not a per-scan guarantee
- [Phase 06-retroactive-verification]: SCORE-01 '80%+ structural/deterministic' = all 12 dimensions are deterministic (no AI/random), not a weight-percentage claim
- [Phase 06-retroactive-verification]: INFRA-02 verified against packages/core (not packages/config empty stub)
- [Phase 06-retroactive-verification]: 34 Phase 1-3 requirements updated in REQUIREMENTS.md traceability — no further mapping needed for Phase 6
- [Phase 06-retroactive-verification]: SITE-01 and DOCS-01 marked 'Complete (code; deploy pending)' — consistent with PASS-CODE-COMPLETE in 03-VERIFICATION.md
- [Phase 07-01]: Dashboard links use https://app.aeorank.dev across all five updated components
- [Phase 07-02]: GitHub Marketplace requires action.yml at repo root — aeorank/action must be a separate repository (not monorepo subdirectory); Option A is standard and recommended
- [Phase 07-02]: v1 major version tag must be manually force-pushed after v1.0.0 release to enable uses: aeorank/action@v1 pinning
- [Phase 01-core-engine]: pnpm + Turborepo monorepo with NodeNext module resolution and Biome for lint/format
- [Phase 01-core-engine]: tsup exports require types condition before import/require for NodeNext type resolution
- [Phase 01-core-engine]: Weight multipliers (high=1.5, medium=1.0, low=0.5) externalized in WEIGHT_MULTIPLIER constant for recalibration
- [Phase 01-core-engine]: Registry pattern (DIMENSION_SCORERS map) decouples orchestrator from individual scorers — future dimension additions require only adding one entry
- [Phase 01-core-engine]: scorePerPage() added beyond plan spec — per-page dimension scoring needed by Phase 5 SaaS dashboard for per-page drill-down views
- [Phase 01-core-engine]: parseRobotsTxt takes (url, content) not just content — robots-parser requires full URL for isAllowed checks
- [Phase 01-core-engine]: scanUrl accepts optional customFetcher parameter for clean dependency injection in tests
- [Phase 01-core-engine]: Discovery caches parsed pages in Map<string, ScannedPage> to avoid double-fetch in scanUrl orchestration
- [Phase 01-core-engine]: All 8 generators are pure functions (ScanResult in, string out) with no disk I/O — guarantees determinism across CLI, GHA, and dashboard
- [Phase 01-core-engine P05]: scan() convenience API wires scanner → scorer → generators in one call with optional customFetcher for hermetic test mocking
- [Phase 01-core-engine P05]: Biome noParameterAssign: use resolvedFetcher local variable instead of reassigning customFetcher parameter in scan()
- [Phase 08]: Extract paragraphs BEFORE DOM mutation in parser.ts to capture p elements that may be inside removed nav/footer containers
- [Phase 08]: Use djb2-style hash (not crypto) for contentHash to keep parser.ts pure with no I/O imports
- [Phase 08]: scoreTopicCoherence returns score=5 with informative hint when fewer than 2 pages (not enough data)
- [Phase 08]: fact-density and duplicate-content added to PAGE_LEVEL_DIMENSIONS; topic-coherence and original-data kept site-level
- [Phase 08]: scoreCrossPageDuplication uses Map<normalized-para, Set<page-url>> to detect identical paragraphs appearing on 2+ distinct pages
- [Phase 08]: scoreEvidencePackaging requires 2+ attribution/citation markers per page to count toward the scored percentage
- [Phase 08]: scoreCitationReadyWriting uses negative lookahead to exclude question words from definition pattern — prevents 'What is' from matching as definition
- [Phase 08]: cross-page-duplication kept site-level only; evidence-packaging and citation-ready-writing added to PAGE_LEVEL_DIMENSIONS
- [Phase 09]: scoreQaFormat scores ratio of question headings to total headings; thresholds >0.4=10 >0.25=7 >0.1=4 >0=2
- [Phase 09]: scoreDirectAnswerDensity only analyzes pages with question headings; 40-300 char capital-start paragraphs count as direct answers
- [Phase 09]: scoreQueryAnswerAlignment checks paragraphs.length >= questionHeadings.length per page as alignment signal
- [Phase 09]: QUESTION_WORD_REGEX extracts headings starting with What/How/Why/When/Where/Who/Is/Are/Do/Does/Did/Can/Could/Should OR containing ?
- [Phase 09]: DEFINITION_SENTENCE_PATTERNS uses specific anchors (is defined as, refers to, means/describes + the/a/an) to avoid matching generic sentences
- [Phase 09]: scoreEntityDisambiguation tokenizes page title into entity terms (>= 4 chars, not stopwords), checks first paragraph and 3+ total bodyText occurrences
- [Phase 09]: ENTITY_STOPWORDS excludes common English words and generic web terms to improve entity term extraction quality

### Pending Todos

- [Phase 3]: User must configure GitHub Pages, DNS, and deploy keys before sites go live (see 03-04-SUMMARY.md)

### Blockers/Concerns

- [Phase 1]: Scoring model weights (12-dimension) based on MEDIUM-confidence third-party research — externalize into config object before SaaS launch
- [Phase 5]: RESOLVED — Clerk + Supabase native integration confirmed working; auth.protect() API updated from research pattern
- [Phase 5]: RESOLVED — QStash chosen for async scan queue; pattern documented in RESEARCH.md
- [Phase 5]: RESOLVED — SSRF prevention implemented as validateScanUrl() in apps/web/lib/validate-url.ts; 12 tests pass
- [Phase 5]: User must configure Clerk and Supabase before running dev server (see apps/web/.env.example)

## Session Continuity

Last session: 2026-03-28T19:05:09.491Z
Stopped at: Completed 09-02-PLAN.md — 3 final Content Structure scorers added (tables-lists, definition-patterns, entity-disambiguation), DIMENSION_DEFS at 25 entries, all 180 tests passing
Resume file: None
