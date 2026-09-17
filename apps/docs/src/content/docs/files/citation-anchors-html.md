---
title: citation-anchors.html
description: Heading id markup for deep links. Extractability, not a citation promise.
---

The `citation-anchors.html` file is heading markup with stable `id` attributes so sections can be deep-linked. Extractability, not a citation guarantee.

## What it is

HTML heading elements with stable `id` attributes and anchor links, enabling AI engines to link to specific sections of your pages rather than just the page URL.

## Why it matters

Heading `id` attributes make sections deep-linkable. That is extractability markup, not a promise that a model will cite the page.

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
Keep heading IDs stable across deploys so deep links do not break.
:::
