---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-14T23:43:40.822Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 19
  completed_plans: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** A developer runs `npx aeorank scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.
**Current focus:** Phase 5 in progress. Plan 03 complete — Stripe billing with Embedded Checkout, webhook handler, and upgrade page.

## Current Position

Phase: 5 of 5 (SaaS Dashboard) — IN PROGRESS
Plan: 3 of 5 in Phase 5 — COMPLETE (plans 1, 3 done; plans 2, 4, 5 remaining — plan 2 exists but scan API has qstash dependency)
Status: Phase 5 in progress
Last activity: 2026-03-14 — Stripe billing implemented: /upgrade pricing page, Embedded Checkout modal, webhook handler syncing subscriptions to Supabase.

Progress: [############] (Phase 5 Plan 3 of 5)

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
| Phase 05-saas-dashboard P03 | 4min | 2 tasks | 8 files |

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
- [Phase 05-saas-dashboard]: Stripe client must be a lazy factory (getStripeClient) not singleton — next build evaluates modules without env vars
- [Phase 05-saas-dashboard]: Stripe v20 current_period_end is on SubscriptionItem not Subscription top-level
- [Phase 05-saas-dashboard]: Stripe webhook returns 200 on handler errors to prevent Stripe retry storms on transient DB failures

### Pending Todos

- [Phase 3]: User must configure GitHub Pages, DNS, and deploy keys before sites go live (see 03-04-SUMMARY.md)

### Blockers/Concerns

- [Phase 1]: Scoring model weights (12-dimension) based on MEDIUM-confidence third-party research — externalize into config object before SaaS launch
- [Phase 5]: RESOLVED — Clerk + Supabase native integration confirmed working; auth.protect() API updated from research pattern
- [Phase 5]: RESOLVED — QStash chosen for async scan queue; pattern documented in RESEARCH.md
- [Phase 5]: RESOLVED — SSRF prevention implemented as validateScanUrl() in apps/web/lib/validate-url.ts; 12 tests pass
- [Phase 5]: User must configure Clerk and Supabase before running dev server (see apps/web/.env.example)

## Session Continuity

Last session: 2026-03-14
Stopped at: Completed 05-saas-dashboard-03-PLAN.md — Stripe billing with Embedded Checkout, webhook handler (checkout.session.completed, subscription events), /upgrade pricing page, CheckoutButton modal, PlanBadge in nav.
Resume file: None
