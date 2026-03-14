---
title: llms.txt
description: A structured overview of your site for language models, following the llmstxt.org specification.
---

The `llms.txt` file is a structured text file that tells language models what your site is about. It follows the [llmstxt.org](https://llmstxt.org) specification.

## What it is

A plain text file that lists your site's pages grouped by section, with titles and brief descriptions. Think of it as a `robots.txt` for AI — but instead of restricting access, it guides understanding.

## Why it matters

Language models use `llms.txt` to quickly understand what a site offers without crawling every page. Sites with a well-structured `llms.txt` are more likely to be accurately cited by AI engines.

**This is the single highest-weighted dimension in AEOrank scoring.**

## Example output

```
# Example Site

> A developer tools company building open-source infrastructure.

## Getting Started
- [Quick Start](https://example.com/docs/quick-start): Set up your first project in 5 minutes
- [Installation](https://example.com/docs/install): System requirements and installation steps

## API Reference
- [Authentication](https://example.com/docs/api/auth): API key management and OAuth setup
- [Endpoints](https://example.com/docs/api/endpoints): Complete REST API reference

## Blog
- [Announcing v2.0](https://example.com/blog/v2-release): Major release with new features
```

## How to deploy

Place `llms.txt` at the root of your website:

```
https://your-site.com/llms.txt
```

Most web servers will serve it as a static file. For framework-specific guidance:
- **Next.js** — place in `public/llms.txt`
- **Astro** — place in `public/llms.txt`
- **WordPress** — upload to your site root via FTP or use a plugin
