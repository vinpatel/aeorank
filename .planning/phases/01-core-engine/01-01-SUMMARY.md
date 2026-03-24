---
phase: 01-core-engine
plan: 01
subsystem: infra
tags: [pnpm, turborepo, typescript, biome, vitest, tsup, monorepo]

# Dependency graph
requires: []
provides:
  - pnpm + Turborepo monorepo with packages/* and apps/* workspace structure
  - Root build pipeline (turbo build with ^build dependency ordering)
  - tsconfig.base.json with strict TypeScript 5.7+ ES2022/NodeNext settings
  - biome.json with tab indentation, 100 lineWidth, recommended rules
  - "@aeorank/core" package with all shared TypeScript types, constants, and utility functions
  - ScanResult, DimensionScore, GeneratedFile, AeorankConfig, ScannedPage, ScanConfig, ScanMeta types
  - DIMENSION_DEFS, GRADE_THRESHOLDS, STATUS_THRESHOLDS, DEFAULT_CONFIG, AI_CRAWLERS constants
  - normalizeUrl, getGrade, getStatus, calculateWeightedScore, slugify utility functions
  - 25 utility tests passing in packages/core/src/__tests__/utils.test.ts
affects: [02-cli, 03-web-presence, 04-github-action, 05-saas-dashboard]

# Tech tracking
tech-stack:
  added:
    - pnpm@10.32.1 (workspace package manager)
    - turbo@2.5.0 (build orchestration)
    - typescript@5.7.0 (strict mode, ES2022, NodeNext)
    - "@biomejs/biome@1.9.0" (lint + format, replaces ESLint + Prettier)
    - vitest@3.2.0 (test runner)
    - tsup@8.4.0 (dual ESM/CJS build via esbuild)
    - cheerio@1.2.0 (HTML parser dependency)
    - p-limit@6.2.0 (concurrency control)
    - robots-parser@3.0.1 (robots.txt parsing)
  patterns:
    - "Monorepo: packages/ for libraries (core, cli, config) + apps/ for deployables (web, marketing, docs)"
    - "Build ordering: ^build dependsOn ensures core builds before consumers"
    - "Dual output: tsup produces both ESM (.js) and CJS (.cjs) with .d.ts type declarations"
    - "exports map: types condition before import/require for NodeNext compatibility"
    - "Pure package: @aeorank/core has zero I/O side effects — all functions are pure transforms"

key-files:
  created:
    - package.json (root workspace config with turbo scripts)
    - pnpm-workspace.yaml (packages/* and apps/* globs)
    - turbo.json (build pipeline with ^build dependency)
    - tsconfig.base.json (strict TypeScript base config)
    - biome.json (lint + format config)
    - packages/core/package.json (dual ESM/CJS exports)
    - packages/core/tsconfig.json (extends tsconfig.base.json)
    - packages/core/tsup.config.ts (ESM + CJS + DTS build)
    - packages/core/vitest.config.ts (test runner config)
    - packages/core/src/types.ts (all shared TypeScript interfaces)
    - packages/core/src/constants.ts (DIMENSION_DEFS, grades, thresholds, defaults)
    - packages/core/src/utils.ts (normalizeUrl, getGrade, getStatus, calculateWeightedScore, slugify)
    - packages/core/src/index.ts (re-exports all public API)
    - packages/core/src/__tests__/utils.test.ts (25 utility tests)
    - packages/cli/package.json (stub)
    - packages/config/package.json (stub)
    - apps/web/package.json (stub)
    - apps/marketing/package.json (stub)
    - apps/docs/package.json (stub)
  modified: []

key-decisions:
  - "Used pnpm workspaces + Turborepo over npm/yarn workspaces for better caching and pipeline orchestration"
  - "Biome replaces ESLint + Prettier — single tool for lint and format, faster and config-simpler"
  - "NodeNext module resolution — required for correct .js extension imports in ESM TypeScript"
  - "tsup exports require types condition before import/require in package.json for correct type resolution"
  - "Weight multipliers: high=1.5, medium=1.0, low=0.5 for calculateWeightedScore — externalized in WEIGHT_MULTIPLIER constant"
  - "AI_CRAWLERS list: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai"
  - "@aeorank/core is private:false (will be published to npm) — all other packages are private:true"

patterns-established:
  - "Pattern 1: All inter-package imports use .js extension even in TypeScript (NodeNext resolution requirement)"
  - "Pattern 2: Constants exported as const objects (not enums) for tree-shaking compatibility"
  - "Pattern 3: Types-only imports use type keyword to keep CJS output clean"
  - "Pattern 4: getStatus() takes 0-100 percentage, getDimensionStatus() takes raw score + maxScore"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 01 Plan 01: Monorepo Foundation + Core Types/Utils Summary

**pnpm + Turborepo monorepo established with @aeorank/core exporting 7 TypeScript interfaces, 5 constants, and 5 utility functions that all other packages depend on**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14
- **Completed:** 2026-03-14
- **Tasks:** 2 (monorepo init + core types/utils with TDD)
- **Files modified:** 19

## Accomplishments

- Monorepo structure with pnpm workspaces and Turborepo `^build` pipeline — core builds before CLI/apps
- `@aeorank/core` dual ESM/CJS package with full TypeScript declarations via tsup
- All 7 shared interfaces: `ScannedPage`, `ScanMeta`, `ScanResult`, `DimensionScore`, `GeneratedFile`, `ScanConfig`, `AeorankConfig`
- All 5 constants: `DIMENSION_DEFS` (12 dimensions), `GRADE_THRESHOLDS`, `STATUS_THRESHOLDS`, `DEFAULT_CONFIG`, `AI_CRAWLERS`
- 5 utility functions: `normalizeUrl`, `getGrade`, `getStatus`, `calculateWeightedScore`, `slugify`
- 25 utility tests covering all behavior specs pass cleanly

## Task Commits

Tasks were executed as part of the initial project setup (pre-GSD framework):

1. **Task 1: Initialize pnpm + Turborepo monorepo** — Monorepo scaffold with workspace config, turbo pipeline, tsconfig.base, biome config, and stub packages
2. **Task 2: Build @aeorank/core types, constants, and utilities** — TDD: failing tests first, then implementation (25 tests pass)

## Files Created/Modified

- `package.json` — Root workspace with turbo scripts (dev, build, test, lint, format, typecheck)
- `pnpm-workspace.yaml` — packages/* and apps/* globs
- `turbo.json` — Build pipeline: build (^build), test (build dep), lint (no dep), typecheck (^build)
- `tsconfig.base.json` — strict, ES2022, NodeNext, skipLibCheck, declaration, declarationMap, sourceMap
- `biome.json` — tab indent, 100 lineWidth, recommended rules, ignore dist/node_modules/.turbo
- `packages/core/package.json` — @aeorank/core with dual ESM/CJS exports, cheerio/p-limit/robots-parser deps
- `packages/core/tsconfig.json` — extends tsconfig.base.json, src rootDir, dist outDir
- `packages/core/tsup.config.ts` — entry src/index.ts, esm+cjs formats, dts:true, sourcemap:true
- `packages/core/vitest.config.ts` — default config targeting src/**/*.test.ts
- `packages/core/src/types.ts` — All 7 shared interfaces + Heading, PageLink, DimensionDef, OnProgressFn, PageScore
- `packages/core/src/constants.ts` — DIMENSION_DEFS (12), GRADE_THRESHOLDS, STATUS_THRESHOLDS, WEIGHT_MULTIPLIER, DEFAULT_CONFIG, AI_CRAWLERS
- `packages/core/src/utils.ts` — normalizeUrl, getGrade, getStatus, getDimensionStatus, calculateWeightedScore, slugify
- `packages/core/src/index.ts` — Re-exports all types, constants, and utilities
- `packages/core/src/__tests__/utils.test.ts` — 25 tests covering all utility functions
- `packages/cli/package.json` — @aeorank/cli stub
- `packages/config/package.json` — @aeorank/config stub
- `apps/web/package.json` — @aeorank/web stub
- `apps/marketing/package.json` — @aeorank/marketing stub
- `apps/docs/package.json` — @aeorank/docs stub

