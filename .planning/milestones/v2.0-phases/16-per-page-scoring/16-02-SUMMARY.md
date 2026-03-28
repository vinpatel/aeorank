---
phase: 16-per-page-scoring
plan: 02
subsystem: ui
tags: [cli, react, per-page-scoring, dashboard, vitest]

requires:
  - phase: 16-per-page-scoring plan 01
    provides: scorePerPage() returns 0-75 scale, PageScore.maxScore=75, PAGE_LEVEL_DIMENSIONS and PAGE_SCORE_MAX exported

provides:
  - CLI --page <path> flag filtering scan output to single-page score/75 with dimension breakdown
  - renderPageScore() function in score-display.ts showing score/75, grade, and sorted dimensions
  - Dashboard PageScores expandable rows showing per-page dimension sub-table with pass/warn/fail badges
  - Dashboard scores displayed as {score}/75

affects: [cli, dashboard, per-page-scoring]

tech-stack:
  added: []
  patterns:
    - "Hardcoded DIMENSION_NAMES map in browser component avoids importing @aeorank/core in client bundle"
    - "TDD RED/GREEN cycle for CLI feature additions"
    - "URL pathname normalization (ensure leading slash) for --page flag path matching"

key-files:
  created: []
  modified:
    - packages/cli/src/ui/score-display.ts
    - packages/cli/src/commands/scan.ts
    - packages/cli/src/__tests__/score-display.test.ts
    - packages/cli/src/__tests__/scan.test.ts
    - apps/web/components/PageScores.tsx

key-decisions:
  - "Hardcode 25 page-level dimension id->name pairs in PageScores.tsx to avoid @aeorank/core browser bundle import"
  - "renderPageScore uses DIMENSION_DEFS from @aeorank/core (Node-only) by default but accepts allDefs param for testability"
  - "Expandable sub-table sorts fail->warn->pass (most actionable first); CLI renderPageScore sorts score ascending (worst first)"
  - "--page flag path normalized with leading slash before URL.pathname comparison"

patterns-established:
  - "Per-page dimension sub-table pattern: expandedPage state + click toggle + colSpan row"
  - "CLI --page flag pattern: normalize path, find by URL.pathname, render or list available"

requirements-completed: [PAGE-02, PAGE-03]

duration: 2min
completed: 2026-03-28
---

# Phase 16 Plan 02: CLI --page Flag and Dashboard Expandable Page Scores Summary

**CLI `--page /path` flag for single-page audit outputting score/75 with dimension breakdown, plus dashboard PageScores expandable rows with per-page dimension sub-table**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T21:11:02Z
- **Completed:** 2026-03-28T21:13:57Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added `renderPageScore(page, allDefs)` to score-display.ts showing score/75, grade, and all dimensions sorted worst-first with pass/warn/fail icons
- Added `--page <path>` flag to scan.ts: normalizes path, matches by URL.pathname, renders page-specific output or exits with error listing available paths; JSON mode outputs filtered pageScore object
- Enhanced PageScores dashboard component with expandable dimension sub-table per row, chevron expand indicator, scores as /75, and DIMENSION_NAMES hardcoded map
- 12 new tests added (77 total CLI tests passing); full monorepo build clean (16/16)

## Task Commits

1. **Task 1: CLI --page flag and renderPageScore function** - `0f4299e` (feat)
2. **Task 2: Dashboard PageScores expandable per-page dimension breakdown** - `d0bc2f4` (feat)

**Plan metadata:** (final docs commit)

## Files Created/Modified

- `packages/cli/src/ui/score-display.ts` - Added renderPageScore(), imported DIMENSION_DEFS and PAGE_SCORE_MAX
- `packages/cli/src/commands/scan.ts` - Added --page option, page?: string to ScanOptions, page filtering logic
- `packages/cli/src/__tests__/score-display.test.ts` - Added 7 renderPageScore tests
- `packages/cli/src/__tests__/scan.test.ts` - Added pageScores to mockResult, added 5 --page flag tests
- `apps/web/components/PageScores.tsx` - Added expandedPage state, DIMENSION_NAMES map, expandable sub-table, /75 score display

## Decisions Made

- Hardcoded 25 page-level dimension id->name pairs in PageScores.tsx to avoid importing @aeorank/core in the browser bundle — consistent with Phase 15 ScoreBreakdown pattern
- renderPageScore default-imports DIMENSION_DEFS but accepts allDefs param for testability without needing mocks
- Sub-table sorts fail->warn->pass (actionability order); CLI dimensions sort by score ascending (same actionability intent)
- --page flag path normalized with leading slash before URL.pathname comparison to handle both `/about` and `about` inputs

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 16 complete — per-page scoring fully wired: scorePerPage() (plan 01), CLI --page flag, dashboard expandable rows (plan 02)
- Ready for any v2.0 remaining work or final integration testing

---
*Phase: 16-per-page-scoring*
*Completed: 2026-03-28*
