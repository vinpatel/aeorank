---
title: "aeorank scan"
description: Scan a URL with aeorank-cli@0.1.2 — 36 dimensions, 8 files.
---

`npx aeorank-cli@0.1.2 scan <url>` scores **36 dimensions** and writes **8 files**. `-V` prints **0.1.2**.

## Usage

```bash
npx aeorank-cli@0.1.2 scan <url> [options]
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--format <type>` | `human` | `human` or `json` |
| `--output <dir>` | `./aeorank-output` | Where to write the 8 files |
| `--config <path>` | — | Config file |
| `--max-pages <n>` | `200` | Crawl cap (`DEFAULT_CONFIG.maxPages`). `init` writes a config with `50`. |
| `--no-files` | off | Skip writing files |
| `--overwrite` | off | Replace existing output |
| `--verbose` | off | Scan progress |
| `--browser` | off | Playwright rendering for SPAs |
| `--pillar <name>` | — | Filter to one pillar id |
| `--page <path>` | — | One page path, for example `/about` |
| `--fail-on-crawler-block` | off | Exit **2** when GPTBot, ClaudeBot, PerplexityBot, or Google-Extended is `block`. Missing `robots.txt` is `unknown` and does not fail. |

The GitHub Action input `fail-on-crawler-block` (default true) reads `crawlerGate` from JSON. It does not pass this flag.

Other commands: `init`, `compare`.

## Examples

```bash
npx aeorank-cli@0.1.2 scan https://example.com
npx aeorank-cli@0.1.2 scan https://example.com --format json --no-files
npx aeorank-cli@0.1.2 scan https://example.com --format json --no-files --fail-on-crawler-block
```

## JSON

Includes `score`, `grade`, `dimensions` (length **36**), `dimensionCount`, `files`, `generatedFiles`, `crawlerAccess`, `crawlerGate`, `pagesScanned`, `url`, and `version`.

Each dimension has `id`, `name`, `score`, `maxScore`, `weightPct`, `status` (`pass` | `warn` | `fail`), and `hint`.

`crawlerAccess` values are **`allow`**, **`block`**, or **`unknown`**. `crawlerGate.failed` is true only when a checked bot is `block`. `crawlerGate.blockedBots` names those bots.

## Honest claims

Crawler allowlists matter. `llms.txt` is agent-docs hygiene, not a citation guarantee. We do not promise citations.
