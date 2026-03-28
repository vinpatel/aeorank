---
phase: 07-marketing-content-deployment
plan: "02"
subsystem: infra
tags: [github-actions, marketplace, publishing, documentation]

requires:
  - phase: 04-github-action
    provides: "action.yml composite action with branding metadata already set"

provides:
  - "action/PUBLISHING.md — step-by-step Marketplace publication checklist for aeorank/action@v1"

affects: [marketplace-listing, action-publication]

tech-stack:
  added: []
  patterns:
    - "Separate aeorank/action repo pattern for GitHub Marketplace publication (action.yml must be at root)"

key-files:
  created:
    - action/PUBLISHING.md
  modified: []

key-decisions:
  - "GitHub Marketplace requires action.yml at repo root — aeorank/action must be a separate repository (Option A), not published from monorepo subdirectory"
  - "v1 major version tag pattern documented: create v1.0.0 release, then force-push v1 tag to same commit for uses: aeorank/action@v1 compatibility"

patterns-established:
  - "Monorepo action sync: copy action/ directory contents to separate aeorank/action repo for each release"

requirements-completed: [GHA-01]

duration: 1min
completed: 2026-03-15
---

# Phase 7 Plan 02: GitHub Marketplace Publication Checklist Summary

**Step-by-step Marketplace publication guide for aeorank/action@v1 covering separate repo creation, v1.0.0 release, Marketplace listing, v1 major tag, and post-publish verification**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-15T02:46:38Z
- **Completed:** 2026-03-15T02:47:37Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `action/PUBLISHING.md` with complete 5-section Marketplace publication checklist
- Documented the critical monorepo constraint: `action.yml` must be at repo root, requires separate `aeorank/action` repository
- Provided both Option A (separate repo, recommended) and Option B (release branch) paths
- Step-by-step release creation including Marketplace checkbox, categories, release notes template
- `v1` major version tag creation instructions for `uses: aeorank/action@v1` compatibility
- Post-publish verification checklist with consumer test workflow
- Future update instructions for patch/minor/major releases and monorepo sync

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Marketplace publication checklist** — `fe07972` (docs)

**Plan metadata:** (forthcoming)

## Files Created/Modified

- `action/PUBLISHING.md` — Step-by-step Marketplace publication checklist (210 lines)

## Decisions Made

- GitHub Marketplace requires `action.yml` at repo root — monorepo subdirectory cannot be published directly. Option A (separate `aeorank/action` repository) is the recommended and standard pattern.
- The `v1` major version tag must be manually created after `v1.0.0` release to enable `uses: aeorank/action@v1` pinning. This is not automatic.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

This plan produces a documentation-only deliverable. Before `aeorank/action@v1` can be published to GitHub Marketplace, the user must:

1. Create the `github.com/aeorank/action` repository
2. Copy `action/` directory contents to the new repository root
3. Follow `action/PUBLISHING.md` step-by-step

## Next Phase Readiness

- `action/PUBLISHING.md` is ready for the user to follow
- GHA-01 (Marketplace publication) is now documented with a clear execution path
- Remaining Phase 7 plans can proceed in parallel (marketing deploy, docs deploy)

---
*Phase: 07-marketing-content-deployment*
*Completed: 2026-03-15*
