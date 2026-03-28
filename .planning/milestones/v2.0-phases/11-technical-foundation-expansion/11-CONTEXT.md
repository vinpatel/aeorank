# Phase 11: Technical Foundation Expansion - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — pure scoring dimensions)

<domain>
## Phase Boundary

Add 5 Technical Foundation scoring dimensions to @aeorank/core: semantic HTML, extraction friction, image context, schema coverage on inner pages, and speakable markup. Parser detects semantic elements, measures sentence complexity, and checks image figure patterns.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Follow SCORING_ROADMAP.md specs and patterns from Phases 8-10.

Dimension specs:
- `semantic-html` (2%): main, article, nav, aside, ARIA, lang attribute
- `extraction-friction` (2%): Average sentence length, jargon density, passive voice
- `image-context` (1%): figure/figcaption, descriptive alt text, contextual placement
- `schema-coverage` (1%): Schema on inner pages, not just homepage
- `speakable-schema` (1%): SpeakableSpecification markup

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- 27 DIMENSION_DEFS and DIMENSION_SCORERS
- ScannedPage has schemaOrg[], sentences[], headings[], links[]
- 527 tests passing

### Integration Points
- Parser may need: semantic element counts, figure/figcaption detection, alt text extraction
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
