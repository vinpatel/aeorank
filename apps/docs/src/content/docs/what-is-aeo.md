---
title: What is AEO?
description: AI Engine Optimization explained — why it matters and how AEOrank helps.
---

**AEO** stands for **AI Engine Optimization** — the practice of making your website visible and citable by AI engines like ChatGPT, Perplexity, Claude, and Google's AI Overviews.

## Why AEO matters

AI engines are becoming a primary way people discover information online. When someone asks ChatGPT "what's the best project management tool?" or Perplexity "how do I set up a Next.js app?", AI engines decide which sources to cite.

Sites that are structured for AI visibility get cited. Sites that aren't get ignored.

## How AEO differs from SEO

SEO optimizes for search engine crawlers and ranking algorithms. AEO optimizes for language models and AI retrieval systems.

| | SEO | AEO |
|---|-----|-----|
| **Target** | Google, Bing crawlers | ChatGPT, Perplexity, Claude |
| **Goal** | Rank in search results | Get cited in AI responses |
| **Signals** | Backlinks, keywords, page speed | Structure, schema, llms.txt, FAQ markup |
| **Output** | Meta tags, sitemaps | llms.txt, schema.json, robots directives |

AEO complements SEO — you should do both.

## What AEOrank does

AEOrank measures your site's AI visibility across [12 dimensions](/scoring/dimensions/) and generates 8 files that AI engines look for:

1. **Scans** your site (up to 50 pages, under 30 seconds)
2. **Scores** your AI visibility from 0-100
3. **Generates** the files AI engines need to find and cite you

The CLI is free, open source, and MIT-licensed. No account required.

## The 8 generated files

AEOrank produces these files tailored to your specific site:

- **llms.txt** — a structured overview of your site for language models
- **llms-full.txt** — full-text content for comprehensive indexing
- **CLAUDE.md** — repository context for AI coding assistants
- **schema.json** — Organization, WebSite, and FAQ structured data
- **robots-patch.txt** — directives for GPTBot, ClaudeBot, PerplexityBot
- **faq-blocks.html** — speakable FAQ schema markup
- **citation-anchors.html** — heading anchors that make content citable
- **sitemap-ai.xml** — AI-optimized sitemap with content hints

Deploy these files on your site and AI engines will have everything they need to understand and cite your content.
