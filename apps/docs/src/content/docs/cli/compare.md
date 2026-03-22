---
title: compare
description: Compare two scan results side by side in the terminal.
---

The `compare` command shows a dimension-by-dimension diff between two scan result JSON files.

## Usage

```bash
npx aeorank-cli compare before.json after.json
```

## How it works

1. Run two scans with `--format json` and save the output:

```bash
npx aeorank-cli scan https://example.com -f json > before.json
# ... make improvements ...
npx aeorank-cli scan https://example.com -f json > after.json
```

2. Compare them:

```bash
npx aeorank-cli compare before.json after.json
```

The output shows:

- **Overall score** change (e.g., `42 → 85 +43 pts`)
- **Per-dimension** before/after scores with delta
- Color-coded: green for improvements, red for regressions

## Example output

```
  Scan Comparison
  https://example.com

  Overall: 42 → 85  +43 pts

  Dimension                Before   After   Change
  ───────────────────────────────────────────────────
  llms.txt Presence        0/10  → 9/10    +9
  Schema.org Markup        6/10  → 8/10    +2
  Content Structure        8/10  → 9/10    +1
  AI Crawler Access        3/10  → 9/10    +6
  ...
```
