---
title: Per-Page Scoring
description: See how each individual page on your site scores across AEO dimensions.
---

The scorer's `PAGE_LEVEL_DIMENSIONS` list is what a per-page row can include. The site score is still `aeorank-cli@0.1.2` (36 dimensions, 8 files).

## How it works

After a scan completes, the dashboard shows a **Per-Page Scores** table below the dimension breakdown. Each page gets its own score (0–100) and grade (A+ through F).

### Page-level dimensions

These ids are in `PAGE_LEVEL_DIMENSIONS`:

`content-structure`, `answer-first`, `meta-descriptions`, `page-freshness`, `citation-anchors`, `schema-markup`, `eeat-signals`, `fact-density`, `duplicate-content`, `evidence-packaging`, `citation-ready-writing`, `qa-format`, `direct-answer-density`, `query-answer-alignment`, `tables-lists`, `definition-patterns`, `entity-disambiguation`, `internal-linking`, `semantic-html`, `extraction-friction`, `image-context`, `schema-coverage`, `content-cannibalization`, `canonical-urls`, `visible-dates`.

### Site-level dimensions

These ids are scored on the site and are not in `PAGE_LEVEL_DIMENSIONS`:

`llms-txt`, `ai-crawler-access`, `faq-speakable`, `sitemap`, `https-redirects`, `topic-coherence`, `original-data`, `cross-page-duplication`, `publishing-velocity`, `content-licensing`, `rss-feed`.

`content-licensing` is where `/ai.txt` is scored. The file is not generated.

## Using per-page scores

The table sorts by **worst score first** by default — so you can immediately see which pages need the most work. You can also sort by URL.

For sites with more than 10 pages, click **Show all** to expand the full list.
