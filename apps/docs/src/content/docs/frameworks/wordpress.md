---
title: WordPress
description: Add AEO files to your WordPress site with the AEOrank plugin.
---

## Installation

1. [Download the plugin from GitHub](https://github.com/vinpatel/aeorank/releases/latest/download/aeorank-wordpress.zip)
2. In your WordPress admin, go to **Plugins > Add New > Upload Plugin**
3. Upload the zip file and click **Install Now**
4. Activate the plugin

## Configuration

Navigate to **Settings > AEOrank** in the WordPress admin dashboard and fill in:

- **Site Name** — defaults to your blog name if left empty
- **Description** — defaults to your blog tagline if left empty
- **Organization Name** — optional
- **Organization URL** — optional
- **Organization Logo URL** — optional

## How It Works

Unlike the npm-based plugins, the WordPress plugin serves AEO files dynamically via rewrite rules. When a request comes in for `/llms.txt`, `/schema.json`, etc., WordPress intercepts it, generates the content on-the-fly, and returns it with the correct `Content-Type` header.

No static files are written to disk. Responses are cached with `Cache-Control: public, max-age=3600, s-maxage=86400`.

## Generated Files

All 8 AEO files are served at your site root: `/llms.txt`, `/llms-full.txt`, `/CLAUDE.md`, `/schema.json`, `/robots-patch.txt`, `/faq-blocks.html`, `/citation-anchors.html`, `/sitemap-ai.xml`.
