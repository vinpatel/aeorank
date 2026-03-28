---
phase: 11-technical-foundation-expansion
plan: "02"
subsystem: core-scorer
tags: [scoring, schema, speakable, determinism, tdd]
dependency_graph:
  requires: ["11-01"]
  provides: ["schema-coverage scorer", "speakable-schema scorer", "32-dimension determinism"]
  affects: ["packages/core/src/scorer/dimensions.ts", "packages/core/src/constants.ts", "packages/core/src/scorer/index.ts"]
tech_stack:
  added: []
  patterns: ["ratio-based scoring", "@graph traversal for schema detection", "SpeakableSpecification detection via nested speakable property"]
key_files:
  created: []
  modified:
    - packages/core/src/scorer/dimensions.ts
    - packages/core/src/constants.ts
    - packages/core/src/scorer/index.ts
    - packages/core/src/__tests__/dimensions.test.ts
    - packages/core/src/__tests__/scorer.test.ts
    - packages/core/src/__tests__/integration.test.ts
    - packages/core/src/__tests__/determinism.test.ts
decisions:
  - "scoreSchemaCoverage single-page special case returns score=5 (can't assess inner coverage with 1 page)"
  - "scoreSpeakableSchema detects SpeakableSpecification via direct @type, @graph traversal, and nested speakable property"
  - "Both new dimensions added to PAGE_LEVEL_DIMENSIONS (each page has its own schema, so page-level scoring makes sense)"
  - "Determinism fixture enhanced with semantic HTML5 elements (main/article/nav/aside/header/footer), ARIA role, figure/figcaption, and SpeakableSpecification in @graph"
metrics:
  duration: 178s
  completed: "2026-03-28"
  tasks_completed: 2
  files_modified: 7
---

# Phase 11 Plan 02: Schema Coverage & Speakable Schema Scorers Summary

One-liner: Schema-coverage and speakable-schema scorers complete the 32-dimension Technical Foundation with ratio-based scoring and full SpeakableSpecification detection via @type, @graph, and nested speakable property.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Implement schema-coverage and speakable-schema scorers (TDD) | 477a467 | dimensions.ts, constants.ts, index.ts, dimensions.test.ts |
| 2 | Update scorer/integration/determinism tests for 32 dimensions | 41d9a33 | scorer.test.ts, integration.test.ts, determinism.test.ts |

## What Was Built

### Dimension 31: Schema Coverage (`schema-coverage`, low weight)

- Checks each page for at least one schema object with a meaningful `@type` string
- Detects schema in direct `@type` fields and `@graph` array items
- Single-page special case: if the one page has schema, returns score=5 (insufficient data to assess inner-page coverage)
- Multi-page thresholds: ratio >= 0.8 → 10, >= 0.6 → 8, >= 0.4 → 6, >= 0.2 → 3, > 0 → 1, else 0
- Sorts pages by URL for determinism

### Dimension 32: Speakable Schema (`speakable-schema`, low weight)

- Detects `SpeakableSpecification` via three patterns:
  1. Direct `@type === "SpeakableSpecification"` on a schema object
  2. In `@graph` array items with `@type === "SpeakableSpecification"`
  3. Nested `speakable` property where `speakable["@type"] === "SpeakableSpecification"`
- Thresholds: ratio >= 0.5 → 10, >= 0.3 → 7, >= 0.1 → 4, > 0 → 2, else 0
- Sorts pages by URL for determinism

### Test Updates

- `dimensions.test.ts`: 14 new tests for both scorers; import list updated; 123 total tests pass
- `scorer.test.ts`: dimension count assertions updated from 30 to 32
- `integration.test.ts`: dimension count assertion updated from 30 to 32
- `determinism.test.ts`: count 32, added 5 Phase 11 dimension IDs (semantic-html, extraction-friction, image-context, schema-coverage, speakable-schema); HTML fixture enhanced with semantic elements and SpeakableSpecification

## Verification Results

1. `pnpm vitest run` — 567/567 tests pass (0 failures)
2. `pnpm tsc --noEmit -p packages/core/tsconfig.json` — no type errors
3. DIMENSION_DEFS has exactly 32 entries
4. DIMENSION_SCORERS has exactly 32 entries
5. Determinism test verifies all 32 dimension IDs produce identical scores across 10 runs

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] packages/core/src/scorer/dimensions.ts — modified, contains scoreSchemaCoverage and scoreSpeakableSchema
- [x] packages/core/src/constants.ts — modified, 32 DIMENSION_DEFS entries
- [x] packages/core/src/scorer/index.ts — modified, schema-coverage and speakable-schema in PAGE_LEVEL_DIMENSIONS
- [x] packages/core/src/__tests__/dimensions.test.ts — modified, 123 tests pass
- [x] Commit 477a467 exists (Task 1)
- [x] Commit 41d9a33 exists (Task 2)
