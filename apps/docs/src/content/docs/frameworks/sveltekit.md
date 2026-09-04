---
title: SvelteKit
description: Add AEO files to your SvelteKit app with @aeorank/sveltekit.
---

Install the plugin:

```bash
npm install @aeorank/sveltekit
```

## Configuration

Create an AEO config file:

```ts title="src/lib/aeo.config.ts"
import type { AeorankSvelteKitConfig } from "@aeorank/sveltekit";

export const aeoConfig: AeorankSvelteKitConfig = {
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

## Server Routes

Create server endpoints for each AEO file:

```ts title="src/routes/llms.txt/+server.ts"
import { createAeoHandler } from "@aeorank/sveltekit";
import { aeoConfig } from "$lib/aeo.config";

export const GET = createAeoHandler("llms.txt", aeoConfig);
```

```ts title="src/routes/llms-full.txt/+server.ts"
import { createAeoHandler } from "@aeorank/sveltekit";
import { aeoConfig } from "$lib/aeo.config";

export const GET = createAeoHandler("llms-full.txt", aeoConfig);
```

Repeat for all 8 files:
- `src/routes/CLAUDE.md/+server.ts`
- `src/routes/schema.json/+server.ts`
- `src/routes/robots-patch.txt/+server.ts`
- `src/routes/faq-blocks.html/+server.ts`
- `src/routes/citation-anchors.html/+server.ts`
- `src/routes/sitemap-ai.xml/+server.ts`

## Static Generation

Alternatively, generate files into `static/` at build time:

```ts title="scripts/generate-aeo.ts"
import { generateAeoFiles } from "@aeorank/sveltekit";
import { aeoConfig } from "../src/lib/aeo.config";

generateAeoFiles({ ...aeoConfig, outputDir: "static" });
```

## Generated Files

All 8 AEO files are served at your site root: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.
