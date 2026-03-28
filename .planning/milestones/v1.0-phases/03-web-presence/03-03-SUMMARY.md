# Plan 03-03 Summary: Homepage Content + Terminal Demo

## Status: Complete

## What was built
All 7 homepage content sections with production copy (37signals-style) and an interactive Preact terminal demo that auto-plays when scrolled into view.

## Key files created
- `apps/marketing/src/components/Hero.astro` — Headline + CTAs + terminal demo
- `apps/marketing/src/components/TerminalDemo.tsx` — Preact island with typing animation
- `apps/marketing/src/components/HowItWorks.astro` — 3-step scan/score/generate
- `apps/marketing/src/components/FilesList.astro` — 8 files grid
- `apps/marketing/src/components/ScoringExplainer.astro` — 12 dimensions + grades
- `apps/marketing/src/components/Pricing.astro` — 4 tiers with prices
- `apps/marketing/src/components/FAQ.astro` — 7 questions, native details/summary
- `apps/marketing/src/components/CTASection.astro` — Final CTA

## Verification
- `pnpm build` succeeds
- Terminal demo JS: 3.88KB (1.57KB gzipped) — only JS on the page
- FAQ uses HTML `<details>/<summary>` — zero JavaScript
- Pricing shows Free/$29/$99/$499 tiers

## Decisions
- Terminal demo loops: types command, shows output, pauses 4s, restarts
- Used inline styles for terminal demo (isolated from Tailwind)
- "Coming Soon" pricing tiers have muted styling + disabled buttons
- FAQ accordion uses CSS rotation for +/x indicator

---
*Plan: 03-03 | Phase: 03-web-presence*
