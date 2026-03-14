# Requirements: AEOrank

**Defined:** 2026-03-14
**Core Value:** A developer runs `npx aeorank scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Monorepo & Infrastructure

- [ ] **INFRA-01**: pnpm + Turborepo monorepo with packages/ (core, cli) and apps/ (web, marketing, docs)
- [ ] **INFRA-02**: Shared TypeScript types and constants in @aeorank/core
- [ ] **INFRA-03**: Biome for linting and formatting across all packages

### Scanning Engine

- [ ] **SCAN-01**: User can scan a live URL with `npx aeorank scan <url>` with zero config
- [ ] **SCAN-02**: Scanner crawls up to 50 pages with rate limiting (3 req/sec default) and respectful User-Agent
- [ ] **SCAN-03**: Scan completes in under 30 seconds for a 50-page site
- [ ] **SCAN-04**: Scanner extracts page content, schema markup, robots.txt, llms.txt, heading hierarchy, and E-E-A-T signals

### AEO Scoring

- [ ] **SCORE-01**: AEO score 0-100 computed from 12 weighted dimensions (80%+ structural/deterministic signals)
- [ ] **SCORE-02**: Letter grade A+/A/B/C/D/F computed from score
- [ ] **SCORE-03**: Each dimension reports score, weight, status (pass/warn/fail), and fix hint
- [ ] **SCORE-04**: Thresholds: ≥70 = pass (green), 40-69 = warn (amber), <40 = fail (red)
- [ ] **SCORE-05**: Scoring is deterministic — same URL produces same score across CLI and dashboard

### File Generation

- [ ] **GEN-01**: llms.txt generated per llmstxt.org spec, grouped by section
- [ ] **GEN-02**: llms-full.txt contains full text of all crawled pages
- [ ] **GEN-03**: CLAUDE.md generated for repo context (tech stack, dirs, commands)
- [ ] **GEN-04**: schema.json contains Organization + WebSite + FAQPage JSON-LD
- [ ] **GEN-05**: robots-patch.txt contains directives for GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- [ ] **GEN-06**: faq-blocks.html contains speakable FAQ schema snippets
- [ ] **GEN-07**: citation-anchors.html contains heading anchor markup
- [ ] **GEN-08**: sitemap-ai.xml is an AI-optimized sitemap

### CLI

- [ ] **CLI-01**: Colored terminal output with spinner, score, dimension table, and next steps
- [ ] **CLI-02**: JSON output via --format json flag
- [ ] **CLI-03**: `npx aeorank init` creates aeorank.config.js with sensible defaults
- [ ] **CLI-04**: Every error message suggests a specific next action
- [ ] **CLI-05**: Actionable fix recommendations ranked High/Medium/Low per failed check

### GitHub Action

- [x] **GHA-01**: Composite action wrapping CLI, published to Marketplace as aeorank/action@v1
- [x] **GHA-02**: Action uses only GITHUB_TOKEN — zero external credentials for basic use
- [x] **GHA-03**: Action posts AEO Score as a GitHub Check (pass/neutral/fail) with dimension table
- [x] **GHA-04**: Action posts score table as PR comment, upserts using hidden marker (never spams)
- [x] **GHA-05**: Action supports fail-below threshold input (default 0 = never fail)

### Marketing Site

- [ ] **SITE-01**: Astro 5 static site deployed to GitHub Pages at aeorank.dev
- [ ] **SITE-02**: Homepage with hero, terminal demo, how-it-works, generated files list, scoring explainer, pricing, FAQ, CTA
- [ ] **SITE-03**: Design matches 37signals/Gumroad aesthetic (off-white #FAF9F7, near-black #111, Inter font, solid buttons)
- [ ] **SITE-04**: Zero JS by default; Astro islands only for interactive terminal demo

### Documentation Site

- [ ] **DOCS-01**: Astro + Starlight deployed to docs.aeorank.dev via GitHub Pages
- [ ] **DOCS-02**: Getting started + 5-minute quick start guide
- [ ] **DOCS-03**: CLI reference (all commands, flags, config options)
- [ ] **DOCS-04**: Reference docs for all 8 generated files
- [ ] **DOCS-05**: AEO scoring explainer (12 dimensions, calculation, grades)

### Web Dashboard

- [x] **DASH-01**: Next.js 16 App Router with Clerk auth
- [ ] **DASH-02**: Add site by URL → scan → display score with 12-dimension breakdown
- [ ] **DASH-03**: Score history chart (30-day sparkline)
- [ ] **DASH-04**: One-click ZIP download of all generated files
- [ ] **DASH-05**: Stripe subscriptions (Free / Pro $29 / API $99)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Local directory scanning with `aeorank scan ./`
- **ADV-02**: Framework-specific integration guides (Next.js, Astro, WordPress, Shopify)
- **ADV-03**: Competitor AEO scoring (scan multiple sites, compare side by side)
- **ADV-04**: AI citation tracker (detect when your site is cited by ChatGPT/Perplexity)
- **ADV-05**: White-label PDF reports for agencies
- **ADV-06**: Agency multi-client dashboard ($499/mo tier)
- **ADV-07**: Weekly monitoring scans with email alert on score drop
- **ADV-08**: REST API with rate limiting for third-party integrations

### Integrations

- **INT-01**: WordPress plugin (auto-serve llms.txt, inject schema)
- **INT-02**: Shopify app (app proxy for llms.txt, metafield schema injection)
- **INT-03**: Slack/Discord bot integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Web-first; CLI + dashboard covers all user types |
| Browser extension | Separate distribution pipeline; web UI paste-and-scan covers 90% of use case |
| Bulk CSV import | Creates queue/abuse problems before PMF; expose via API tier later |
| SSO/SAML enterprise auth | Enterprise tier complexity not justified for v1 |
| On-premise deployment | Open-source CLI is the on-premise answer |
| Real-time collaborative editing | Not needed for generated files; users download and edit locally |
| Sentiment analysis of AI mentions | Different product category; recommend Profound/Otterly |
| Keyword/prompt tracking | Monitoring product, not scanner; out of scope for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| SCAN-01 | Phase 1 | Pending |
| SCAN-02 | Phase 1 | Pending |
| SCAN-03 | Phase 1 | Pending |
| SCAN-04 | Phase 1 | Pending |
| SCORE-01 | Phase 1 | Pending |
| SCORE-02 | Phase 1 | Pending |
| SCORE-03 | Phase 1 | Pending |
| SCORE-04 | Phase 1 | Pending |
| SCORE-05 | Phase 1 | Pending |
| GEN-01 | Phase 1 | Pending |
| GEN-02 | Phase 1 | Pending |
| GEN-03 | Phase 1 | Pending |
| GEN-04 | Phase 1 | Pending |
| GEN-05 | Phase 1 | Pending |
| GEN-06 | Phase 1 | Pending |
| GEN-07 | Phase 1 | Pending |
| GEN-08 | Phase 1 | Pending |
| CLI-01 | Phase 2 | Pending |
| CLI-02 | Phase 2 | Pending |
| CLI-03 | Phase 2 | Pending |
| CLI-04 | Phase 2 | Pending |
| CLI-05 | Phase 2 | Pending |
| SITE-01 | Phase 3 | Pending |
| SITE-02 | Phase 3 | Pending |
| SITE-03 | Phase 3 | Pending |
| SITE-04 | Phase 3 | Pending |
| DOCS-01 | Phase 3 | Pending |
| DOCS-02 | Phase 3 | Pending |
| DOCS-03 | Phase 3 | Pending |
| DOCS-04 | Phase 3 | Pending |
| DOCS-05 | Phase 3 | Pending |
| GHA-01 | Phase 4 | Complete |
| GHA-02 | Phase 4 | Complete |
| GHA-03 | Phase 4 | Complete |
| GHA-04 | Phase 4 | Complete |
| GHA-05 | Phase 4 | Complete |
| DASH-01 | Phase 5 | Complete |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |
| DASH-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after initial definition*
