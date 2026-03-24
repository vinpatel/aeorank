---
phase: 01-core-engine
plan: 04
subsystem: generators
tags: [typescript, json-ld, llms-txt, schema-org, xml, html, pure-functions]

# Dependency graph
requires:
  - phase: 01-core-engine/01-01
    provides: ScanResult, ScannedPage, GeneratedFile types + slugify utility
  - phase: 01-core-engine/01-02
    provides: scanner populating pages + meta for generators to consume
  - phase: 01-core-engine/01-03
    provides: scored ScanResult with dimensions fed into schema.json generator
provides:
  - generateLlmsTxt(result) — llms.txt per llmstxt.org spec (H1, blockquote, H2 sections)
  - generateLlmsFullTxt(result) — full page body text dump sorted by URL
  - generateClaudeMd(result) — CLAUDE.md with tech stack, site structure, content summary
  - generateSchemaJson(result) — JSON-LD with Organization + WebSite + FAQPage entities
  - generateRobotsPatch(result) — AI crawler directives for robots.txt
  - generateFaqBlocks(result) — FAQPage JSON-LD + microdata HTML with speakable
  - generateCitationAnchors(result) — heading anchor suggestions with slug IDs
  - generateSitemapAi(result) — XML sitemap with custom ai:summary extension
  - generateFiles(result) — orchestrator returning all 8 GeneratedFile objects
