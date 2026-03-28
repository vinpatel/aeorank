---
phase: 12-ai-discovery-expansion
plan: "02"
subsystem: core-scorer
tags: [scoring, dimensions, ai-discovery, tdd, determinism]
dependency_graph:
  requires: ["12-01"]
  provides: ["canonical-urls scorer", "rss-feed scorer", "visible-dates scorer", "38-dimension determinism"]
  affects: ["scorer/dimensions.ts", "constants.ts", "scorer/index.ts"]
tech_stack:
  added: []
  patterns: ["DimensionScorer function", "makeDimension helper", "DIMENSION_SCORERS registry"]
key_files:
  created: []
  modified:
    - packages/core/src/scorer/dimensions.ts
    - packages/core/src/constants.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/dimensions.test.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/core/src/__tests__/integration.test.ts
    - packages/core/src/__tests__/determinism.test.ts
decisions:
  - "[Phase 12-02]: scoreVisibleDates base score uses dateRatio >= 1.0 -> 9 (not 8) so all-pages-with-dates hits 9+ without meta bonus"
  - "[Phase 12-02]: scoreRssFeed identifies homepage as page with shortest URL path (not hardcoded root URL)"
  - "[Phase 12-02]: scoreCanonicalUrls normalizes trailing slashes to treat /page/ and /page as equivalent for self-referencing check"
  - "[Phase 12-02]: canonical-urls and visible-dates added to PAGE_LEVEL_DIMENSIONS; rss-feed is site-level only (homepage check)"
metrics:
  duration: 232s
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_modified: 7
---

# Phase 12 Plan 02: AI Discovery Scorer Completion Summary

**One-liner:** Added canonical-urls, rss-feed, and visible-dates scorers bringing total to 38 dimensions with full determinism test coverage for all Phase 12 additions.

## What Was Built

Three new scorer functions completing Phase 12's AI Discovery Expansion pillar:

- **scoreCanonicalUrls** (Dimension 36, low weight): Scores based on self-referencing canonical tag ratio across pages. Normalizes trailing slashes for comparison. `selfRefRatio >= 0.9` = 10, down to 0 for no canonicals.
- **scoreRssFeed** (Dimension 37, low weight): Site-level check for RSS/Atom feed linked from homepage (score 10), non-homepage only (score 4), or absent (score 0). Homepage identified by shortest URL path.
- **scoreVisibleDates** (Dimension 38, low weight): Scores ratio of pages with `<time>` elements plus +2 bonus when 50%+ of pages have `hasDatePublished`. Thresholds: 100% coverage = 9 base + potential bonus to 10.

All 3 registered in `DIMENSION_SCORERS`, added to `DIMENSION_DEFS` (38 total), and `canonical-urls`/`visible-dates` added to `PAGE_LEVEL_DIMENSIONS`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement canonical-urls, rss-feed, visible-dates scorers | 1b26165 | dimensions.ts, constants.ts, scorer/index.ts, dimensions.test.ts |
| 2 | Update scorer/integration/determinism tests for 38 dimensions | 1d097b6 | scorer.test.ts, integration.test.ts, determinism.test.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] scoreVisibleDates threshold adjustment for 9-10 range**
- **Found during:** Task 1 GREEN phase
- **Issue:** Initial thresholds had `dateRatio >= 0.8 -> 8` which failed the test expecting 9-10 when all pages have time elements (no hasDatePublished bonus)
- **Fix:** Added `dateRatio >= 1.0 -> 9` threshold so perfect coverage reaches 9 without requiring the meta bonus
- **Files modified:** packages/core/src/scorer/dimensions.ts
- **Commit:** 1b26165 (fixed in same commit after first test run)

## Verification

- `pnpm vitest run` — **598 tests pass** (0 failures) across 34 test files
- `pnpm tsc --noEmit -p packages/core/tsconfig.json` — **no type errors**
- DIMENSION_DEFS: **38 entries** confirmed
- DIMENSION_SCORERS: **38 entries** confirmed (37 quoted + `sitemap: scoreSitemap`)
- Determinism test: **all 38 dimension IDs** verified across 10 identical scan runs
- PAGE_LEVEL_DIMENSIONS: **canonical-urls** and **visible-dates** added

## Self-Check

Files verified:
- [x] packages/core/src/scorer/dimensions.ts — scoreCanonicalUrls, scoreRssFeed, scoreVisibleDates present
- [x] packages/core/src/constants.ts — 38 DIMENSION_DEFS entries
- [x] packages/core/src/scorer/index.ts — canonical-urls, visible-dates in PAGE_LEVEL_DIMENSIONS
- [x] All test files updated with 38 dimension assertions and Phase 12 IDs in determinism test

Commits verified:
- [x] 1b26165 present in git log
- [x] 1d097b6 present in git log

## Self-Check: PASSED
