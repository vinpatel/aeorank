# Feature Research

**Domain:** AEO (Answer Engine Optimization) tooling — website audit, AI readability scoring, and AI-optimized file generation
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH (ecosystem is nascent and evolving fast; competitor feature sets verified against multiple sources)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| AEO score 0–100 with letter grade | Every AEO tool produces a composite score; users compare and track it over time | MEDIUM | HubSpot AEO Grader, SEOShouts, Otterly all anchor around a single headline number |
| Robots.txt AI crawler check | Under 5% of sites configure robots.txt for AI bots; users expect this to be surfaced immediately | LOW | Check GPTBot, ClaudeBot, PerplexityBot, Google-Extended allow/disallow status |
| Schema markup validation | Schema is the #1 lever for AI citation likelihood; every audit tool checks it | MEDIUM | Validate Organization, FAQPage, Article, Author, BreadcrumbList; report missing types |
| Content structure analysis | Heading hierarchy (H1/H2/H3), answer-first formatting, scannable bullets | MEDIUM | Pages with sequential heading hierarchy have 2.8× higher citation likelihood |
| E-E-A-T signal detection | Google's quality framework is deeply embedded in AI citation decisions | MEDIUM | Named authors, About page, credential links, publication dates, freshness signals |
| FAQ section detection | FAQ schema is the highest-leverage structured data for AI answer extraction | LOW | Detect FAQ sections; validate schema markup exists; flag missing schema on FAQ content |
| llms.txt presence check | Growing standard (llmstxt.org); users expect AEO tools to check this file | LOW | Verify file exists at /llms.txt, validate H1 + blockquote + file list structure |
| Actionable fix recommendations | Score alone is useless; users need "what to fix" with priority (High/Medium/Low) | MEDIUM | Every competitor surfaces specific, ranked remediation items per failed check |
| Scan by URL with zero config | Core expectation for web-based and CLI tools; no API key, no login should be required for basic scan | LOW | `npx aeorank scan <url>` or paste-and-go in web UI |
| Page performance check | Slow pages reduce AI crawler budget; expected in any technical audit | LOW | Compression, caching, image optimization — lightweight check, not full Lighthouse |
| HTTPS / security check | Basic trust signal; expected in every site auditor | LOW | Verify HTTPS; clean redirect chain |

### Differentiators (Competitive Advantage)