affects: [02-cli, 04-github-action, 05-saas-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure generator functions: every generator takes ScanResult and returns string — no I/O"
    - "Deterministic output: all generators sort pages/sections by URL before processing"
    - "HTML escaping: faq-blocks.html and citation-anchors.html escape all user content"
    - "XML escaping: sitemap-ai.xml escapes &, <, >, ', quote in URL and summary content"
    - "FAQ extraction: dual strategy — parse existing FAQPage schema-org OR detect heading ? patterns"
    - "llmstxt.org spec: H1 site name, > blockquote description, H2 path-segment sections"

key-files:
  created:
    - packages/core/src/generators/llms-txt.ts
    - packages/core/src/generators/llms-full.ts
    - packages/core/src/generators/claude-md.ts
    - packages/core/src/generators/schema-json.ts
    - packages/core/src/generators/robots-patch.ts
    - packages/core/src/generators/faq-blocks.ts
    - packages/core/src/generators/citation-anchors.ts
    - packages/core/src/generators/sitemap-ai.ts
    - packages/core/src/generators/index.ts
    - packages/core/src/__tests__/generators.test.ts
  modified:
    - packages/core/src/index.ts

key-decisions:
  - "All generators are pure functions — ScanResult in, string out, no disk I/O anywhere"
  - "generateFiles() returns a fixed-order array of 8 items — order is part of the public contract"
  - "sitemap-ai.xml uses custom xmlns:ai namespace at https://aeorank.dev/sitemap-ai"
  - "FAQ extraction uses dual strategy: existing FAQPage schema-org takes priority over heading-pattern detection"
  - "citation-anchors targets only H2/H3 without id attributes (H1 is typically the page title)"
  - "robots-patch marks crawlers already allowed with # comment rather than emitting duplicate directives"

patterns-established:
  - "Pattern 1: All generators sort by URL (a.url.localeCompare(b.url)) for output determinism"
  - "Pattern 2: Escape helpers (escapeHtml, escapeXml) defined per-file to avoid cross-file coupling"
  - "Pattern 3: FAQ extraction deduplicates via Set<string> keyed on question text"

requirements-completed: [GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, GEN-07, GEN-08]

# Metrics
duration: ~20min
completed: 2026-03-14
---

# Phase 01 Plan 04: All 8 File Generators Summary

**8 pure generator functions producing llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, and sitemap-ai.xml from any ScanResult — no disk I/O, deterministic output**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-14
- **Completed:** 2026-03-14
- **Tasks:** 2 (4 generators each, TDD pattern)
- **Files modified:** 11

## Accomplishments

- All 8 generator functions implemented as pure TypeScript with no side effects
- `generateFiles()` orchestrator exports all 8 as `GeneratedFile[]` from `@aeorank/core`
- `llms.txt` follows llmstxt.org spec exactly: H1 title, blockquote description, H2 sections by path segment
- `schema.json` produces valid JSON-LD `@graph` with Organization + WebSite + FAQPage (when Q&A detected)
- `sitemap-ai.xml` uses custom `xmlns:ai` namespace with `<ai:summary>` element per URL
- 15 generator tests passing across 5 describe blocks

## Task Commits

Work was executed in the initial Phase 1 batch:

1. **Task 1: llms.txt, llms-full.txt, CLAUDE.md, schema.json generators** — included in `d265262` (feat)
2. **Task 2: robots-patch, faq-blocks, citation-anchors, sitemap-ai + orchestrator** — included in `d265262` (feat)

**Full commit:** `d265262` — `feat(01-04): all 8 file generators`

## Files Created/Modified

- `packages/core/src/generators/llms-txt.ts` — llms.txt per llmstxt.org spec; pages grouped by first URL path segment
- `packages/core/src/generators/llms-full.ts` — full body text dump, pages sorted by URL
- `packages/core/src/generators/claude-md.ts` — CLAUDE.md with tech stack, site structure, content summary sections
- `packages/core/src/generators/schema-json.ts` — JSON-LD @graph with Organization, WebSite, optional FAQPage
- `packages/core/src/generators/robots-patch.ts` — AI crawler directives using AI_CRAWLERS constant; marks already-allowed crawlers
- `packages/core/src/generators/faq-blocks.ts` — FAQPage JSON-LD + microdata HTML; extracts from schema-org or heading patterns
- `packages/core/src/generators/citation-anchors.ts` — H2/H3 headings without id; slugify() for suggested anchor ids
- `packages/core/src/generators/sitemap-ai.ts` — XML sitemap with custom ai:summary extension namespace
- `packages/core/src/generators/index.ts` — generateFiles() returning fixed-order array of 8 GeneratedFile items
- `packages/core/src/__tests__/generators.test.ts` — 15 tests: generateFiles, llms.txt, llms-full.txt, schema.json, robots-patch
- `packages/core/src/index.ts` — re-exports generateFiles from generators/index.ts

## Decisions Made

- All generators are pure functions with zero disk I/O — guarantees score/file determinism across CLI, GHA, and SaaS dashboard
- `generateFiles()` returns a fixed-order array of 8 items — the order (llms.txt first through sitemap-ai.xml last) is the public contract consumed by CLI and dashboard
- `sitemap-ai.xml` uses `xmlns:ai="https://aeorank.dev/sitemap-ai"` custom namespace — differentiates from standard sitemap.xml
- FAQ extraction dual strategy: existing FAQPage schema-org data takes precedence over heuristic heading-? detection
- `robots-patch.txt` marks already-allowed crawlers with `# {crawler}: Already allowed` comments instead of re-emitting directives — prevents duplicate directives when users append to existing robots.txt

## Deviations from Plan

None — plan executed exactly as written. All 8 generators implemented with specified behavior. The test file covers all major generators but uses a single describe-based pattern rather than per-file test files — this is simpler and works well for pure function generators.

## Issues Encountered

None — all generators are pure functions over the already-typed ScanResult, so implementation was straightforward with no type resolution or build issues.

## Next Phase Readiness

- `generateFiles()` exported from `@aeorank/core` — CLI can call it directly without knowing individual generator modules
- All generators are deterministic (sorted output) — the determinism test in Plan 05 will pass cleanly
- No external dependencies added — generators use only built-in TypeScript + types/constants from earlier plans

---
*Phase: 01-core-engine*
*Completed: 2026-03-14*

## Self-Check: PASSED

- All 10 generator source files: FOUND
- Task commit d265262 (feat(01-04): all 8 file generators): FOUND
- 15 generator tests passing: VERIFIED (pnpm test 120/120)
