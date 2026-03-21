# Scoring Roadmap — Milestone 2: Competitive Parity + Beyond

Expand AEOrank from 12 dimensions to 36 criteria, matching and exceeding AEO Content Inc's coverage while keeping our plugin generation advantage.

## Current State

- 12 dimensions (high/medium/low weights)
- Score 0-100 with letter grades
- All checks are deterministic, no LLM calls

## Architecture Approach

Each phase adds new dimension scorers in `packages/core/src/scorer/dimensions.ts`, extends `ScannedPage` in `types.ts` with any new parsed fields, and adds extraction logic in `packages/core/src/scanner/parser.ts`. Existing dimensions and scores remain stable — this is purely additive.

New weight system: migrate from high/medium/low to percentage weights (matching aeocontent's approach) for finer granularity. Existing 12 dimensions get redistributed into the new percentage system.

---

## Phase 8: Answer Readiness (highest impact, 7 new dimensions)

**Goal**: Add the 7 missing Answer Readiness criteria — the heaviest pillar that most differentiates aeocontent's scoring from ours.

**New dimensions:**
| ID | Name | Weight | What to check |
|----|------|--------|---------------|
| `topic-coherence` | Topical Authority | 6% | Analyze headings + content across pages for thematic focus vs scatter |
| `original-data` | Original Research & Data | 4% | Detect case studies, proprietary stats, unique data points |
| `fact-density` | Fact & Data Density | 3% | Count specific numbers, percentages, statistics per page |
| `duplicate-content` | Duplicate Content | 3% | Detect repeated text blocks within a page |
| `cross-page-duplication` | Cross-Page Duplication | 2% | Detect identical paragraphs across multiple pages |
| `evidence-packaging` | Evidence Packaging | 2% | Check for inline citations, attribution phrases, sources sections |
| `citation-ready-writing` | Citation-Ready Writing | 2% | Detect self-contained definition sentences, single-claim statements |

**Parser changes**: Extract paragraph text arrays, sentence-level analysis, cross-page text hashing.

**Score gate**: Add coherence gate — sites with `topic-coherence` < 6/10 get score capped.

---

## Phase 9: Content Structure Expansion (6 new dimensions)

**Goal**: Add granular content structure checks beyond heading hierarchy.

**New dimensions:**
| ID | Name | Weight | What to check |
|----|------|--------|---------------|
| `qa-format` | Q&A Content Format | 3% | Question-format headings (What, How, Why) with answers |
| `direct-answer-density` | Direct Answer Density | 3% | Concise answer paragraphs after question headings |
| `query-answer-alignment` | Query-Answer Alignment | 2% | Every question heading followed by a direct answer |
| `tables-lists` | Tables & Lists | 2% | HTML tables with headers, ordered/unordered lists |
| `definition-patterns` | Definition Patterns | 2% | "X is defined as..." / "X refers to..." patterns |
| `entity-disambiguation` | Entity Disambiguation | 2% | Primary entity defined early, consistent terminology |

**Parser changes**: Detect question headings, table/list elements, definition sentence patterns.

---

## Phase 10: Trust & Authority Expansion (2 new dimensions)

**Goal**: Deepen trust signals beyond basic E-E-A-T.

**New dimensions:**
| ID | Name | Weight | What to check |
|----|------|--------|---------------|
| `internal-linking` | Internal Linking | 3% | Topic clusters, breadcrumbs, link depth from homepage |
| `author-schema` | Author & Expert Schema | 2% | Person schema with credentials, sameAs links |

**Parser changes**: Count internal vs external links per page, detect breadcrumb markup, Person schema properties.

---

## Phase 11: Technical Foundation Expansion (5 new dimensions)

**Goal**: Add granular technical checks for AI parseability.

**New dimensions:**
| ID | Name | Weight | What to check |
|----|------|--------|---------------|
| `semantic-html` | Semantic HTML | 2% | `<main>`, `<article>`, `<nav>`, `<aside>`, ARIA, `lang` attr |
| `extraction-friction` | Extraction Friction | 2% | Average sentence length, jargon density, passive voice |
| `image-context` | Image Context for AI | 1% | `<figure>`/`<figcaption>`, descriptive alt text, contextual placement |
| `schema-coverage` | Schema Coverage | 1% | Schema on inner pages, not just homepage |
| `speakable-schema` | Speakable Schema | 1% | SpeakableSpecification markup |

**Parser changes**: Detect semantic elements, sentence complexity metrics, image figure patterns.

---

## Phase 12: AI Discovery Expansion (6 new dimensions)

**Goal**: Add all missing discoverability signals.

**New dimensions:**
| ID | Name | Weight | What to check |
|----|------|--------|---------------|
| `content-cannibalization` | Content Cannibalization | 2% | Overlapping pages competing for same topic |
| `publishing-velocity` | Publishing Velocity | 2% | Regular publishing cadence from sitemap lastmod dates |
| `content-licensing` | Content Licensing | 2% | `/ai.txt` file, license schema for AI usage |
| `canonical-urls` | Canonical URLs | 1% | Self-referencing canonical tags on all pages |
| `rss-feed` | RSS/Atom Feed | 1% | RSS feed linked from homepage |
| `visible-dates` | Visible Date Signals | 1% | `<time>` elements with datetime attributes |

**Parser changes**: Extract canonical tags (already partial), RSS `<link>` tags, `<time>` elements, ai.txt fetch.

---

## Phase 13: Weight Migration & Score Gates

**Goal**: Migrate from high/medium/low weights to percentage-based weights. Redistribute existing 12 dimensions into the new system. Add score gates.

**Changes:**
- Update `DimensionDef` type to support `weightPct: number` alongside legacy `weight`
- Redistribute existing dimensions:
  - llms.txt: high → 4%
  - Schema.org: high → 3%
  - Content Structure: high → 4%
  - AI Crawler Access: medium → 2%
  - Answer-First: medium → 3% (merge with new `answer-first-placement`)
  - FAQ & Speakable: medium → 3% (absorbs `speakable-schema`)
  - E-E-A-T: medium → 3% (absorbs `author-schema`)
  - Meta Descriptions: medium → 2%
  - Citation Anchors: medium → 2%
  - Sitemap: low → 1%
  - HTTPS & Redirects: low → 1% (absorbs `canonical-urls`)
  - Page Freshness: low → 1% (absorbs `visible-dates`)
- Add coherence gate (topic-coherence < 6 caps score)
- Add duplication gate (3+ duplicate blocks caps page at 35%)
- Total: 36 criteria, weights sum to 100%

---

## Phase 14: New File Generators

**Goal**: Generate 2 new files that aeocontent checks for but we don't generate.

**New generators:**
- `ai.txt` — Content licensing file for AI crawlers (similar to robots.txt but for usage rights)
- `llms-full.txt` improvements — Add Q&A pairs, definition blocks, entity disambiguation

**Plugin updates**: All 13 framework plugins updated to serve/generate `ai.txt`.

---

## Phase 15: Dashboard & Docs Updates

**Goal**: Update all surfaces for the expanded scoring.

**Changes:**
- Dashboard: Update score breakdown UI to show 36 criteria grouped by pillar
- Docs: Add new scoring dimensions page, update "12 Dimensions" → "36 Criteria"
- Marketing: Update copy referencing "12 dimensions" → "36 criteria across 5 pillars"
- CLI: Update table output to group by pillar, add `--pillar` filter flag

---

## Phase 16: Per-Page Scoring

**Goal**: Add per-page scoring (0-75 scale) in addition to site-level scoring.

**Changes:**
- 21 of 36 criteria apply at page level
- Dashboard shows per-page breakdown
- CLI adds `--page` flag for single-page audit
- API returns per-page scores in scan results

---

## Summary

| Phase | New Dimensions | Running Total | Focus |
|-------|---------------|---------------|-------|
| Current | — | 12 | Shipped |
| 8 | +7 | 19 | Answer Readiness |
| 9 | +6 | 25 | Content Structure |
| 10 | +2 | 27 | Trust & Authority |
| 11 | +5 | 32 | Technical Foundation |
| 12 | +6 | 38 | AI Discovery |
| 13 | — | 36 (merged) | Weight migration + gates |
| 14 | — | 36 | New file generators |
| 15 | — | 36 | Dashboard/docs/marketing |
| 16 | — | 36 | Per-page scoring |

## Phase 17: Large Site Scanning

**Goal**: Handle sites with 1000+ pages gracefully with smart sampling, configurable limits, and plan-tiered caps.

**Changes:**
- **Configurable maxPages** — CLI flag `--max-pages` and config option
- **Transparent sampling** — Show "Scored based on 200 of ~1,247 pages" in CLI output and dashboard
- **Smart sampling** — Instead of first-N from sitemap, sample across site sections (homepage, blog, docs, product) for representative scoring
- **Plan-tiered caps** — Free: 200 pages, Pro: 500 pages, API: unlimited
- **Sitemap counting** — Parse full sitemap to report total page count even if not all are scanned

---

After Phase 17, AEOrank will have **36 criteria matching aeocontent's coverage**, smart large-site handling, PLUS the generation + plugin advantage they don't have.
