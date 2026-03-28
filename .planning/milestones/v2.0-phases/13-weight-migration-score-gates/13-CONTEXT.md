# Phase 13: Weight Migration & Score Gates - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase)

<domain>
## Phase Boundary

Migrate from high/medium/low weights to percentage-based weights summing to 100%. Redistribute existing 12 dimensions into the new system alongside the 26 new ones. Add coherence gate (topic-coherence < 6 caps score) and duplication gate (3+ blocks caps page at 35%). Merge overlapping dimensions where noted in SCORING_ROADMAP.md.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices at Claude's discretion. Key references:

From SCORING_ROADMAP.md Phase 13:
- Update `DimensionDef` type to support `weightPct: number` alongside legacy `weight`
- Redistribute existing 12 dimensions into percentage weights (see SCORING_ROADMAP.md for exact mappings)
- Merge overlapping dimensions: FAQ & Speakable absorbs speakable-schema, E-E-A-T absorbs author-schema, HTTPS & Redirects absorbs canonical-urls, Page Freshness absorbs visible-dates
- After merging: 38 raw dimensions → 36 final criteria (some merged)
- Add coherence gate: topic-coherence < 6 caps total score
- Add duplication gate: 3+ duplicate blocks caps page score at 35%
- Total weights must sum to exactly 100%

</decisions>

<code_context>
## Existing Code Insights

### Current State
- 38 DIMENSION_DEFS using weight: "high" | "medium" | "low" multipliers
- WEIGHT_MULTIPLIER constant: high=1.5, medium=1.0, low=0.5
- calculateAeoScore() in scorer/index.ts uses these multipliers
- 598 tests passing

### Key Files
- packages/core/src/constants.ts — DIMENSION_DEFS, WEIGHT_MULTIPLIER
- packages/core/src/scorer/index.ts — calculateAeoScore(), scorePerPage()
- packages/core/src/types.ts — DimensionDef, DimensionScore types

</code_context>

<specifics>
## Specific Ideas

The weight redistribution from SCORING_ROADMAP.md must be followed exactly. The final weights should match the percentages listed in the scoring roadmap for each dimension.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
