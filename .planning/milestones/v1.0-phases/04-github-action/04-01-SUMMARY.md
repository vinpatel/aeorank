---
phase: 04-github-action
plan: 01
subsystem: github-action
tags: [github-actions, composite-action, checks-api, pr-comments, marketplace]
dependency_graph:
  requires: [packages/core, packages/cli]
  provides: [action/action.yml, action/README.md]
  affects: [github-marketplace-listing]
tech_stack:
  added: [actions/github-script@v8, peter-evans/find-comment@v3, peter-evans/create-or-update-comment@v5]
  patterns: [composite-action, check-run-api, pr-comment-upsert, hidden-html-marker]
key_files:
  created: [action/action.yml, action/README.md]
  modified: []
decisions:
  - "Use env: block to pass large JSON scan result to github-script (not template interpolation)"
  - "Use AEORANK_EOF as multiline delimiter to avoid collision with generic EOF"
  - "Use context.payload.pull_request.head.sha on PR events, not context.sha (merge commit)"
  - "Check conclusion: failure(<40 or fail-below), neutral(40-69), success(70+)"
  - "PR comment upsert via peter-evans pair with <!-- aeorank-score --> hidden marker"
metrics:
  duration: 78s
  completed: 2026-03-14
  tasks_completed: 2
  files_created: 2
---

# Phase 4 Plan 1: GitHub Action — Summary

Composite GitHub Action that wraps the AEOrank CLI, posts AEO scores as GitHub Check Runs, and upserts PR comment score tables using the peter-evans two-step upsert pattern with a hidden HTML marker.

## What Was Built

### action/action.yml

A composite GitHub Action with 4 steps:

1. **Scan step** (`id: scan`): Runs `npx aeorank@latest scan <url> --format json --no-files`, captures the full JSON result using the `AEORANK_EOF` multiline output pattern, and extracts `score` and `grade` as separate outputs for use in template expressions.

2. **Post Check Run step**: Uses `actions/github-script@v8` with an `env:` block to safely pass the scan result JSON (avoids template interpolation issues with large payloads). Builds a markdown dimension table from `result.dimensions`, determines the correct commit SHA (PR head vs push), computes Check conclusion based on score + `fail-below` threshold, calls `github.rest.checks.create()`, and exports `AEORANK_TABLE` via `core.exportVariable()` for the comment step.

3. **Find existing PR comment step** (`id: fc`, if: `pull_request`): Uses `peter-evans/find-comment@v3` with `body-includes: '<!-- aeorank-score -->'` to locate any existing bot comment.

4. **Upsert PR comment step** (if: `pull_request`): Uses `peter-evans/create-or-update-comment@v5` with `edit-mode: replace`. If `comment-id` is empty (first run), creates a new comment. Otherwise updates the existing one. Comment body starts with `<!-- aeorank-score -->` hidden marker.

**Inputs:**
- `url` (required) — URL to scan
- `token` (default: `${{ github.token }}`) — GitHub token
- `fail-below` (default: `'0'`) — threshold for failing the Check

### action/README.md

163-line Marketplace-ready README covering:
- Quick start (3-line minimum example)
- Full inputs table
- Required permissions section with explanation of WHY `checks:write` and `pull-requests:write` are needed
- Complete caller workflow YAML with push + pull_request triggers and `fail-below: 70`
- What It Does (3 behaviors: Check Run, PR comment upsert, fail-below)
- Check conclusion logic table (score ranges to conclusion)
- Fork PR limitation and `pull_request_target` workaround with security warning
- npm caching section
- Footer links

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `env:` block for JSON passing | Template interpolation (`${{ steps.scan.outputs.result }}`) is unsafe for large JSON — newlines and special chars can break the script. `process.env.SCAN_RESULT` is the documented pattern. |
| `AEORANK_EOF` delimiter | Generic `EOF` could collide with other step content. Namespaced delimiter prevents multiline output corruption. |
| `context.payload.pull_request.head.sha` | On `pull_request` events, `context.sha` is the merge commit SHA which doesn't appear on the PR's Checks tab. Head SHA attaches the check to the correct commit. |
| `core.exportVariable('AEORANK_TABLE')` | Composite action steps share environment but not outputs between a `github-script` step and a subsequent marketplace action step. `core.exportVariable` is the correct cross-step sharing mechanism. |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- action/action.yml: FOUND
- action/README.md: FOUND
- Commit d859295 (action.yml): FOUND
- Commit fca9448 (README.md): FOUND
