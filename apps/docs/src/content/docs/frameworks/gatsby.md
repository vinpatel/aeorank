---
title: Gatsby
description: Add AEO files to your Gatsby site with @aeorank/gatsby.
---

Install the plugin:

```bash
npm install @aeorank/gatsby
```

## Setup

Add the plugin to your Gatsby config:

```ts title="gatsby-config.ts"
import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  plugins: [
    {
      resolve: "@aeorank/gatsby",
      options: {
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
    },
  ],
};

export default config;
```

The plugin hooks into Gatsby's `onPostBuild` lifecycle and writes all 8 AEO files to the `public/` directory.

## Generated Files

After `gatsby build`, all 8 AEO files are in `public/`: `llms.txt`, `llms-full.txt`, `CLAUDE.md`, `schema.json`, `robots-patch.txt`, `faq-blocks.html`, `citation-anchors.html`, `sitemap-ai.xml`.
