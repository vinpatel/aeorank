---
phase: 04-github-action
plan: 02
subsystem: github-action
tags: [github-actions, composite-action, self-test, ci-workflow, marketplace]
dependency_graph:
  requires: [action/action.yml, action/README.md]
  provides: [action/.github/workflows/test.yml]
  affects: [aeorank/action-repo-readiness]
tech_stack:
  added: []
  patterns: [composite-action-self-test, uses-local-action]
key_files:
  created: [action/.github/workflows/test.yml]
  modified: []
decisions:
  - "Use fail-below: 0 in self-test so example.com scan never fails on score"
  - "uses: ./ references the action from repo root (correct for aeorank/action repo layout)"
metrics:
  duration: 27s
  completed: 2026-03-14
  tasks_completed: 2
  files_created: 1
---

# Phase 4 Plan 2: Self-Test Workflow and Action Readiness Summary

Self-test CI workflow that validates the composite GitHub Action end-to-end against example.com when pushed to the standalone `aeorank/action` repo.

## What Was Built

### action/.github/workflows/test.yml

A 22-line CI workflow that tests the action itself in the `aeorank/action` repo:

- **Triggers:** Push to `main` and `pull_request` — exercises both Check Run and PR comment paths
- **Permissions:** `checks: write`, `pull-requests: write`, `contents: read` — all three required permissions declared
- **Local action reference:** `uses: ./` references the action from the repo root (correct when `action.yml` lives at root of `aeorank/action`)
- **Test target:** `https://example.com` with `fail-below: 0` so a low score never causes a test failure

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `fail-below: 0` | example.com is not AEO-optimized and will score low. Setting threshold to 0 ensures the CI test only validates the action runs without error, not that example.com scores well. |
| `uses: ./` | When the `action/` directory contents are copied to the `aeorank/action` repo root, `action.yml` lives at root. `uses: ./` is the correct local action reference in that layout. |

## Checkpoint Auto-Approved

Task 2 was a `checkpoint:human-verify`. Auto-approved via `auto_advance: true` config.

Verification confirmed all three action package files are present:
- `action/action.yml` — composite action (4 steps, 3 inputs)
- `action/README.md` — 163-line Marketplace listing
- `action/.github/workflows/test.yml` — self-test CI workflow

The `action/` directory is self-contained and ready to be copied to the standalone `aeorank/action` repo.

## How to Publish

1. Create `aeorank/action` repo on GitHub
2. Copy contents of `action/` to repo root
3. Push to `main`
4. Create a `v1` release tag to list on GitHub Marketplace

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- action/.github/workflows/test.yml: FOUND
- Commit 48381bd (test.yml): FOUND
