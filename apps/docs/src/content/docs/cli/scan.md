---
title: "aeorank scan"
description: Scan a URL and generate an AEO score with all 8 files.
---

Scan a website URL and generate an AEO score with dimension breakdown and all 8 output files.

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
| `--format <type>` | `text` | Output format: `text` (colored terminal) or `json` (machine-readable) |
| `--output <dir>` | `./aeo-output` | Directory to write generated files |
| `--config <path>` | `./aeorank.config.js` | Path to configuration file |
| `--max-pages <n>` | `50` | Maximum pages to crawl |
| `--timeout <ms>` | `30000` | Request timeout in milliseconds |
| `--concurrency <n>` | `3` | Concurrent requests |

## Examples

### Basic scan

```bash
npx aeorank-cli scan https://example.com
```

### JSON output for CI

```bash
npx aeorank-cli scan https://example.com --format json
```

The JSON output can be piped to other tools:

```bash
npx aeorank-cli scan https://example.com --format json | jq '.score'
```

### Custom output directory

```bash
npx aeorank-cli scan https://example.com --output ./my-aeo-files
```

### Scan fewer pages (faster)

```bash
npx aeorank-cli scan https://example.com --max-pages 10
```

### Use a config file

```bash
npx aeorank-cli scan https://example.com --config ./aeorank.config.js
```

## Output

### Text format (default)

The text format displays a colored score table with:
- Overall AEO score (0-100) and letter grade
- 12-dimension breakdown with score, weight, and status
- Pass/warn/fail indicators
- Actionable next-step recommendations ranked by priority

### JSON format

The JSON format outputs a clean JSON object to stdout containing:
- `url` — scanned URL
- `score` — overall score (0-100)
- `grade` — letter grade (A+ through F)
- `dimensions` — array of dimension scores
- `files` — array of generated file objects
- `pagesScanned` — number of pages crawled
- `duration` — scan duration in milliseconds

## Error handling

Every error includes a specific next action:
- **Invalid URL** — "Check the URL format. Include https:// prefix."
- **Network error** — "Verify the site is accessible. Check your internet connection."
- **Timeout** — "Site took too long to respond. Try `--timeout 60000` for a longer timeout."
- **Permission denied** — "The site's robots.txt blocks crawling. Check the site's access rules."
