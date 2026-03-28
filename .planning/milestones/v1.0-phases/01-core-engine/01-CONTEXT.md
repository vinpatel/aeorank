# Phase 1: Core Engine - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Monorepo setup (pnpm + Turborepo) and the shared `@aeorank/core` library: URL scanner, 12-dimension AEO scorer, and all 8 file generators as a pure TypeScript package with no I/O side effects. CLI wrapper, GitHub Action, marketing site, docs, and dashboard are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Monorepo Structure
- pnpm workspaces + Turborepo for build orchestration
- `packages/` for shared libraries: core, cli (stub), config
- `apps/` for deployable apps: web (dashboard stub), marketing (stub), docs (stub)
- TypeScript 5.7+ with strict mode, ES2022 target, NodeNext module resolution
- Biome for linting and formatting (replaces ESLint + Prettier)
- Vitest for testing

### Scanner Architecture
- cheerio as primary HTML parser (fast path, covers ~80% of pages)
- Playwright NOT included in Phase 1 — cheerio-only for now; lazy Playwright fallback is v1.x scope
- Rate limiting: 3 concurrent requests/sec default with exponential backoff on 429/503
- User-Agent: `AEOrank/1.0 (+https://aeorank.dev)`
- Respect `Crawl-delay` from robots.txt
- Cap at 50 pages per scan
- HTTP client: undici (Node.js built-in) or got — Claude's discretion

### Scoring Engine (12 Dimensions)
- Score 0-100, weighted across 12 dimensions
- 80%+ weight on structural/deterministic signals (not performance-based)
- Letter grades: A+ (≥95), A (≥85), B (≥70), C (≥55), D (≥40), F (<40)
- Per-dimension: score, maxScore, weight, status (pass/warn/fail), hint
- Thresholds: ≥70 = pass (green), 40-69 = warn (amber), <40 = fail (red)
- Scoring must be deterministic — same URL produces same score across runs
- Weights are externalized in a config object (not hardcoded) to allow recalibration before SaaS launch

### 12 Scoring Dimensions
1. llms.txt presence and structure (per llmstxt.org spec)
2. Schema markup (Organization, WebSite, FAQPage, Article, Author)
3. Robots.txt AI crawler directives (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
4. Content structure (heading hierarchy H1→H2→H3, sequential)
5. Answer-first formatting (concise lead paragraphs)
6. FAQ sections with schema markup
7. E-E-A-T signals (named authors, About page, credential links, publication dates)
8. Meta descriptions optimized for AI extraction
9. Sitemap presence and structure
10. HTTPS and clean redirect chains
11. Page freshness signals (last-modified, datePublished)
12. Citation-friendly anchors (heading IDs, deep-linkable sections)

### File Generators (all 8)
- `core.generateFiles(scanResult)` returns all 8 files as strings (no disk I/O in core)
- llms.txt: grouped by section per llmstxt.org spec
- llms-full.txt: full text of all crawled pages
- CLAUDE.md: repo context (tech stack, dirs, commands) — generated from scan data
- schema.json: Organization + WebSite + FAQPage JSON-LD
- robots-patch.txt: AI crawler directives (allow/disallow recommendations)
- faq-blocks.html: speakable FAQ schema snippets extracted from page content
- citation-anchors.html: heading anchor markup for deep linking
- sitemap-ai.xml: AI-optimized sitemap with content summaries

### Claude's Discretion
- Internal module structure within @aeorank/core (how to organize scanner, scorer, generators)
- Exact cheerio scraping patterns and DOM traversal
- Test fixture strategy (mock HTML pages vs real URL snapshots)
- Error handling patterns within the core library
- Package.json exports configuration

</decisions>

<specifics>
## Specific Ideas

- Domain is aeorank.dev (not aeorank.com)
- The core package must have zero I/O side effects — scanning accepts fetched HTML or a URL+fetcher, scoring works on extracted data, file generation returns strings
- Score consistency between CLI and future dashboard is a baseline trust requirement — single shared engine guarantees this
- Research found no competitor generates files — this is the primary moat. All 8 file generators must work correctly from Phase 1
- Scoring weights are v1 defaults based on research (MEDIUM confidence) — externalize into config for later recalibration

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established in this phase

### Integration Points
- @aeorank/core will be imported by CLI (Phase 2), GitHub Action (Phase 4), and dashboard API route (Phase 5)
- Shared TypeScript types (ScanResult, DimensionScore, GeneratedFile, AeorankConfig) used by all consumers
- Turborepo build pipeline: config → core → cli → apps

</code_context>

<deferred>
## Deferred Ideas

- Playwright lazy-loading for JS-heavy pages — v1.x enhancement after cheerio-only proves the concept
- Local directory scanning (`aeorank scan ./`) — Phase 2 or later
- Performance-based scoring dimensions (TTFB, load time) — keep weight low or defer, too non-deterministic
- Async scan job queue for large sites — Phase 5 dashboard concern

</deferred>

---

*Phase: 01-core-engine*
*Context gathered: 2026-03-14*
