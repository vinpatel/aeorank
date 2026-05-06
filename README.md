<p align="center">
  <img src=".github/banner.svg" alt="AEOrank" width="100%" />
</p>

<h3 align="center">Your site ranks #1 on Google — but is invisible to ChatGPT.</h3>

<p align="center">
  AEOrank scores your AI visibility 0–100 across <strong>36 criteria</strong>, then generates the <strong>9 files</strong> that get you cited by ChatGPT, Perplexity, Claude, and Google AI Overviews.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/aeorank-cli"><img src="https://img.shields.io/npm/v/aeorank-cli?style=flat-square&color=E8590C&label=CLI" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@aeorank/core"><img src="https://img.shields.io/npm/v/@aeorank/core?style=flat-square&color=E8590C&label=core" alt="core version"></a>
  <a href="https://github.com/marketplace/actions/aeorank-aeo-scanner"><img src="https://img.shields.io/badge/GitHub%20Action-Marketplace-blue?style=flat-square&logo=github" alt="GitHub Action"></a>
  <a href="https://github.com/apps/aeorank"><img src="https://img.shields.io/badge/GitHub%20App-Install-blue?style=flat-square&logo=github" alt="GitHub App"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/vinpatel/aeorank/stargazers"><img src="https://img.shields.io/github/stars/vinpatel/aeorank?style=flat-square&color=E8590C" alt="GitHub Stars"></a>
</p>

