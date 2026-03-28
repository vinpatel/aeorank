# Phase 12: AI Discovery Expansion - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — pure scoring dimensions)

<domain>
## Phase Boundary

Add 6 AI Discovery scoring dimensions to @aeorank/core: content cannibalization, publishing velocity, content licensing, canonical URLs, RSS feeds, and visible dates. Parser extracts canonical tags, RSS link tags, time elements, and ai.txt.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All choices at Claude's discretion. Follow SCORING_ROADMAP.md and Phase 8-11 patterns.

Dimension specs:
- `content-cannibalization` (2%): Overlapping pages competing for same topic
- `publishing-velocity` (2%): Regular publishing cadence from sitemap lastmod dates
- `content-licensing` (2%): /ai.txt file, license schema for AI usage
- `canonical-urls` (1%): Self-referencing canonical tags on all pages
- `rss-feed` (1%): RSS feed linked from homepage
- `visible-dates` (1%): time elements with datetime attributes

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- 32 DIMENSION_DEFS, 567 tests passing
- ScannedPage already has canonicalUrl field from Phase 1
- Scanner already fetches robots.txt — similar pattern for ai.txt

### Integration Points
- Parser needs: RSS link detection, time element extraction, ai.txt fetch
- canonical tags may already be partially parsed
- New scorers in dimensions.ts, constants.ts, index.ts

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow SCORING_ROADMAP.md.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
