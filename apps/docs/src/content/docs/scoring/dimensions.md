---
title: 36 Criteria
description: Every criterion AEOrank measures, grouped by pillar, with weights and descriptions.
---

AEOrank scores your site across 36 criteria in 5 pillars. Each criterion is scored 0–10 and weighted by percentage importance (weights sum to 100%).

## Answer Readiness (26%)

These 7 criteria measure whether your content is ready to be used as a direct answer by AI engines.

### Topical Authority

**ID:** `topic-coherence` · **Weight:** 7% · **Max Score:** 10

Checks whether your site demonstrates coherent topical coverage — that pages reinforce a consistent subject area rather than covering unrelated topics. AI engines prefer citing sources with clear subject authority.

**Pass:** Strong topical consistency across pages
**Warn:** Mixed topics with some coherence
**Fail:** No clear topical focus

### Original Research & Data

**ID:** `original-data` · **Weight:** 5% · **Max Score:** 10

Checks whether your content includes proprietary data, statistics, studies, or original research. AI engines prefer citing primary sources over pages that merely summarize others.

**Pass:** Original data, statistics, or research present
**Warn:** Some original data mixed with summaries
**Fail:** No original data detected

### Fact & Data Density

**ID:** `fact-density` · **Weight:** 4% · **Max Score:** 10

Measures the density of verifiable facts, numbers, and data points per page. High fact density makes content more useful for AI citation and more likely to be referenced.

**Pass:** High density of specific facts and numbers
**Warn:** Some facts present but sparse
**Fail:** Mostly vague claims without supporting data

### Duplicate Content

**ID:** `duplicate-content` · **Weight:** 4% · **Max Score:** 10

Detects near-duplicate pages within your site. Duplicate content confuses AI engines about which page to cite and dilutes authority signals.

**Pass:** Pages have unique content throughout
**Warn:** Some overlap between pages
**Fail:** Significant duplicate blocks across pages

### Cross-Page Duplication

**ID:** `cross-page-duplication` · **Weight:** 2% · **Max Score:** 10

Checks for duplicate paragraph-level content repeated across multiple pages. More granular than page-level duplicate detection.

**Pass:** No repeated content blocks across pages
**Warn:** Minor repeated sections
**Fail:** Major content blocks duplicated across many pages

### Evidence Packaging

**ID:** `evidence-packaging` · **Weight:** 2% · **Max Score:** 10

Checks whether claims are backed by inline evidence — citations, links to sources, footnotes, or attribution. AI engines prefer content that packages its evidence visibly.

**Pass:** Claims backed by inline sources or citations
**Warn:** Some claims backed, others unsupported
**Fail:** Assertions without supporting evidence

### Citation-Ready Writing

**ID:** `citation-ready-writing` · **Weight:** 2% · **Max Score:** 10

Checks whether content is written in a quotable, citation-ready style — clear sentences, defined terms, and statements that can stand alone as a cited excerpt.

**Pass:** Content contains easily quotable statements
**Warn:** Some quotable passages but format varies
**Fail:** Dense prose not suited for citation

---

## Content Structure (25%)

These 8 criteria measure how well your content is structured for AI parsing and direct answer extraction.

### Content Structure

**ID:** `content-structure` · **Weight:** 5% · **Max Score:** 10

Analyzes heading hierarchy (H1–H6), content organization, and logical page structure. Well-structured content is easier for AI engines to parse and cite accurately.

**Pass:** Clean heading hierarchy, logical structure
**Warn:** Minor heading issues (skipped levels, multiple H1s)
**Fail:** No headings or severely broken structure

### Answer-First Formatting

**ID:** `answer-first` · **Weight:** 4% · **Max Score:** 10

Checks whether content leads with direct answers rather than burying them. AI engines prefer content that states the answer in the first paragraph, then elaborates.

**Pass:** Content leads with concise answers
**Warn:** Answers present but buried in content
**Fail:** No clear answer formatting

### Q&A Content Format

**ID:** `qa-format` · **Weight:** 4% · **Max Score:** 10

Detects whether content uses explicit question-and-answer formatting. Q&A structure maps directly to how AI engines retrieve and present information.

**Pass:** Explicit Q&A sections present throughout
**Warn:** Some Q&A formatting, inconsistently applied
**Fail:** No Q&A structure detected

### Direct Answer Density

**ID:** `direct-answer-density` · **Weight:** 4% · **Max Score:** 10

