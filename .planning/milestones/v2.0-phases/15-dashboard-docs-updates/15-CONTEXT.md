# Phase 15: Dashboard & Docs Updates - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (surface update phase)

<domain>
## Phase Boundary

Update all user-facing surfaces for 36 criteria across 5 pillars. Dashboard shows pillar-grouped breakdown, docs reference all criteria, marketing reflects "36 criteria across 5 pillars", CLI groups by pillar with --pillar filter.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All choices at Claude's discretion. Key areas:

Dashboard (apps/web):
- ScoreBreakdown.tsx already updated with weightPct in Phase 13
- Need to group 36 criteria into 5 collapsible pillar sections
- Pillars: Answer Readiness, Content Structure, Trust & Authority, Technical Foundation, AI Discovery

Docs (apps/docs):
- Scoring dimension pages need updating from "12 dimensions" to "36 criteria"
- Add new dimension documentation pages for all 24 new criteria
- Update calculation page for percentage weights

Marketing (apps/marketing):
- Update copy referencing "12 dimensions" → "36 criteria across 5 pillars"
- ScoringExplainer component needs updating

CLI (packages/cli):
- Add --pillar filter flag to scan command
- Group dimension table output by pillar

</decisions>

<code_context>
## Existing Code Insights

### Key Files
- apps/web/app/sites/[siteId]/page.tsx — ScoreBreakdown usage
- apps/web/components/ScoreBreakdown.tsx — already has weightPct
- apps/docs/src/content/docs/scoring/ — dimensions.md, calculation.md, grades.md
- apps/marketing/src/components/ScoringExplainer.astro
- packages/cli/src/ui/score-display.ts — renderDimensionTable

### Established Patterns
- Dashboard: React components with Tailwind CSS
- Docs: Starlight markdown pages
- Marketing: Astro components
- CLI: chalk-colored terminal output

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow SCORING_ROADMAP.md Phase 15 and existing patterns.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
