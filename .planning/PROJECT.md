# AEOrank

## What This Is

Open-source CLI + SaaS that audits any website for AI visibility across 36 criteria, generates 9 AI-readability files automatically, and provides a dashboard with score history, per-page scoring, and billing. The CLI is MIT-licensed; the dashboard, monitoring, and agency features are paid.

## Core Value

A developer runs `npx aeorank-cli scan <url>` with zero config and gets an AEO score (36 criteria across 5 pillars) plus all 9 generated files needed for AI visibility — in under 30 seconds.

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

(None — planning next milestone)

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

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-28 after v2.0 milestone*
