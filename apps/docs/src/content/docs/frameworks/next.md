---
title: Next.js
description: Add AEO files to your Next.js app with @aeorank/next.
---

Install the plugin:

```bash
npm install @aeorank/next
```

## Configuration

Create an AEO config file:

```ts title="aeo.config.ts"
import type { AeorankNextConfig } from "@aeorank/next";

export const aeoConfig: AeorankNextConfig = {
  siteName: "My Site",
  siteUrl: "https://example.com",
  description: "A description of your site for AI crawlers.",
  organization: {
    name: "My Company",
    url: "https://example.com",
  },
  faq: [
    { question: "What does your product do?", answer: "It helps you..." },
  ],
};
```

## Option A: Static Generation

Generate files into `public/` at build time:

```ts title="scripts/generate-aeo.ts"
import { generateAeoFiles } from "@aeorank/next";
import { aeoConfig } from "../aeo.config";

generateAeoFiles(aeoConfig);
console.log("AEO files generated.");
```

Add to your build script:

```json title="package.json"
{
  "scripts": {
    "build": "tsx scripts/generate-aeo.ts && next build"
  }
}
```

## Option B: Dynamic Routes (App Router)

Serve files on-demand using route handlers:

```ts title="app/llms.txt/route.ts"
import { serveAeoFile } from "@aeorank/next";
import { aeoConfig } from "../../aeo.config";

export const GET = serveAeoFile("llms.txt", aeoConfig);
```

Repeat for each file:
- `app/llms-full.txt/route.ts`
- `app/CLAUDE.md/route.ts`
- `app/schema.json/route.ts`
- `app/robots-patch.txt/route.ts`
- `app/faq-blocks.html/route.ts`
- `app/citation-anchors.html/route.ts`
- `app/sitemap-ai.xml/route.ts`

## Content-Type Headers

Use `withAeorank` in your Next.js config to set correct headers:

```ts title="next.config.ts"
import { withAeorank } from "@aeorank/next";
import { aeoConfig } from "./aeo.config";

const aeorank = withAeorank(aeoConfig);

export default aeorank({
  // your Next.js config
});
```

## Generated Files

All 8 AEO files are served at your site root: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.
