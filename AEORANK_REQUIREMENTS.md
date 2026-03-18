# Requirements

## V1 (Build now)

### CLI Core
- REQ-01: `npx aeorank scan <url>` scans a live URL with zero config
- REQ-02: `npx aeorank scan <path>` scans a local directory
- REQ-03: Generates all 8 output files to ./aeorank-output/ by default
- REQ-04: Produces colored terminal output with spinner, score, dimension table, next steps
- REQ-05: Outputs JSON via --format json flag
- REQ-06: `npx aeorank init` creates aeorank.config.js
- REQ-07: Scan completes in under 30 seconds for a 50-page site
- REQ-08: Every error message suggests a specific next action

### AEO Scoring
- REQ-09: Score 0–100 computed from 12 weighted dimensions
- REQ-10: Letter grade A+/A/B/C/D/F computed from score
- REQ-11: Each dimension reports score, weight, status, and fix hint
- REQ-12: Thresholds: ≥70 = pass (green), 40–69 = warn (amber), <40 = fail (red)

### File Generators
- REQ-13: llms.txt generated per llmstxt.org spec, grouped by section
- REQ-14: llms-full.txt contains full text of all crawled pages
- REQ-15: CLAUDE.md generated for repo context (tech stack, dirs, commands)
- REQ-16: schema.json contains Organization + WebSite + FAQPage JSON-LD
- REQ-17: robots-patch.txt contains directives for GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- REQ-18: faq-blocks.html contains speakable FAQ schema snippets
- REQ-19: citation-anchors.html contains heading anchor markup
- REQ-20: sitemap-ai.xml is an AI-optimized sitemap

### GitHub Native Integration (Actions only, no external server)
- REQ-21: GitHub Action published to Marketplace as `aeorank/action@v1`
- REQ-22: Action uses only GITHUB_TOKEN — zero external credentials required for basic use
- REQ-23: Action posts AEO Score as a GitHub Check (pass/neutral/fail) with full dimension table
- REQ-24: Action posts score table as a PR comment, upserts (never spams) using hidden marker
- REQ-25: Action uploads generated files as workflow artifacts
- REQ-26: Action supports fail-below threshold input (default 0 = never fail)
- REQ-27: Action auto-detects site URL from aeorank.config.js, CNAME, package.json, or input
- REQ-28: Reusable workflow at .github/workflows/aeorank-scan.yml callable via uses:
- REQ-29: Action writes AEO score badge JSON to gh-pages for shields.io badge support
- REQ-30: Action annotates workspace files inline (robots.txt, llms.txt) when issues found

### Marketing Site (GitHub Pages)
- REQ-31: Astro 4 static site deployed to GitHub Pages via GitHub Actions on push to main
- REQ-32: Custom domain aeorank.com via CNAME file
- REQ-33: Homepage: nav, hero, animated terminal demo, how-it-works, generated files list, AEO score explainer, integrations grid, pricing, testimonials, FAQ, CTA, footer
- REQ-34: Pricing page with feature comparison table
- REQ-35: Changelog page (reverse-chronological, RSS feed)
- REQ-36: Open metrics page (GitHub stars, npm downloads, MRR, sites scanned)
- REQ-37: Design matches 37signals/Gumroad aesthetic per PROJECT.md color/type tokens
- REQ-38: Zero JS by default (pure HTML/CSS); Astro islands only for interactive terminal demo

### Documentation Site
- REQ-39: Astro + Starlight deployed to docs.aeorank.com via GitHub Pages
- REQ-40: Getting started + 5-minute quick start guide
- REQ-41: CLI reference (all commands, all flags, all config options)
- REQ-42: Reference docs for all 8 generated files
- REQ-43: AEO scoring explainer (12 dimensions, calculation, grades)
- REQ-44: Integration guide for each of 10 CMS platforms (3 levels: manual, plugin, API)
- REQ-45: Integration guide for each of 10 web frameworks
- REQ-46: GitHub Action integration guide (2 levels: basic workflow, reusable workflow)
- REQ-47: API reference with authentication, endpoints, rate limits

### Web Dashboard (SaaS)
- REQ-48: Next.js 15 App Router with Clerk auth
- REQ-49: Add site by URL → auto-scan → display score
- REQ-50: Score history chart (30-day sparkline)
- REQ-51: 12-dimension breakdown per site
- REQ-52: One-click ZIP download of all generated files
- REQ-53: Inline file viewer (syntax highlighted, copy to clipboard)
- REQ-54: Stripe subscriptions (Free / Pro $29 / API $99 / Agency $499)
- REQ-55: Weekly monitoring scans with email alert on score drop (Pro+)

## V2 (Next milestone)

- Competitor AEO scoring (scan multiple sites, compare side by side)
- WordPress plugin (auto-serve llms.txt via rewrite, inject schema)
- Shopify app (app proxy for llms.txt, metafield schema injection)
- AI citation tracker (detect when your site is cited by ChatGPT/Perplexity)
- White-label PDF reports for agencies
- Slack/Discord bot integration
- GitHub App (full Probot-style app with webhook server for teams that want zero-yaml)
- REST API with rate limiting for third-party integrations

## Out of scope (V1)
- Mobile app
- Browser extension
- Bulk CSV import
- SSO / SAML enterprise auth
- On-premise deployment
- Real-time collaborative editing of generated files
