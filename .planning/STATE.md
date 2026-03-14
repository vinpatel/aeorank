# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** A developer runs `npx aeorank scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.
**Current focus:** Phase 3 complete. Ready for Phase 4.

## Current Position

Phase: 3 of 5 (Web Presence) — COMPLETE
Plan: 4 of 4 in Phase 3
Status: Phase 3 complete
Last activity: 2026-03-14 — All 4 plans executed across 2 waves. Marketing site builds, docs site builds (18 pages), GitHub Actions workflows created.

Progress: [##########] 100% (Phase 3)

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

### Pending Todos

- [Phase 3]: User must configure GitHub Pages, DNS, and deploy keys before sites go live (see 03-04-SUMMARY.md)

### Blockers/Concerns

- [Phase 1]: Scoring model weights (12-dimension) based on MEDIUM-confidence third-party research — externalize into config object before SaaS launch
- [Phase 5]: Clerk + Supabase JWT sync in Next.js 16 `proxy.ts` context has limited documentation — spike before Phase 5 planning
- [Phase 5]: Async scan job queue mechanism (Supabase pg_cron, Upstash QStash, Vercel Background Functions) — defer decision to Phase 5 planning
- [Phase 5]: SSRF prevention on scan API route is a launch blocker — validate all URLs before server-side fetch

## Session Continuity

Last session: 2026-03-14
Stopped at: Phase 3 complete. All 4 plans executed across 2 waves. Ready for Phase 4 (GitHub Action).
Resume file: None