Features that set AEOrank apart. Not universally expected, but provide real value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| File generation (all 8 files) | No competitor generates a complete set of AI-readability files; most stop at llms.txt | HIGH | llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml — complete "AI-ready kit" |
| GitHub Action integration | Zero-friction CI for developers; no external credential or webhook server required | MEDIUM | Post AEO score as GitHub Check + PR comment using only GITHUB_TOKEN; no competitor offers this |
| CLI-first developer experience | Developers are an underserved segment; all major competitors are web-only SaaS | MEDIUM | `npx aeorank scan <url>` in 30 seconds; JSON output for scripting; CI-native |
| Scoring across 12 weighted dimensions | Competitors use 5–7 dimensions; 12 with weights gives more nuance and differentiation room | HIGH | Weight dimensions by actual citation-likelihood research; show per-dimension letter grades |
| Local directory scanning | Scan a repo before deploying; catch issues in CI before they hit production | MEDIUM | No competitor scans local file systems; enables dev-loop use case |
| Score history + trend charts | Track improvement over time; essential for agencies showing ROI | MEDIUM | Compare scans over weeks/months; flag regressions automatically |
| Framework-specific integration guides | Tailored instructions for Next.js, Astro, WordPress, Shopify; not generic advice | MEDIUM | Most tools give generic recommendations; framework-specific guides reduce implementation friction |
| Agency multi-client dashboard | Manage multiple sites in one view; bulk scoring; progress reports per client | HIGH | Profound and LLM Pulse do this at $399–$500+/mo; AEOrank targets agencies at $499/mo |
| Paste-and-download for non-developers | Non-technical users paste a URL, download all 8 generated files — no account required | LOW | Unique UX for the marketing/content audience; very low acquisition friction |
| Open-source CLI (MIT license) | Builds trust, enables community contributions, drives organic adoption via GitHub stars | LOW | Positions AEOrank as infrastructure, not just a tool; SEO/AEO community will share it |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create more problems than they solve for v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI citation tracker (live monitoring) | "Show me when ChatGPT mentions my brand" is the obvious next ask | Requires polling multiple LLM APIs with real-money costs per query; latency is high; results vary per session; adds massive operational complexity | Defer to v2; integrate with Otterly or Peec AI via API instead of building from scratch |
| Real-time collaborative editing of generated files | Teams want to co-edit llms.txt together | Adds WebSocket infrastructure, presence indicators, conflict resolution — none of which contribute to the core value prop | Generate files, let users download and edit locally; v2 can add a simple editor |
| White-label PDF reports | Agencies want reports with their branding | Requires a PDF rendering pipeline (Puppeteer or similar), brand customization UI, storage — significant scope for v1 | Defer to v2 agency tier; use structured JSON + CSV export as interim solution |
| Bulk CSV import of URLs | Power users want to scan 1,000 sites | Creates queue management, rate-limiting, cost control, and abuse-prevention problems before product has PMF | Expose API tier at $99/mo; let API handle bulk programmatically |
| Browser extension | "Audit any page I'm on" is intuitive | Extension distribution (Chrome Web Store review), manifest v3 limitations, cross-browser support — separate release pipeline with high maintenance overhead | Web UI paste-and-scan achieves 90% of the use case with no distribution friction |
| SSO/SAML enterprise auth | Enterprise buyers ask for it | Clerk supports SAML but it requires enterprise tier setup, compliance documentation, security review — not worth v1 scope | Free/Pro/API use standard Clerk email+social auth; defer enterprise SAML to v2 |
| On-premise deployment | "We can't send our URLs to a third-party" | Creates a completely different product (packaging, licensing, support) with no shared infrastructure | Lean into open-source CLI as the on-premise answer; the CLI is MIT and runs locally |
| Sentiment analysis of AI mentions | "What tone does ChatGPT use when it mentions us?" | Requires real LLM API calls per analysis, not a website audit; different product category | Not an AEOrank feature; recommend Otterly or Profound for sentiment tracking |
| Keyword/prompt tracking | "What prompts trigger AI to cite me?" | Requires ongoing LLM queries, prompt database, keyword research infrastructure — this is a monitoring product, not a scanner | Position as: use AEOrank to make your site citable; use Profound/Otterly to confirm citations afterward |

---

## Feature Dependencies

```
[URL/local scan crawler]
    └──requires──> [Content parser + DOM extraction]
                       └──requires──> [Schema extractor]
                       └──requires──> [Robots.txt parser]
                       └──requires──> [llms.txt parser]
                       └──requires──> [Heading hierarchy analyzer]
                       └──requires──> [E-E-A-T signal detector]
                       └──requires──> [FAQ detector]

[AEO score engine (12 dimensions)]
    └──requires──> [All scan extractors above]
    └──requires──> [Weighted scoring model]

[File generation (all 8 files)]
    └──requires──> [AEO score engine]
    └──requires──> [Site structure data from crawl]

[Score history + trend charts]
    └──requires──> [Database persistence layer]
    └──requires──> [User auth (Clerk)]

[GitHub Action]
    └──requires──> [CLI scan output (JSON)]
    └──requires──> [Exit code support for score thresholds]

[Agency multi-client dashboard]
    └──requires──> [Score history]
    └──requires──> [Multi-site data model]
    └──requires──> [Stripe subscriptions (Agency tier)]

[Web dashboard (paste-and-download)]
    └──enhances──> [CLI scan engine] (shared scan logic, different I/O)

[Framework integration guides]
    └──enhances──> [File generation] (generated files + "how to deploy" per framework)
```

### Dependency Notes

