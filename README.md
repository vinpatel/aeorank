<p align="center">
  <img src=".github/banner.svg" alt="AEOrank" width="100%" />
</p>

<p align="center">
  <strong>Scan any website and see how AI search engines perceive your content.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/aeorank-cli"><img src="https://img.shields.io/npm/v/aeorank-cli?style=flat-square&color=E8590C&label=CLI" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@aeorank/core"><img src="https://img.shields.io/npm/v/@aeorank/core?style=flat-square&color=E8590C&label=core" alt="core version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/vinpatel/aeorank/actions"><img src="https://img.shields.io/github/actions/workflow/status/vinpatel/aeorank/deploy-docs.yml?style=flat-square&label=build" alt="Build"></a>
</p>

<p align="center">
  <a href="https://aeorank.dev">Website</a> &nbsp;·&nbsp;
  <a href="https://docs.aeorank.dev">Docs</a> &nbsp;·&nbsp;
  <a href="https://app.aeorank.dev">Dashboard</a> &nbsp;·&nbsp;
  <a href="https://docs.aeorank.dev/getting-started/">Quick Start</a>
</p>

---

AEOrank scores your website 0–100 across 12 dimensions of **Answer Engine Optimization** — how visible your content is to ChatGPT, Perplexity, Claude, and Google AI Overviews. Then it generates the 8 files these AI engines actually look for.

**One command. Zero config. Instant score.**

```bash
npx aeorank-cli scan https://your-site.com
```

```
AEO Score: 72/100 (B)

  ✓ Schema.org Markup       10/10  [HIGH]
  ✓ Content Structure        8/10  [HIGH]
  ⚠ llms.txt Presence        3/10  [HIGH]   — Create /llms.txt with H1 title and sections
  ✓ Meta Descriptions        7/10  [MEDIUM]
  ✓ Answer-First Formatting  8/10  [MEDIUM]
  ⚠ FAQ & Speakable          3/10  [MEDIUM] — Add FAQPage schema with 3+ Q&A pairs
  ✗ AI Crawler Access        0/10  [MEDIUM] — Allow GPTBot, ClaudeBot in robots.txt
  ...

Next steps:
  1. [HIGH]   Create /llms.txt with H1 title and sections
  2. [MEDIUM] Allow AI crawlers (GPTBot, ClaudeBot) in robots.txt
  3. [MEDIUM] Add FAQPage schema markup with 3+ Q&A pairs
```

## Why AEOrank?

Traditional SEO tools don't check what AI engines actually look for. AEOrank does.

| | AEOrank | Traditional SEO Tools |
|---|:---:|:---:|
| Checks `llms.txt` | **Yes** | No |
| AI crawler access audit | **Yes** | No |
| Generates AI-readable files | **Yes** | No |
| Schema.org for AI citation | **Yes** | Partial |
| Answer-first content analysis | **Yes** | No |
| Framework plugins (zero-config) | **13** | 0 |
| GitHub Action for CI | **Yes** | No |
| Open source | **MIT** | No |

## Framework Plugins

Drop-in AEO file generation for your stack. One config, 8 files, zero maintenance.

<p align="center">
  <a href="https://docs.aeorank.dev/frameworks/next/"><img src="https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs" alt="Next.js"></a>
  <a href="https://docs.aeorank.dev/frameworks/astro/"><img src="https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=fff" alt="Astro"></a>
  <a href="https://docs.aeorank.dev/frameworks/nuxt/"><img src="https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=fff" alt="Nuxt"></a>
  <a href="https://docs.aeorank.dev/frameworks/remix/"><img src="https://img.shields.io/badge/Remix-000?style=for-the-badge&logo=remix" alt="Remix"></a>
  <a href="https://docs.aeorank.dev/frameworks/sveltekit/"><img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=fff" alt="SvelteKit"></a>
  <a href="https://docs.aeorank.dev/frameworks/gatsby/"><img src="https://img.shields.io/badge/Gatsby-663399?style=for-the-badge&logo=gatsby&logoColor=fff" alt="Gatsby"></a>
  <a href="https://docs.aeorank.dev/frameworks/shopify/"><img src="https://img.shields.io/badge/Shopify-7AB55C?style=for-the-badge&logo=shopify&logoColor=fff" alt="Shopify"></a>
  <a href="https://docs.aeorank.dev/frameworks/11ty/"><img src="https://img.shields.io/badge/11ty-000?style=for-the-badge&logo=eleventy" alt="11ty"></a>
  <a href="https://docs.aeorank.dev/frameworks/vitepress/"><img src="https://img.shields.io/badge/VitePress-646CFF?style=for-the-badge&logo=vite&logoColor=fff" alt="VitePress"></a>
  <a href="https://docs.aeorank.dev/frameworks/docusaurus/"><img src="https://img.shields.io/badge/Docusaurus-3ECC5F?style=for-the-badge&logo=docusaurus&logoColor=fff" alt="Docusaurus"></a>
  <a href="https://docs.aeorank.dev/frameworks/wordpress/"><img src="https://img.shields.io/badge/WordPress-21759B?style=for-the-badge&logo=wordpress&logoColor=fff" alt="WordPress"></a>
