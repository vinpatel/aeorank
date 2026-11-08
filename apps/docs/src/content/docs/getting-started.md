---
title: Quick Start
description: First AEO scan with aeorank-cli@0.1.2.
---

Get a score and the 8 fix files in a few minutes.

## Prerequisites

- **Node.js 20** or later
- A public website URL

## Step 1: Scan

```bash
npx aeorank-cli@0.1.2 scan https://your-site.com
```

With no config file the CLI crawls up to **200** pages, scores **36 dimensions**, and writes **8 files**. `-V` prints **0.1.2**. `init` writes a config whose `maxPages` is 50.

## Step 2: Read the score

You’ll see a 0–100 score, a letter grade, and the 36 dimensions (`weightPct`). See [36 dimensions](/scoring/dimensions/).

Illustrative shape (not a live transcript of your site):

```
Scanning https://your-site.com...
AEO Score: 42/100 (D)
36 dimensions · 8 generated files
→ 8 files written to ./aeorank-output/
```

## Step 3: The 8 files

`./aeorank-output/` contains exactly:

| File | What it does |
|------|-------------|
| `llms.txt` | Agent-readable site map — not a citation guarantee |
| `llms-full.txt` | Longer extract |
| `CLAUDE.md` | Context for coding agents |
| `schema.json` | JSON-LD |
| `robots-patch.txt` | Allow rules for GPTBot and peers |
| `faq-blocks.html` | FAQ / speakable markup |
| `citation-anchors.html` | Heading anchors |
| `sitemap-ai.xml` | Sitemap stub |

Not written: `ai.txt` (scored by `content-licensing`, not generated), `answers.json`, `report.html`.

## Step 4: Deploy

1. `llms.txt` / `llms-full.txt` / `sitemap-ai.xml` → site root
2. `schema.json` → JSON-LD in the document
3. `robots-patch.txt` → merge into `robots.txt`
4. HTML snippets → relevant pages

Rescan after deploy. Score change is technical readiness, not a citation timeline.

## CI

To fail when GPTBot is **`block`**, pass `--fail-on-crawler-block` (exit 2) or the [GitHub Action](/github-action/) input of the same name. Missing `robots.txt` is **`unknown`**, not blocked.
