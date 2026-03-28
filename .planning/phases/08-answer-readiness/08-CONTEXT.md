# Phase 8: Answer Readiness - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — pure scoring dimensions)

<domain>
## Phase Boundary

Add 7 Answer Readiness scoring dimensions to @aeorank/core. Each dimension is a pure scorer function in dimensions.ts that receives ScanResult and returns DimensionScore (0-10). Parser changes extract paragraph text arrays, sentence-level analysis, and cross-page text hashing.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase adding deterministic scoring functions. Use SCORING_ROADMAP.md specifications and existing dimension scorer patterns as the guide.

Specific dimension specs from SCORING_ROADMAP.md:
- `topic-coherence` (6%): Analyze headings + content across pages for thematic focus vs scatter
- `original-data` (4%): Detect case studies, proprietary stats, unique data points
- `fact-density` (3%): Count specific numbers, percentages, statistics per page
- `duplicate-content` (3%): Detect repeated text blocks within a page
- `cross-page-duplication` (2%): Detect identical paragraphs across multiple pages
- `evidence-packaging` (2%): Check for inline citations, attribution phrases, sources sections
- `citation-ready-writing` (2%): Detect self-contained definition sentences, single-claim statements

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/core/src/scorer/dimensions.ts` — existing 12 dimension scorers follow DimensionScorer pattern
- `DIMENSION_SCORERS` Map in dimensions.ts — registry pattern for all scorers
- `packages/core/src/scanner/parser.ts` — HTML parser using cheerio
- `packages/core/src/types.ts` — ScannedPage, DimensionScore, ScanResult types

### Established Patterns
- Each scorer: `(pages: ScannedPage[], config: ScanConfig) => DimensionScore`
- Pure functions with no I/O
- Weight defined via WEIGHT_MULTIPLIER (will migrate to percentages in Phase 13)

### Integration Points
- New scorers register in DIMENSION_SCORERS map
- New parsed fields extend ScannedPage interface in types.ts
- New extraction logic in parser.ts

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Follow SCORING_ROADMAP.md dimension specifications exactly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