</p>

```bash
npm install @aeorank/next    # or @aeorank/astro, @aeorank/nuxt, etc.
```

```ts
// next.config.ts
import { withAeorank } from "@aeorank/next";

export default withAeorank({
  siteName: "My Site",
  siteUrl: "https://example.com",
  description: "What my site does.",
});
```

That's it. All 8 AEO files are now served at your site root.

## What Gets Generated

| File | Purpose |
|------|---------|
| `llms.txt` | Site summary for LLM crawlers ([llmstxt.org](https://llmstxt.org) spec) |
| `llms-full.txt` | Full-context version with all content |
| `CLAUDE.md` | Markdown context file for Claude |
| `schema.json` | JSON-LD structured data |
| `robots-patch.txt` | AI-specific robots.txt rules |
| `faq-blocks.html` | FAQ with schema.org markup |
| `citation-anchors.html` | Deep-linkable citation anchors |
| `sitemap-ai.xml` | AI-optimized sitemap |

## 12 Scoring Dimensions

AEOrank checks what AI engines actually care about:

| Dimension | Weight | What It Checks |
|-----------|--------|----------------|
| llms.txt Presence | High | Does `/llms.txt` exist and follow the spec? |
| Schema.org Markup | High | JSON-LD types: Organization, FAQPage, Article, etc. |
| Content Structure | High | Heading hierarchy, logical page organization |
| AI Crawler Access | Medium | Are GPTBot, ClaudeBot, PerplexityBot allowed? |
| Answer-First Formatting | Medium | Do pages lead with direct answers? |
| FAQ & Speakable | Medium | FAQPage schema with speakable markup |
| E-E-A-T Signals | Medium | Author info, dates, expertise indicators |
| Meta Descriptions | Medium | Quality meta descriptions on all pages |
| Citation Anchors | Medium | Heading IDs for deep linking |
| Sitemap Presence | Low | Valid XML sitemap |
| HTTPS & Redirects | Low | HTTPS + canonical URLs |
| Page Freshness | Low | Publication and modification dates |

## GitHub Action

Add AEO scoring to your CI pipeline:

```yaml
# .github/workflows/aeo.yml
name: AEO Score
on: [push, pull_request]

jobs:
  aeo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: vinpatel/aeorank@v1
        with:
          url: https://your-site.com
          fail-below: 50
```

The action posts a Check with your AEO score and comments on PRs with a dimension breakdown.

## SaaS Dashboard

Track your AEO score over time at [app.aeorank.dev](https://app.aeorank.dev):

- Scan any URL and get a full breakdown
- 30-day score history with sparkline charts
- Download all 8 generated files as a ZIP
- Free tier: 1 site, 3 scans/month

## Packages

| Package | Description |
|---------|-------------|
| [`aeorank-cli`](https://www.npmjs.com/package/aeorank-cli) | CLI tool — `npx aeorank-cli scan <url>` |
| [`@aeorank/core`](https://www.npmjs.com/package/@aeorank/core) | Core scanning + scoring engine |
| [`@aeorank/next`](https://www.npmjs.com/package/@aeorank/next) | Next.js plugin |
| [`@aeorank/astro`](https://www.npmjs.com/package/@aeorank/astro) | Astro integration |
| [`@aeorank/nuxt`](https://www.npmjs.com/package/@aeorank/nuxt) | Nuxt module |
| [`@aeorank/remix`](https://www.npmjs.com/package/@aeorank/remix) | Remix plugin |
| [`@aeorank/sveltekit`](https://www.npmjs.com/package/@aeorank/sveltekit) | SvelteKit plugin |
| [`@aeorank/gatsby`](https://www.npmjs.com/package/@aeorank/gatsby) | Gatsby plugin |
| [`@aeorank/shopify`](https://www.npmjs.com/package/@aeorank/shopify) | Shopify Hydrogen plugin |
| [`@aeorank/11ty`](https://www.npmjs.com/package/@aeorank/11ty) | Eleventy plugin |
| [`@aeorank/vitepress`](https://www.npmjs.com/package/@aeorank/vitepress) | VitePress plugin |
| [`@aeorank/docusaurus`](https://www.npmjs.com/package/@aeorank/docusaurus) | Docusaurus plugin |

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
git clone https://github.com/vinpatel/aeorank.git
cd aeorank
pnpm install
pnpm build
pnpm test
```

## License

[MIT](LICENSE) — Vin Patel
