---
phase: 15-dashboard-docs-updates
plan: "03"
subsystem: cli
tags: [cli, pillar-grouping, score-display, scan-command]
dependency_graph:
  requires: [15-01]
  provides: [cli-pillar-grouped-output, cli-pillar-filter-flag]
  affects: [packages/cli/src/ui/score-display.ts, packages/cli/src/commands/scan.ts]
tech_stack:
  added: []
  patterns: [pillar-grouped-table, optional-filter-parameter]
key_files:
  created: []
  modified:
    - packages/cli/src/ui/score-display.ts
    - packages/cli/src/commands/scan.ts
    - packages/cli/src/__tests__/score-display.test.ts
    - packages/cli/src/__tests__/scan.test.ts
    - packages/cli/src/__tests__/integration.test.ts
decisions:
  - Use real dimension IDs in tests to ensure pillar grouping works correctly
  - Fix existing test mocks to use importOriginal so PILLAR_GROUPS is available
  - Dimensions with unrecognized IDs are silently skipped (grouped output only shows known pillar members)
metrics:
  duration: "3m 14s"
  completed: "2026-03-28"
  tasks_completed: 2
  files_changed: 5
---

# Phase 15 Plan 03: CLI Pillar Grouping & --pillar Flag Summary

**One-liner:** Pillar-grouped CLI dimension table with aggregate scores per pillar and `--pillar` filter flag using PILLAR_GROUPS from @aeorank/core.

## What Was Built

### Task 1: Update renderDimensionTable to group by pillar (TDD)

Updated `packages/cli/src/ui/score-display.ts`:

- Imported `PILLAR_GROUPS` from `@aeorank/core`
- Changed `renderDimensionTable(dimensions)` signature to `renderDimensionTable(dimensions, pillarFilter?)`
- Renders dimensions grouped under pillar headers showing: name, aggregate score (X.X/10), and weight sum [N%]
- Aggregate score formula: `sum(score * weightPct) / sum(maxScore * weightPct) * 10`
- Dimensions within each pillar sorted by weightPct descending, then score ascending
- Pillars with no matching dimensions are silently skipped
- Invalid `pillarFilter` values print a warning with all valid pillar IDs listed
- Updated `renderNextSteps` to accept optional `pillarFilter` — limits recommendations to that pillar's dimensions
- Heading changed from "Dimensions" to "Dimensions by Pillar"

### Task 2: Add --pillar flag to scan command

Updated `packages/cli/src/commands/scan.ts`:

- Added `.option("--pillar <name>", ...)` with description listing all 5 valid pillar IDs
- Added `pillar?: string` to `ScanOptions` interface
- Human mode: passes `options.pillar` to both `renderDimensionTable` and `renderNextSteps`
- JSON mode: filters `result.dimensions` to only the specified pillar's dimensions using `PILLAR_GROUPS.find`
- Imported `PILLAR_GROUPS` for JSON-mode filtering

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Existing tests used generic IDs not in any pillar**
- **Found during:** Task 1 GREEN phase
- **Issue:** Old tests used `id: "test-dim"` which doesn't belong to any PILLAR_GROUPS entry, causing pillar-grouped output to render empty (all dimensions skipped)
- **Fix:** Updated 6 existing tests to use real dimension IDs (e.g., `llms-txt`, `eeat-signals`, `sitemap`) that are members of known pillars
- **Files modified:** `packages/cli/src/__tests__/score-display.test.ts`
- **Commit:** e607f32

**2. [Rule 1 - Bug] Integration and scan test mocks missing PILLAR_GROUPS**
- **Found during:** Task 1 GREEN phase
- **Issue:** Both `scan.test.ts` and `integration.test.ts` used `vi.mock("@aeorank/core", () => ({ scan: vi.fn(), DEFAULT_CONFIG: ... }))` which did not include `PILLAR_GROUPS`. When `score-display.ts` imported `PILLAR_GROUPS`, vitest threw "No PILLAR_GROUPS export is defined on the mock"
- **Fix:** Switched both mocks to `vi.mock("@aeorank/core", async (importOriginal) => { const actual = await importOriginal(); return { ...actual, scan: vi.fn() }; })` — spreads real module exports and only overrides `scan`
- **Files modified:** `packages/cli/src/__tests__/scan.test.ts`, `packages/cli/src/__tests__/integration.test.ts`
- **Commit:** e607f32

## Verification

- Build: `pnpm build` in `packages/cli` passes (ESM 2.24 MB in 55ms)
- Tests: 65/65 passing across 6 test files
- CLI help: `--pillar <name>` option visible with description
- Acceptance criteria met:
  - `grep "PILLAR_GROUPS" packages/cli/src/ui/score-display.ts` matches
  - `grep "pillarFilter" packages/cli/src/ui/score-display.ts` matches
  - `grep "Dimensions by Pillar" packages/cli/src/ui/score-display.ts` matches
  - `grep "pillar" packages/cli/src/__tests__/score-display.test.ts` matches (22 occurrences)
  - `grep "\-\-pillar" packages/cli/src/commands/scan.ts` matches (2 times)
  - `grep "pillar" packages/cli/src/commands/scan.ts` matches (10 times)

## Self-Check: PASSED

Files exist:
- packages/cli/src/ui/score-display.ts: FOUND
- packages/cli/src/commands/scan.ts: FOUND
- packages/cli/src/__tests__/score-display.test.ts: FOUND

Commits exist:
- e607f32: feat(15-03): group CLI dimension table by pillar with aggregate scores
- 6e5f9d7: feat(15-03): add --pillar flag to scan command
