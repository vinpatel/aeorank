# AEOrank

## What This Is

Open-source CLI + SaaS that audits any website or GitHub repo for AI visibility, generates all required AI-readability files automatically, and provides ongoing monitoring. Run one command, get cited by ChatGPT, Perplexity, and Claude. The CLI is MIT-licensed; the dashboard, monitoring, and agency features are paid.

## Core Value

A developer runs `npx aeorank scan <url>` with zero config and gets an AEO score plus all 8 generated files needed for AI visibility — in under 30 seconds.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] CLI scans URLs and local directories with zero config
- [ ] AEO Score 0-100 across 12 weighted dimensions with letter grades
- [ ] Generates 8 files: llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml
- [ ] GitHub Action posts AEO score as Check and PR comment using only GITHUB_TOKEN
- [ ] Marketing site (Astro 4) on GitHub Pages at aeorank.dev
- [ ] Documentation site (Astro + Starlight) at docs.aeorank.dev
- [ ] Web dashboard (Next.js 15) with Clerk auth, Stripe subscriptions, score history
- [ ] CMS and framework integration guides

### Out of Scope

- Mobile app — web-first
- Browser extension — not core to value prop
- Bulk CSV import — v2 feature
- SSO/SAML — enterprise tier, not v1
- On-premise deployment — SaaS only
- Real-time collaborative editing — not needed for generated files
- GitHub App (Probot webhook server) — v2, GitHub Actions covers v1
- AI citation tracker — v2 feature
- White-label PDF reports — v2 agency feature

## Context

- Domain: aeorank.dev
- AEO (Answer Engine Optimization) is an emerging field — websites need to be readable by AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) to get cited in AI-generated answers
- The llms.txt spec (llmstxt.org) is gaining adoption as a standard for AI-readable site descriptions
- GitHub Actions-only integration (no external server, no webhook) is a key differentiator — zero friction for developers
- Target users: developers (CLI), non-developers (web UI paste-and-download), agencies (dashboard), enterprise (API)

## Constraints

- **Tech stack**: pnpm workspaces + Turborepo monorepo, TypeScript throughout
- **CLI runtime**: Node.js 20+, published as @aeorank/cli
- **Marketing**: Astro 4 → GitHub Pages, zero JS by default
- **Dashboard**: Next.js 15 App Router → Vercel
- **Database**: Supabase (PostgreSQL + Drizzle ORM)
- **Auth**: Clerk
- **Payments**: Stripe (Free / Pro $29 / API $99 / Agency $499)
- **Design**: 37signals/Gumroad aesthetic — warm off-white (#FAF9F7), near-black text (#111), no gradients, no glassmorphism, Inter body font, solid black buttons
- **Performance**: Scan completes in under 30 seconds for 50-page site

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| GitHub Actions only (no GitHub App) | Zero external credentials, no webhook server, simpler for users | — Pending |
| pnpm + Turborepo monorepo | All packages in one repo, shared types, atomic deploys | — Pending |
| Astro for marketing + docs | Zero JS default, Starlight for docs, GitHub Pages hosting | — Pending |
| Next.js 15 for dashboard | App Router, React Server Components, Vercel deployment | — Pending |
| Supabase + Drizzle | Managed Postgres, type-safe ORM, real-time subscriptions | — Pending |
| 37signals design aesthetic | Distinctive, warm, anti-SaaS-generic, editorial feel | — Pending |

---
*Last updated: 2026-03-14 after initialization*
