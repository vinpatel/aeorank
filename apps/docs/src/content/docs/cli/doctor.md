---
title: "aeorank doctor"
description: Fast robots.txt, HEAD, and WAF probe for AI crawler access. Does not score the 12 dimensions.
---

:::caution[Not in published npm 0.1.1]
Published `aeorank-cli@0.1.1` commands are `scan` and `init`. `doctor` is in this repository's CLI. It is not on that npm release, so `npx aeorank-cli@0.1.1 doctor` will not run it.
:::

`doctor <url>` checks whether the crawlers in `@aeorank/core`'s `AI_CRAWLERS` list can reach a URL. That list is GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and anthropic-ai.

It does not score the **12 dimensions** and it does not write the **8 files**. `scan` still owns the full score. In this repository, `scan --fail-on-crawler-block` fails when GPTBot, ClaudeBot, PerplexityBot, or Google-Extended is disallowed in `robots.txt`. `doctor` is the shorter probe: robots.txt, a `HEAD` of the URL you passed, a `HEAD` of `/llms.txt`, and two WAF response headers.

A finished report exits 0. Read `verdict.status` (`pass`, `warn`, or `fail`). The process exits 1 only when the command itself cannot run (bad URL, bad flags, or an unexpected error).

## Usage

From a checkout, after building the CLI:

```bash
node packages/cli/dist/index.js doctor https://example.com
node packages/cli/dist/index.js doctor https://example.com --format json --timeout 8000
```

## What it checks

- Fetches `/robots.txt` and maps each `AI_CRAWLERS` entry through `parseRobotsTxt` (evaluated for the site root `/`):
  - `allowed` when the parser says the crawler may fetch `/`
  - `blocked` when the parser says it is disallowed
  - `unspecified` when robots.txt is missing, unreadable, or the parser returns unknown
- Sends `HEAD` to the target URL with that crawler's name as `User-Agent`.
- Sends `HEAD` to `/llms.txt` with the same `User-Agent`.
- Flags these response headers when they are present:
  - Cloudflare `cf-mitigated` (challenge pages; documented value `challenge`)
  - AWS WAF `x-amzn-waf-action` (`challenge` on HTTP 202, `captcha` on HTTP 405)

Missing `/llms.txt` (**404**) is not a block. A server that rejects `HEAD` (**405**) is not a block. AWS WAF CAPTCHA is still a block, because that response is **405 plus** `x-amzn-waf-action: captcha`.

Other statuses treated as blocks, without a WAF header: `401`, `403`, `406`, `407`, `418`, `429`, `451`, `503`, and `999`.

`unspecified` robots access and failed requests (timeout, network) are inconclusive. They produce `warn`, not `fail`. A missing `robots.txt` is not a block.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--format <type>` | `human` | `human` or `json` |
| `--timeout <ms>` | `10000` | Per-request timeout in milliseconds |

## JSON

The JSON object includes `url`, `robotsUrl`, `llmsTxtUrl`, `crawlers`, and `verdict`. Each crawler has `userAgent`, `robots` (`allowed`, `blocked`, or `unspecified`), and `target` / `llmsTxt` objects with `status`, `blocked`, `wafSignals`, and `error` when a request failed.

`verdict.status` is `pass`, `warn`, or `fail`. This payload is not the scan JSON: there is no `score`, no `dimensions` array, and no generated files.
