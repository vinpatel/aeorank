---
title: How Scores Work
description: How AEOrank calculates your AEO score from 12 dimension scores.
---

AEOrank produces a single score from 0 to 100 by measuring 12 dimensions and applying weighted aggregation.

## How it works

### 1. Dimension scoring

Each of the [12 dimensions](/scoring/dimensions/) is scored from 0 to 10 based on specific checks against your site.

### 2. Weight multipliers

Not all dimensions are equally important. Each has a weight multiplier:

| Weight | Multiplier | Dimensions |
|--------|-----------|------------|
| **High** | 1.5x | llms.txt Presence, Schema.org Markup, Content Structure |
| **Medium** | 1.0x | AI Crawler Access, Answer-First, FAQ & Speakable, E-E-A-T, Meta Descriptions, Citation Anchors |
| **Low** | 0.5x | Sitemap, HTTPS & Redirects, Page Freshness |

### 3. Weighted calculation

```
weighted_sum = Σ (dimension_score × weight_multiplier)
max_possible = Σ (max_score × weight_multiplier)
final_score  = (weighted_sum / max_possible) × 100
```

**Example:**

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| llms.txt Presence | 0/10 | 1.5x | 0 |
| Schema.org Markup | 7/10 | 1.5x | 10.5 |
| Content Structure | 8/10 | 1.5x | 12 |
| AI Crawler Access | 5/10 | 1.0x | 5 |
| Answer-First | 4/10 | 1.0x | 4 |
| FAQ & Speakable | 2/10 | 1.0x | 2 |
| E-E-A-T Signals | 6/10 | 1.0x | 6 |
| Meta Descriptions | 7/10 | 1.0x | 7 |
| Citation Anchors | 1/10 | 1.0x | 1 |
| Sitemap | 9/10 | 0.5x | 4.5 |
| HTTPS & Redirects | 10/10 | 0.5x | 5 |
| Page Freshness | 5/10 | 0.5x | 2.5 |
| **Total** | | | **59.5** |

Max possible: (3 × 10 × 1.5) + (6 × 10 × 1.0) + (3 × 10 × 0.5) = 45 + 60 + 15 = **120**

Score: (59.5 / 120) × 100 = **49.6** → Grade: **C**

### 4. Status thresholds

Each dimension also gets a pass/warn/fail status based on its percentage of max score:

| Status | Threshold | Meaning |
|--------|-----------|---------|
| ✓ Pass | ≥ 70% | Dimension is in good shape |
| ⚠ Warn | 40-69% | Room for improvement |
| ✗ Fail | < 40% | Needs attention |

## Determinism

AEOrank scoring is deterministic. The same URL scanned twice produces the same score. This is by design — over 80% of scoring weight comes from structural, deterministic signals that don't change between scans.

## Improving your score

Focus on high-weight dimensions first:

1. **Add `llms.txt`** — biggest single improvement
2. **Add Schema.org markup** — Organization, WebSite, FAQPage
3. **Fix content structure** — clean heading hierarchy

Then address medium-weight dimensions for further gains.
