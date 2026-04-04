---
title: GitHub Action
description: Add AEO scoring to your CI pipeline with the AEOrank GitHub Action.
---

The AEOrank GitHub Action runs in your CI pipeline and posts AEO scores as Check Runs and PR comments. Use it when you want full control over triggers, thresholds, and workflow configuration.

## Quick start

```yaml
# .github/workflows/aeorank.yml
name: AEO Score
on: [push, pull_request]

permissions:
  checks: write
  pull-requests: write
  contents: read

jobs:
  aeo:
    runs-on: ubuntu-latest
    steps:
      - uses: vinpatel/aeorank-action@v1
        with:
          url: https://your-site.com
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | Yes | — | URL to scan |
| `token` | No | `github.token` | GitHub token for API calls |
| `fail-below` | No | `0` | Fail the Check if score drops below this value (0 = never fail) |

## Permissions

Your workflow **must** declare these permissions:

```yaml
permissions:
  checks: write        # Post Check Runs
  pull-requests: write # Post PR comments
  contents: read       # Standard read access
```

## What it does

**On every push and pull request:**

The Action runs `aeorank scan <url> --format json` and posts the result as a **Check Run** with:

- Score and grade in the Check summary
- Full 36-dimension breakdown table in the Check details
- Conclusion: `success` (≥70), `neutral` (40–69), or `failure` (<40)

**On pull requests only:**

Posts a **PR comment** with the score and dimension table. Uses a hidden `<!-- aeorank-score -->` marker so re-runs update the existing comment.

## Enforce a minimum score

Set `fail-below` to make the Check fail when the score drops below your threshold:

```yaml
- uses: vinpatel/aeorank-action@v1
  with:
    url: https://your-site.com
    fail-below: 70
```

PRs that drop the score below 70 will show a failing Check — blocking merge if you use branch protection rules.

## Check conclusion logic

| Score | `fail-below` triggered? | Conclusion |
|-------|------------------------|------------|
| 70–100 | No | ✅ Success |
| 40–69 | No | — Neutral |
| 0–39 | No | ❌ Failure |
| Any | Yes (score < threshold) | ❌ Failure |

## Caching

Speed up runs by caching npm:

```yaml
steps:
  - uses: actions/cache@v4
    with:
      path: ~/.npm
      key: ${{ runner.os }}-npm-aeorank
  - uses: vinpatel/aeorank-action@v1
    with:
      url: https://your-site.com
```

## Fork PRs

When a PR comes from a fork, `GITHUB_TOKEN` is restricted to read-only. The Action cannot post Check Runs or PR comments on fork PRs. Use `pull_request_target` as a workaround (see [security implications](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#pull_request_target)).

## GitHub Action vs GitHub App

| | GitHub Action | GitHub App |
|---|---|---|
| **Setup** | Add YAML workflow file | One-click install |
| **Control** | Full — custom triggers, thresholds | Automatic on every PR |
| **`fail-below`** | ✅ | Coming soon |
| **Runs on** | Your GitHub Actions minutes | AEOrank servers |

**Recommendation:** Use the Action if you need `fail-below` thresholds or custom workflow logic. Use the [GitHub App](/github-app) for zero-friction setup.

## Links

- [Marketplace listing](https://github.com/marketplace/actions/aeorank-aeo-scanner)
- [Action source code](https://github.com/vinpatel/aeorank-action)
- [GitHub App alternative](/github-app)
- [36 scoring criteria](/scoring/dimensions)
