# Phase 16: Per-Page Scoring - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure + surface phase)

<domain>
## Phase Boundary

Add per-page scoring (0-75 scale) for the 21 page-level criteria. Dashboard shows per-page breakdown, CLI supports --page flag, API returns per-page scores.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All choices at Claude's discretion. Key references:

From SCORING_ROADMAP.md Phase 16:
- 21 of 36 criteria apply at page level (those in PAGE_LEVEL_DIMENSIONS)
- Page score 0-75 (not 0-100 since site-level dimensions don't apply)
- Dashboard shows per-page breakdown on site detail page
- CLI adds --page flag for single-page audit
- API returns pages[] array with per-page dimension scores

Core already has scorePerPage() — may need enhancement to return 0-75 scale and include the duplication gate.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- scorePerPage() in packages/core/src/scorer/index.ts — already scores individual pages
- PAGE_LEVEL_DIMENSIONS constant — lists which dimensions are page-level
- Duplication gate already implemented in scorePerPage() (Phase 13)
- ScanResult.pageScores already exists in types

### Key Files
- packages/core/src/scorer/index.ts — scorePerPage()
- packages/core/src/types.ts — PageScore type
- apps/web/app/sites/[siteId]/page.tsx — site detail page
- packages/cli/src/commands/scan.ts — scan command

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow SCORING_ROADMAP.md Phase 16.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