Measures the ratio of content that provides direct, concrete answers versus preamble, filler, or off-topic material. Higher density means more of the page is useful to AI engines.

**Pass:** Most content is direct and on-point
**Warn:** Good content mixed with padding
**Fail:** Low ratio of actionable, direct answers

### Query-Answer Alignment

**ID:** `query-answer-alignment` · **Weight:** 2% · **Max Score:** 10

Checks whether page headings and content align with common search queries for your topic. Alignment improves retrieval when AI engines look for specific answers.

**Pass:** Headings and content match query patterns
**Warn:** Some alignment, some mismatch
**Fail:** Content doesn't align with query intent

### Tables & Lists

**ID:** `tables-lists` · **Weight:** 2% · **Max Score:** 10

Checks for the presence of structured lists and comparison tables. Structured formatting makes data easy for AI engines to extract and re-present.

**Pass:** Tables and lists used appropriately throughout
**Warn:** Some use of structured formatting
**Fail:** No tables or lists detected

### Definition Patterns

**ID:** `definition-patterns` · **Weight:** 2% · **Max Score:** 10

Detects whether key terms are defined inline — using definition list markup, "X is Y" sentence patterns, or explicit glossary sections. Definitions are frequently cited by AI engines.

**Pass:** Key terms defined inline throughout
**Warn:** Some definitions present
**Fail:** No definition patterns detected

### Entity Disambiguation

**ID:** `entity-disambiguation` · **Weight:** 2% · **Max Score:** 10

Checks whether entities (people, products, organizations, places) are disambiguated with enough context for AI engines to identify them unambiguously.

**Pass:** Entities described with sufficient disambiguating context
**Warn:** Some entities clear, others ambiguous
**Fail:** Entities referenced without disambiguation

---

## Trust & Authority (12%)

These 3 criteria measure the trust signals that affect whether AI engines prefer to cite your content.

### E-E-A-T Signals

**ID:** `eeat-signals` · **Weight:** 6% · **Max Score:** 10

Checks for Experience, Expertise, Authoritativeness, and Trustworthiness signals. Looks for author information, publication dates, citations, and about pages.

**Pass:** Strong author/org signals, dates, expertise indicators
**Warn:** Some E-E-A-T signals present
**Fail:** No authorship or trust signals

### Internal Linking

**ID:** `internal-linking` · **Weight:** 4% · **Max Score:** 10

Checks the quality and density of internal links. Strong internal linking helps AI crawlers understand your site's structure and the relationships between pages.

**Pass:** Dense, contextual internal links throughout
**Warn:** Some internal linking present
**Fail:** Few or no internal links

### Citation Anchors

**ID:** `citation-anchors` · **Weight:** 2% · **Max Score:** 10

Checks for heading IDs and anchor links that enable AI engines to cite specific sections. Stable anchor links improve citation accuracy.

**Pass:** Headings have stable IDs with anchor links
**Warn:** Some headings have IDs
**Fail:** No heading anchors detected

---

## Technical Foundation (25%)

These 9 criteria measure the technical infrastructure that makes your site accessible and readable by AI systems.

### llms.txt Presence

**ID:** `llms-txt` · **Weight:** 5% · **Max Score:** 10

