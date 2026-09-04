---
title: VitePress
description: Add AEO files to your VitePress site with @aeorank/vitepress.
---

Install the plugin:

```bash
npm install @aeorank/vitepress
```

## Setup

Add the Vite plugin to your VitePress config:

```ts title=".vitepress/config.ts"
import { aeorank } from "@aeorank/vitepress";
import { defineConfig } from "vitepress";

export default defineConfig({
  vite: {
    plugins: [
      aeorank({
        siteName: "My Docs",
        siteUrl: "https://docs.example.com",
        description: "A description of your site for AI crawlers.",
        organization: {
          name: "My Company",
        },
        faq: [
          { question: "What does your product do?", answer: "It helps you..." },
        ],
      }),
    ],
  },
});
```

In dev mode, AEO files are served via middleware. During build, files are written to `.vitepress/dist/` after the bundle closes.

## Generated Files

After `vitepress build`, all 8 AEO files are in `.vitepress/dist/`: `llms.txt`, `llms-full.txt`, `CLAUDE.md`, `schema.json`, `robots-patch.txt`, `faq-blocks.html`, `citation-anchors.html`, `sitemap-ai.xml`.
