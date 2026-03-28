---
phase: 14-new-file-generators
plan: "01"
subsystem: core-generators
tags: [generators, ai-txt, llms-full, content-licensing, qa-pairs, definitions, entity-disambiguation]
dependency_graph:
  requires: []
  provides: [ai-txt-generator, llms-full-enriched]
  affects: [packages/core, packages/cli]
tech_stack:
  added: []
  patterns: [pure-function-generator, definition-pattern-matching, entity-extraction]
key_files:
  created:
    - packages/core/src/generators/ai-txt.ts
  modified:
    - packages/core/src/generators/llms-full.ts
    - packages/core/src/generators/index.ts
    - packages/core/src/__tests__/generators.test.ts
    - packages/core/src/__tests__/integration.test.ts
    - packages/cli/src/__tests__/integration.test.ts
decisions:
  - "DEFINITION_PATTERNS and ENTITY_STOPWORDS duplicated in llms-full.ts (not imported from dimensions.ts) to keep generators dependency-free"
  - "Entity count uses split/join technique instead of indexOf loop to satisfy Biome noAssignInExpressions"
  - "Q&A pairs question headings with paragraphs by index (not by bodyText position search)"
  - "Key Entities section only shows terms with 2+ occurrences in bodyText"
  - "Integration test and CLI integration test updated from 8->9 file count assertions"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-28T20:40:55Z"
  tasks_completed: 2
  files_modified: 6
requirements:
  - FGEN-01
  - FGEN-02
---

# Phase 14 Plan 01: New File Generators (ai.txt + llms-full.txt Improvements) Summary

**One-liner:** ai.txt generator with content licensing directives + llms-full.txt enriched with Q&A pairs, definition blocks, and entity disambiguation sections.

## What Was Built

### Task 1: ai.txt Generator

Created `packages/core/src/generators/ai-txt.ts` — a pure function `generateAiTxt(result: ScanResult): string` that produces a machine-readable AI content licensing file.

Format includes:
- Header comment with site name and URL
- `User-Agent: *` with `Allow-AI-Training`, `Allow-AI-Inference`, `Allow-AI-Summarization`, `Allow-AI-Attribution` directives
- Content license block (CC-BY-4.0, attribution, contact)
- Conditional note comment when the site already has an `/ai.txt` file

Wired into `generateFiles()` in `index.ts` — now returns 9 files (was 8).

### Task 2: llms-full.txt Improvements

Rewrote `packages/core/src/generators/llms-full.ts` to add three structured sections per page (when data is present):

**Q&A section** — emitted when `page.questionHeadings.length > 0`. Pairs each question heading with the corresponding paragraph by index. Format: `**Q: heading**` / `A: paragraph (truncated to 500 chars)`.

**Definitions section** — emitted when sentences match definition patterns. Three patterns: `is defined as`, `refers to`, `means/describes the/a/an`. Each matching sentence listed as a bullet.

**Key Entities section** — emitted when title terms appear 2+ times in bodyText. Extracts words >= 4 chars from page title, filters against ENTITY_STOPWORDS, counts bodyText occurrences. Format: `- Term: Referenced N times`.

All sections omitted entirely when empty — no spurious empty headers.

## Tests

- New test file coverage: 30 tests in generators.test.ts (up from 15)
- Full test suite: 281 tests passing (up from 266)
- All existing regression tests pass

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Integration test hardcoded 8-file count**
- **Found during:** Task 1 GREEN phase
- **Issue:** `packages/core/src/__tests__/integration.test.ts` had 3 assertions checking `files.toHaveLength(8)` and 1 test named "generates exactly 8 files"
- **Fix:** Updated all assertions to 9, renamed test to "generates exactly 9 files"
- **Files modified:** `packages/core/src/__tests__/integration.test.ts`
- **Commit:** 2fd2a55

**2. [Rule 1 - Bug] CLI integration test hardcoded 8-file count**
- **Found during:** Task 1 GREEN phase
- **Issue:** `packages/cli/src/__tests__/integration.test.ts` had assertion `files.toHaveLength(8)`
- **Fix:** Updated to 9
- **Files modified:** `packages/cli/src/__tests__/integration.test.ts`
- **Commit:** 2fd2a55

**3. [Rule 2 - Biome] noAssignInExpressions lint error**
- **Found during:** Task 2 lint check
- **Issue:** `while ((pos = lowerBody.indexOf(term, pos)) !== -1)` pattern violates Biome noAssignInExpressions rule
- **Fix:** Replaced with `lowerBody.split(term).length - 1` which is semantically equivalent and lint-clean
- **Files modified:** `packages/core/src/generators/llms-full.ts`
- **Commit:** 6dcbab8

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 2fd2a55 | feat(14-01): add ai.txt generator and wire into generateFiles (9 files) |
| Task 2 | 6dcbab8 | feat(14-01): improve llms-full.txt with Q&A pairs, definitions, entity disambiguation |

## Self-Check: PASSED

All created files found on disk. Both commits verified in git log.