<!-- STATS_START -->
![npm downloads](https://img.shields.io/badge/monthly%20downloads-80-blue)
![GitHub stars](https://img.shields.io/github/stars/vinpatel/aeorank?style=social)
<!-- STATS_END -->

<p align="center">
  <a href="https://aeorank.dev">Website</a> &nbsp;·&nbsp;
  <a href="https://docs.aeorank.dev">Docs</a> &nbsp;·&nbsp;
  <a href="https://app.aeorank.dev">Dashboard</a> &nbsp;·&nbsp;
  <a href="https://github.com/marketplace/actions/aeorank-aeo-scanner">GitHub Action</a> &nbsp;·&nbsp;
  <a href="https://github.com/apps/aeorank">GitHub App</a>
</p>

---

**One command. Zero config. Instant score.**

```bash
npx aeorank-cli scan https://your-site.com
```

<p align="center">
  <img src=".github/demo.gif" alt="AEOrank CLI scanning stripe.com — 56/100 (C) with per-dimension breakdown and top recommendations" width="100%" />
</p>

<p align="center">
  <em>30-second scan · 36 criteria · actionable fixes ranked by score impact</em>
</p>

## Why does this matter?

AI search engines now drive **40% of web discovery**. ChatGPT converts visitors at **15.9%** — higher than Google organic. But traditional SEO tools don't check what AI engines actually look for.

AEOrank does.

## AEOrank vs the competition

Every other AEO tool is paid SaaS targeting marketers. AEOrank is the **only open-source, developer-native** AEO tool.

| | AEOrank | Scrunch | Adobe LLM Optimizer | Semrush AI |
|---|:---:|:---:|:---:|:---:|
| **Price** | **Free / MIT** | $499+/mo | Enterprise | $129+/mo |
| **Open source** | ✅ | ❌ | ❌ | ❌ |
| **CLI** | ✅ | ❌ | ❌ | ❌ |
| **GitHub integration** | ✅ Action + App | ❌ | ❌ | ❌ |
| **Framework plugins** | **13** | 0 | 0 | 0 |
| **Generates AI files** | ✅ 9 files | ❌ | ❌ | ❌ |
| **Scoring criteria** | 36 | Varies | Varies | Varies |
| **Self-hostable** | ✅ | ❌ | ❌ | ❌ |

## Three ways to use it

### 1. CLI — scan any URL

```bash
npx aeorank-cli scan https://your-site.com
```

### 2. GitHub App — zero-config PR checks

Install the [AEOrank GitHub App](https://github.com/apps/aeorank) on your repo. Every PR automatically gets an AEO score as a Check Run — no YAML, no config.

### 3. GitHub Action — CI pipeline control

```yaml
name: AEO Score
on: [push, pull_request]

permissions:
  checks: write
  pull-requests: write
  contents: read

jobs:
  aeo:
    runs-on: ubuntu-latest
    steps:
      - uses: vinpatel/aeorank-action@v1
        with:
          url: https://your-site.com
          fail-below: 50
```

## 36 criteria across 5 pillars

| Pillar | Weight | What it checks |
|--------|--------|----------------|
| 🎯 **Answer Readiness** | 30% | Topical authority, fact density, citation-ready writing, duplicate content, evidence packaging |
| 📐 **Content Structure** | 21% | Q&A format, direct answers, heading hierarchy, tables/lists, definition patterns |
| 🏛️ **Trust & Authority** | 16% | E-E-A-T signals, internal linking, author schema, meta descriptions |
| ⚙️ **Technical Foundation** | 14% | Schema.org coverage, semantic HTML, image context, extraction friction, speakable markup |
| 🔍 **AI Discovery** | 19% | llms.txt, AI crawler access, content licensing, canonical URLs, RSS feed, sitemap freshness |

## 9 generated files

AEOrank generates all the files AI engines look for:

| File | Purpose |
|------|---------|
| `llms.txt` | Site summary for LLM crawlers ([llmstxt.org](https://llmstxt.org) spec) |
| `llms-full.txt` | Full-context version with Q&A pairs and entity disambiguation |
| `ai.txt` | AI usage permissions and licensing |
| `CLAUDE.md` | Markdown context file for Claude |
| `schema.json` | JSON-LD structured data |
| `robots-patch.txt` | AI-specific robots.txt rules |
| `faq-blocks.html` | FAQ with schema.org + speakable markup |
| `citation-anchors.html` | Deep-linkable citation anchors |
| `sitemap-ai.xml` | AI-optimized sitemap |

## Framework plugins

Drop-in AEO file generation. One config, 9 files, zero maintenance.

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
// → All 9 AEO files now served at your site root
```

## SaaS Dashboard

Track your AEO score over time at [app.aeorank.dev](https://app.aeorank.dev):

- Scan any URL → full 36-criteria breakdown
- 30-day score history with sparkline charts
- Download all 9 generated files as a ZIP
- Free tier: 1 site, 3 scans/month

## Packages

| Package | Description |
|---------|-------------|
| [`aeorank-cli`](https://www.npmjs.com/package/aeorank-cli) | CLI — `npx aeorank-cli scan <url>` |
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

## Live Demo

See [DEMO.md](./DEMO.md) for today's auto-generated scan.

Last updated: May 06, 2026

## Star History

<a href="https://www.star-history.com/#vinpatel/aeorank&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=vinpatel/aeorank&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=vinpatel/aeorank&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=vinpatel/aeorank&type=Date" />
  </picture>
</a>

## Contributing

We ship fast and merge fast. New framework plugins, new scoring criteria, and real-world bug reports are especially welcome.

- 👀 Browse [good first issues](https://github.com/vinpatel/aeorank/labels/good%20first%20issue) — concrete, small, well-scoped.
- 📖 Read [CONTRIBUTING.md](./CONTRIBUTING.md) — repo layout, PR expectations, local setup.
- 💬 Ask in [Discussions](https://github.com/vinpatel/aeorank/discussions) — ideas, questions, show-and-tell.
- 🔒 Report vulnerabilities privately via [Security Advisories](https://github.com/vinpatel/aeorank/security/advisories/new).

```bash
git clone https://github.com/vinpatel/aeorank.git
cd aeorank
pnpm install
pnpm test    # 675 tests across 13 packages
```

## Share

If AEOrank saved you a $299/mo subscription, the best thank-you is sending it to one person who also needs it.

[![Tweet](https://img.shields.io/badge/Share-on%20X-000000?style=flat-square&logo=x&logoColor=white)](https://twitter.com/intent/tweet?text=AEOrank%20%E2%80%94%20open-source%20AI%20visibility%20scanner.%20Score%20your%20site%2C%20generate%20the%209%20files%20ChatGPT%20actually%20reads.%20MIT%2C%20free%2C%20self-hostable.&url=https%3A%2F%2Fgithub.com%2Fvinpatel%2Faeorank)
[![Share on Hacker News](https://img.shields.io/badge/Share-on%20Hacker%20News-FF6600?style=flat-square&logo=ycombinator&logoColor=white)](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fgithub.com%2Fvinpatel%2Faeorank&t=AEOrank%20%E2%80%94%20open-source%20AI-visibility%20scanner%20for%20ChatGPT%2C%20Perplexity%2C%20Claude)
[![Share on Reddit](https://img.shields.io/badge/Share-on%20Reddit-FF4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Fvinpatel%2Faeorank&title=AEOrank%20%E2%80%94%20open-source%20AI-visibility%20scanner%20%28MIT%29)
[![Share on LinkedIn](https://img.shields.io/badge/Share-on%20LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Fvinpatel%2Faeorank)

## License

[MIT](LICENSE) — built by [Vin Patel](https://github.com/vinpatel), sponsored by [Linx Agency](https://linx.agency) & [Mindtrades](https://mindtrades.com).

