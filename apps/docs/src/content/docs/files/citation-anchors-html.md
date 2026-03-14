---
title: citation-anchors.html
description: Heading anchor markup that makes your content directly linkable by AI engines.
---

The `citation-anchors.html` file contains heading anchor markup that makes specific sections of your content directly citable by AI engines.

## What it is

HTML heading elements with stable `id` attributes and anchor links, enabling AI engines to link to specific sections of your pages rather than just the page URL.

## Why it matters

When AI engines cite your content, anchor links let them point to the exact section they're referencing. This improves user experience (readers land on the relevant section) and signals to AI engines that your content is well-structured.

## Example output

```html
<h2 id="installation">
  <a href="#installation">Installation</a>
</h2>

<h2 id="configuration">
  <a href="#configuration">Configuration</a>
</h2>

<h3 id="database-setup">
  <a href="#database-setup">Database Setup</a>
</h3>
```

## How to deploy

Most static site generators and content frameworks add heading anchors automatically. If yours doesn't, add the `id` attributes to your headings:

- **Markdown processors** — most support `{#custom-id}` syntax or auto-generate IDs
- **Next.js** — use a rehype plugin like `rehype-slug`
- **Astro** — heading IDs are generated automatically in Markdown
- **WordPress** — use a table of contents plugin

:::tip
Keep heading IDs stable across deploys. Changing them breaks existing AI citations pointing to your content.
:::
