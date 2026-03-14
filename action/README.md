# AEOrank GitHub Action

Scan any URL for AI Engine Optimization (AEO) score and post results as a GitHub Check Run and PR comment.

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AEOrank-blue?logo=github)](https://github.com/marketplace/actions/aeorank-aeo-scanner)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Quick Start

```yaml
- uses: aeorank/action@v1
  with:
    url: https://example.com
```

---

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `url` | URL to scan | Yes | — |
| `token` | GitHub token for API calls | No | `${{ github.token }}` |
| `fail-below` | Fail the Check if AEO score drops below this value (0 = never fail) | No | `0` |

---

## Required Permissions

The caller workflow **must** declare these permissions:

```yaml
permissions:
  checks: write
  pull-requests: write
  contents: read
```

**Why these permissions are required:**

`GITHUB_TOKEN` is a GitHub App installation access token automatically provisioned by GitHub Actions for each workflow run. By default it has minimal permissions, but you can expand them at the job or workflow level:

- **`checks: write`** — unlocks `checks.create()` which posts the AEO score as a Check Run on the commit. Without this permission, the API call returns "Resource not accessible by integration".
- **`pull-requests: write`** — unlocks comment creation and updates on PRs. Required for the score table comment to be posted.
- **`contents: read`** — standard read access, needed for checkout (if your workflow uses it).

You do **not** need a separate GitHub App or personal access token. `GITHUB_TOKEN` is sufficient when permissions are declared correctly.

---

## Full Workflow Example

Create `.github/workflows/aeorank.yml` in your repository:

```yaml
name: AEOrank Check

on:
  push:
    branches: [main]
  pull_request:

permissions:
  checks: write
  pull-requests: write
  contents: read

jobs:
  aeorank:
    runs-on: ubuntu-latest
    steps:
      - uses: aeorank/action@v1
        with:
          url: https://example.com
          token: ${{ secrets.GITHUB_TOKEN }}
          fail-below: 70
```

Replace `https://example.com` with the URL you want to scan on every push or pull request.

---

## What It Does

**On every push and pull request:**

The action runs `aeorank scan <url> --format json --no-files` using the AEOrank CLI. It then posts the result as a **GitHub Check Run** attached to the commit:

- Score and grade shown in the Check summary
- Full dimension breakdown table in the Check details
- Check conclusion is `success`, `neutral`, or `failure` based on the score (see table below)

**On pull requests only:**

Posts (or updates) a **PR comment** with the score and dimension table. The comment uses a hidden `<!-- aeorank-score -->` marker so re-runs update the existing comment rather than posting new ones. Your PR thread stays clean no matter how many times the workflow runs.

**With `fail-below`:**

Set `fail-below: 70` (or any threshold from 1–100) to make the Check fail whenever the AEO score drops below that number. This lets you enforce a minimum AEO quality bar in CI — PRs that drop the score below your threshold will show a failing Check.

---

## Check Conclusion Logic

| Score Range | `fail-below` triggered? | Conclusion | Display |
|-------------|------------------------|------------|---------|
| 70–100 | No | `success` | Green check |
| 40–69 | No | `neutral` | Grey dash |
| 0–39 | No | `failure` | Red X |
| Any | Yes (score < threshold) | `failure` | Red X |

The `fail-below` input overrides the normal conclusion — if the score is below your threshold, the Check fails regardless of whether the score would otherwise be `neutral` or `success`.

---

## Fork PR Limitation

When a pull request is opened from a **fork**, GitHub restricts `GITHUB_TOKEN` to read-only permissions for security. This means the action cannot post Check Runs or PR comments on fork PRs — the API calls will fail with permission errors.

**Workaround:** Use `pull_request_target` instead of `pull_request` in your workflow trigger:

```yaml
on:
  pull_request_target:
```

> **Security warning:** `pull_request_target` runs in the context of the base branch (with write permissions) even for fork PRs. Only use this if you understand the [security implications](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#pull_request_target). Never checkout the fork's code and run it in a `pull_request_target` workflow without careful sandboxing.

For most projects, the simplest approach is to skip Check/comment posting on fork PRs and accept that fork contributors won't see the AEOrank score inline until their PR is merged or the branch is pushed to your repo.

---

## Caching (Optional)

`npx aeorank@latest` downloads the CLI from npm on every run, adding 5–15 seconds. You can reduce this with npm caching:

```yaml
jobs:
  aeorank:
    runs-on: ubuntu-latest
    steps:
      - name: Cache npm
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-npm-aeorank
          restore-keys: |
            ${{ runner.os }}-npm-

      - uses: aeorank/action@v1
        with:
          url: https://example.com
```

---

## Links

- [aeorank.dev](https://aeorank.dev) — AEOrank homepage
- [docs.aeorank.dev](https://docs.aeorank.dev) — Full documentation
- [GitHub Marketplace](https://github.com/marketplace/actions/aeorank-aeo-scanner) — Action listing
