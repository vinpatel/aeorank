---
title: "aeorank doctor"
description: Diagnose AI crawler access, WAF blocks, and llms.txt reachability.
---

The `doctor` command checks whether common AI crawlers can reach a site without
being blocked by `robots.txt`, bot mitigation, or common `/llms.txt` firewall
responses.

## Usage

```bash
npx aeorank-cli doctor https://example.com
```

## What it checks

- Fetches `/robots.txt` and reports every crawler from AEOrank's core AI crawler
  list as `allowed`, `blocked`, or `unspecified`.
- Sends a `HEAD` request to the target URL using each crawler as the
  `User-Agent`.
- Sends a `HEAD` request to `/llms.txt` using each crawler as the `User-Agent`.
- Flags explicit Cloudflare and AWS WAF headers: `cf-mitigated` and
  `x-amzn-waf-action`.
- Treats common access-control status codes like `403`, `429`, and `503` as
  possible blocks, while avoiding false positives for missing `/llms.txt` files
  or servers that do not support `HEAD`.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--format <type>` | `human` | Output format: `human` or `json` |
| `--timeout <ms>` | `10000` | Per-request timeout in milliseconds |

## Examples

### Human output

```bash
npx aeorank-cli doctor https://example.com
```

### JSON output

```bash
npx aeorank-cli doctor https://example.com --format json
```

The JSON output includes the normalized target URL, checked file URLs, per-crawler
diagnostics, WAF header signals, and a final verdict.
