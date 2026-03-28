# Roadmap: AEOrank

## Milestones

- ✅ **v1.0 MVP** — Phases 1-7 (shipped 2026-03-28) — [Archive](milestones/v1.0-ROADMAP.md)
- 📋 **v2.0 Competitive Parity** — Phases 8-16 (planned)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

<details>
<summary>✅ v1.0 MVP (Phases 1-7) — SHIPPED 2026-03-28</summary>

- [x] Phase 1: Core Engine (5/5 plans) — completed 2026-03-24
- [x] Phase 2: CLI (3/3 plans) — completed 2026-03-14
- [x] Phase 3: Web Presence (4/4 plans) — completed 2026-03-14
- [x] Phase 4: GitHub Action (2/2 plans) — completed 2026-03-14
- [x] Phase 5: SaaS Dashboard (5/5 plans) — completed 2026-03-14
- [x] Phase 6: Retroactive Verification (3/3 plans) — completed 2026-03-15
- [x] Phase 7: Marketing Content & Deployment (2/2 plans) — completed 2026-03-15

</details>

### 📋 v2.0 Competitive Parity (36 Criteria)

Expands scoring from 12 dimensions to 36 criteria across 5 pillars, matching AEO Content Inc's coverage while keeping our plugin generation advantage.

- [ ] **Phase 8: Answer Readiness** — +7 dimensions (topic coherence, original data, fact density, duplicate content, evidence packaging, citation-ready writing)
- [x] **Phase 9: Content Structure Expansion** — +6 dimensions (Q&A format, direct answer density, tables & lists, definition patterns, entity disambiguation) (completed 2026-03-28)
- [x] **Phase 10: Trust & Authority Expansion** — +2 dimensions (internal linking, author schema) (completed 2026-03-28)
- [x] **Phase 11: Technical Foundation Expansion** — +5 dimensions (semantic HTML, extraction friction, image context, schema coverage, speakable) (completed 2026-03-28)
- [x] **Phase 12: AI Discovery Expansion** — +6 dimensions (content cannibalization, publishing velocity, content licensing, canonical URLs, RSS feed, visible dates) (completed 2026-03-28)
- [x] **Phase 13: Weight Migration & Score Gates** — Migrate to percentage weights, merge overlapping dimensions, add coherence + duplication gates (completed 2026-03-28)
- [x] **Phase 14: New File Generators** — ai.txt generator, llms-full.txt improvements, plugin updates (completed 2026-03-28)
- [x] **Phase 15: Dashboard & Docs Updates** — Update all surfaces for 36 criteria (completed 2026-03-28)
- [ ] **Phase 16: Per-Page Scoring** — Page-level scoring (0-75 scale), CLI `--page` flag, API per-page results

## Phase Details

### Phase 8: Answer Readiness
**Goal**: Add 7 Answer Readiness scoring dimensions — the highest-impact pillar that most differentiates competitive coverage. Parser extracts paragraph text arrays, sentence-level analysis, and cross-page text hashing. All new scorers are pure functions added to dimensions.ts.
**Depends on**: Phase 1 (core engine)
**Requirements**: ANS-01, ANS-02, ANS-03, ANS-04, ANS-05, ANS-06, ANS-07
**Success Criteria** (what must be TRUE):
  1. `scan()` result includes 7 new dimension scores (topic-coherence, original-data, fact-density, duplicate-content, cross-page-duplication, evidence-packaging, citation-ready-writing)
  2. Each new dimension returns score 0-10, weight percentage, status (pass/warn/fail), and fix hint
  3. Running the full test suite (existing + new) passes with zero failures
  4. Scanning a content-rich site (e.g., blog with 10+ articles) produces meaningfully different scores per dimension (not all zeros or all tens)
  5. Determinism test: same URL scanned twice produces identical scores for all 7 new dimensions
**Plans:** 2/2 plans executed
Plans:
- [x] 08-01-PLAN.md — Parser extensions + first 4 scorers (topic-coherence, original-data, fact-density, duplicate-content)
- [x] 08-02-PLAN.md — Last 3 scorers (cross-page-duplication, evidence-packaging, citation-ready-writing) + determinism tests

### Phase 9: Content Structure Expansion
**Goal**: Add 6 Content Structure scoring dimensions checking Q&A format, answer density, tables/lists, definition patterns, and entity disambiguation. Parser detects question headings, table/list elements, and definition sentence patterns.
**Depends on**: Phase 8
**Requirements**: CSTR-01, CSTR-02, CSTR-03, CSTR-04, CSTR-05, CSTR-06
**Success Criteria** (what must be TRUE):
  1. `scan()` result includes 6 new dimension scores (qa-format, direct-answer-density, query-answer-alignment, tables-lists, definition-patterns, entity-disambiguation)
  2. Each new dimension returns score 0-10 with weight, status, and fix hint
  3. A FAQ-style page scores significantly higher on qa-format and direct-answer-density than a narrative page
  4. All existing + new tests pass with zero failures
  5. Determinism test passes for all 6 new dimensions
