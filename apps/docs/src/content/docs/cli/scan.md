---
title: "aeorank scan"
description: Scan a URL with aeorank-cli@0.1.1 — 12 dimensions, 8 files.
---

`npx aeorank-cli@0.1.1 scan <url>` scores **12 dimensions** and writes **8 files**. npm **0.1.1** is canonical.

## Usage

```bash
npx aeorank-cli@0.1.1 scan <url> [options]
```

## Options (published 0.1.1)

| Flag | Default | Description |
|------|---------|-------------|
| `--format <type>` | `human` | `human` or `json` |
| `--output <dir>` | `./aeorank-output` | Where to write the 8 files |
| `--config <path>` | — | Config file |
| `--max-pages <n>` | `50` | Crawl cap |
| `--no-files` | off | Skip writing files |
| `--overwrite` | off | Replace existing output |

**Not in 0.1.1:** `--fail-on-crawler-block`, `--pillar`, `--page`, `--browser`. Use the [GitHub Action](/github-action/) `fail-on-crawler-block` input to fail a Check when GPTBot (or ClaudeBot, PerplexityBot, Google-Extended) is **disallowed**. Missing `robots.txt` is unknown, not blocked.

## Examples

```bash
npx aeorank-cli@0.1.1 scan https://example.com
npx aeorank-cli@0.1.1 scan https://example.com --format json --no-files
```

## JSON (0.1.1)

Published JSON includes `score`, `grade`, `dimensions` (length **12**), `files` (8 names), `pagesScanned`, `url`. It does **not** include `dimensionCount`, `generatedFiles`, `crawlerAccess`, or `crawlerGate` on this release. Count dimensions with `dimensions.length`.

Each dimension has `id`, `name`, `score`, `maxScore`, `weight` (`high` \| `medium` \| `low`), `status`, `hint`.

## Honest claims

Crawler allowlists matter. `llms.txt` is agent-docs hygiene, not a citation guarantee. We do not promise citations.
