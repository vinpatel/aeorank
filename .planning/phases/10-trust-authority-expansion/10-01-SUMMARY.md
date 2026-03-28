---
phase: 10-trust-authority-expansion
plan: "01"
subsystem: scoring
tags: [aeo, dimensions, schema-org, internal-linking, author-schema, tdd, vitest]

# Dependency graph
requires:
  - phase: 09-content-structure-expansion
    provides: "25-dimension scoring baseline, TDD patterns, BreadcrumbList/Person schema detection patterns"
provides:
  - scoreInternalLinking scorer (Dimension 26, medium weight) analyzing internal link topology + BreadcrumbList
  - scoreAuthorSchema scorer (Dimension 27, low weight) analyzing Person schema credentials + sameAs
  - DIMENSION_DEFS at 27 entries
  - DIMENSION_SCORERS registry at 27 entries
  - PAGE_LEVEL_DIMENSIONS array with both new IDs
  - 93 unit tests for all 27 dimensions
  - Full determinism verification for all 27 dimensions
affects: [scoring, cli, dashboard, integration-tests, determinism]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "BreadcrumbList detection via @type + @graph traversal (same pattern as scoreSchemaMarkup)"
    - "Person schema traversal with jobTitle/hasCredential + sameAs scoring ladder"
    - "Internal link counting via links[].internal filter + avgInternal thresholds"
    - "Pages sorted by URL before scoring for determinism guarantee"

key-files:
  created:
    - packages/core/src/__tests__/dimensions.test.ts (new test sections for scoreInternalLinking + scoreAuthorSchema)
  modified:
    - packages/core/src/scorer/dimensions.ts
    - packages/core/src/constants.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/core/src/__tests__/integration.test.ts
    - packages/core/src/__tests__/determinism.test.ts

key-decisions:
  - "scoreInternalLinking avgInternal thresholds: >=5+breadcrumbs=10, >=5=8, >=3=6, >=1=3, else=0"
  - "scoreAuthorSchema scoring ladder: personSchema+credentials+sameAs=10, +credentials=6, person=3, none=0"
  - "Both dimensions added to PAGE_LEVEL_DIMENSIONS (page-level: each page has own links + schema)"
  - "BreadcrumbList detection reuses @graph traversal pattern from scoreSchemaMarkup for consistency"
  - "determinism.test.ts HTML fixture enhanced with BreadcrumbList + Person schema + 6 internal nav links"

patterns-established:
  - "New scorer: always sort pages by URL before scoring to guarantee determinism"
  - "New scorer: return early with score=0 + hint when pages.length === 0"
  - "Schema traversal: check both direct @type and items inside @graph arrays"

requirements-completed: [TRST-01, TRST-02]

# Metrics
duration: 6min
completed: 2026-03-28
---

# Phase 10 Plan 01: Trust & Authority Expansion Summary

**Two new Trust & Authority scorers (internal-linking + author-schema) added, DIMENSION_DEFS and DIMENSION_SCORERS at 27 entries, all 527 tests passing with determinism verified**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-28T15:13:00Z
- **Completed:** 2026-03-28T15:15:30Z
- **Tasks:** 2 (TDD: RED + GREEN + test updates)
- **Files modified:** 6

## Accomplishments

- Implemented `scoreInternalLinking` (Dimension 26, medium weight) — counts internal links per page, checks for BreadcrumbList schema, scores 0/3/6/8/10 based on avg links + breadcrumbs
- Implemented `scoreAuthorSchema` (Dimension 27, low weight) — detects Person schema with jobTitle/hasCredential + sameAs URLs, scores 0/3/6/10 on credential ladder
- Both registered in DIMENSION_SCORERS, DIMENSION_DEFS (27 total), and PAGE_LEVEL_DIMENSIONS
- Full test coverage: 16 new unit tests in dimensions.test.ts, scorer/integration/determinism tests updated to 27 dimensions

## Task Commits

1. **Task 1: Implement internal-linking and author-schema scorers** - `6a51ccf` (feat)
2. **Task 2: Update scorer/integration/determinism tests for 27 dimensions** - `0db4a09` (test)

## Files Created/Modified

- `packages/core/src/scorer/dimensions.ts` - Added scoreInternalLinking + scoreAuthorSchema functions + registry entries
- `packages/core/src/constants.ts` - Added 2 DIMENSION_DEFS entries (27 total)
- `packages/core/src/scorer/index.ts` - Added both IDs to PAGE_LEVEL_DIMENSIONS
- `packages/core/src/__tests__/dimensions.test.ts` - Added 16 unit tests for new scorers (import + test suites)
- `packages/core/src/__tests__/scorer.test.ts` - Updated dimension count 25→27, enhanced makePage with internal links + Person schema
- `packages/core/src/__tests__/integration.test.ts` - Updated dimension count 25→27
- `packages/core/src/__tests__/determinism.test.ts` - Updated count 25→27, added IDs to newDimIds, enhanced HTML fixture

## Decisions Made

- `scoreInternalLinking` uses avgInternal thresholds (>=5+breadcrumbs=10, >=5=8, >=3=6, >=1=3) — matches plan spec exactly
- `scoreAuthorSchema` uses credential ladder (person+credentials+sameAs=10, +credentials=6, person=3) — matches plan spec
- Both scorers sort pages by URL before processing to guarantee determinism
- BreadcrumbList detection reuses the `@graph` traversal pattern from `scoreSchemaMarkup` for consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Trust & Authority pillar complete with 27 total dimensions
- All 527 tests passing, zero type errors, full determinism verified
- Ready for next scoring expansion phase or other milestone work

## Self-Check: PASSED

All required files exist and all commits are present in git history.

---
*Phase: 10-trust-authority-expansion*
*Completed: 2026-03-28*
