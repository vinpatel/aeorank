---
title: Remix
description: Add AEO files to your Remix app with @aeorank/remix.
---

Install the plugin:

```bash
npm install @aeorank/remix
```

## Configuration

Create an AEO config file:

```ts title="app/aeo.config.ts"
import type { AeorankRemixConfig } from "@aeorank/remix";

export const aeoConfig: AeorankRemixConfig = {
  siteName: "My Site",
  siteUrl: "https://example.com",
  description: "A description of your site for AI crawlers.",
  organization: {
    name: "My Company",
  },
  faq: [
    { question: "What does your product do?", answer: "It helps you..." },
  ],
};
```

## Resource Routes

Create resource routes for each AEO file. Remix uses `[.]` to escape dots in filenames:

```ts title="app/routes/llms[.]txt.ts"
import { createAeoLoader } from "@aeorank/remix";
import { aeoConfig } from "~/aeo.config";

export const loader = createAeoLoader("llms.txt", aeoConfig);
```

```ts title="app/routes/llms-full[.]txt.ts"
import { createAeoLoader } from "@aeorank/remix";
import { aeoConfig } from "~/aeo.config";

export const loader = createAeoLoader("llms-full.txt", aeoConfig);
```

Repeat the same pattern for all 8 files:
- `app/routes/CLAUDE[.]md.ts`
- `app/routes/schema[.]json.ts`
- `app/routes/robots-patch[.]txt.ts`
- `app/routes/faq-blocks[.]html.ts`
- `app/routes/citation-anchors[.]html.ts`
- `app/routes/sitemap-ai[.]xml.ts`

## Static Generation

Alternatively, generate files into `public/` at build time:

```ts title="scripts/generate-aeo.ts"
import { generateAeoFiles } from "@aeorank/remix";
import { aeoConfig } from "../app/aeo.config";

generateAeoFiles(aeoConfig);
```

## Generated Files

All 8 AEO files are served at your site root: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.
