---
title: 36 dimensions
description: The 36 dimensions aeorank-cli@0.1.2 scores. Percentage weights sum to 100. No citation promises.
---

`npx aeorank-cli@0.1.2` scores **36 dimensions**. Each is 0–10. JSON has `dimensions` (length 36) and `dimensionCount`. The score is `round(Σ (score / 10) × weightPct)`. `weightPct` sums to 100.

This is technical readiness (crawler access + extractability), **not** a citation rank. Long-form notes are in the [catalog](/scoring/dimensions-catalog/).

## Crawler status

`crawlerAccess` emits **`allow`**, **`block`**, or **`unknown`** for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and anthropic-ai. A missing `robots.txt` is **`unknown`**, not blocked.

`meta.robotsTxt.crawlerAccess` keeps the parser's internal `allowed` / `disallowed` / `unknown`. The GitHub Action Check table maps `allowed` → `allow` and `disallowed` → `block`, and shows the public values unchanged.

`--fail-on-crawler-block` is a **CLI flag** (exit 2 when `crawlerGate.failed` is true) and a **GitHub Action input**. The Action reads `crawlerGate`; it does not pass the flag. The gate checks GPTBot, ClaudeBot, PerplexityBot, and Google-Extended. `unknown` does not fail it.

## ai.txt

`ai.txt` is **not generated**. The scanner reads `/ai.txt`, and the `content-licensing` dimension scores it. `generateAiTxt` is not in `GENERATED_FILE_NAMES`.

## The 36

| weightPct | ID | Name |
|----------:|----|------|
| 5 | `llms-txt` | llms.txt Presence |
| 4 | `schema-markup` | Schema.org Markup |
| 5 | `content-structure` | Content Structure |
| 3 | `ai-crawler-access` | AI Crawler Access |
| 4 | `answer-first` | Answer-First Formatting |
| 5 | `faq-speakable` | FAQ & Speakable |
| 6 | `eeat-signals` | E-E-A-T Signals |
| 2 | `meta-descriptions` | Meta Descriptions |
| 2 | `citation-anchors` | Citation Anchors |
| 1 | `sitemap` | Sitemap Presence |
| 2 | `https-redirects` | HTTPS & Redirects |
| 2 | `page-freshness` | Page Freshness |
| 7 | `topic-coherence` | Topical Authority |
| 5 | `original-data` | Original Research & Data |
| 4 | `fact-density` | Fact & Data Density |
| 4 | `duplicate-content` | Duplicate Content |
| 2 | `cross-page-duplication` | Cross-Page Duplication |
| 2 | `evidence-packaging` | Evidence Packaging |
| 2 | `citation-ready-writing` | Citation-Ready Writing |
| 4 | `qa-format` | Q&A Content Format |
| 4 | `direct-answer-density` | Direct Answer Density |
| 2 | `query-answer-alignment` | Query-Answer Alignment |
| 2 | `tables-lists` | Tables & Lists |
| 2 | `definition-patterns` | Definition Patterns |
| 2 | `entity-disambiguation` | Entity Disambiguation |
| 4 | `internal-linking` | Internal Linking |
| 2 | `semantic-html` | Semantic HTML |
| 2 | `extraction-friction` | Extraction Friction |
| 1 | `image-context` | Image Context for AI |
| 1 | `schema-coverage` | Schema Coverage |
| 2 | `content-cannibalization` | Content Cannibalization |
| 1 | `publishing-velocity` | Publishing Velocity |
| 1 | `content-licensing` | Content Licensing |
| 1 | `canonical-urls` | Canonical URLs |
| 1 | `rss-feed` | RSS/Atom Feed |
| 1 | `visible-dates` | Visible Date Signals |

`citation-anchors` and `citation-ready-writing` are markup and writing checks. They do not promise that a model will cite you.

The 8 generated files are listed on [Quick Start](/getting-started/). `ai.txt` is not one of them.
