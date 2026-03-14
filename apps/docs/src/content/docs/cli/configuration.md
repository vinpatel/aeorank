---
title: Configuration
description: Complete reference for the aeorank.config.js configuration file.
---

AEOrank can be configured via an `aeorank.config.js` file. Create one with `aeorank init` or write it manually.

## Config file format

```js
/** @type {import('@aeorank/core').AeorankConfig} */
export default {
  site: {
    url: "https://example.com",
    name: "Example Site",
    description: "A description of what your site does",
  },
  output: {
    dir: "./aeo-output",
  },
  scanner: {
    maxPages: 50,
    concurrency: 3,
    timeout: 30000,
    userAgent: "AEOrank/1.0 (+https://aeorank.dev)",
    respectCrawlDelay: true,
  },
};
```

## Options reference

### `site`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | `string` | — | Your site's URL (used for generated files) |
| `name` | `string` | Detected from site | Your site's name |
| `description` | `string` | Detected from site | Brief description |

### `output`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dir` | `string` | `"./aeo-output"` | Directory for generated files |

### `scanner`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxPages` | `number` | `50` | Maximum pages to crawl |
| `concurrency` | `number` | `3` | Concurrent requests (be respectful) |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `userAgent` | `string` | `"AEOrank/1.0 (+https://aeorank.dev)"` | User-Agent header |
| `respectCrawlDelay` | `boolean` | `true` | Honor robots.txt Crawl-delay |

## Priority order

Settings are resolved in this order (later overrides earlier):

1. **Built-in defaults** — sensible values for most sites
2. **Config file** — `aeorank.config.js` in the current directory
3. **CLI flags** — `--max-pages`, `--timeout`, etc.

CLI flags always win. This lets you override config for one-off scans:

```bash
# Use config defaults but scan only 10 pages this time
aeorank scan https://example.com --max-pages 10
```

## Tips

:::tip
Keep `concurrency` at 3 or lower to be respectful of site resources. Higher values may trigger rate limiting.
:::

:::caution
Setting `respectCrawlDelay: false` ignores the site's robots.txt Crawl-delay directive. Only do this for sites you own.
:::
