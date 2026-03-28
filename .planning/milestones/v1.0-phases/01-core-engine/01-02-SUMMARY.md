---
phase: 01-core-engine
plan: 02
subsystem: scanner
tags: [cheerio, robots-parser, p-limit, html-parsing, url-discovery, sitemap, tdd]

# Dependency graph
requires:
  - phase: 01-core-engine plan 01
    provides: ScannedPage, ScanMeta, ScanResult, ScanConfig, RobotsInfo types; AI_CRAWLERS, DEFAULT_CONFIG constants; normalizeUrl utility
provides:
  - parsePage(url, html, baseUrl): ScannedPage — extracts title, meta, headings, schema.org, links, author, dates
  - parseRobotsTxt(url, content): RobotsInfo — AI crawler allow/disallow + crawl delay
  - createFetcher(config, crawlDelay): FetcherFn — rate-limited HTTP fetch with User-Agent, timeouts, exponential backoff
  - discoverUrls(startUrl, fetcher, maxPages): Promise<DiscoveryResult> — sitemap + BFS link discovery
  - scanUrl(url, config?, fetcher?): Promise<{pages, meta}> — orchestrator combining all scanner modules
  - Test fixtures: sample-page.html, robots.txt, sitemap.xml
affects: [01-03-scorer, 01-04-generators, 02-cli, 04-github-action, 05-saas-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD flow: RED (failing tests + fixtures) → GREEN (implementation) committed atomically"
    - "Parser uses cheerio.load(html) — all extraction is synchronous, no I/O"
    - "Fetcher wraps p-limit for concurrency, AbortSignal.timeout for per-request timeouts"
    - "Discovery: sitemap.xml first, then BFS internal link crawl, URL-normalized deduplication"
    - "parseRobotsTxt takes full URL (not path) for robots-parser isAllowed checks"
    - "Error handling: all fetch failures return {html:'', status:0} — never throw to caller"

key-files:
  created:
    - packages/core/src/scanner/parser.ts
    - packages/core/src/scanner/robots.ts
    - packages/core/src/scanner/fetcher.ts
    - packages/core/src/scanner/discovery.ts
    - packages/core/src/scanner/index.ts
    - packages/core/src/__tests__/parser.test.ts
    - packages/core/src/__tests__/scanner.test.ts
    - packages/core/src/__tests__/fixtures/sample-page.html
    - packages/core/src/__tests__/fixtures/robots.txt
    - packages/core/src/__tests__/fixtures/sitemap.xml
  modified:
    - packages/core/src/index.ts (re-exports scanUrl, parsePage, parseRobotsTxt, createFetcher, discoverUrls)

key-decisions:
  - "robots-parser requires full URL (not path) for isAllowed checks — pass origin URL not just /robots.txt path"
  - "parseRobotsTxt signature takes (url, content) not just content — needed to construct full URL for robots-parser"
  - "scanUrl accepts optional customFetcher parameter — enables clean mocking in tests without vi.mock()"
  - "Discovery caches parsed pages in Map<string, ScannedPage> — avoids double-fetch in scanUrl orchestration"
  - "Crawl-delay capped at MAX_CRAWL_DELAY constant — prevents adversarial robots.txt from blocking scan indefinitely"

patterns-established:
  - "Pattern 5: Scanner modules are pure functions — parsePage, parseRobotsTxt take strings, return data objects"
  - "Pattern 6: All async scanner functions accept FetcherFn as dependency injection for testability"
  - "Pattern 7: Discovery returns {urls, cachedPages} — orchestrator reuses cached pages to avoid redundant fetches"

requirements-completed: [SCAN-01, SCAN-02, SCAN-03, SCAN-04]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 01 Plan 02: URL Scanner Summary

**HTML parser (cheerio), rate-limited HTTP fetcher (p-limit), sitemap+BFS URL discovery, and robots.txt AI crawler access detection — all TDD with 16 parser tests and 6 scanner tests**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14
- **Completed:** 2026-03-14
- **Tasks:** 2 (parser/robots with fixtures, then fetcher/discovery/orchestrator)
- **Files modified:** 11

## Accomplishments

- `parsePage()` extracts 12 fields from HTML: title, meta description, headings (level/text/id), schema.org JSON-LD, body text, links (internal/external), canonical URL, robots meta, language, word count, author, and date published
- `parseRobotsTxt()` uses robots-parser library to check each AI crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai) — returns allowed/disallowed/unknown + crawl delay
- `createFetcher()` wraps p-limit for concurrency control, AbortSignal.timeout per request, AEOrank User-Agent, exponential backoff on 429/503
- `discoverUrls()` fetches sitemap.xml first (with sitemap index support), then BFS internal link crawl — deduplicates via normalizeUrl, skips /wp-admin, /api/, non-HTML extensions
- `scanUrl()` orchestrates all modules: robots.txt → llms.txt check → URL discovery → concurrent page fetch/parse → ScanMeta assembly
- 3 test fixture files: realistic 500-word HTML page, robots.txt with mixed AI crawler rules, sitemap.xml with 5 URLs

