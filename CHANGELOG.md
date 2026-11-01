# Changelog

## 0.1.2 — 2026-11-01

Prepared for publish. Not published from this change.

### aeorank-cli@0.1.2

- Scan JSON includes `crawlerAccess` and `crawlerGate`. Public crawler status is `allow`, `block`, or `unknown`. `crawlerGate.failed` is true only when GPTBot, ClaudeBot, PerplexityBot, or Google-Extended is explicitly blocked. A missing `robots.txt` is `unknown` and does not fail the gate.
- `--fail-on-crawler-block` is a CLI flag. It exits **2** when `crawlerGate.failed` is true. Scan errors stay exit **1**. The GitHub Action input of the same name is separate: the Action reads `crawlerGate` and does not pass the flag.
- Scores **36** dimensions (`dimensions.length` and `dimensionCount`). Weights are `weightPct` and sum to 100.
- Writes **8** files: `llms.txt`, `llms-full.txt`, `CLAUDE.md`, `schema.json`, `robots-patch.txt`, `faq-blocks.html`, `citation-anchors.html`, `sitemap-ai.xml`.
- `ai.txt` is not generated. The scanner reads `/ai.txt` and the `content-licensing` dimension scores it.

### @aeorank/core@0.1.2

- Version moved from `0.0.1` so the CLI dependency resolves to this release. Publish `@aeorank/core@0.1.2` before `aeorank-cli@0.1.2`. The CLI bundles `@aeorank/core`.

### GitHub Action

- `action/action.yml` runs `npx aeorank-cli@0.1.2` instead of `npx aeorank-cli@latest`.
