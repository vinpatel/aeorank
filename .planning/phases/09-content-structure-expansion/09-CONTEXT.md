# Phase 9: Content Structure Expansion - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — pure scoring dimensions)

<domain>
## Phase Boundary

Add 6 Content Structure scoring dimensions to @aeorank/core. Each dimension is a pure scorer function following the established DimensionScorer pattern. Parser changes detect question headings, table/list elements, and definition sentence patterns.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow SCORING_ROADMAP.md specs and the patterns established in Phase 8.

Dimension specs from SCORING_ROADMAP.md:
- `qa-format` (3%): Question-format headings (What, How, Why) with answers
- `direct-answer-density` (3%): Concise answer paragraphs after question headings
- `query-answer-alignment` (2%): Every question heading followed by a direct answer
- `tables-lists` (2%): HTML tables with headers, ordered/unordered lists
- `definition-patterns` (2%): "X is defined as..." / "X refers to..." patterns
- `entity-disambiguation` (2%): Primary entity defined early, consistent terminology

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 8 established: paragraphs, sentences, contentHash on ScannedPage
- 19 DIMENSION_DEFS and DIMENSION_SCORERS already registered
- 479 tests passing across 34 files

### Established Patterns
- Each scorer: `(pages: ScannedPage[], config: ScanConfig) => DimensionScore`
- TDD: write failing tests first, then implement
- Register in DIMENSION_SCORERS map and DIMENSION_DEFS constant array

### Integration Points
- New scorers register in DIMENSION_SCORERS map in dimensions.ts
- New DIMENSION_DEFS entries in constants.ts
- Parser may need new extraction for question headings, tables, lists

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow SCORING_ROADMAP.md dimension specifications.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