**Plans:** 2/2 plans complete
Plans:
- [x] 09-01-PLAN.md — Parser extensions (question headings, table/list counts) + first 3 scorers (qa-format, direct-answer-density, query-answer-alignment)
- [x] 09-02-PLAN.md — Last 3 scorers (tables-lists, definition-patterns, entity-disambiguation) + determinism tests

### Phase 10: Trust & Authority Expansion
**Goal**: Add 2 Trust & Authority dimensions for internal linking analysis and author/expert schema detection. Parser counts internal vs external links per page, detects breadcrumb markup, and extracts Person schema properties.
**Depends on**: Phase 9
**Requirements**: TRST-01, TRST-02
**Success Criteria** (what must be TRUE):
  1. `scan()` result includes internal-linking and author-schema dimension scores
  2. A site with rich internal linking and author schema scores higher than one without
  3. All existing + new tests pass with zero failures
  4. Determinism test passes for both new dimensions
**Plans:** 1/1 plans complete
Plans:
- [x] 10-01-PLAN.md — Both scorers (internal-linking, author-schema) + determinism tests

### Phase 11: Technical Foundation Expansion
**Goal**: Add 5 Technical Foundation dimensions checking semantic HTML, extraction friction, image context, schema coverage on inner pages, and speakable markup. Parser detects semantic elements, measures sentence complexity, and checks image figure patterns.
**Depends on**: Phase 10
**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04, TECH-05
**Success Criteria** (what must be TRUE):
  1. `scan()` result includes 5 new dimension scores (semantic-html, extraction-friction, image-context, schema-coverage, speakable-schema)
  2. Each new dimension returns score 0-10 with weight, status, and fix hint
  3. A well-structured HTML5 site scores higher on semantic-html than a div-soup site
  4. All existing + new tests pass with zero failures
  5. Determinism test passes for all 5 new dimensions
**Plans:** 2/2 plans complete
Plans:
- [x] 11-01-PLAN.md — Parser extensions (semantic elements, image context, sentence metrics) + first 3 scorers (semantic-html, extraction-friction, image-context)
- [x] 11-02-PLAN.md — Last 2 scorers (schema-coverage, speakable-schema) + determinism tests for all 32 dimensions

### Phase 12: AI Discovery Expansion
**Goal**: Add 6 AI Discovery dimensions checking content cannibalization, publishing velocity, content licensing, canonical URLs, RSS feeds, and visible dates. Parser extracts canonical tags, RSS link tags, time elements, and ai.txt.
**Depends on**: Phase 11
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06
**Success Criteria** (what must be TRUE):
  1. `scan()` result includes 6 new dimension scores (content-cannibalization, publishing-velocity, content-licensing, canonical-urls, rss-feed, visible-dates)
  2. Each new dimension returns score 0-10 with weight, status, and fix hint
  3. A site with canonical tags, RSS feed, and dated content scores higher on discovery dimensions
  4. All existing + new tests pass with zero failures
  5. Determinism test passes for all 6 new dimensions
**Plans:** 2/2 plans complete
Plans:
- [x] 12-01-PLAN.md — Parser/scanner extensions + first 3 scorers (content-cannibalization, publishing-velocity, content-licensing)
- [x] 12-02-PLAN.md — Last 3 scorers (canonical-urls, rss-feed, visible-dates) + determinism tests for all 38 dimensions

### Phase 13: Weight Migration & Score Gates
**Goal**: Migrate from high/medium/low weights to percentage-based weights summing to 100%. Redistribute existing 12 dimensions into new system. Add coherence gate (topic-coherence < 6 caps score) and duplication gate (3+ blocks caps page at 35%). Merge overlapping dimensions where noted in SCORING_ROADMAP.md.
**Depends on**: Phase 12 (all 36 dimensions exist)
**Requirements**: WGHT-01, WGHT-02, WGHT-03, WGHT-04
**Success Criteria** (what must be TRUE):
  1. All 36 criteria use `weightPct: number` with weights summing to exactly 100%
  2. Existing 12 dimensions produce comparable scores under new weight system (regression test)
  3. Coherence gate: site with topic-coherence < 6/10 has score capped visibly in output
  4. Duplication gate: page with 3+ duplicate blocks capped at 35% in per-page score
  5. All existing tests updated and passing with zero failures
