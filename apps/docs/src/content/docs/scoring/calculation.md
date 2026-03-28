---
title: How Scores Work
description: How AEOrank calculates your AEO score from 36 criteria.
---

AEOrank produces a single score from 0 to 100 by measuring 36 criteria across 5 pillars and applying percentage-weighted aggregation.

## How it works

### 1. Criterion scoring

Each of the [36 criteria](/scoring/dimensions/) is scored from 0 to 10 based on specific checks against your site.

### 2. Percentage weights

Each criterion has a percentage weight. All 36 weights sum to exactly 100%.

```
final_score = Σ(criterion_score / max_score × weightPct)
```

Where `weightPct` is the criterion's percentage weight (e.g., 7 for 7%).

### 3. Example calculation

| Criterion | Score | Weight (%) | Contribution |
|-----------|-------|-----------|--------------|
| Topical Authority | 0/10 | 7% | 0.0 |
| FAQ & Speakable | 6/10 | 5% | 3.0 |
| llms.txt Presence | 0/10 | 5% | 0.0 |
| Content Structure | 8/10 | 5% | 4.0 |
| E-E-A-T Signals | 7/10 | 6% | 4.2 |
| AI Crawler Access | 5/10 | 3% | 1.5 |
| *(30 more criteria)* | … | … | … |

Each criterion contributes `(score / 10) × weightPct` points to the total. The sum across all 36 criteria is your final score out of 100.

### 4. Score Gates

Two gates can cap your final score regardless of weighted totals:

**Coherence Gate:** If `topic-coherence` scores below 6/10, your overall score is capped. A site without topical authority cannot reach high AEO scores even if all other criteria pass — AI engines require a coherent subject focus to trust and cite a source reliably.

**Duplication Gate:** If 3 or more duplicate content blocks are detected across pages, your score is capped at 35. Pervasive duplication signals low-quality content that AI engines should not cite.

### 5. Status thresholds

Each criterion also gets a pass/warn/fail status based on its percentage of max score:

| Status | Threshold | Meaning |
|--------|-----------|---------|
| ✓ Pass | ≥ 70% | Criterion is in good shape |
| ⚠ Warn | 40–69% | Room for improvement |
| ✗ Fail | < 40% | Needs attention |

## Determinism

AEOrank scoring is deterministic. The same URL scanned twice produces the same score. This is by design — over 80% of scoring weight comes from structural, deterministic signals that don't change between scans.

## Improving your score

Focus on high-weight criteria first, organized by pillar:

**Answer Readiness (26%)** — Start with topical authority and original data. These have the highest individual weights (7% and 5%) and directly gate your maximum possible score.

**Content Structure (25%)** — Fix content structure (5%), then answer-first formatting and Q&A format (4% each). Structural improvements lift multiple criteria at once.

**Technical Foundation (25%)** — Add `llms.txt` (5%) and FAQ & Speakable markup (5%). These are binary checks with large weight — zero investment for full points once deployed.

**Trust & Authority (12%)** — Strengthen E-E-A-T signals (6%) with author information, publication dates, and citations.

**AI Discovery (12%)** — Address page freshness, canonical URLs, and sitemap last. Important for discovery but lower individual weights.
