---
title: Docusaurus
description: Add AEO files to your Docusaurus site with @aeorank/docusaurus.
---

Install the plugin:

```bash
npm install @aeorank/docusaurus
```

## Setup

Add the plugin to your Docusaurus config:

```ts title="docusaurus.config.ts"
const config = {
  plugins: [
    [
      "@aeorank/docusaurus",
      {
        siteName: "My Docs",
        siteUrl: "https://docs.example.com",
        description: "A description of your site for AI crawlers.",
        organization: {
          name: "My Company",
        },
        faq: [
          { question: "What does your product do?", answer: "It helps you..." },
        ],
      },
    ],
  ],
};
```

The plugin uses Docusaurus's `postBuild` hook to write all 8 AEO files to the build output directory.

## Generated Files

After `docusaurus build`, all 8 AEO files are in `build/`: `llms.txt`, `llms-full.txt`, `CLAUDE.md`, `schema.json`, `robots-patch.txt`, `faq-blocks.html`, `citation-anchors.html`, `sitemap-ai.xml`.
