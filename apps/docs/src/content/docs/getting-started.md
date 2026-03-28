---
title: Quick Start
description: Go from zero to your first AEO scan in under 5 minutes.
---

Get your AEO score and generated files in four steps.

## Prerequisites

- **Node.js 20** or later
- A website URL to scan

## Step 1: Run your first scan

No installation needed. Run this command in your terminal:

```bash
npx aeorank-cli scan https://your-site.com
```

AEOrank will crawl up to 50 pages, analyze your site's structure, and generate your score.

## Step 2: Review your score

You'll see output like this:

```
Scanning https://your-site.com...
✓ Fetched 12 pages in 3.2s
✓ Analyzed structure and schema
✓ Generated 8 files

AEO Score: 42/100 (D)

Dimension              Score  Status
─────────────────────────────────────
llms.txt Presence        0    ✗ fail
Schema.org Markup       65    ⚠ warn
AI Crawler Access       30    ✗ fail
Content Structure       80    ✓ pass
Answer-First Format     45    ⚠ warn
FAQ & Speakable         20    ✗ fail
E-E-A-T Signals         60    ⚠ warn
Meta Descriptions       70    ✓ pass
Sitemap Presence        90    ✓ pass
HTTPS & Redirects      100    ✓ pass
Page Freshness          50    ⚠ warn
Citation Anchors        10    ✗ fail

→ 8 files written to ./aeo-output/
```

Each criterion is scored 0-10 and weighted by percentage importance. See [36 Criteria](/scoring/dimensions/) for details on what each one measures.

## Step 3: Check your generated files

AEOrank writes 8 files to `./aeo-output/` by default:

| File | What it does |
|------|-------------|
| `llms.txt` | Tells AI models what your site is about |
| `llms-full.txt` | Full-text version for comprehensive AI indexing |
| `CLAUDE.md` | Repository context for AI coding assistants |
| `schema.json` | Organization + WebSite + FAQ structured data |
| `robots-patch.txt` | Directives for AI crawlers (GPTBot, ClaudeBot, etc.) |
| `faq-blocks.html` | Speakable FAQ schema markup |
| `citation-anchors.html` | Heading anchors for AI citations |
| `sitemap-ai.xml` | AI-optimized sitemap |

See [Generated Files](/files/llms-txt/) for detailed documentation on each file.

## Step 4: Deploy the files

Copy the generated files to your website:

1. **llms.txt** and **llms-full.txt** → root of your site (next to robots.txt)
2. **schema.json** → embed as a `<script type="application/ld+json">` tag in your HTML head
3. **robots-patch.txt** → append the directives to your existing robots.txt
4. **faq-blocks.html** and **citation-anchors.html** → add to relevant pages
5. **sitemap-ai.xml** → root of your site, reference in robots.txt

Run the scan again after deploying to see your score improve.

## Next steps

- [Configure AEOrank](/cli/configuration/) for your specific needs
- [Understand your score](/scoring/dimensions/) across all 36 criteria
- [Learn about each generated file](/files/llms-txt/) in detail

:::tip
Re-run `npx aeorank-cli scan` after deploying your files to track your improvement. Most sites see a 20-40 point increase.
:::