## Task Commits

Code was committed as part of atomic Phase 1 execution:

1. **Task 1: Build page parser and test fixtures** - `95fbad9` (feat)
   - parser.ts, robots.ts, parser.test.ts, fixtures/sample-page.html, fixtures/robots.txt, fixtures/sitemap.xml
2. **Task 2: Build URL fetcher, discovery, and scan orchestrator** - `95fbad9` (feat)
   - fetcher.ts, discovery.ts, scanner/index.ts, scanner.test.ts, updated packages/core/src/index.ts

**Plan metadata:** `0c33fbb` (docs: 01-01 complete, Phase 1 marked complete)

_Note: Tasks 1 and 2 were committed together in a single atomic commit as they were developed in a single session._

## Files Created/Modified

- `packages/core/src/scanner/parser.ts` — cheerio-based HTML parser, 12-field extraction
- `packages/core/src/scanner/robots.ts` — robots-parser wrapper with AI_CRAWLERS access map
- `packages/core/src/scanner/fetcher.ts` — p-limit rate-limited fetcher, retry, timeouts
- `packages/core/src/scanner/discovery.ts` — sitemap + BFS crawl, dedup, smart sampling
- `packages/core/src/scanner/index.ts` — scanUrl orchestrator + sub-module re-exports
- `packages/core/src/__tests__/parser.test.ts` — 16 tests covering all parsePage and parseRobotsTxt behaviors
- `packages/core/src/__tests__/scanner.test.ts` — 6 tests: scanUrl mocked, error handling, maxPages, discovery
- `packages/core/src/__tests__/fixtures/sample-page.html` — realistic 500-word HTML with all required elements
- `packages/core/src/__tests__/fixtures/robots.txt` — mixed AI crawler rules, Crawl-delay: 2
- `packages/core/src/__tests__/fixtures/sitemap.xml` — 5 URLs with lastmod and changefreq
- `packages/core/src/index.ts` — added re-exports for scanUrl and all scanner sub-exports

## Decisions Made

- `parseRobotsTxt(url, content)` takes a URL parameter (not just content) — robots-parser requires a full URL to construct the robots.txt base for isAllowed checks
- `scanUrl` accepts an optional `customFetcher` argument — cleaner than vi.mock() for testing; tests pass a mock fetcher directly
- Discovery caches parsed pages during BFS crawl — returned as `cachedPages: Map<string, ScannedPage>` to avoid re-fetching pages already scanned during discovery
- Crawl-delay capped at `MAX_CRAWL_DELAY` constant — prevents adversarial robots.txt values from stalling the scan

## Deviations from Plan

None — plan executed exactly as written. All 13 behavior specs from Task 1 and all 7 behavior specs from Task 2 are implemented and verified by tests.

## Issues Encountered

None — clean implementation. robots-parser TypeScript type workaround (type assertion for NodeNext resolution) was already documented as a known decision from Plan 01.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `scanUrl()` exported from `@aeorank/core` and callable with full ScanResult shape
- All 120 core tests passing (25 utils + 16 parser + 6 scanner + 23 dimensions + 15 generators + 11 integration + 3 determinism + others)
- Build succeeds: dual ESM/CJS + .d.ts output via tsup
- Scanner output feeds directly into Plan 03 (scorer) and Plan 04 (generators)

---
*Phase: 01-core-engine*
*Completed: 2026-03-14*

## Self-Check: PASSED

All 11 required files found on disk. Commit 95fbad9 verified in git history. 120 tests passing.
