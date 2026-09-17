---
title: How Scores Work
description: How aeorank-cli@0.1.1 turns 12 dimensions into a 0–100 score.
---

`npx aeorank-cli@0.1.1` produces a 0–100 score from **12 dimensions**, each scored 0–10, each tagged `high` / `medium` / `low`.

There is no published percentage-pillar table on this CLI. Do not quote the [36-row catalog](/scoring/dimensions-catalog/) as live weights.

## How it works

1. Crawl up to **50** pages by default (`--max-pages` overrides).
2. Score the [12 dimensions](/scoring/dimensions/).
3. Combine them into one 0–100 score and a letter grade.

Same URL, same HTML → same score. No LLM judge.

## Status per dimension

| Status | Meaning |
|--------|---------|
| Pass | Dimension looks healthy |
| Warn | Partial signal |
| Fail | Missing or blocked |

Exact numeric cutoffs are in the scorer; marketing does not invent extra bands.

## Improving the score

Fix **crawler access** first (allow GPTBot and peers in `robots.txt`), then ship the [8 generated files](/files/llms-txt/). That is technical readiness, not a citation guarantee.
