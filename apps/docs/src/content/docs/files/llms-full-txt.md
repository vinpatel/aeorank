---
title: llms-full.txt
description: Full-text content of all crawled pages for comprehensive AI indexing.
---

The `llms-full.txt` file contains the full text content of all crawled pages, giving AI models comprehensive access to your site's content.

## What it is

A plain text file with the complete text content from every page AEOrank crawled, separated by page headers. It's the "extended version" of `llms.txt`.

## Why it matters

Some AI models prefer to ingest full content rather than summaries. `llms-full.txt` gives them everything — useful for models building deep understanding of your site's domain.

## Example output

```
# Example Site — Full Content

## Page: Quick Start (https://example.com/docs/quick-start)

Set up your first project in 5 minutes.

Prerequisites: Node.js 20 or later.

Step 1: Install the CLI...
[full page content continues]

---

## Page: API Reference (https://example.com/docs/api)

Complete API documentation for Example Site.

Authentication: All API requests require...
[full page content continues]
```

## How to deploy

Place `llms-full.txt` at the root of your website alongside `llms.txt`:

```
https://your-site.com/llms-full.txt
```

:::note
This file can be large (100KB+) for content-heavy sites. That's expected — AI models handle large text files well.
:::