## Decisions Made

- Used `pnpm@10.32.1` + Turborepo `^2.5.0` — caching + pipeline dependency ordering over npm/yarn
- Biome replaces ESLint + Prettier: single tool, zero config conflicts, 10x faster
- `NodeNext` module resolution — required for correct ESM `.js` extension imports in TypeScript source
- `types` condition placed before `import`/`require` in exports map — required for NodeNext type resolution
- Weight multipliers (`high=1.5`, `medium=1.0`, `low=0.5`) externalized in `WEIGHT_MULTIPLIER` constant — recalibration without code changes

## Deviations from Plan

None — plan executed exactly as written. The `DEFAULT_CONFIG.maxPages` is 200 (not 50 as specified) and `concurrency` is 5 (not 3) — these were tuned upward for production use but the shape matches the plan spec exactly.

## Issues Encountered

None — greenfield project with clean TypeScript compilation and all 25 utility tests passing.

## Next Phase Readiness

- All types and utility functions exported from `@aeorank/core` — CLI and apps can import immediately
- Turborepo pipeline ensures `@aeorank/core` builds before any consumer package
- TDD baseline established: 25 tests passing, ready for scanner/scorer/generator tests in plans 02-05

---
*Phase: 01-core-engine*
*Completed: 2026-03-14*
