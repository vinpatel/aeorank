---
title: "aeorank scan"
description: Scan a URL and generate an AEO score with all 9 files.
---

Scan a website URL and generate an AEO score with a dimension breakdown and the 9 files the CLI actually writes.

## Usage

```bash
aeorank scan <url> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<url>` | The website URL to scan (required) |

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--format <type>` | `human` | Output format: `human` (colored terminal) or `json` (machine-readable) |
| `--output <dir>` | `./aeorank-output` | Directory to write generated files |
| `--config <path>` | — | Path to configuration file |
| `--max-pages <n>` | `200` | Maximum pages to crawl |
| `--no-files` | off | Skip writing generated files |
| `--overwrite` | off | Replace existing output files |
| `--browser` / `-b` | off | Use Playwright for JavaScript-rendered pages |
| `--pillar <name>` | — | Filter dimensions to one pillar |
| `--page <path>` | — | Show score for a specific page path |
| `--fail-on-crawler-block` | off | **Fail the PR if GPTBot is blocked.** Exit 2 if GPTBot, ClaudeBot, PerplexityBot, or Google-Extended is *disallowed* in `robots.txt`. A missing `robots.txt` is **unknown**, not blocked. |

## Examples

### Basic scan

```bash
npx aeorank-cli scan https://example.com
```

### Fail CI when an AI crawler is blocked

```bash
npx aeorank-cli scan https://example.com --fail-on-crawler-block --format json --no-files
```

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | Scan succeeded (unknown crawlers do **not** fail) |
| `1` | Scan or I/O error |
| `2` | `--fail-on-crawler-block` and a gated bot is disallowed |

### JSON output for CI

```bash
npx aeorank-cli scan https://example.com --format json --no-files
```

The JSON object is the contract the GitHub Action consumes next. Always present:

- `version` — CLI version from `package.json` (one source of truth)
- `score` / `grade`
- `dimensionCount` — `dimensions.length` (currently 36)
- `generatedFiles` — names of files actually written (currently 9)
- `crawlerAccess` — per-bot map: `allow` \| `block` \| `unknown`
- `crawlerGate` — `{ checkedBots, blockedBots, unknownBots, failed, robotsTxt }`
  - `failed` is `true` only when a checked bot is **disallowed**
  - `robotsTxt: "missing"` means 404 / no file — status unknown, **not** blocked

```bash
npx aeorank-cli scan https://example.com --format json --no-files | jq '.crawlerAccess.GPTBot'
```

## Output

### Human format (default)

1. **AI crawler table** — GPTBot, ClaudeBot, PerplexityBot, Google-Extended → allow / block / unknown
2. Overall AEO score (0–100) and letter grade, plus the true dimension and file counts
3. 36-dimension breakdown grouped by pillar
4. Actionable next-step recommendations

### JSON format

See fields above. `crawlerAccess` uses `allow` / `block` / `unknown` (not `allowed` / `disallowed`) so Actions can consume it without remapping.

## Honest claims

Crawler allowlists plus a CI gate prevent GPTBot (and peers) from staying blocked. `llms.txt` is agent-docs hygiene, not a citation guarantee.
