---
phase: 08-answer-readiness
plan: 02
subsystem: "@aeorank/core scorer"
tags: [scoring, answer-readiness, dimensions, tdd, determinism]
dependency_graph:
  requires: ["08-01"]
  provides: ["19-dimension scoring engine", "cross-page-duplication scorer", "evidence-packaging scorer", "citation-ready-writing scorer"]
  affects: ["packages/core/src/scorer/dimensions.ts", "packages/core/src/constants.ts", "packages/core/src/scorer/index.ts"]
tech_stack:
  added: []
  patterns: ["registry pattern (DIMENSION_SCORERS map)", "normalized paragraph map for cross-page dedup", "attribution/citation regex patterns", "definition sentence pattern matching"]
key_files:
  created: []
  modified:
    - packages/core/src/scorer/dimensions.ts
    - packages/core/src/constants.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/dimensions.test.ts
    - packages/core/src/__tests__/determinism.test.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/core/src/__tests__/integration.test.ts
decisions:
  - "scoreCrossPageDuplication uses Map<normalized-para, Set<page-url>> to detect identical paragraphs appearing on 2+ distinct pages"
  - "scoreEvidencePackaging checks 4 attribution patterns + 2 citation patterns + sources heading per page; requires 2+ markers for a page to count"
  - "scoreCitationReadyWriting uses negative lookahead to exclude question words from definition pattern — prevents 'What is' from matching as a definition"
  - "cross-page-duplication is site-level only; evidence-packaging and citation-ready-writing added to PAGE_LEVEL_DIMENSIONS"
  - "scorer.test.ts and integration.test.ts hard-coded 16-dimension counts updated to 19 (Rule 1 auto-fix)"
metrics:
  duration: "~5 min"
  completed: "2026-03-28"
  tasks_completed: 2
  files_modified: 7
---

# Phase 08 Plan 02: Final Answer Readiness Scorers + Determinism Summary

Complete the Answer Readiness pillar with 3 new scorers (cross-page-duplication, evidence-packaging, citation-ready-writing) and verify determinism across all 7 new dimensions.

## What Was Built

**3 new scorer functions** in `packages/core/src/scorer/dimensions.ts`:

1. **scoreCrossPageDuplication** — Builds `Map<normalizedParagraph, Set<pageUrl>>` to track which paragraphs appear on multiple pages. Ratio of cross-page duplicates to total unique paragraphs drives the score (0 ratio = 10, <5% = 8, <10% = 5, <20% = 3, else 0). Returns 10 with informative hint for single-page sites.

2. **scoreEvidencePackaging** — Scans each page's sentences for 4 attribution patterns (`according to`, `source:`, `cited`, `reference:`), 2 citation patterns (inline `[N]` and parenthetical year citations), plus a heading check for sources/bibliography sections. Pages with 2+ markers count as "evidenced"; percentage of such pages drives the score.

3. **scoreCitationReadyWriting** — Detects definition sentences (via regex with negative lookahead to exclude question words) and self-contained single-claim statements (40-200 chars, capital start, period end, no `, and ` or `, but ` conjunctions). Averages citation-ready sentence ratio across pages.

**DIMENSION_DEFS** expanded from 16 to **19 entries** in `constants.ts`, all with `weight: "low"`.

**DIMENSION_SCORERS** registry now has **19 entries**; `PAGE_LEVEL_DIMENSIONS` includes `evidence-packaging` and `citation-ready-writing` (not `cross-page-duplication` which is site-level by definition).

**Determinism test** updated to explicitly verify: 19 dimensions present, all 7 new dimension IDs in results, identical scores for each new dimension across 10 independent runs.

## Test Results

- **148 tests passing** (was 136 before phase 08; +12 from this plan)
- 51 dimension tests, 3 determinism tests, 19 integration tests, 6 scorer tests
- `pnpm --filter @aeorank/core run typecheck` — 0 errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed definition regex matching question words**
- **Found during:** Task 1 (GREEN phase test run)
- **Issue:** `DEFINITION_PATTERN = /^[A-Z][^.]+\s+(is|are...)/` matched "What is..." because `[^.]+` backtracked to allow `is` to match, causing question sentences to incorrectly count as definitions
- **Fix:** Added negative lookahead `(?!What |How |Why |When |Where |Who |Is |Are |Do |Does |Did |Can |Could |Should )` to the pattern
- **Files modified:** `packages/core/src/scorer/dimensions.ts`
- **Commit:** `6700acc` (included in Task 1 commit)

**2. [Rule 1 - Bug] Updated hard-coded dimension counts in scorer.test.ts and integration.test.ts**
- **Found during:** Task 1 (GREEN phase test run)
- **Issue:** Tests hard-coded `toHaveLength(16)` — now fails with 19 dimensions
- **Fix:** Updated to `toHaveLength(19)` and test name from "exactly 16 dimensions" to "exactly 19 dimensions"
- **Files modified:** `packages/core/src/__tests__/scorer.test.ts`, `packages/core/src/__tests__/integration.test.ts`
- **Commit:** `6700acc` (included in Task 1 commit)

## Self-Check

Verify files exist:
- [x] `packages/core/src/scorer/dimensions.ts` — contains scoreCrossPageDuplication, scoreEvidencePackaging, scoreCitationReadyWriting
- [x] `packages/core/src/constants.ts` — 19 DIMENSION_DEFS entries
- [x] `packages/core/src/__tests__/determinism.test.ts` — contains "topic-coherence" and "19"

Verify commits:
- [x] `6700acc` — feat(08-02): add 3 new scorers
- [x] `494812d` — feat(08-02): update determinism tests

## Self-Check: PASSED
