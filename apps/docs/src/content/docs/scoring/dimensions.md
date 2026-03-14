---
title: 12 Dimensions
description: Every dimension AEOrank measures, what it checks, and why it matters.
---

AEOrank scores your site across 12 dimensions, each measuring a specific aspect of AI engine visibility. Dimensions are weighted by importance.

## High Weight (1.5x)

These dimensions have the biggest impact on your score.

### llms.txt Presence

**ID:** `llms-txt` · **Max Score:** 10

Checks whether your site has a `llms.txt` file at the root URL. This file tells language models what your site is about, following the [llmstxt.org](https://llmstxt.org) specification.

**Pass:** `llms.txt` exists and is well-structured
**Fail:** No `llms.txt` found

### Schema.org Markup

**ID:** `schema-markup` · **Max Score:** 10

Checks for structured data using Schema.org vocabulary (JSON-LD, Microdata, or RDFa). Looks for Organization, WebSite, FAQPage, Article, and other relevant types.

**Pass:** Multiple schema types detected with complete properties
**Warn:** Some schema markup present but incomplete
**Fail:** No schema markup found

### Content Structure

**ID:** `content-structure` · **Max Score:** 10

Analyzes heading hierarchy (H1-H6), content organization, and logical page structure. Well-structured content is easier for AI engines to parse and cite accurately.

**Pass:** Clean heading hierarchy, logical structure
**Warn:** Minor heading issues (skipped levels, multiple H1s)
**Fail:** No headings or severely broken structure

## Medium Weight (1.0x)

Standard-weight dimensions that contribute meaningfully to your score.

### AI Crawler Access

**ID:** `ai-crawler-access` · **Max Score:** 10

Checks robots.txt for AI-specific crawler rules. Verifies that GPTBot, ClaudeBot, PerplexityBot, and Google-Extended are not blocked.

**Pass:** All major AI crawlers allowed
**Warn:** Some crawlers blocked
**Fail:** All or most AI crawlers blocked

### Answer-First Formatting

**ID:** `answer-first` · **Max Score:** 10

Checks whether content leads with direct answers rather than burying them. AI engines prefer content that states the answer in the first paragraph, then elaborates.

**Pass:** Content leads with concise answers
**Warn:** Answers present but buried in content
**Fail:** No clear answer formatting

### FAQ & Speakable

**ID:** `faq-speakable` · **Max Score:** 10

Checks for FAQ markup and speakable specification. FAQ-structured content is heavily favored by AI engines when generating responses to questions.

**Pass:** FAQPage schema with speakable markup
**Warn:** FAQ content exists but lacks schema
**Fail:** No FAQ content detected

### E-E-A-T Signals

**ID:** `eeat-signals` · **Max Score:** 10

Checks for Experience, Expertise, Authoritativeness, and Trustworthiness signals. Looks for author information, publication dates, citations, and about pages.

**Pass:** Strong author/org signals, dates, expertise indicators
**Warn:** Some E-E-A-T signals present
**Fail:** No authorship or trust signals

### Meta Descriptions

**ID:** `meta-descriptions` · **Max Score:** 10

Checks that pages have meta descriptions of appropriate length (120-160 characters). Meta descriptions help AI engines understand page content without full parsing.

**Pass:** All pages have quality meta descriptions
**Warn:** Some pages missing or too short/long
**Fail:** Most pages lack meta descriptions

### Citation Anchors

**ID:** `citation-anchors` · **Max Score:** 10

Checks for heading IDs and anchor links that enable AI engines to cite specific sections. Stable anchor links improve citation accuracy.

**Pass:** Headings have stable IDs with anchor links
**Warn:** Some headings have IDs
**Fail:** No heading anchors detected

## Low Weight (0.5x)

These dimensions have a smaller impact but still contribute to your overall score.

### Sitemap Presence

**ID:** `sitemap` · **Max Score:** 10

Checks for a sitemap.xml file and validates its structure. Sitemaps help AI crawlers discover and prioritize your content.

**Pass:** Valid sitemap.xml found
**Fail:** No sitemap detected

### HTTPS & Redirects

**ID:** `https-redirects` · **Max Score:** 10

Checks that the site uses HTTPS and handles redirects properly. AI engines prefer secure sites with clean URL structures.

**Pass:** HTTPS enabled, clean redirects
**Warn:** HTTPS but messy redirects
**Fail:** No HTTPS

### Page Freshness

**ID:** `page-freshness` · **Max Score:** 10

Checks for publication and modification dates. AI engines prefer citing current content over stale pages.

**Pass:** Recent dates detected on most pages
**Warn:** Some pages have dates, some don't
**Fail:** No date information found

## Quick Reference

| Dimension | ID | Weight | Max |
|-----------|-----|--------|-----|
| llms.txt Presence | `llms-txt` | High (1.5x) | 10 |
| Schema.org Markup | `schema-markup` | High (1.5x) | 10 |
| Content Structure | `content-structure` | High (1.5x) | 10 |
| AI Crawler Access | `ai-crawler-access` | Medium (1.0x) | 10 |
| Answer-First Formatting | `answer-first` | Medium (1.0x) | 10 |
| FAQ & Speakable | `faq-speakable` | Medium (1.0x) | 10 |
| E-E-A-T Signals | `eeat-signals` | Medium (1.0x) | 10 |
| Meta Descriptions | `meta-descriptions` | Medium (1.0x) | 10 |
| Citation Anchors | `citation-anchors` | Medium (1.0x) | 10 |
| Sitemap Presence | `sitemap` | Low (0.5x) | 10 |
| HTTPS & Redirects | `https-redirects` | Low (0.5x) | 10 |
| Page Freshness | `page-freshness` | Low (0.5x) | 10 |
