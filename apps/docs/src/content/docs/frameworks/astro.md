---
title: Astro
description: Add AEO files to your Astro site with @aeorank/astro.
---

Install the integration:

```bash
npm install @aeorank/astro
```

## Setup

Add the integration to your Astro config:

```ts title="astro.config.mjs"
import { defineConfig } from "astro/config";
import aeorank from "@aeorank/astro";

export default defineConfig({
  integrations: [
    aeorank({
      siteName: "My Site",
      siteUrl: "https://example.com",
      description: "A description of your site for AI crawlers.",
      organization: {
        name: "My Company",
      },
      faq: [
        { question: "What does your product do?", answer: "It helps you..." },
      ],
    }),
  ],
});
```

That's it. The integration:
- **Dev**: Serves AEO files via Vite middleware at `localhost:4321/llms.txt`, etc.
- **Build**: Writes all 8 files to your output directory.

## Generated Files

All 8 AEO files are available at your site root: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.
