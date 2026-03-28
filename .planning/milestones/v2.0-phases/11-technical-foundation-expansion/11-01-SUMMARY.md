---
phase: 11-technical-foundation-expansion
plan: "01"
subsystem: scoring
tags: [typescript, vitest, cheerio, semantic-html, scoring, parser, dimensions]

# Dependency graph
requires:
  - phase: 10-trust-authority-expansion
    provides: "27 existing scorers, ScannedPage type, parser.ts extraction pattern, DIMENSION_DEFS"
provides:
  - "scoreSemanticHtml: scores semantic HTML5 landmark elements + lang attribute + ARIA roles"
  - "scoreExtractionFriction: inverted scorer rewarding short average sentence length and active voice"
  - "scoreImageContext: scores alt text coverage and figure/figcaption usage per image"
  - "ScannedPage extended with 6 new fields: semanticElements, ariaRoleCount, figureCount, imgCount, imgsWithAlt, avgSentenceLength"
  - "DIMENSION_DEFS at 30 entries (was 27)"
  - "All 553 tests passing"
affects: [12-ai-discovery-expansion, scoring-engine, cli, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New parser fields extracted BEFORE DOM mutation line ($('script, style, nav, footer, header').remove())"
    - "All new scorers sort pages by URL for determinism before computing averages"
    - "scoreExtractionFriction is an inverted scorer: lower friction = higher score (10 = clean, short sentences)"
    - "scoreImageContext returns 10 for zero-image pages (no images = no friction from images)"
    - "Per-page signal averaging maps to stepped score thresholds (not raw average)"

key-files:
  created:
    - packages/core/src/__tests__/parser.test.ts (10 new tests in 'parsePage semantic elements' describe block)
  modified:
    - packages/core/src/types.ts (6 new ScannedPage fields)
    - packages/core/src/scanner/parser.ts (extracts semanticElements, ariaRoleCount, figureCount, imgCount, imgsWithAlt, avgSentenceLength)
    - packages/core/src/scorer/dimensions.ts (3 new scorer functions + 3 registry entries)
    - packages/core/src/constants.ts (3 new DIMENSION_DEFS entries, 30 total)
    - packages/core/src/scorer/index.ts (3 new IDs in PAGE_LEVEL_DIMENSIONS)
    - packages/core/src/__tests__/dimensions.test.ts (16 new tests, updated imports, updated makePage defaults)
    - packages/core/src/__tests__/scorer.test.ts (updated makePage defaults, 27→30 counts)
    - packages/core/src/__tests__/integration.test.ts (27→30 dimension count)
    - packages/core/src/__tests__/determinism.test.ts (27→30 dimension count)

key-decisions:
  - "scoreExtractionFriction uses avgSentenceLength from parser (pre-computed) rather than re-splitting sentences during scoring"
  - "Passive voice detection uses regex /\\b(is|are|was|were|been|being)\\s+\\w+ed\\b/i per sentence as a simple heuristic"
  - "scoreImageContext scores zero-image pages as 10 (no images = no extraction friction from missing alt text)"
  - "All 3 new dimensions added to PAGE_LEVEL_DIMENSIONS (each page has own semantic elements and images)"
  - "Deviation Rule 1: scorer.test.ts, integration.test.ts, determinism.test.ts updated from 27→30 dimension counts (direct consequence of adding 3 dimensions)"

patterns-established:
  - "Extract all parser fields BEFORE $('script, style, nav, footer, header').remove() DOM mutation"
  - "Inverted scorers (lower value = higher score) named with noun describing the bad thing (friction, duplication)"
  - "Zero-page guard at top of every scorer function returns score=0 with informative hint"

requirements-completed: [TECH-01, TECH-02, TECH-03]

# Metrics
duration: 8min
completed: 2026-03-28
---

# Phase 11 Plan 01: Technical Foundation Expansion Summary

**3 new AEO scoring dimensions (semantic-html, extraction-friction, image-context) with 6 new ScannedPage parser fields, extending DIMENSION_DEFS to 30 total and all 553 tests passing**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-28T15:23:05Z
- **Completed:** 2026-03-28T15:26:24Z
- **Tasks:** 2 (both TDD)
- **Files modified:** 9

## Accomplishments

- Extended `ScannedPage` with 6 new fields extracted by the parser before DOM mutation: `semanticElements` (per-tag counts), `ariaRoleCount`, `figureCount`, `imgCount`, `imgsWithAlt`, `avgSentenceLength`
- Implemented `scoreSemanticHtml` (Dimension 28): scores landmark element coverage + lang attribute + ARIA roles using a per-page signal sum mapped to stepped thresholds
- Implemented `scoreExtractionFriction` (Dimension 29): inverted scorer rewarding pages with short average sentence length (<= 18 words = 10) and penalizing passive voice
- Implemented `scoreImageContext` (Dimension 30): scores alt text ratio and figure/figcaption usage; zero-image pages score 10 (no friction)
- DIMENSION_DEFS count: 27 → 30; PAGE_LEVEL_DIMENSIONS: 19 → 22; all 3 IDs registered in DIMENSION_SCORERS

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ScannedPage type and parser** - `f69dc8f` (feat)
2. **Task 2: Implement 3 scorers** - `810ef8d` (feat)

_TDD: RED (failing tests) written first, GREEN (implementation) applied, verified 553/553 pass_

## Files Created/Modified

- `packages/core/src/types.ts` - 6 new ScannedPage fields added after listCount
- `packages/core/src/scanner/parser.ts` - extracts all 6 new fields before DOM mutation
- `packages/core/src/scorer/dimensions.ts` - scoreSemanticHtml, scoreExtractionFriction, scoreImageContext + 3 registry entries
- `packages/core/src/constants.ts` - 3 new DIMENSION_DEFS entries (30 total)
- `packages/core/src/scorer/index.ts` - 3 new IDs in PAGE_LEVEL_DIMENSIONS (22 total)
- `packages/core/src/__tests__/parser.test.ts` - 10 new tests for new parser fields
- `packages/core/src/__tests__/dimensions.test.ts` - 16 new scorer tests, updated imports and makePage defaults
- `packages/core/src/__tests__/scorer.test.ts` - updated makePage defaults, 27→30 dimension count assertions
- `packages/core/src/__tests__/integration.test.ts` - 27→30 dimension count assertion
- `packages/core/src/__tests__/determinism.test.ts` - 27→30 dimension count assertion

## Decisions Made

- `scoreExtractionFriction` uses `avgSentenceLength` pre-computed by parser (not re-splitting sentences during scoring) for efficiency and consistency
- Passive voice detection: simple regex `/\b(is|are|was|were|been|being)\s+\w+ed\b/i` per sentence — lightweight heuristic sufficient for scoring signal
- `scoreImageContext` returns 10 for zero-image pages (no images = no friction from missing alt text)
- All 3 new dimensions are page-level (each page has its own semantic elements and images) — added to PAGE_LEVEL_DIMENSIONS

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated 27→30 dimension count assertions in scorer/integration/determinism tests**
- **Found during:** Task 2 (implement scorers)
- **Issue:** `scorer.test.ts`, `integration.test.ts`, `determinism.test.ts` all asserted `toHaveLength(27)` — now incorrect with 30 dimensions. `scorer.test.ts` also had a `makePage` helper missing new fields causing TypeError.
- **Fix:** Updated all 3 files to expect 30 dimensions; added new fields to `scorer.test.ts` makePage helper
- **Files modified:** packages/core/src/__tests__/scorer.test.ts, integration.test.ts, determinism.test.ts
- **Verification:** All 553 tests pass
- **Committed in:** 810ef8d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - direct consequence of adding 3 dimensions)
**Impact on plan:** Necessary correctness fix. No scope creep.

## Issues Encountered

None — TDD flow proceeded cleanly. RED confirmed failures, GREEN confirmed all tests pass.

## Next Phase Readiness

- DIMENSION_DEFS at 30 (of planned 36 for v2.0)
- All 553 tests passing
- Phase 12 (AI Discovery expansion) can proceed — no blockers

---
*Phase: 11-technical-foundation-expansion*
*Completed: 2026-03-28*
