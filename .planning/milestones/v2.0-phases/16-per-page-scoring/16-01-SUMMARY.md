---
phase: 16-per-page-scoring
plan: 01
subsystem: core-scoring
tags: [per-page-scoring, scoring, types, constants, tdd]
dependency_graph:
  requires: []
  provides: [PAGE_LEVEL_DIMENSIONS, PAGE_SCORE_MAX, PageScore.maxScore, scorePerPage-0-75]
  affects: [packages/core, api-scan-results, dashboard-page-scores]
tech_stack:
  added: []
  patterns: [TDD red-green, exported constants, 0-75 scale normalization]
key_files:
  created: []
  modified:
    - packages/core/src/constants.ts
    - packages/core/src/types.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/index.ts
    - packages/core/src/__tests__/scorer.test.ts
decisions:
  - "PAGE_LEVEL_DIMENSIONS moved from scorer/index.ts local const to constants.ts exported const — single source of truth, importable by CLI/dashboard consumers"
  - "PAGE_SCORE_MAX = 75 constant used throughout scorer to avoid magic numbers and allow easy recalibration"
  - "Duplication gate updated to Math.round(75 * 0.35) = 26 to stay proportional on 0-75 scale"
  - "getGrade() called with score * (100/75) to keep letter grade thresholds on 0-100 scale"
metrics:
  duration: 139s
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_modified: 5
requirements: [PAGE-01, PAGE-04]
---

# Phase 16 Plan 01: Per-Page Scoring 0-75 Scale Summary

Per-page scoring changed from 0-100 to 0-75 scale with `PAGE_LEVEL_DIMENSIONS` and `PAGE_SCORE_MAX` exported from `@aeorank/core` for CLI and dashboard consumers.

## What Was Built

- `scorePerPage()` now returns scores on the 0-75 scale (site-level dimensions like topic-coherence and cross-page-duplication are excluded per-page, so the max achievable is 75 not 100)
- `PageScore` interface gained `maxScore: number` field (always 75) so consumers can display scores without hardcoding
- `PAGE_LEVEL_DIMENSIONS` (array of 25 dimension IDs) moved from a local const in `scorer/index.ts` to an exported const in `constants.ts`, then re-exported from `@aeorank/core` public API
- `PAGE_SCORE_MAX = 75` added to `constants.ts` and re-exported — eliminates magic numbers
- Duplication gate threshold changed from `Math.min(score, 35)` to `Math.min(score, Math.round(PAGE_SCORE_MAX * 0.35))` = 26, keeping the 35% cap proportional to the new max

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| TDD RED | Add failing tests for 0-75 scale | c2ba9f3 | scorer.test.ts |
| 1 GREEN | Move PAGE_LEVEL_DIMENSIONS, add maxScore, update scorePerPage | 45e8b4a | constants.ts, types.ts, scorer/index.ts, index.ts |
| 2 | Update existing scorer tests for 0-75 scale | ca9143f | scorer.test.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Test Results

- 288/288 core tests pass (all 10 test files)
- 21/21 scorer tests pass (6 new + 15 updated)
- Build clean: ESM + CJS + DTS all succeed

## Self-Check

- [x] `packages/core/src/constants.ts` — `export const PAGE_LEVEL_DIMENSIONS` present
- [x] `packages/core/src/constants.ts` — `export const PAGE_SCORE_MAX = 75` present
- [x] `packages/core/src/types.ts` — `maxScore: number` in PageScore interface
- [x] `packages/core/src/scorer/index.ts` — `PAGE_SCORE_MAX` used for normalization and gate
- [x] `packages/core/src/index.ts` — `PAGE_LEVEL_DIMENSIONS, PAGE_SCORE_MAX` re-exported
- [x] Tests contain `toBeLessThanOrEqual(75)`, `toBeLessThanOrEqual(26)`, `maxScore.*75`, `PAGE_LEVEL_DIMENSIONS`

## Self-Check: PASSED
