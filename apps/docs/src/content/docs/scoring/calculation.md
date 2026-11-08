---
title: How Scores Work
description: How aeorank-cli@0.1.2 turns 36 dimensions into a 0–100 score.
---

`npx aeorank-cli@0.1.2` produces a 0–100 score from **36 dimensions**, each scored 0–10, each with a `weightPct`. Those weights sum to 100.

## How it works

1. Crawl up to **200** pages by default (`DEFAULT_CONFIG.maxPages`). `--max-pages` overrides. `init` writes a config with `50`.
2. Score the [36 dimensions](/scoring/dimensions/).
3. `score = round(Σ (dimension.score / 10) × weightPct)`.
4. If `topic-coherence` is present and its score is below 6, cap the total at `topic-coherence × 10`.
5. Map the total to a letter grade.

Same URL, same HTML → same score. No LLM judge.

A display helper labels `weightPct` as high (≥ 3), medium (≥ 2), or low. The score uses `weightPct`, not those labels.

## Status per dimension

| Status | Meaning |
|--------|---------|
| Pass | Score is at least 70% of 10 |
| Warn | Score is at least 40% and below 70% |
| Fail | Score is below 40% |

## Improving the score

Fix **crawler access** first (`allow` for GPTBot and peers in `robots.txt`), then ship the [8 generated files](/files/llms-txt/). That is technical readiness, not a citation guarantee.
