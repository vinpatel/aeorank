---
title: schema.json
description: Organization, WebSite, and FAQPage structured data in JSON-LD format.
---

The `schema.json` file contains structured data in JSON-LD format that helps AI engines understand your site's identity and content.

## What it is

A JSON file containing [Schema.org](https://schema.org) structured data with three schema types:
- **Organization** — who you are
- **WebSite** — what your site is
- **FAQPage** — frequently asked questions (if detected)

## Why it matters

Schema markup is one of the most heavily weighted signals for AI engines. It provides machine-readable context about your site that AI models use to generate accurate citations and descriptions.

## Example output

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Example Site",
      "url": "https://example.com",
      "description": "A developer tools company"
    },
    {
      "@type": "WebSite",
      "name": "Example Site",
      "url": "https://example.com",
      "description": "A developer tools company building open-source infrastructure"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I get started?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Run npx example-cli init to set up your first project."
          }
        }
      ]
    }
  ]
}
```

## How to deploy

Embed the JSON-LD in your site's HTML `<head>`:

```html
<script type="application/ld+json">
  <!-- paste contents of schema.json here -->
</script>
```

Most frameworks support this in a layout file:
- **Next.js** — in `app/layout.tsx` using `<script>` tag
- **Astro** — in your base layout component
- **WordPress** — via an SEO plugin or theme `header.php`
