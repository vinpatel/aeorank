# AEOrank

## What This Is

Open-source CLI + SaaS that audits any website for AI visibility, generates all 8 AI-readability files automatically, and provides a dashboard with score history and billing. The CLI is MIT-licensed; the dashboard, monitoring, and agency features are paid.

## Core Value

A developer runs `npx aeorank-cli scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.

## Current State (v1.0 shipped)

- **@aeorank/core**: 12-dimension scoring engine + 8 file generators, 120 tests passing
- **@aeorank/cli**: `npx aeorank-cli scan <url>` with colored output, JSON mode, init command (55 tests)
- **Marketing site**: Astro 5 + Tailwind CSS 4 at aeorank.dev (GitHub Pages)
- **Docs site**: Astro 5 + Starlight at docs.aeorank.dev (17 pages, Pagefind search)
- **GitHub Action**: Composite action posting AEO score as Check Run + PR comment
- **SaaS Dashboard**: Next.js 16 + Clerk auth + Supabase + Stripe billing + QStash async scans
- **Codebase**: 22,459 LOC TypeScript/Astro, 136 commits, 389 files

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

### Active

- [ ] Expand scoring from 12 dimensions to 36 criteria across 5 pillars (Milestone 2)
- [ ] Per-page scoring (0-75 scale) with CLI --page flag
- [ ] ai.txt generator and improved llms-full.txt
- [ ] Weight migration to percentage-based system with coherence + duplication gates

### Out of Scope

- Mobile app — web-first approach, PWA works well
- Browser extension — not core to value prop
- Bulk CSV import — creates queue/abuse problems before PMF
- SSO/SAML — enterprise tier, not needed yet
- On-premise deployment — open-source CLI is the on-premise answer
- Real-time collaborative editing — not needed for generated files
- AI citation tracker — separate product category
- White-label PDF reports — agency tier v2 feature

## Context

- Domain: aeorank.dev
- AEO (Answer Engine Optimization) is an emerging field — websites need to be readable by AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) to get cited in AI-generated answers
- The llms.txt spec (llmstxt.org) is gaining adoption as a standard for AI-readable site descriptions
- GitHub Actions-only integration (no external server, no webhook) is a key differentiator
- Target users: developers (CLI), non-developers (web UI), agencies (dashboard), enterprise (API)
- Milestone 2 focus: Competitive parity with AEO Content Inc — expand from 12 to 36 scoring criteria

## Constraints

- **Tech stack**: pnpm workspaces + Turborepo monorepo, TypeScript throughout
- **CLI runtime**: Node.js 20+, published as @aeorank/cli (npm package name: aeorank-cli)
- **Marketing**: Astro 5 + Tailwind CSS 4 → GitHub Pages, zero JS by default
- **Dashboard**: Next.js 16 App Router → Vercel
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Clerk (native accessToken() integration with Supabase)
- **Payments**: Stripe (Free / Pro $29 / API $99 / Agency $499)
- **Design**: 37signals aesthetic — warm off-white (#FAF9F7), near-black text (#111), Inter font, solid black buttons
- **Performance**: Scan completes in under 30 seconds for 50-page site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| GitHub Actions only (no GitHub App) | Zero external credentials, no webhook server | ✓ Good — simplest CI integration |
| pnpm + Turborepo monorepo | Shared types, atomic deploys | ✓ Good — all packages share @aeorank/core |
| Astro 5 for marketing + docs | Zero JS default, Starlight for docs | ✓ Good — lighthouse 100 scores |
| Next.js 16 for dashboard | App Router, RSC, proxy.ts middleware | ✓ Good — Clerk v6 integration clean |
| Supabase + RLS (no Drizzle ORM) | Managed Postgres, row-level security | ✓ Good — simpler than ORM layer |
| 37signals design aesthetic | Distinctive, warm, anti-SaaS-generic | ✓ Good — clear brand identity |
| Clerk native accessToken() | No JWT templates needed | ✓ Good — cleaner than deprecated approach |
| QStash for async scans | No long-running serverless functions | ✓ Good — reliable scan pipeline |
| Pure @aeorank/core (no I/O) | Determinism across CLI, GHA, dashboard | ✓ Good — same score everywhere |
| aeorank-cli npm package name | Avoids npm name conflicts | ⚠️ Revisit — action.yml must match |

---
*Last updated: 2026-03-28 after v1.0 milestone*
