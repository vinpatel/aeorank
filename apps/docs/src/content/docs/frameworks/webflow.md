---
title: Webflow
description: Add AEO files to your Webflow site manually.
---

Webflow doesn't support server-side plugins, but you can still add AEO files.

## Step 1: Generate your files

Use the CLI to scan your site and generate AEO files:

```bash
npx aeorank-cli scan https://your-site.webflow.io
```

This writes 8 files to `./aeo-output/`.

## Step 2: Host the files

Since Webflow only serves HTML pages, host your AEO text files using one of these approaches:

### Option A: Cloudflare Workers (Recommended)

Create a Cloudflare Worker that serves your AEO files at your domain:

```js title="worker.js"
const files = {
  "/llms.txt": { content: "...", type: "text/plain" },
  "/schema.json": { content: "...", type: "application/ld+json" },
  // ... add all 8 files
};

export default {
  fetch(request) {
    const url = new URL(request.url);
    const file = files[url.pathname];
    if (file) {
      return new Response(file.content, {
        headers: { "Content-Type": file.type },
      });
    }
    return fetch(request);
  },
};
```

### Option B: Custom Code Embed

For `schema.json` and `faq-blocks.html`, you can embed them directly in your Webflow pages using the Custom Code feature:

1. Go to **Project Settings > Custom Code**
2. In the **Head Code** section, paste your JSON-LD schema:

```html
<script type="application/ld+json">
  // Paste contents of schema.json here
</script>
```

## Step 3: Add robots.txt directives

In Webflow, go to **SEO > Robots.txt** and append the contents of `robots-patch.txt`.
