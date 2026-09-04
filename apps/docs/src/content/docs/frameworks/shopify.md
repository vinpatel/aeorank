---
title: Shopify Hydrogen
description: Add AEO files to your Shopify Hydrogen store with @aeorank/shopify.
---

Install the plugin:

```bash
npm install @aeorank/shopify
```

## Configuration

Create an AEO config file:

```ts title="app/aeo.config.ts"
import type { AeorankShopifyConfig } from "@aeorank/shopify";

export const aeoConfig: AeorankShopifyConfig = {
  siteName: "My Store",
  siteUrl: "https://mystore.com",
  description: "Your store description for AI crawlers.",
  organization: {
    name: "My Brand",
    url: "https://mystore.com",
  },
  faq: [
    { question: "What do you sell?", answer: "We sell..." },
  ],
};
```

## Routes

Hydrogen uses Remix-style routing. Create resource routes for each AEO file:

```ts title="app/routes/llms[.]txt.tsx"
import { createAeoLoader } from "@aeorank/shopify";
import { aeoConfig } from "~/aeo.config";

export const loader = createAeoLoader("llms.txt", aeoConfig);
```

Repeat for all 8 files:
- `app/routes/llms-full[.]txt.tsx`
- `app/routes/CLAUDE[.]md.tsx`
- `app/routes/schema[.]json.tsx`
- `app/routes/robots-patch[.]txt.tsx`
- `app/routes/faq-blocks[.]html.tsx`
- `app/routes/citation-anchors[.]html.tsx`
- `app/routes/sitemap-ai[.]xml.tsx`

## Generated Files

All 8 AEO files are served at your store root: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.
