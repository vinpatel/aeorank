---
title: "aeorank init"
description: Create an AEOrank configuration file with sensible defaults.
---

Create an `aeorank.config.js` configuration file in the current directory with sensible defaults.

## Usage

```bash
aeorank init
```

## What it creates

Running `aeorank init` generates an `aeorank.config.js` file:

```js
/** @type {import('@aeorank/core').AeorankConfig} */
export default {
  site: {
    url: "https://example.com",
    name: "My Site",
    description: "A brief description of your site",
  },
  output: {
    dir: "./aeo-output",
  },
  scanner: {
    maxPages: 50,
    concurrency: 3,
    timeout: 30000,
  },
};
```

Edit the values to match your site, then run:

```bash
aeorank scan https://your-site.com --config ./aeorank.config.js
```

## When to use init

Use `aeorank init` when you want to:
- Customize scanner settings for repeated scans
- Set a default output directory
- Configure site metadata for more accurate file generation

For one-off scans, you don't need a config file — just run `aeorank scan <url>` directly.
