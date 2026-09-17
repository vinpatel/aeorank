---
title: What is AEO?
description: AI Engine Optimization — crawler access and extractability, not a citation promise.
---

**AEO** stands for **AI Engine Optimization** — structuring a site so AI crawlers can **access** it and **extract** answers. That is technical readiness. It is not a ranking in ChatGPT.

## Why it matters

Models fetch pages through crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended). If `robots.txt` disallows them, or the HTML is hard to extract, they have nothing usable. Competitors that sell **monitoring** tell you whether you were mentioned. AEOrank scores the upstream files and access rules.

## How AEO differs from SEO

| | SEO | AEO (what we score) |
|---|-----|-----|
| **Target** | Search crawlers | AI crawlers |
| **Goal** | Rank in results | Crawler access + extractability |
| **Output we write** | — | 8 fix files the CLI generates |

We do **not** treat “get cited in AI responses” as a deliverable.

## What AEOrank does

`npx aeorank-cli@0.1.1` (npm; `-V` may still print `0.0.1`):

1. **Scans** a public URL (default cap **50** pages)
2. **Scores** [12 dimensions](/scoring/dimensions/) 0–100
3. **Writes** the 8 files below

The CLI is MIT. No account required.

## The 8 generated files

Same set `aeorank-cli@0.1.1` writes. Not generated: `ai.txt`, `answers.json`, `report.html`.

- **llms.txt** — site map for agents (hygiene, not a citation guarantee)
- **llms-full.txt** — longer extract
- **CLAUDE.md** — repo context for coding agents
- **schema.json** — JSON-LD
- **robots-patch.txt** — GPTBot / ClaudeBot / PerplexityBot / Google-Extended allow rules
- **faq-blocks.html** — FAQ / speakable markup
- **citation-anchors.html** — heading ids
- **sitemap-ai.xml** — sitemap stub

## CI

The **GitHub Action** input `fail-on-crawler-block` can fail the Check when a gated bot is **disallowed** in `robots.txt`. Missing robots = unknown, not blocked. That flag is **not** on `aeorank-cli@0.1.1`. App `fail-below` (score threshold) is **coming soon** — Action-only today.
