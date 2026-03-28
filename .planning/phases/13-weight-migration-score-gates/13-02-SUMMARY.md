---
phase: 13-weight-migration-score-gates
plan: "02"
subsystem: core/cli/web
tags: [score-gates, coherence, duplication, weightPct, cli, dashboard]
dependency_graph:
  requires: [13-01]
  provides: [coherence-gate, duplication-gate, weightPct-display]
  affects: [packages/core/src/scorer/index.ts, packages/cli/src/ui/score-display.ts, apps/web/components/ScoreBreakdown.tsx]
tech_stack:
  added: []
  patterns:
    - "Coherence gate: topic-coherence < 6 caps site score at coherence_score * 10"
    - "Duplication gate: 3+ duplicate paragraph blocks caps per-page score at 35"
    - "countDuplicateBlocks() helper extracted from scoreDuplicateContent algorithm"
    - "weightPct percentage labels ([N%]) replace HIGH/MEDIUM/LOW in CLI and dashboard"
key_files:
  created: []
  modified:
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/cli/src/ui/score-display.ts
    - packages/cli/src/__tests__/score-display.test.ts
    - packages/cli/src/__tests__/scan.test.ts
    - packages/cli/src/__tests__/integration.test.ts
    - apps/web/components/ScoreBreakdown.tsx
    - apps/web/components/ScanComparison.tsx
    - apps/web/components/DimensionTrends.tsx
    - apps/web/app/api/report/[siteId]/route.ts
    - apps/web/app/(dashboard)/sites/[siteId]/page.tsx
decisions:
  - "coherence gate caps at coherence_score * 10 (not a hard cap like 50) — proportional penalty"
  - "duplication gate threshold is 3+ duplicate occurrences (not unique blocks), matching scoreDuplicateContent algorithm"
  - "weightPct thresholds for CLI color: >=5% red, >=3% yellow, <3% dim — mirrors badge colors in dashboard"
  - "Fixed 'returns high score for perfect inputs' test to use coherent headings (sharing 'AEO', 'optimization' keywords) to avoid coherence gate"
metrics:
  duration: 361s
  completed: "2026-03-28"
  tasks_completed: 2
  files_modified: 11
---

# Phase 13 Plan 02: Score Gates and weightPct Display Summary

**One-liner:** Coherence gate (topic-coherence < 6 caps score) and duplication gate (3+ blocks caps page at 35%) added to scorer; CLI and dashboard updated to display percentage weights instead of HIGH/MEDIUM/LOW labels.

## What Was Built

### Task 1: Score Gates in Scorer (packages/core)

Added two quality gates to `packages/core/src/scorer/index.ts`:

**Coherence gate** — After computing the weighted site score, if `topic-coherence` dimension scores < 6, the total score is capped at `coherence_score * 10`. Example: coherence=4 means score cannot exceed 40, regardless of other dimensions scoring perfectly.

**Duplication gate** — In `scorePerPage()`, a new helper `countDuplicateBlocks(page)` counts repeated normalized paragraphs. If a page has 3+ duplicate blocks, its per-page score is capped at 35.

Added 7 new gate tests to `scorer.test.ts`:
- 3 coherence gate tests (cap applied when < 6, not applied when >= 6, exact cap scenario)
- 4 duplication gate tests (capped at 3+, not capped below 3, exactly 3 dupes, 0 dupes)

Also fixed the existing "returns high score for perfect inputs" test — the default `makePage()` headings ("Title", "Section", "Sub") are too short/common to produce coherent topic keywords across pages, causing the coherence gate to falsely cap the score. The test now uses coherent pages sharing "AEO", "optimization", "visibility" keywords.

### Task 2: CLI and Dashboard weightPct Display

**CLI `score-display.ts`:**
- Removed `WEIGHT_PRIORITY` and `WEIGHT_LABEL` constants entirely
- Sort by `dim.weightPct` descending (highest weight first), then score ascending
- Table shows `[N%]` label: `chalk.dim('[${dim.weightPct}%]'.padEnd(8))`
- Next steps color: `>= 5% = red, >= 3% = yellow, < 3% = dim`

**CLI test files updated:**
- `score-display.test.ts`: `makeDimension` now uses `weightPct: 3`; label tests expect `[5%]`/`[3%]`/`[1%]`; sort tests use `weightPct: 5/3/1`
- `scan.test.ts`: All 12 mock dimensions updated from `weight: "high"/"medium"/"low"` to `weightPct` values; added `pageScores: []` and full `meta` fields
- `integration.test.ts`: Same mock updates; CLI-05 test now asserts `[5%]`/`[6%]`/`[3%]`/`[1%]` labels

**Dashboard components:**
- `ScoreBreakdown.tsx`: Removed `weightLabel()`/`weightBadgeClass()` functions; badge shows `{dim.weightPct}%`; badge color `>= 5% = badge-red, >= 3% = badge-amber, < 3% = badge-green`; dimensions sorted by `weightPct` descending
- `ScanComparison.tsx`: `DimScore` interface `weight: "high"|"medium"|"low"` replaced with `weightPct: number`
- `DimensionTrends.tsx`: `DimensionHistory` interface same replacement
- `apps/web/app/api/report/[siteId]/route.ts`: Local `DimensionScore` interface and badge color logic updated to use `weightPct`; badge displays `{d.weightPct}%`
- `apps/web/app/(dashboard)/sites/[siteId]/page.tsx`: `dimensionMeta` map updated `weight -> weightPct`

## Test Results

| Package | Tests | Status |
|---------|-------|--------|
| @aeorank/core | 266/266 | PASS |
| aeorank-cli | 59/59 | PASS |
| @aeorank/web | build | PASS (no type errors) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 'returns high score for perfect inputs' coherence gate conflict**
- **Found during:** Task 1
- **Issue:** Default `makePage()` headings ("Title", "Section", "Sub") are stopwords/too short to match topic keywords across pages, causing topic-coherence to score 0 and gate to cap score at 0
- **Fix:** Updated test to use coherent pages with shared keywords ("AEO", "optimization", "visibility") in headings and body text
- **Files modified:** `packages/core/src/__tests__/scorer.test.ts`
- **Commit:** e776d24

**2. [Rule 2 - Missing critical field] Added pageScores and full meta to CLI mock ScanResult**
- **Found during:** Task 2
- **Issue:** Mock ScanResult in scan.test.ts and integration.test.ts was missing `pageScores: []` and had incomplete `meta` (missing `aiTxt`, `sitemapLastmods`)
- **Fix:** Added missing fields to match current `ScanResult` type
- **Files modified:** `packages/cli/src/__tests__/scan.test.ts`, `packages/cli/src/__tests__/integration.test.ts`
- **Commit:** 4d1cacd

**3. [Rule 1 - Bug] Fixed remaining `weight` reference in siteId page.tsx**
- **Found during:** Task 2 (web build type check)
- **Issue:** `apps/web/app/(dashboard)/sites/[siteId]/page.tsx` line 101 referenced `d.weight` in `dimensionMeta` mapping, which TypeScript rejected since `DimensionScore` no longer has `weight`
- **Fix:** Updated `weight: d.weight` to `weightPct: d.weightPct`
- **Files modified:** `apps/web/app/(dashboard)/sites/[siteId]/page.tsx`
- **Commit:** 4d1cacd

## Self-Check: PASSED

All key files exist. Commits e776d24 and 4d1cacd confirmed. 266 core tests + 59 CLI tests passing. Web build compiles with no type errors.
