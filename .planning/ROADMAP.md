# Roadmap: AEOrank

## Overview

From a shared scan engine to a full SaaS product: Phase 1 builds the `@aeorank/core` library that everything else depends on — scanner, scorer, and all 8 file generators. Phase 2 wraps that engine in a CLI published to npm. Phase 3 ships the marketing and docs sites that create credibility before asking anyone to pay. Phase 4 delivers the GitHub Action that makes AEOrank the only CI-native AEO tool. Phase 5 completes the product with the authenticated SaaS dashboard, score history, and Stripe billing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Core Engine** - Monorepo + shared scan/score/generate library that all other surfaces depend on
- [x] **Phase 2: CLI** - `npx aeorank scan <url>` published to npm as MIT; primary developer acquisition channel
- [x] **Phase 3: Web Presence** - Marketing site at aeorank.dev and docs at docs.aeorank.dev
- [ ] **Phase 4: GitHub Action** - Composite CI action posting AEO score as Check + PR comment with zero external credentials
- [ ] **Phase 5: SaaS Dashboard** - Authenticated Next.js 16 dashboard with score history, file downloads, and Stripe billing

## Phase Details

### Phase 1: Core Engine
**Goal**: The shared `@aeorank/core` library is complete, tested, and deterministic — any URL produces an AEO score and all 8 generated files via a pure TypeScript package with no I/O side effects
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, SCAN-01, SCAN-02, SCAN-03, SCAN-04, SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, GEN-07, GEN-08
**Success Criteria** (what must be TRUE):
  1. Running `pnpm build` from the repo root compiles all packages with zero errors via Turborepo
  2. A developer can call `core.scan(url)` in a Node.js script and receive an AEO score 0-100 with 12 dimension breakdowns and letter grade in under 30 seconds for a 50-page site
  3. The same URL scanned twice produces the same score (determinism test passes in CI)
  4. Calling `core.generateFiles(scanResult)` returns all 8 files (llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml) as strings
  5. Biome linting passes with zero warnings across all packages
**Plans**: TBD

### Phase 2: CLI
**Goal**: Developers can run `npx aeorank scan <url>` with zero config and get a scored AEO report with generated files in their working directory
**Depends on**: Phase 1
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05
**Success Criteria** (what must be TRUE):
  1. `npx aeorank scan https://example.com` completes in under 30 seconds and prints a colored score table with dimension breakdown and next-step recommendations
  2. `npx aeorank scan https://example.com --format json` outputs valid JSON to stdout that can be piped to other tools
  3. `npx aeorank init` creates an `aeorank.config.js` file in the current directory with sensible defaults
  4. Every error displayed in the terminal includes a specific next-action suggestion (not a generic error message)
  5. Failed checks in the output are ranked High/Medium/Low so developers know what to fix first
**Plans**: 3/3 complete (02-01, 02-02, 02-03)

### Phase 3: Web Presence
**Goal**: aeorank.dev and docs.aeorank.dev are live, discoverable, and give developers and non-developers everything they need to understand and adopt AEOrank before the dashboard exists
**Depends on**: Phase 2
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05
**Success Criteria** (what must be TRUE):
  1. aeorank.dev loads at the GitHub Pages URL with hero, terminal demo, how-it-works, generated files list, scoring explainer, pricing table, FAQ, and CTA sections
  2. The marketing site renders with zero JavaScript by default (Lighthouse JS payload = 0 for non-interactive pages)
  3. docs.aeorank.dev serves a working Starlight site with getting-started guide, CLI reference, all 8 file format docs, and the 12-dimension scoring explainer
  4. A developer reading the docs can go from zero to a working `npx aeorank scan` in under 5 minutes following the quick-start guide
**Plans**: 4/4 complete (03-01, 03-02, 03-03, 03-04)

### Phase 4: GitHub Action
**Goal**: Any GitHub repository can add AEOrank to CI and get AEO scores posted as a Check Run and PR comment using only the built-in `GITHUB_TOKEN` — no external credentials required
**Depends on**: Phase 2
**Requirements**: GHA-01, GHA-02, GHA-03, GHA-04, GHA-05
**Success Criteria** (what must be TRUE):
  1. Adding the action to a workflow with only `GITHUB_TOKEN` posts an AEO score as a GitHub Check (pass/neutral/fail) with dimension table on every push
  2. Opening a pull request that affects AEO score generates a PR comment with a score table; re-running never posts a second comment (upserts in place)
  3. Setting `fail-below: 70` causes the Check to fail when the AEO score drops below 70
  4. The action is installable from the GitHub Marketplace as `aeorank/action@v1`
**Plans**: TBD

### Phase 5: SaaS Dashboard
**Goal**: Users can sign in, add a site by URL, view their AEO score history, download all generated files in a ZIP, and subscribe to a paid plan — the complete SaaS product is live
**Depends on**: Phase 3, Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. A user can sign up with Clerk, add a URL, trigger a scan, and see their AEO score with 12-dimension breakdown on the dashboard
  2. A returning user can view a 30-day sparkline chart showing how their score has changed over time
  3. A user can click "Download files" and receive a ZIP containing all 8 generated files for their site
  4. A user can upgrade from Free to Pro ($29) via Stripe and be granted the corresponding access without manual intervention
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Engine | 0/TBD | Not started | - |
| 2. CLI | 3/3 | Complete | 2026-03-14 |
| 3. Web Presence | 4/4 | Complete | 2026-03-14 |
| 4. GitHub Action | 0/TBD | Not started | - |
| 5. SaaS Dashboard | 0/TBD | Not started | - |
