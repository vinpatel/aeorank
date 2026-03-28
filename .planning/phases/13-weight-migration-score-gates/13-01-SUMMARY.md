---
phase: "13"
plan: "01"
subsystem: "core/scorer"
tags: ["scoring", "weighting", "refactor", "dimensions", "typescript"]
dependency_graph:
  requires: []
  provides: ["weightPct-scoring-engine", "36-dimension-set"]
  affects: ["packages/core/src/scorer", "packages/core/src/types", "packages/core/src/constants"]
tech_stack:
  added: []
  patterns: ["percentage-based weighted scoring", "registry pattern for dimension scorers"]
key_files:
  created: []
  modified:
    - "packages/core/src/types.ts"
    - "packages/core/src/constants.ts"
    - "packages/core/src/utils.ts"
    - "packages/core/src/index.ts"
    - "packages/core/src/scorer/dimensions.ts"
    - "packages/core/src/scorer/grades.ts"
    - "packages/core/src/scorer/index.ts"
    - "packages/core/src/__tests__/scorer.test.ts"
    - "packages/core/src/__tests__/dimensions.test.ts"
    - "packages/core/src/__tests__/determinism.test.ts"
    - "packages/core/src/__tests__/integration.test.ts"
    - "packages/core/src/__tests__/utils.test.ts"
decisions:
  - "weightPct values must sum to exactly 100 across all 36 dimensions"
  - "speakable-schema merged into faq-speakable with combined scoring tiers"
  - "author-schema merged into eeat-signals with Article+Person schema detection"
  - "getWeightCategory() helper retained for any backward compatibility needs"
  - "publishing-velocity and content-licensing reduced to 1% each to correct sum to 100"
metrics:
  duration: "~40 minutes"
  completed_date: "2026-03-28"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 12
---

# Phase 13 Plan 01: Weight Migration & Score Gates Summary

Migrated the AEOrank scoring engine from high/medium/low multipliers to percentage-based weightPct values summing to exactly 100%, and reduced 38 dimensions to 36 by merging two dimension pairs.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Migrate types/constants/scorer to weightPct | dc6532c | types.ts, constants.ts, scorer/index.ts, utils.ts, index.ts, all test files |
| 2 | Merge absorbed scorers (speakable→faq, author→eeat) | 72790ad | scorer/dimensions.ts, dimensions.test.ts |

## What Was Built

**Task 1 — weightPct Migration**

- `DimensionDef.weight: "high"|"medium"|"low"` replaced with `weightPct: number` in types.ts
- `DimensionScore.weight` same migration
- `WEIGHT_MULTIPLIER` constant removed from constants.ts
- All 36 `DIMENSION_DEFS` entries updated with explicit percentage weights summing to 100
- `calculateAeoScore()` rewritten: `weightedSum += (score/maxScore) * def.weightPct`, result is directly on 0-100 scale
- `scorePerPage()` normalizes by `totalPageWeight` (subset of dimensions)
- `calculateWeightedScore()` in utils.ts updated to use `dim.weightPct`
- `getWeightCategory(weightPct)` helper added to grades.ts for backward compat
- `getWeightCategory` re-exported from scorer/index.ts and index.ts

**Task 2 — Dimension Merger**

- `scoreFaqSpeakable` absorbs SpeakableSpecification detection (direct `@type`, `@graph`, nested `speakable` property); scoring tiers: 10=FAQ+3Q&A+speakable, 8=FAQ+3Q&A, 7=FAQ+speakable, 6=FAQ, 5=faq-content+speakable, 4=speakable only, 3=faq-content, 0=none
- `scoreEeatSignals` absorbs Person schema detection (credentials, sameAs) and Article+author markup; scoring tiers: 10=Article+Person+credentials+sameAs, 9=Article+Person+credentials, 8=Article+Person, 7=3 content signals, 5=2 signals or PersonSchema, 3=1 signal, 0=none
- `scoreSpeakableSchema` function removed entirely
- `scoreAuthorSchema` function removed entirely
- `author-schema` and `speakable-schema` entries removed from `DIMENSION_SCORERS` map

## Weight Table (36 dimensions, sum = 100)

| Dimension | weightPct |
|-----------|-----------|
| topic-coherence | 7 |
| eeat-signals | 6 |
| llms-txt | 5 |
| content-structure | 5 |
| faq-speakable | 5 |
| original-data | 5 |
| schema-markup | 4 |
| answer-first | 4 |
| fact-density | 4 |
| duplicate-content | 4 |
| qa-format | 4 |
| direct-answer-density | 4 |
| internal-linking | 4 |
| ai-crawler-access | 3 |
| cross-page-duplication | 3 |
| evidence-packaging | 3 |
| citation-ready-writing | 3 |
| query-answer-alignment | 3 |
| tables-lists | 3 |
| definition-patterns | 3 |
| entity-disambiguation | 3 |
| meta-descriptions | 2 |
| https-redirects | 2 |
| page-freshness | 2 |
| citation-anchors | 2 |
| semantic-html | 2 |
| extraction-friction | 2 |
| content-cannibalization | 2 |
| sitemap | 1 |
| image-context | 1 |
| schema-coverage | 1 |
| publishing-velocity | 1 |
| content-licensing | 1 |
| canonical-urls | 1 |
| rss-feed | 1 |
| visible-dates | 1 |
| **TOTAL** | **100** |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Weight sum was 102, not 100**
- **Found during:** Task 1
- **Issue:** Plan's weight table listed 34 items but 36 dimensions exist; canonical-urls (1) and visible-dates (1) were not in the plan's list but needed to remain
- **Fix:** Reduced publishing-velocity 2→1 and content-licensing 2→1 to restore sum to 100
- **Files modified:** packages/core/src/constants.ts
- **Commit:** dc6532c

**2. [Rule 1 - Bug] FAQPage not detected inside @graph arrays**
- **Found during:** Task 2 (test failure)
- **Issue:** scoreFaqSpeakable only checked `s["@type"] === "FAQPage"` at top level, not inside `@graph`
- **Fix:** Extracted `checkFaqSchema()` helper and called it for both top-level and `@graph` items
- **Files modified:** packages/core/src/scorer/dimensions.ts
- **Commit:** 72790ad

## Self-Check: PASSED

Files verified:
- packages/core/src/types.ts — exists, weightPct field present
- packages/core/src/constants.ts — exists, 36 DIMENSION_DEFS with weightPct
- packages/core/src/scorer/dimensions.ts — exists, scoreSpeakableSchema/scoreAuthorSchema removed
- .planning/phases/13-weight-migration-score-gates/13-01-SUMMARY.md — this file

Commits verified:
- dc6532c — Task 1 commit
- 72790ad — Task 2 commit

Test results: 259/259 tests pass