- **Scan crawler requires content parser:** Everything downstream depends on reliable extraction of page content, schema, robots.txt, and llms.txt. This is the foundation — get it right first.
- **Score engine requires all extractors:** The 12-dimension score cannot be computed until all signal types are extracted. Build extractors incrementally, but score engine goes last.
- **File generation requires score engine:** Generated files reference audit findings (e.g., generated schema.json addresses detected missing types). Scoring first, generation second.
- **GitHub Action requires CLI JSON output:** The Action is a thin wrapper around the CLI's `--json` output flag. CLI must be stable before the Action ships.
- **Score history requires auth + DB:** History is a paid-tier feature; it needs Clerk (auth) and Supabase (persistence) in place before it can ship.
- **Agency dashboard requires score history + Stripe:** The top-tier feature depends on multiple infrastructure layers; build last.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept and acquire early adopters.

- [ ] **CLI scan by URL** — the core promise; `npx aeorank scan <url>` in under 30 seconds
- [ ] **AEO score 0–100 across 12 weighted dimensions** — headline number + per-dimension letter grades
- [ ] **Robots.txt AI crawler check** — quick win, low complexity, high user surprise value
- [ ] **Schema markup validation** — Organization, FAQPage, Article, Author; flag missing/broken types
- [ ] **llms.txt presence + structure check** — validate against llmstxt.org spec
- [ ] **Content structure analysis** — heading hierarchy, answer-first formatting, FAQ detection
- [ ] **E-E-A-T signal detection** — named authors, About page, publication dates, credential links
- [ ] **Actionable fix recommendations** — ranked High/Medium/Low per failed check
- [ ] **File generation (all 8 files)** — the unique value; no competitor does this; drives word-of-mouth
- [ ] **Web UI paste-and-download** — non-developer acquisition; zero friction
- [ ] **Marketing site (Astro)** — needed for organic discovery and credibility
- [ ] **Docs site (Starlight)** — needed to explain the 8 files and scoring model

### Add After Validation (v1.x)

Features to add once core scan + generation is working and users are requesting them.

- [ ] **GitHub Action** — add after CLI is stable; triggered by developer requests in v1 feedback
- [ ] **Score history + trend charts** — add after Pro subscribers show consistent return usage
- [ ] **Local directory scanning** — add after CLI user segment validates; enables CI use case
- [ ] **Framework integration guides** — add as content alongside v1.x docs expansion
- [ ] **Web dashboard (Clerk + Stripe)** — add when free users are asking for account features

### Future Consideration (v2+)

Features to defer until product-market fit is established and early revenue funds complexity.

