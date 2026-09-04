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
  AI Crawler Access
    GPTBot             unknown
    ClaudeBot          unknown
    PerplexityBot      unknown
    Google-Extended    unknown

  AEO Score: 42/100 (D)
  36 dimensions · 8 generated files

  Dimensions by Pillar
    ...

→ 8 files written to ./aeorank-output/
```

Each criterion is scored 0-10 and weighted by percentage importance. See [36 Criteria](/scoring/dimensions/) for details on what each one measures.

## Step 3: Check your generated files

AEOrank writes 8 files to `./aeorank-output/` by default (the same list `generateFiles()` and `npx aeorank-cli@latest` return):

| File | What it does |
|------|-------------|
| `llms.txt` | Site summary for LLM crawlers — agent-docs hygiene, not a citation guarantee |
| `llms-full.txt` | Full-text version with Q&A pairs |
| `CLAUDE.md` | Repository context for AI coding assistants |
| `schema.json` | Organization + WebSite + FAQ structured data |
| `robots-patch.txt` | Directives for GPTBot, ClaudeBot, PerplexityBot, Google-Extended |
| `faq-blocks.html` | Speakable FAQ schema markup |
| `citation-anchors.html` | Heading anchors for deep links |
| `sitemap-ai.xml` | AI-oriented sitemap |

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
