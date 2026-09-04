# AEOrank

## What This Is

Open-source CLI + SaaS that audits any website for AI visibility across 36 criteria, generates 9 AI-readability files automatically, and provides a dashboard with score history, per-page scoring, and billing. The CLI is MIT-licensed; the dashboard, monitoring, and agency features are paid.

## Core Value

A developer runs `npx aeorank-cli scan <url>` with zero config and gets an AEO score (36 criteria across 5 pillars) plus all 9 generated files needed for AI visibility — in under 30 seconds.

## Current Milestone: v3.0 Developer Parity

**Goal:** Close the developer-surface gaps against Profound, Scrunch, Otterly, Peec, and
AthenaHQ — then launch.

**Target features:**
- Launch blockers cleared: 242 open Dependabot alerts resolved, every published claim measured and true
- Public REST API + scoped API keys (makes the promised $99 API tier real — it does not currently exist)
- MCP server (only Otterly has one in the category, and developers are our audience)
- AI crawler / agent log analytics (Profound, Scrunch, Otterly and AthenaHQ all ship this)
- Alerts: score drop, AI crawler blocked, generated file regression
- CSV / JSON / PDF exports + scheduled delivery (today we ship ZIP only)
- Integrations: Google Search Console, GA4, Vercel, Cloudflare
- Multi-region + multi-language scanning
- Defend the moat: edge middleware for AI-optimised page variants, audit-depth benchmark, publish the scoreboard

**Explicitly NOT in this milestone — Tier 0 monitoring.** Prompt tracking, citation
extraction, share-of-voice, sentiment, and prompt-volume data are what all five
competitors sell. Building them would reverse two locked Out of Scope decisions below,
break the determinism claim the CI story and all V2 marketing copy rest on, and add
per-customer LLM COGS that the $29 Pro tier cannot cover. Sequenced after first real
user feedback so the design is informed by users rather than by cloning five competitors
who are all guessing too. Full reasoning: `.planning/COMPETITIVE-PARITY.md`.

## Current State (v2.0 shipped)

- **@aeorank/core**: 36-criteria scoring engine across 5 pillars with percentage weights, coherence + duplication gates, 9 file generators, per-page scoring (0-75 scale). 288 core tests.
- **@aeorank/cli**: `npx aeorank-cli scan <url>` with pillar-grouped output, `--pillar` filter, `--page` single-page audit, `--format json`. 77 CLI tests.
- **Marketing site**: Astro 5 at aeorank.dev — "36 criteria across 5 pillars" messaging, stacked bar pillar visualization
- **Docs site**: Starlight at docs.aeorank.dev — all 36 criteria documented with weights
- **GitHub Action**: Composite action posting AEO score as Check Run + PR comment
- **SaaS Dashboard**: Next.js 16 with pillar-grouped ScoreBreakdown, expandable per-page scores, Clerk auth, Supabase, Stripe
- **Codebase**: ~36K LOC TypeScript/Astro, 221 commits, 482 files, 637 tests

### Deploy Status
- Marketing + Docs: Code + CI/CD ready, GitHub Pages DNS configuration pending
- Dashboard: Code complete, Clerk/Supabase/Stripe credentials needed
- GitHub Action: Code complete, Marketplace publication pending (see action/PUBLISHING.md)

## Requirements

### Validated

- ✓ CLI scans URLs with zero config — v1.0
- ✓ AEO Score 0-100 across 12 weighted dimensions with letter grades — v1.0
- ✓ Generates 8 files: llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml — v1.0
- ✓ GitHub Action posts AEO score as Check + PR comment using only GITHUB_TOKEN — v1.0
- ✓ Marketing site (Astro 5) on GitHub Pages at aeorank.dev — v1.0
- ✓ Documentation site (Astro 5 + Starlight) at docs.aeorank.dev — v1.0
- ✓ Web dashboard (Next.js 16) with Clerk auth, Stripe subscriptions, score history — v1.0
- ✓ 36 criteria across 5 pillars (Answer Readiness, Content Structure, Trust & Authority, Technical Foundation, AI Discovery) — v2.0
- ✓ Percentage-based weight migration with coherence + duplication score gates — v2.0
- ✓ ai.txt generator + llms-full.txt improvements — v2.0
- ✓ Dashboard/docs/marketing updated for 36 criteria — v2.0
- ✓ Per-page scoring (0-75 scale) with CLI --page flag and API support — v2.0

