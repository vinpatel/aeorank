---
title: Nuxt
description: Add AEO files to your Nuxt 3 app with @aeorank/nuxt.
---

Install the module:

```bash
npm install @aeorank/nuxt
```

## Setup

Add the module and config to `nuxt.config.ts`:

```ts title="nuxt.config.ts"
export default defineNuxtConfig({
  modules: ["@aeorank/nuxt"],
  aeorank: {
    siteName: "My Site",
    siteUrl: "https://example.com",
    description: "A description of your site for AI crawlers.",
    organization: {
      name: "My Company",
    },
    faq: [
      { question: "What does your product do?", answer: "It helps you..." },
    ],
  },
});
```

The module registers Nitro server routes for all 8 AEO files. They're available in both dev and production.

## Generated Files

All 8 AEO files are served as Nitro routes: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.

Each route returns the correct `Content-Type` header and is cached with `Cache-Control: public, max-age=3600, s-maxage=86400`.
