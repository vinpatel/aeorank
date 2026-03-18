---
title: Squarespace
description: Add AEO files to your Squarespace site manually.
---

Squarespace doesn't support server-side plugins, but you can add structured data and serve AEO files with a proxy.

## Step 1: Generate your files

Use the CLI to scan your site:

```bash
npx aeorank-cli scan https://your-site.squarespace.com
```

## Step 2: Add structured data

In Squarespace, go to **Settings > Advanced > Code Injection** and add your JSON-LD in the **Header** section:

```html
<script type="application/ld+json">
  // Paste contents of schema.json here
</script>
```

## Step 3: Add FAQ schema

For pages with FAQs, use a **Code Block** to embed the contents of `faq-blocks.html`.

## Step 4: Host remaining files

For `llms.txt`, `sitemap-ai.xml`, and other root files, use a reverse proxy like Cloudflare Workers (see the [Webflow guide](/frameworks/webflow/) for an example Worker setup).

## Step 5: Robots.txt

Squarespace doesn't allow editing robots.txt directly. Use a Cloudflare Worker to intercept `/robots.txt` requests and append the AI crawler directives from `robots-patch.txt`.
