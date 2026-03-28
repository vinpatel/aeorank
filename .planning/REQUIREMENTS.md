# Requirements: AEOrank

**Defined:** 2026-03-28
**Core Value:** A developer runs `npx aeorank-cli scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.

## v2.0 Requirements

Requirements for Competitive Parity milestone. Expands scoring from 12 to 36 criteria.

### Answer Readiness

- [x] **ANS-01**: Scanner detects topical authority by analyzing heading/content thematic focus across pages and scores topic coherence 0-10
- [x] **ANS-02**: Scanner detects original research and data (case studies, proprietary stats, unique data points) and scores 0-10
- [x] **ANS-03**: Scanner measures fact and data density (numbers, percentages, statistics per page) and scores 0-10
- [x] **ANS-04**: Scanner detects duplicate content blocks within a single page and scores 0-10
- [x] **ANS-05**: Scanner detects cross-page duplication (identical paragraphs across multiple pages) and scores 0-10
- [x] **ANS-06**: Scanner checks for evidence packaging (inline citations, attribution phrases, sources sections) and scores 0-10
- [x] **ANS-07**: Scanner detects citation-ready writing (self-contained definitions, single-claim statements) and scores 0-10

### Content Structure

- [x] **CSTR-01**: Scanner detects Q&A content format (question-format headings with answers) and scores 0-10
- [x] **CSTR-02**: Scanner measures direct answer density (concise answer paragraphs after question headings) and scores 0-10
- [x] **CSTR-03**: Scanner checks query-answer alignment (every question heading followed by a direct answer) and scores 0-10
- [x] **CSTR-04**: Scanner detects tables with headers and ordered/unordered lists and scores their presence 0-10
- [x] **CSTR-05**: Scanner detects definition patterns ("X is defined as...", "X refers to...") and scores 0-10
- [x] **CSTR-06**: Scanner checks entity disambiguation (primary entity defined early, consistent terminology) and scores 0-10

### Trust & Authority

- [x] **TRST-01**: Scanner analyzes internal linking (topic clusters, breadcrumbs, link depth from homepage) and scores 0-10
- [x] **TRST-02**: Scanner detects author and expert schema (Person schema with credentials, sameAs links) and scores 0-10

### Technical Foundation

- [x] **TECH-01**: Scanner checks semantic HTML usage (main, article, nav, aside, ARIA, lang attribute) and scores 0-10
- [x] **TECH-02**: Scanner measures extraction friction (average sentence length, jargon density, passive voice) and scores 0-10
- [x] **TECH-03**: Scanner checks image context for AI (figure/figcaption, descriptive alt text, contextual placement) and scores 0-10
- [x] **TECH-04**: Scanner checks schema coverage on inner pages (not just homepage) and scores 0-10
- [x] **TECH-05**: Scanner detects SpeakableSpecification markup and scores 0-10

### AI Discovery

- [x] **DISC-01**: Scanner detects content cannibalization (overlapping pages competing for same topic) and scores 0-10
- [x] **DISC-02**: Scanner checks publishing velocity (regular cadence from sitemap lastmod dates) and scores 0-10
- [x] **DISC-03**: Scanner checks for content licensing (ai.txt file, license schema for AI usage) and scores 0-10
- [x] **DISC-04**: Scanner verifies canonical URLs (self-referencing canonical tags on all pages) and scores 0-10
- [x] **DISC-05**: Scanner detects RSS/Atom feed linked from homepage and scores 0-10
- [x] **DISC-06**: Scanner checks for visible date signals (time elements with datetime attributes) and scores 0-10

### Weight System

- [x] **WGHT-01**: Scoring uses percentage-based weights (not high/medium/low) for all 36 criteria summing to 100%
- [x] **WGHT-02**: Existing 12 dimensions redistributed into new percentage system without breaking existing scores
- [x] **WGHT-03**: Coherence gate caps site score when topic-coherence < 6/10
- [x] **WGHT-04**: Duplication gate caps page score at 35% when 3+ duplicate blocks detected

### File Generation

- [x] **FGEN-01**: ai.txt generator produces content licensing file for AI crawlers
- [x] **FGEN-02**: llms-full.txt improved with Q&A pairs, definition blocks, entity disambiguation

### Surface Updates

- [x] **SURF-01**: Dashboard score breakdown shows 36 criteria grouped by pillar (5 collapsible sections)
- [x] **SURF-02**: Docs site updated — "12 Dimensions" → "36 Criteria" across all scoring pages
- [x] **SURF-03**: Marketing site copy updated to reference "36 criteria across 5 pillars"
- [x] **SURF-04**: CLI table output groups dimensions by pillar with --pillar filter flag

### Per-Page Scoring

- [x] **PAGE-01**: 21 page-level criteria scored on 0-75 scale per page
- [x] **PAGE-02**: Dashboard shows per-page score breakdown with page-level dimension table
- [x] **PAGE-03**: CLI supports --page flag for single-page audit
- [x] **PAGE-04**: API returns per-page scores in scan results alongside site-level score

## Future Requirements

Deferred beyond v2.0.

### Large Site Handling

- **SITE-01**: Configurable maxPages CLI flag and config option
- **SITE-02**: Smart sampling across site sections for representative scoring
- **SITE-03**: Plan-tiered page caps (Free: 200, Pro: 500, API: unlimited)

### Advanced Features (from v1.0)

- **ADV-01**: Local directory scanning with `aeorank scan ./`
- **ADV-02**: Framework-specific integration guides
- **ADV-03**: Competitor AEO scoring (compare side by side)
- **ADV-04**: AI citation tracker
- **ADV-05**: White-label PDF reports

## Out of Scope

| Feature | Reason |
|---------|--------|
| LLM-based scoring | Must remain deterministic — no API calls during scan |
| Custom weight profiles | Complexity not justified; standard weights match industry |
| Historical dimension comparison | v3 feature — requires schema migration |
| Mobile app | Web-first approach unchanged |
| Real-time monitoring | Separate product category |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ANS-01 | Phase 8 | Complete |
| ANS-02 | Phase 8 | Complete |
| ANS-03 | Phase 8 | Complete |
| ANS-04 | Phase 8 | Complete |
| ANS-05 | Phase 8 | Complete |
| ANS-06 | Phase 8 | Complete |
| ANS-07 | Phase 8 | Complete |
| CSTR-01 | Phase 9 | Complete |
| CSTR-02 | Phase 9 | Complete |
| CSTR-03 | Phase 9 | Complete |
| CSTR-04 | Phase 9 | Complete |
| CSTR-05 | Phase 9 | Complete |
| CSTR-06 | Phase 9 | Complete |
| TRST-01 | Phase 10 | Complete |
| TRST-02 | Phase 10 | Complete |
| TECH-01 | Phase 11 | Complete |
| TECH-02 | Phase 11 | Complete |
| TECH-03 | Phase 11 | Complete |
| TECH-04 | Phase 11 | Complete |
| TECH-05 | Phase 11 | Complete |
| DISC-01 | Phase 12 | Complete |
| DISC-02 | Phase 12 | Complete |
| DISC-03 | Phase 12 | Complete |
| DISC-04 | Phase 12 | Complete |
| DISC-05 | Phase 12 | Complete |
| DISC-06 | Phase 12 | Complete |
| WGHT-01 | Phase 13 | Complete |
| WGHT-02 | Phase 13 | Complete |
| WGHT-03 | Phase 13 | Complete |
| WGHT-04 | Phase 13 | Complete |
| FGEN-01 | Phase 14 | Complete |
| FGEN-02 | Phase 14 | Complete |
| SURF-01 | Phase 15 | Complete |
| SURF-02 | Phase 15 | Complete |
| SURF-03 | Phase 15 | Complete |
| SURF-04 | Phase 15 | Complete |
| PAGE-01 | Phase 16 | Complete |
| PAGE-02 | Phase 16 | Complete |
| PAGE-03 | Phase 16 | Complete |
| PAGE-04 | Phase 16 | Complete |

**Coverage:**
- v2.0 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after milestone v2.0 initialization*