### Active

- Zero open critical/high Dependabot alerts, and every published claim measured — v3.0
- Public REST API with scoped API keys, quotas, and OpenAPI spec — v3.0
- MCP server exposing scan + results to AI coding agents — v3.0
- AI crawler / agent log analytics from edge logs — v3.0
- Alerts on score drop, crawler block, and generated-file regression — v3.0
- CSV / JSON / PDF exports and scheduled report delivery — v3.0
- Google Search Console, GA4, Vercel, Cloudflare integrations — v3.0
- Multi-region and multi-language scanning — v3.0
- Edge middleware serving AI-optimised page variants (answer to Scrunch AXP) — v3.0
- Public scoreboard of 100 funded startups — v3.0

### Out of Scope

- Mobile app — web-first approach, PWA works well
- Browser extension — not core to value prop
- Bulk CSV import — creates queue/abuse problems before PMF
- SSO/SAML — enterprise tier, not needed yet
- On-premise deployment — open-source CLI is the on-premise answer
- AI citation tracker — separate product category
- White-label PDF reports — agency tier future feature
- LLM-based scoring — must remain deterministic
- Custom weight profiles — standard weights match industry

## Context

- Domain: aeorank.dev
- AEO (Answer Engine Optimization) is an emerging field
- llms.txt spec (llmstxt.org) gaining adoption
- GitHub Actions-only integration is a key differentiator
- Target users: developers (CLI), non-developers (web UI), agencies (dashboard), enterprise (API)
- Now at competitive parity with AEO Content Inc (36 criteria) plus plugin generation advantage

## Constraints

- **Tech stack**: pnpm workspaces + Turborepo monorepo, TypeScript throughout
- **CLI runtime**: Node.js 20+, published as aeorank-cli
- **Marketing**: Astro 5 + Tailwind CSS 4 → GitHub Pages
- **Dashboard**: Next.js 16 App Router → Vercel
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Clerk (native accessToken() with Supabase)
- **Payments**: Stripe (Free / Pro $29 / API $99 / Agency $499)
- **Design**: 37signals aesthetic
- **Performance**: Scan < 30s for 50-page site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| GitHub Actions only (no GitHub App) | Zero external credentials | ✓ Good |
| pnpm + Turborepo monorepo | Shared types, atomic deploys | ✓ Good |
| Astro 5 for marketing + docs | Zero JS default, Starlight | ✓ Good |
| Next.js 16 for dashboard | App Router, RSC, proxy.ts | ✓ Good |
| Supabase + RLS (no ORM) | Managed Postgres, RLS | ✓ Good |
| Pure @aeorank/core (no I/O) | Determinism everywhere | ✓ Good |
| Percentage weights (v2.0) | Finer granularity than high/medium/low | ✓ Good |
| PILLAR_GROUPS in core | Single source of truth for UI/CLI | ✓ Good |
| Server/client split for ScoreBreakdown | Turbopack bundling issue | ✓ Good — avoids playwright in browser |
| Hardcoded dimension names in dashboard | Avoids core import in browser | ⚠️ Revisit — could use shared constants file |
| Developer parity over full parity (v3.0) | Monitoring is a second product with per-customer LLM COGS; developer surface is cheap, on-identity, and uncontested | ⏳ In progress |
| Launch blockers folded in as Phase 17 | 242 open alerts + false "0 alerts" claim in LAUNCH.md would undo the parity work on launch day | ⏳ In progress |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-08-15 at start of v3.0 Developer Parity milestone*
