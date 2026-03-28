# Phase 10: Trust & Authority Expansion - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — pure scoring dimensions)

<domain>
## Phase Boundary

Add 2 Trust & Authority scoring dimensions to @aeorank/core: internal linking analysis and author/expert schema detection. Parser changes count internal vs external links per page, detect breadcrumb markup, and extract Person schema properties.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow SCORING_ROADMAP.md specs and patterns from Phases 8-9.

Dimension specs:
- `internal-linking` (3%): Topic clusters, breadcrumbs, link depth from homepage
- `author-schema` (2%): Person schema with credentials, sameAs links

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- 25 DIMENSION_DEFS and DIMENSION_SCORERS registered
- 511 tests passing across 34 files
- ScannedPage already has links array from Phase 1 parser

### Integration Points
- New scorers in dimensions.ts, constants.ts, index.ts
- Parser may need internal/external link counting and breadcrumb detection

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow SCORING_ROADMAP.md.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
