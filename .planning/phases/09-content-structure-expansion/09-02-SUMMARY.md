---
phase: 09-content-structure-expansion
plan: "02"
subsystem: scoring
tags: [typescript, vitest, tdd, dimensions, content-structure]

# Dependency graph
requires:
  - phase: 09-01
    provides: ScannedPage.tableCount, ScannedPage.listCount, scoreQaFormat, scoreDirectAnswerDensity, scoreQueryAnswerAlignment

provides:
  - scoreTablesLists: avg structured elements/page scoring with 0/2/4/7/10 thresholds
  - scoreDefinitionPatterns: ratio of pages with definition sentences (is defined as, refers to, means, describes)
  - scoreEntityDisambiguation: entity term in first paragraph + 3+ bodyText occurrences
  - DIMENSION_DEFS at 25 entries (Content Structure pillar complete)
  - Determinism test verifying all 25 dimensions with all 6 new Content Structure IDs

affects: [10-scoring-calibration, any phase adding new dimensions, SaaS dashboard per-page scoring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - DEFINITION_SENTENCE_PATTERNS const array of regex patterns for definition sentence detection
    - ENTITY_STOPWORDS Set for filtering insignificant words in entity term extraction
    - Entity disambiguation using title tokenization + first-paragraph + bodyText frequency

key-files:
  created: []
  modified:
    - packages/core/src/scorer/dimensions.ts
    - packages/core/src/constants.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/dimensions.test.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/core/src/__tests__/integration.test.ts
    - packages/core/src/__tests__/determinism.test.ts

key-decisions:
  - "DEFINITION_SENTENCE_PATTERNS uses specific anchors (is defined as, refers to, means/describes + the/a/an) to avoid matching generic sentences like 'This is a random sentence'"
  - "scoreEntityDisambiguation tokenizes page title into entity terms (>= 4 chars, not stopwords), checks first paragraph and 3+ total bodyText occurrences"
  - "ENTITY_STOPWORDS excludes common English words and generic web terms (page, site, blog, post, guide) to improve entity term extraction quality"
  - "determinism.test.ts updated to use enhanced HTML fixture with question headings, table, list, and definition patterns for realistic data"

patterns-established:
  - "Pattern: tighten regex patterns to avoid false positives on generic sentences — anchor definition patterns with specific trigger words"
  - "Pattern: entity term extraction from title — filter by length + stopword exclusion + regex boundary matching"

requirements-completed: [CSTR-04, CSTR-05, CSTR-06]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 09 Plan 02: Content Structure Expansion (Wave 2) Summary

**3 final Content Structure scorers (tables-lists, definition-patterns, entity-disambiguation) bringing DIMENSION_DEFS to 25 entries with determinism verified across all 6 new dimensions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T19:01:18Z
- **Completed:** 2026-03-28T19:04:10Z
- **Tasks:** 2 (TDD)
- **Files modified:** 7

## Accomplishments
- Implemented scoreTablesLists: avg (tableCount + listCount) / pages with 0/2/4/7/10 score thresholds
- Implemented scoreDefinitionPatterns: ratio of pages with definition sentences using 5-pattern regex array
- Implemented scoreEntityDisambiguation: title tokenization → first-paragraph presence + 3+ bodyText occurrences
- Registered all 3 scorers in DIMENSION_SCORERS and added 3 entries to DIMENSION_DEFS (now 25 total)
- Added all 3 to PAGE_LEVEL_DIMENSIONS for per-page scoring support
- Updated determinism test to expect 25 dimensions and verify all 6 new Content Structure IDs
- All 180 tests passing with 0 typecheck errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement 3 remaining Content Structure scorers** - `0c6ee97` (feat)
2. **Task 2: Update determinism tests for all 6 Content Structure dimensions** - `0a5eb34` (test)

_Note: TDD tasks — tests written before implementation_

## Files Created/Modified
- `packages/core/src/scorer/dimensions.ts` - Added scoreTablesLists, scoreDefinitionPatterns, scoreEntityDisambiguation functions + DEFINITION_SENTENCE_PATTERNS + ENTITY_STOPWORDS + registry entries
- `packages/core/src/constants.ts` - Added tables-lists, definition-patterns, entity-disambiguation to DIMENSION_DEFS (25 total)
- `packages/core/src/scorer/index.ts` - Added 3 new dimension IDs to PAGE_LEVEL_DIMENSIONS
- `packages/core/src/__tests__/dimensions.test.ts` - Added 13 new tests for 3 new scorers
- `packages/core/src/__tests__/scorer.test.ts` - Updated dimension count assertion from 22 to 25
- `packages/core/src/__tests__/integration.test.ts` - Updated dimension count assertion from 22 to 25
- `packages/core/src/__tests__/determinism.test.ts` - Updated count to 25, added 3 new dimension IDs, enhanced HTML fixture

## Decisions Made
- Tightened definition pattern regexes to avoid false positives — `is\s+defined\s+as` instead of `is\s+(?:defined\s+as|a|an|the)` which matched "This is a random sentence"
- ENTITY_STOPWORDS includes common web terms (page, site, blog, guide) to avoid matching generic page components as entity terms
- Enhanced HTML fixture in determinism test includes question headings, table, list, definition sentences, and entity repetition to give all 6 new scorers real data to process

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tightened definition pattern regexes to prevent false positives**
- **Found during:** Task 1 (GREEN phase — tests revealed scorer returning 10 instead of 0 for non-definition sentences)
- **Issue:** `is\s+(?:defined\s+as|a|an|the)` matched "This is a random sentence" because `is a` is valid English with no definition semantics
- **Fix:** Split into specific patterns: `is\s+defined\s+as`, `refers?\s+to`, `means?\s+(?:the|a|an)`, `describes?\s+(?:the|a|an)`, `defined\s+as\s+the`
- **Files modified:** packages/core/src/scorer/dimensions.ts
- **Verification:** scoreDefinitionPatterns returns 0 for "This is a random sentence. Another unrelated sentence." — test passes
- **Committed in:** 0c6ee97 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix necessary for correct scoring behavior. Tighter patterns improve signal quality.

## Issues Encountered
- Initial definition pattern regex was too broad — resolved by tightening patterns to require explicit definition markers (no scope impact)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Content Structure pillar complete: 6 new dimensions (CSTR-01 through CSTR-06) added in Plans 01 and 02
- DIMENSION_DEFS now at 25 entries total; DIMENSION_SCORERS at 25 entries
- Determinism verified for all 25 dimensions across 10 runs
- All 180 tests passing, 0 typecheck errors — ready for Phase 10

---
*Phase: 09-content-structure-expansion*
*Completed: 2026-03-28*
