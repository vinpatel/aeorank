---
title: 12 dimensions
description: The 12 dimensions aeorank-cli@0.1.1 actually scores (high / medium / low).
---

`npx aeorank-cli@0.1.1` scores **12 dimensions**. Each is 0–10 with a `high` / `medium` / `low` weight. JSON has a `dimensions` array; there is no `dimensionCount` field on this release. The in-repo 36-row catalog is [archived](/scoring/dimensions-catalog/) until a published CLI matches it.

This is technical readiness (crawler access + extractability), **not** a citation rank.

## High

### llms.txt Presence

**ID:** `llms-txt`

Checks for a root `/llms.txt`. Agent-docs hygiene, not a citation guarantee.

### Schema.org Markup

**ID:** `schema-markup`

JSON-LD / microdata types present on the scanned pages.

### Content Structure

**ID:** `content-structure`

Headings, hierarchy, and extractable blocks.

## Medium

### AI Crawler Access

**ID:** `ai-crawler-access`

Reads `robots.txt` for GPTBot, ClaudeBot, PerplexityBot, Google-Extended. Status is allow / block / unknown. A missing `robots.txt` is **unknown**, not blocked.

`--fail-on-crawler-block` is **not** a flag on `aeorank-cli@0.1.1`. The GitHub Action input `fail-on-crawler-block` can fail a Check when a gated bot is **disallowed**.

### Answer-First Formatting

**ID:** `answer-first`

Whether the page leads with a direct answer.

### FAQ & Speakable

**ID:** `faq-speakable`

FAQPage / speakable markup.

### E-E-A-T Signals

**ID:** `eeat-signals`

Author, organization, and trust cues in the HTML.

### Meta Descriptions

**ID:** `meta-descriptions`

Presence and quality of meta description.

### Citation Anchors

**ID:** `citation-anchors`

Stable heading ids for deep links. This is markup, not a promise that models will cite you.

## Low

### Sitemap Presence

**ID:** `sitemap`

A discoverable sitemap.

### HTTPS & Redirects

**ID:** `https-redirects`

HTTPS and redirect hygiene.

### Page Freshness

**ID:** `page-freshness`

Visible date / last-modified signals.

## Quick reference

| Weight | ID | Name |
|--------|----|------|
| high | `llms-txt` | llms.txt Presence |
| high | `schema-markup` | Schema.org Markup |
| high | `content-structure` | Content Structure |
| medium | `ai-crawler-access` | AI Crawler Access |
| medium | `answer-first` | Answer-First Formatting |
| medium | `faq-speakable` | FAQ & Speakable |
| medium | `eeat-signals` | E-E-A-T Signals |
| medium | `meta-descriptions` | Meta Descriptions |
| medium | `citation-anchors` | Citation Anchors |
| low | `sitemap` | Sitemap Presence |
| low | `https-redirects` | HTTPS & Redirects |
| low | `page-freshness` | Page Freshness |

`ai.txt` is **not** in this list and is **not** one of the 8 generated files.
