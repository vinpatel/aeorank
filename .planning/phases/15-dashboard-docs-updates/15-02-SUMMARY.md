---
phase: 15-dashboard-docs-updates
plan: "02"
subsystem: docs-marketing
tags: [docs, marketing, scoring, criteria, pillars]
dependency_graph:
  requires: []
  provides: [updated-docs-scoring, updated-marketing-copy]
  affects: [docs-site, marketing-site]
tech_stack:
  added: []
  patterns: [markdown-docs, astro-components, stacked-bar-visualization]
key_files:
  created: []
  modified:
    - apps/docs/src/content/docs/scoring/dimensions.md
    - apps/docs/src/content/docs/scoring/calculation.md
    - apps/docs/src/content/docs/scoring/grades.md
    - apps/docs/src/content/docs/getting-started.md
    - apps/docs/src/content/docs/what-is-aeo.md
    - apps/docs/src/content/docs/index.mdx
    - apps/docs/astro.config.mjs
    - apps/marketing/src/components/ScoringExplainer.astro
    - apps/marketing/src/components/Hero.astro
    - apps/marketing/src/components/FAQ.astro
decisions:
  - "Replaced 12-point radar chart with 5-segment stacked bar — simpler and more informative for pillar-weight communication"
  - "Grouped all 36 criteria into pillar sections in dimensions.md for navigability"
  - "Added Score Gates section to calculation.md documenting coherence and duplication gates"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-28"
  tasks_completed: 2
  files_modified: 10
---

# Phase 15 Plan 02: Docs & Marketing 36 Criteria Update Summary

**One-liner:** Updated all docs and marketing from stale "12 dimensions" to "36 criteria across 5 pillars" with percentage weights, stacked bar visualization, and score gates documentation.

## What Was Done

### Task 1: Rewrite docs scoring pages for 36 criteria

**dimensions.md** — Complete rewrite from 12 dimensions (3 weight tiers) to 36 criteria grouped by 5 pillars with percentage weights. Each criterion has H3 name, ID, weight %, description, and Pass/Warn/Fail criteria. Ends with a full Quick Reference table (all 36 criteria, IDs, weights, max scores). Sidebar label updated from "12 Dimensions" to "36 Criteria" in astro.config.mjs.

**calculation.md** — Replaced multiplier-based formula (1.5x/1.0x/0.5x) with percentage-weight formula (`final_score = Σ(criterion_score / max_score × weightPct)`). Added Score Gates section documenting the coherence gate (topic-coherence < 6/10) and duplication gate (3+ duplicate blocks caps at 35). Updated "Improving your score" to organize guidance by pillar.

**Other docs files** — Removed all "12 dimensions" references from getting-started.md, what-is-aeo.md, index.mdx, and grades.md.

### Task 2: Update marketing site for 5 pillars

**ScoringExplainer.astro** — Major rewrite replacing the 12-axis radar chart SVG and high/medium/low dimension grouping with:
- A 5-segment horizontal stacked bar visualization showing pillar weight contributions (26%+25%+12%+25%+12% = 100%) with warm-to-cool color gradient
- Pillar legend with color swatches and weight percentages
- Per-pillar criteria lists showing all 36 criteria with individual weights
- Heading changed from "12 Dimensions. One Score." to "36 Criteria. 5 Pillars. One Score."

**Hero.astro** — Updated subheadline and stat counter: "12 dimensions" → "36 criteria", "AI dimensions scored" → "AI criteria scored".

**FAQ.astro** — Updated scoring answer to reference 36 criteria across 5 pillars with pillar names and percentage weights.

## Verification

Both builds pass:
- `pnpm turbo build --filter=@aeorank/docs` — 36 pages built
- `pnpm turbo build --filter=@aeorank/marketing` — 1 page built

Zero `12 [Dd]imension` references remain in either `apps/docs/src/` or `apps/marketing/src/`.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

**Additional change (Rule 2):** Hero.astro stat counter also updated from "12" to "36" (the plan mentioned the subheadline change but the stat counter also needed updating for consistency). Applied as part of Task 2.

## Commits

- `a7cb2d8` — feat(15-02): rewrite docs scoring pages for 36 criteria with percentage weights
- `81645f0` — feat(15-02): update marketing site for 36 criteria across 5 pillars

## Self-Check: PASSED

All key files verified present. Both task commits confirmed in git log.
