# Phase 14: New File Generators - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase)

<domain>
## Phase Boundary

Add ai.txt generator and improve llms-full.txt with Q&A pairs, definition blocks, and entity disambiguation. Update generateFiles() to produce ai.txt alongside existing files.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All choices at Claude's discretion. Follow SCORING_ROADMAP.md Phase 14 and existing generator patterns.

From SCORING_ROADMAP.md:
- ai.txt — Content licensing file for AI crawlers (similar to robots.txt but for usage rights)
- llms-full.txt improvements — Add Q&A pairs, definition blocks, entity disambiguation
- All generators are pure functions (ScanResult in, string out)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- 8 existing generators in packages/core/src/generators/
- Each generator: (result: ScanResult) => string
- generateFiles() orchestrates all generators
- ScannedPage now has questionHeadings, sentences, paragraphs from Phase 8-9

### Integration Points
- New generator functions in generators/
- generateFiles() returns map of filename → content
- ai.txt content-licensing format to be defined

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow SCORING_ROADMAP.md.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