**Plans:** 2/2 plans complete
Plans:
- [x] 13-01-PLAN.md — Weight migration: types, constants, scorer to weightPct + merge speakable-schema and author-schema
- [x] 13-02-PLAN.md — Score gates (coherence + duplication) + CLI/dashboard weightPct display updates

### Phase 14: New File Generators
**Goal**: Add ai.txt generator and improve llms-full.txt with Q&A pairs, definition blocks, and entity disambiguation. Update generateFiles() to produce 9 files total.
**Depends on**: Phase 13
**Requirements**: FGEN-01, FGEN-02
**Success Criteria** (what must be TRUE):
  1. `generateFiles()` returns ai.txt alongside existing 8 files (9 total minimum)
  2. ai.txt contains content licensing directives in a machine-readable format
  3. llms-full.txt includes extracted Q&A pairs and definition blocks from scan results
  4. Generator tests cover both new outputs
  5. All existing generator tests still pass
**Plans:** 1/1 plans complete
Plans:
- [x] 14-01-PLAN.md — ai.txt generator + llms-full.txt Q&A/definitions/entities enrichment

### Phase 15: Dashboard & Docs Updates
**Goal**: Update all user-facing surfaces for 36 criteria. Dashboard shows pillar-grouped breakdown, docs reference all criteria, marketing reflects "36 criteria across 5 pillars", CLI groups by pillar with --pillar filter.
**Depends on**: Phase 14
**Requirements**: SURF-01, SURF-02, SURF-03, SURF-04
**Success Criteria** (what must be TRUE):
  1. Dashboard score breakdown renders 5 collapsible pillar sections with all criteria
  2. Docs scoring pages reference 36 criteria (no stale "12 dimensions" text)
  3. Marketing site mentions "36 criteria across 5 pillars" (not "12 dimensions")
  4. CLI `aeorank scan <url>` output groups dimensions by pillar
  5. CLI `--pillar answer-readiness` filters output to show only that pillar's criteria
**Plans:** 3/3 plans complete
Plans:
- [x] 15-01-PLAN.md — Core PILLAR_GROUPS constant + Dashboard pillar-grouped ScoreBreakdown
- [x] 15-02-PLAN.md — Docs + Marketing content updates (36 criteria, 5 pillars, percentage weights)
- [x] 15-03-PLAN.md — CLI pillar-grouped output + --pillar filter flag

### Phase 16: Per-Page Scoring
**Goal**: Add per-page scoring (0-75 scale) for the 21 page-level criteria. Dashboard shows per-page breakdown, CLI supports --page flag, API returns per-page scores.
**Depends on**: Phase 15
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04
**Success Criteria** (what must be TRUE):
  1. `scorePerPage()` returns 0-75 score for each scanned page using 21 page-level criteria
  2. Dashboard site detail page shows expandable per-page score table
  3. `aeorank scan <url> --page /about` outputs score for a single page
  4. API scan result JSON includes `pages[]` array with per-page dimension scores
  5. All existing + new tests pass
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Core Engine | v1.0 | 5/5 | Complete | 2026-03-24 |
| 2. CLI | v1.0 | 3/3 | Complete | 2026-03-14 |
| 3. Web Presence | v1.0 | 4/4 | Complete | 2026-03-14 |
| 4. GitHub Action | v1.0 | 2/2 | Complete | 2026-03-14 |
| 5. SaaS Dashboard | v1.0 | 5/5 | Complete | 2026-03-14 |
| 6. Retroactive Verification | v1.0 | 3/3 | Complete | 2026-03-15 |
| 7. Marketing Content | v1.0 | 2/2 | Complete | 2026-03-15 |
| 8. Answer Readiness | v2.0 | 2/2 | Complete |  |
| 9. Content Structure | v2.0 | 2/2 | Complete   | 2026-03-28 |
| 10. Trust & Authority | v2.0 | 1/1 | Complete    | 2026-03-28 |
| 11. Technical Foundation | v2.0 | 2/2 | Complete    | 2026-03-28 |
| 12. AI Discovery | v2.0 | 2/2 | Complete    | 2026-03-28 |
| 13. Weight Migration | v2.0 | 2/2 | Complete    | 2026-03-28 |
| 14. New File Generators | v2.0 | 1/1 | Complete    | 2026-03-28 |
| 15. Dashboard & Docs | v2.0 | 3/3 | Complete    | 2026-03-28 |
| 16. Per-Page Scoring | v2.0 | 0/? | Not Started | — |
