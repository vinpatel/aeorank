---
title: sitemap-ai.xml
description: AI-optimized sitemap with content type hints for AI engine crawlers.
---

The `sitemap-ai.xml` file is an AI-optimized sitemap that includes content type hints, making it easier for AI engines to prioritize and understand your pages.

## What it is

An XML sitemap following the standard sitemap protocol, enhanced with content type metadata that AI crawlers can use to prioritize which pages to index and how to categorize them.

## Why it matters

Standard sitemaps list URLs with last-modified dates. AI-optimized sitemaps add content classification hints, helping AI engines quickly identify your most important and relevant content — documentation pages, FAQ sections, and API references.

## Example output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-03-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/docs/quick-start</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://example.com/docs/api</loc>
    <lastmod>2026-03-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## How to deploy

Place `sitemap-ai.xml` at the root of your website and reference it in your `robots.txt`:

```
Sitemap: https://your-site.com/sitemap-ai.xml
```

This can coexist with your regular `sitemap.xml` — AI crawlers will use whichever provides better content hints.