Checks whether your site has a `llms.txt` file at the root URL. This file tells language models what your site is about, following the [llmstxt.org](https://llmstxt.org) specification.

**Pass:** `llms.txt` exists and is well-structured
**Fail:** No `llms.txt` found

### FAQ & Speakable

**ID:** `faq-speakable` · **Weight:** 5% · **Max Score:** 10

Checks for FAQ markup and speakable specification. FAQ-structured content is heavily favored by AI engines when generating responses to questions.

**Pass:** FAQPage schema with speakable markup
**Warn:** FAQ content exists but lacks schema
**Fail:** No FAQ content detected

### Schema.org Markup

**ID:** `schema-markup` · **Weight:** 4% · **Max Score:** 10

Checks for structured data using Schema.org vocabulary (JSON-LD, Microdata, or RDFa). Looks for Organization, WebSite, FAQPage, Article, and other relevant types.

**Pass:** Multiple schema types detected with complete properties
**Warn:** Some schema markup present but incomplete
**Fail:** No schema markup found

### AI Crawler Access

**ID:** `ai-crawler-access` · **Weight:** 3% · **Max Score:** 10

Checks robots.txt for AI-specific crawler rules. Verifies that GPTBot, ClaudeBot, PerplexityBot, and Google-Extended are not blocked.

**Pass:** All major AI crawlers allowed
**Warn:** Some crawlers blocked
**Fail:** All or most AI crawlers blocked

### Meta Descriptions

**ID:** `meta-descriptions` · **Weight:** 2% · **Max Score:** 10

Checks that pages have meta descriptions of appropriate length (120–160 characters). Meta descriptions help AI engines understand page content without full parsing.

**Pass:** All pages have quality meta descriptions
**Warn:** Some pages missing or too short/long
**Fail:** Most pages lack meta descriptions

### Semantic HTML

**ID:** `semantic-html` · **Weight:** 2% · **Max Score:** 10

Checks whether pages use semantic HTML5 elements (`<article>`, `<section>`, `<main>`, `<nav>`, `<aside>`) rather than generic `<div>` containers. Semantic markup gives AI crawlers structural context.

**Pass:** Semantic elements used throughout
**Warn:** Some semantic elements present
**Fail:** No semantic HTML structure detected

### Extraction Friction

**ID:** `extraction-friction` · **Weight:** 2% · **Max Score:** 10

Measures how much JavaScript, lazy-loading, or dynamic rendering stands between AI crawlers and your content. High friction means AI crawlers may not see your full content.

**Pass:** Content fully accessible without JavaScript
**Warn:** Some content requires JS but core content accessible
**Fail:** Critical content only visible after JS execution

### Image Context for AI

**ID:** `image-context` · **Weight:** 1% · **Max Score:** 10

Checks that images have descriptive alt text and, where appropriate, captions or surrounding context. AI engines use text context to understand images.

**Pass:** Images have descriptive alt text and context
**Warn:** Some images documented
**Fail:** Images have no alt text or context

### Schema Coverage

**ID:** `schema-coverage` · **Weight:** 1% · **Max Score:** 10

Measures the percentage of pages with schema markup, not just whether any schema exists. Broad schema coverage across all pages improves AI indexability site-wide.

**Pass:** Schema present on 80%+ of pages
**Warn:** Schema on some pages
**Fail:** Schema on fewer than 25% of pages

---

## AI Discovery (12%)

These 9 criteria measure signals that help AI engines discover, trust, and index your content reliably.

### Content Cannibalization

**ID:** `content-cannibalization` · **Weight:** 2% · **Max Score:** 10

Checks whether multiple pages compete for the same topic or query. Cannibalization confuses AI engines about which page represents your authoritative answer.

**Pass:** Each topic covered by a single authoritative page
**Warn:** Some topic overlap between pages
**Fail:** Multiple pages competing for the same queries

### HTTPS & Redirects

**ID:** `https-redirects` · **Weight:** 2% · **Max Score:** 10

Checks that the site uses HTTPS and handles redirects properly. AI engines prefer secure sites with clean URL structures.

**Pass:** HTTPS enabled, clean redirects
**Warn:** HTTPS but messy redirects
**Fail:** No HTTPS

### Page Freshness

**ID:** `page-freshness` · **Weight:** 2% · **Max Score:** 10

Checks for publication and modification dates. AI engines prefer citing current content over stale pages.

**Pass:** Recent dates detected on most pages
**Warn:** Some pages have dates, some don't
**Fail:** No date information found

### Publishing Velocity

**ID:** `publishing-velocity` · **Weight:** 1% · **Max Score:** 10

Measures how frequently new content is published. Regular publishing signals an active, maintained site that AI engines can trust for current information.

**Pass:** Consistent publishing cadence detected
**Warn:** Irregular publishing pattern
**Fail:** No recent content or very infrequent publishing

### Content Licensing

**ID:** `content-licensing` · **Weight:** 1% · **Max Score:** 10

Checks whether content has clear licensing signals that indicate AI engines may use and cite it. Explicit licensing reduces friction for AI systems that respect content permissions.

**Pass:** Clear licensing or Creative Commons indicator present
**Warn:** Terms of service present but licensing unclear
**Fail:** No licensing information found

### Canonical URLs

**ID:** `canonical-urls` · **Weight:** 1% · **Max Score:** 10

Checks for canonical `<link>` tags that indicate the preferred URL for each page. Canonical tags prevent AI engines from indexing duplicate or near-duplicate URLs.

**Pass:** Canonical tags present on all pages
**Warn:** Canonical tags on some pages
**Fail:** No canonical tags detected

### Sitemap Presence

**ID:** `sitemap` · **Weight:** 1% · **Max Score:** 10

Checks for a sitemap.xml file and validates its structure. Sitemaps help AI crawlers discover and prioritize your content.

**Pass:** Valid sitemap.xml found
**Fail:** No sitemap detected

### RSS/Atom Feed

**ID:** `rss-feed` · **Weight:** 1% · **Max Score:** 10

Checks for RSS or Atom feed presence. Feeds allow AI systems to track content updates and index new content quickly after publication.

**Pass:** Valid RSS or Atom feed found
**Warn:** Feed present but poorly structured
**Fail:** No feed detected

### Visible Date Signals

**ID:** `visible-dates` · **Weight:** 1% · **Max Score:** 10

Checks for visible publication and update dates displayed on the page (not just in metadata). Visible dates let AI engines verify content freshness from rendered text.

**Pass:** Publication and update dates visible in content
**Warn:** Dates in metadata only
**Fail:** No dates visible anywhere

---

## Quick Reference

| Pillar | Criterion | ID | Weight (%) | Max Score |
|--------|-----------|-----|-----------|-----------|
| Answer Readiness | Topical Authority | `topic-coherence` | 7% | 10 |
| Answer Readiness | Original Research & Data | `original-data` | 5% | 10 |
| Answer Readiness | Fact & Data Density | `fact-density` | 4% | 10 |
| Answer Readiness | Duplicate Content | `duplicate-content` | 4% | 10 |
| Answer Readiness | Cross-Page Duplication | `cross-page-duplication` | 2% | 10 |
| Answer Readiness | Evidence Packaging | `evidence-packaging` | 2% | 10 |
| Answer Readiness | Citation-Ready Writing | `citation-ready-writing` | 2% | 10 |
| Content Structure | Content Structure | `content-structure` | 5% | 10 |
| Content Structure | Answer-First Formatting | `answer-first` | 4% | 10 |
| Content Structure | Q&A Content Format | `qa-format` | 4% | 10 |
| Content Structure | Direct Answer Density | `direct-answer-density` | 4% | 10 |
| Content Structure | Query-Answer Alignment | `query-answer-alignment` | 2% | 10 |
| Content Structure | Tables & Lists | `tables-lists` | 2% | 10 |
| Content Structure | Definition Patterns | `definition-patterns` | 2% | 10 |
| Content Structure | Entity Disambiguation | `entity-disambiguation` | 2% | 10 |
| Trust & Authority | E-E-A-T Signals | `eeat-signals` | 6% | 10 |
| Trust & Authority | Internal Linking | `internal-linking` | 4% | 10 |
| Trust & Authority | Citation Anchors | `citation-anchors` | 2% | 10 |
| Technical Foundation | llms.txt Presence | `llms-txt` | 5% | 10 |
| Technical Foundation | FAQ & Speakable | `faq-speakable` | 5% | 10 |
| Technical Foundation | Schema.org Markup | `schema-markup` | 4% | 10 |
| Technical Foundation | AI Crawler Access | `ai-crawler-access` | 3% | 10 |
| Technical Foundation | Meta Descriptions | `meta-descriptions` | 2% | 10 |
| Technical Foundation | Semantic HTML | `semantic-html` | 2% | 10 |
| Technical Foundation | Extraction Friction | `extraction-friction` | 2% | 10 |
| Technical Foundation | Image Context for AI | `image-context` | 1% | 10 |
| Technical Foundation | Schema Coverage | `schema-coverage` | 1% | 10 |
| AI Discovery | Content Cannibalization | `content-cannibalization` | 2% | 10 |
| AI Discovery | HTTPS & Redirects | `https-redirects` | 2% | 10 |
| AI Discovery | Page Freshness | `page-freshness` | 2% | 10 |
| AI Discovery | Publishing Velocity | `publishing-velocity` | 1% | 10 |
| AI Discovery | Content Licensing | `content-licensing` | 1% | 10 |
| AI Discovery | Canonical URLs | `canonical-urls` | 1% | 10 |
| AI Discovery | Sitemap Presence | `sitemap` | 1% | 10 |
| AI Discovery | RSS/Atom Feed | `rss-feed` | 1% | 10 |
| AI Discovery | Visible Date Signals | `visible-dates` | 1% | 10 |
