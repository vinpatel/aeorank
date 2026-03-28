---
phase: 15-dashboard-docs-updates
plan: 01
subsystem: ui
tags: [react, nextjs, typescript, aeorank-core, server-components, client-components]

# Dependency graph
requires:
  - phase: 12-ai-discovery
    provides: "All 36 dimension IDs complete in DIMENSION_DEFS"
provides:
  - "PILLAR_GROUPS constant in @aeorank/core mapping 36 dimensions to 5 named pillars"
  - "PillarGroup interface exported from @aeorank/core"
  - "ScoreBreakdown.tsx server component rendering 5 collapsible pillar sections"
  - "PillarSection.tsx client component for collapse toggle behavior"
affects: [dashboard, core-constants, scoring-display]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server/client component split: server component imports @aeorank/core constants, passes data to client component for interactivity"
    - "PILLAR_GROUPS as single source of truth for pillar-to-dimension mapping"

key-files:
  created:
    - packages/core/src/constants.ts (PillarGroup interface + PILLAR_GROUPS constant)
    - apps/web/components/PillarSection.tsx (client component with collapse toggle)
  modified:
    - packages/core/src/index.ts (exports PILLAR_GROUPS and PillarGroup)
    - apps/web/components/ScoreBreakdown.tsx (rebuilt as server component with pillar grouping)

key-decisions:
  - "Split ScoreBreakdown into server (ScoreBreakdown.tsx) + client (PillarSection.tsx) components to avoid bundling @aeorank/core scanner code (playwright) in the browser bundle"
  - "PILLAR_GROUPS lives in @aeorank/core/constants.ts as single source of truth, not hardcoded in the dashboard"
  - "Pillar aggregate score uses weighted sum formula: sum(score*weight) / sum(maxScore*weight) * 100"

patterns-established:
  - "When a dashboard component needs @aeorank/core constants but also client interactivity, keep the data import server-side and pass serializable props to a 'use client' child"

requirements-completed: [SURF-01]

# Metrics
duration: 25min
completed: 2026-03-28
---

# Phase 15 Plan 01: Dashboard Score Breakdown — Pillar Groups Summary

**PILLAR_GROUPS constant added to @aeorank/core, ScoreBreakdown rebuilt with 5 collapsible pillar sections (Answer Readiness, Content Structure, Trust & Authority, Technical Foundation, AI Discovery)**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-28T20:30:00Z
- **Completed:** 2026-03-28T20:55:10Z
- **Tasks:** 2
- **Files modified:** 4 (+ 1 created)

## Accomplishments
- Added `PillarGroup` interface and `PILLAR_GROUPS` array to `packages/core/src/constants.ts`, covering all 36 dimension IDs across 5 pillars
- Exported `PILLAR_GROUPS` and `PillarGroup` type from `packages/core/src/index.ts`
- Rebuilt `ScoreBreakdown.tsx` as a server component that groups dimensions by pillar and renders collapsible `PillarSection` components
- Created `PillarSection.tsx` client component with expand/collapse toggle, pillar aggregate score, and sorted dimension table

## Task Commits

Each task was committed atomically:

1. **Task 1: Add PILLAR_GROUPS constant to core and export it** - `0e1b5c6` (feat)
2. **Task 2: Rebuild ScoreBreakdown with collapsible pillar sections** - `1254ae8` (feat)

## Files Created/Modified
- `packages/core/src/constants.ts` - Added PillarGroup interface + PILLAR_GROUPS constant (5 pillars, 36 dimension IDs)
- `packages/core/src/index.ts` - Exports PILLAR_GROUPS and PillarGroup type
- `apps/web/components/ScoreBreakdown.tsx` - Rebuilt as server component using PILLAR_GROUPS, renders PillarSection per pillar
- `apps/web/components/PillarSection.tsx` - New client component with useState collapse toggle, pillar header with aggregate score and chevron, dimension table

## Decisions Made
- Split ScoreBreakdown into server + client components rather than making the whole component a client component. This avoids Next.js/Turbopack attempting to bundle `@aeorank/core`'s scanner code (playwright dependencies) in the browser bundle, which caused 87 Turbopack errors.
- Pillar aggregate score formula: weighted sum of (score * weightPct) / weighted sum of (maxScore * weightPct) * 100, rounded to integer.
- PILLAR_GROUPS is the single source of truth — pillar names are not hardcoded in the dashboard component.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Split ScoreBreakdown into server + client components**
- **Found during:** Task 2 (Rebuild ScoreBreakdown)
- **Issue:** Adding `"use client"` to ScoreBreakdown.tsx (as the plan specified) caused Next.js Turbopack to attempt bundling `packages/core/dist/chunk-NTX2XC4V.js` in the browser bundle. This chunk contains playwright-core code which requires Node.js builtins (async_hooks, child_process, fs, etc.), producing 87 Turbopack build errors.
- **Fix:** Kept ScoreBreakdown.tsx as a server component (no `"use client"`). Extracted the interactive collapse behavior into a new `PillarSection.tsx` client component. Server component imports PILLAR_GROUPS, computes pillar scores, and passes serializable `DimensionScore[]` props to PillarSection.
- **Files modified:** apps/web/components/ScoreBreakdown.tsx, apps/web/components/PillarSection.tsx (new)
- **Verification:** `pnpm turbo build --filter=@aeorank/web` passes cleanly (7s, 0 errors)
- **Committed in:** 1254ae8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in planned approach)
**Impact on plan:** Fix was necessary for the build to succeed. The server/client split is a better architectural pattern for Next.js App Router. No functional behavior lost — all 5 pillars are collapsible, pillar aggregate scores shown, dimensions sorted by weight.

## Issues Encountered
- Turbopack in Next.js 16 is stricter than webpack about client-side bundle analysis. The plan's `"use client"` approach failed because @aeorank/core's ESM bundle shares a chunk between constants and the playwright-fetcher. The server/client split pattern is the correct solution for this architecture.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dashboard score breakdown now shows 5 collapsible pillar sections with correct grouping
- PILLAR_GROUPS is available in @aeorank/core for any other surface (CLI, docs) that needs pillar-grouped display
- Ready for additional dashboard improvements (per-page scores, pillar-level recommendations)

---
*Phase: 15-dashboard-docs-updates*
*Completed: 2026-03-28*