- [ ] **AI citation tracker / live monitoring** — requires LLM API polling budget and ops infrastructure
- [ ] **Agency multi-client dashboard** — requires multi-site data model and agency-specific UX
- [ ] **White-label PDF reports** — agency tier feature; requires PDF rendering pipeline
- [ ] **Bulk CSV import** — defer until API tier has traction
- [ ] **SSO/SAML** — enterprise tier gate
- [ ] **GitHub App (Probot)** — webhook server; GitHub Actions covers v1

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| CLI scan by URL | HIGH | MEDIUM | P1 |
| AEO score 0–100 (12 dimensions) | HIGH | HIGH | P1 |
| File generation (all 8 files) | HIGH | HIGH | P1 |
| Robots.txt AI crawler check | HIGH | LOW | P1 |
| Schema markup validation | HIGH | MEDIUM | P1 |
| llms.txt presence + structure check | HIGH | LOW | P1 |
| Content structure analysis | HIGH | MEDIUM | P1 |
| Actionable fix recommendations | HIGH | MEDIUM | P1 |
| Web UI paste-and-download | HIGH | LOW | P1 |
| E-E-A-T signal detection | MEDIUM | MEDIUM | P1 |
| FAQ detection + schema validation | MEDIUM | LOW | P1 |
| Marketing site | HIGH | LOW | P1 |
| Docs site | HIGH | LOW | P1 |
| GitHub Action | HIGH | LOW | P2 |
| Score history + trend charts | HIGH | MEDIUM | P2 |
| Local directory scanning | MEDIUM | MEDIUM | P2 |
| Framework integration guides | MEDIUM | LOW | P2 |
| Web dashboard (Clerk + Stripe) | HIGH | HIGH | P2 |
| Page performance check | LOW | LOW | P2 |
| Agency multi-client dashboard | HIGH | HIGH | P3 |
| AI citation tracker | HIGH | HIGH | P3 |
| White-label PDF reports | MEDIUM | HIGH | P3 |
| Bulk CSV import | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | HubSpot AEO Grader | Otterly AI ($29/mo) | Profound ($99+/mo) | Scrunch ($300/mo) | AEOrank (Our Approach) |
|---------|-------------------|---------------------|-------------------|-------------------|------------------------|
| AEO/visibility score | Yes (brand-focused) | Yes (citation-focused) | Yes (multi-signal) | Yes (share-of-voice) | Yes (technical + content, 12 dimensions) |
| Website technical audit | Partial | Yes (25+ factors) | Yes | Yes | Yes (comprehensive, 12 weighted dimensions) |
| File generation | No | No | No | No | Yes (all 8 files — unique) |
| llms.txt generation | No | No | No | No | Yes |
| robots.txt AI crawler patch | No | No | No | No | Yes (generated patch, not just check) |
| Schema.json generation | No | No | No | No | Yes |
| CLI tool | No | No | No | No | Yes (MIT open source) |
| GitHub Action | No | No | No | No | Yes |
| Local directory scan | No | No | No | No | Yes (v1.x) |
| AI citation monitoring | Yes | Yes (6 engines) | Yes (10+ engines) | Yes | No (v2 / partner integration) |
| Score history + trends | No | Yes | Yes | Yes | Yes (Pro tier) |
| Competitor benchmarking | Yes | Yes | Yes | Yes | No (v2) |
| Agency multi-client | No | No | Yes | Yes | Yes (v2 Agency tier) |
| White-label reports | No | No | Yes | Yes | No (v2) |
| Pricing | Free | $29/mo | $99–399/mo | $300/mo | Free CLI / $29 Pro / $99 API / $499 Agency |
| Open source | No | No | No | No | Yes (CLI is MIT) |

**Key insight:** Every competitor is a monitoring/analytics product. AEOrank is the only tool that generates the actual files needed to improve AI readability. This is the primary competitive moat for v1.

---

## Sources

- [Scrunch: 7 best AEO/GEO tools for 2026](https://scrunch.com/blog/best-answer-engine-optimization-aeo-generative-engine-optimization-geo-tools-2026) — competitor landscape (MEDIUM confidence, verified against multiple sources)
- [AirOps: AEO audit checklist 48 critical factors](https://www.airops.com/blog/aeo-audit-checklist) — scoring dimension categories (MEDIUM confidence)
- [SEOShouts GEO/AEO Checker](https://seoshouts.com/tools/geo-aeo-checker/) — 7-dimension scoring model with weights (MEDIUM confidence)
- [HubSpot AEO Grader](https://www.hubspot.com/aeo-grader) — competitor feature analysis (HIGH confidence, verified directly)
- [llmstxt.org official spec](https://llmstxt.org/) — llms.txt required/optional fields (HIGH confidence, official source)
- [Airefs: 12 best AEO tools](https://getairefs.com/blog/best-aeo-tools/) — file generation gap in market (MEDIUM confidence)
- [WebSearch: AEO tool competitor pricing/features 2026](https://nicklafferty.com/blog/best-aeo-tools-answer-engine-optimization/) — pricing tiers (LOW-MEDIUM confidence, single source)
- [WebSearch: AI visibility SaaS dashboard features 2026](https://llmpulse.ai/blog/white-label-ai-seo-software/) — agency features (LOW confidence, marketing copy)
- [WebSearch: GitHub Actions SEO audit CI integration](https://github.com/seo-skills/seo-audit-skill) — CI integration patterns (MEDIUM confidence)
- [LLMrefs: llms.txt adoption note](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026) — only 10% site adoption, no official LLM support confirmed (LOW confidence, needs monitoring)

---

*Feature research for: AEOrank — AEO website audit, scoring, and AI file generation tool*
*Researched: 2026-03-14*
