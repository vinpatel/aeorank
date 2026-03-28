---
phase: 07-marketing-content-deployment
plan: 01
subsystem: marketing-site
tags: [content, copy, astro, links, pricing]
dependency_graph:
  requires: []
  provides: [accurate-marketing-copy, dashboard-links]
  affects: [apps/marketing/src/components]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - apps/marketing/src/components/Pricing.astro
    - apps/marketing/src/components/FAQ.astro
    - apps/marketing/src/components/Nav.astro
    - apps/marketing/src/components/Footer.astro
    - apps/marketing/src/components/CTASection.astro
decisions:
  - "Dashboard links use https://app.aeorank.dev (no trailing slash) consistently"
  - "Paid tier CTAs use available: true to render as real anchor links not disabled spans"
metrics:
  duration: 64s
  completed_date: "2026-03-14"
  tasks_completed: 2
  files_modified: 5
---

# Phase 7 Plan 1: Marketing Content — Stale Copy Removal Summary

Updated five marketing site components to replace stale "Coming Soon" copy with accurate product state — dashboard links, available pricing tiers, and shipped GitHub Action reference.

## What Was Done

Five Astro components updated to reflect the shipped product (web dashboard at app.aeorank.dev, GitHub Action aeorank/action@v1):

- **Pricing.astro**: Three paid tiers (Pro $29, API $99, Agency $499) set to `available: true`, `cta: "Start Free Trial"`, `ctaLink: "https://app.aeorank.dev"`. Template markup untouched; only frontmatter data values changed.
- **FAQ.astro**: "Is AEOrank free?" — removed "(coming soon)", added "score history, charts, and file downloads". "Can I use this in CI?" — replaced coming-soon with explicit aeorank/action@v1 reference.
- **Nav.astro**: "Dashboard" regular nav link added after "Pricing" in center nav div.
- **Footer.astro**: "Dashboard" link added as final item in Product column ul.
- **CTASection.astro**: "Open Dashboard ->" tertiary plain-text link added after the two existing CTAs.

## Verification Results

1. Zero instances of "coming soon" (case-insensitive) in any marketing component — PASS
2. Zero instances of "Coming Soon" in any marketing component — PASS
3. app.aeorank.dev present in Nav (1), Footer (1), CTASection (1), Pricing (3) — PASS
4. `pnpm --filter marketing build` — 1 page built in 534ms, zero errors — PASS

## Deviations from Plan

None — plan executed exactly as written.

## Commits

- `3386988` feat(07-01): update Pricing and FAQ data arrays with shipped product state
- `2e44793` feat(07-01): add Dashboard links to Nav, Footer, and CTASection

## Self-Check

- [x] apps/marketing/src/components/Pricing.astro — modified
- [x] apps/marketing/src/components/FAQ.astro — modified
- [x] apps/marketing/src/components/Nav.astro — modified
- [x] apps/marketing/src/components/Footer.astro — modified
- [x] apps/marketing/src/components/CTASection.astro — modified
- [x] commits 3386988 and 2e44793 exist
