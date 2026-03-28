---
phase: "09-content-structure-expansion"
plan: "01"
subsystem: "@aeorank/core scorer"
tags: ["scoring", "parser", "content-structure", "qa-format"]
dependency_graph:
  requires: ["08-02 — Citation-Ready Writing scorer"]
  provides: ["questionHeadings parser field", "tableCount/listCount parser fields", "qa-format scorer", "direct-answer-density scorer", "query-answer-alignment scorer"]
  affects: ["@aeorank/core scoring engine", "DIMENSION_DEFS (now 22)", "per-page scoring"]
tech_stack:
  added: []
  patterns: ["question-heading regex filter", "direct-answer paragraph ratio", "query-answer alignment ratio"]
key_files:
  created: []
  modified:
    - packages/core/src/types.ts
    - packages/core/src/scanner/parser.ts
    - packages/core/src/scorer/dimensions.ts
    - packages/core/src/constants.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/parser.test.ts
    - packages/core/src/__tests__/dimensions.test.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/core/src/__tests__/integration.test.ts
    - packages/core/src/__tests__/determinism.test.ts
decisions:
  - "scoreQaFormat scores ratio of question headings to total headings (thresholds: >0.4=10, >0.25=7, >0.1=4, >0=2)"
  - "scoreDirectAnswerDensity only scores pages with question headings; excludes pages without; 40-300 char paragraphs starting with capital letter count as direct answers"
  - "scoreQueryAnswerAlignment checks if paragraphs.length >= questionHeadings.length per page — simple alignment signal"
  - "QUESTION_WORD_REGEX extracts headings starting with What/How/Why/When/Where/Who/Is/Are/Do/Does/Did/Can/Could/Should OR containing ?"
  - "countLists requires 2+ li children to filter trivial single-item lists"
  - "All 3 new scorers added to PAGE_LEVEL_DIMENSIONS for per-page scoring support"
  - "scorer.test.ts perfect-pages updated with question headings + concise paragraphs to keep score >= 70"
metrics:
  duration: "~5 min"
  completed: "2026-03-28"
  tasks: 2
  files_modified: 10
requirements: [CSTR-01, CSTR-02, CSTR-03]
---

# Phase 09 Plan 01: Q&A Content Structure Parser Extensions & Scorers Summary

**One-liner:** Parser extended with question-heading detection and table/list counting; 3 Q&A scorers (qa-format, direct-answer-density, query-answer-alignment) added — DIMENSION_DEFS at 22 entries, 167 tests passing.

## What Was Built

### Task 1: Parser Extensions (commit 6eca25f)

Added 3 new fields to `ScannedPage` in `types.ts`:
- `questionHeadings: { text: string; level: number }[]` — headings matching `QUESTION_WORD_REGEX` or containing `?`
- `tableCount: number` — tables with at least one `th` or `thead` element
- `listCount: number` — `ol`/`ul` elements with 2+ `li` children

Added 3 extraction helpers to `parser.ts`:
- `extractQuestionHeadings()` — filters existing headings array using regex
- `countTables()` — cheerio filter on `table` elements
- `countLists()` — cheerio filter on `ol, ul` elements

Updated `makePage()` defaults in `dimensions.test.ts` and `scorer.test.ts` with `questionHeadings: [], tableCount: 0, listCount: 0`.

Added 6 new parser tests covering all extraction behaviors.

### Task 2: Q&A Scorers (commit 533f2ff)

Three new dimension scorers implemented in `dimensions.ts`:

**scoreQaFormat** (id: `qa-format`, weight: `medium`)
- Computes ratio of question headings to total headings across all pages
- Scoring: >0.4→10, >0.25→7, >0.1→4, >0→2, else 0
- Returns 0 for empty pages or zero headings

**scoreDirectAnswerDensity** (id: `direct-answer-density`, weight: `medium`)
- Only analyzes pages with at least one question heading
- Counts paragraphs that are 40-300 chars, start with capital, don't end with `?`
- Averages ratio across question-heading pages
- Scoring: >0.5→10, >0.3→7, >0.15→4, >0→2, else 0
- Returns 0 when no pages have question headings

**scoreQueryAnswerAlignment** (id: `query-answer-alignment`, weight: `low`)
- For pages with question headings, checks if `paragraphs.length >= questionHeadings.length`
- Scores ratio of "aligned" pages to total pages with question headings
- Scoring: >0.7→10, >0.5→7, >0.3→4, >0→2, else 0
- Returns 0 when no pages have question headings

All 3 registered in `DIMENSION_SCORERS` and `PAGE_LEVEL_DIMENSIONS`. `DIMENSION_DEFS` updated to 22 entries in `constants.ts`. Hardcoded dimension counts updated in `scorer.test.ts`, `integration.test.ts`, `determinism.test.ts`.

13 new tests added (4 scoreQaFormat + 4 scoreDirectAnswerDensity + 5 scoreQueryAnswerAlignment).

## Deviations from Plan

**1. [Rule 1 - Bug] scorer.test.ts perfect-pages needed question headings for score >= 70**
- **Found during:** Task 2 GREEN phase
- **Issue:** Adding 2 new medium-weight scorers that return 0 for empty questionHeadings dropped the "perfect inputs" score from ~72 to ~65, failing the `>= 70` assertion
- **Fix:** Updated `makePage()` in `scorer.test.ts` to include `questionHeadings`, `paragraphs`, and `sentences` that satisfy the new scorers
- **Files modified:** `packages/core/src/__tests__/scorer.test.ts`
- **Commit:** 533f2ff

**2. [Rule 1 - Bug] determinism.test.ts had hardcoded 19 and missing new dim IDs**
- **Found during:** Task 2 GREEN phase
- **Issue:** Determinism test asserted `toHaveLength(19)` and only listed 7 Answer Readiness dimensions to verify
- **Fix:** Updated to 22 and added qa-format, direct-answer-density, query-answer-alignment to verification list
- **Files modified:** `packages/core/src/__tests__/determinism.test.ts`
- **Commit:** 533f2ff

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 6eca25f | feat(09-01): extend ScannedPage with questionHeadings, tableCount, listCount |
| 2 | 533f2ff | feat(09-01): implement 3 Q&A Content Structure scorers |

## Verification

- `pnpm --filter @aeorank/core run typecheck` — 0 errors
- `pnpm --filter @aeorank/core run test -- --run` — 167 tests passing (10 test files)
- `DIMENSION_DEFS` has exactly 22 entries
- `DIMENSION_SCORERS` has exactly 22 entries
- `ScannedPage` includes `questionHeadings`, `tableCount`, `listCount`

## Self-Check: PASSED

- `packages/core/src/types.ts` — exists, contains `questionHeadings` ✓
- `packages/core/src/scorer/dimensions.ts` — contains `scoreQaFormat`, `scoreDirectAnswerDensity`, `scoreQueryAnswerAlignment` ✓
- `packages/core/src/constants.ts` — 22 DIMENSION_DEFS entries ✓
- Commits `6eca25f` and `533f2ff` — exist ✓
- 167 tests passing ✓
