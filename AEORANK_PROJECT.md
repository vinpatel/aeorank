# AEOrank

## Vision
Open-source CLI + SaaS that audits any website or GitHub repo for AI visibility, generates all required AI-readability files automatically, and provides ongoing monitoring. The GitHub integration is 100% native — it runs entirely on GitHub Actions runners using GITHUB_TOKEN, with no external servers required.

## One-liner
> "Run one command. Get cited by ChatGPT, Perplexity, and Claude."

## What it does
- Scans any URL or local project directory
- Scores AI readability across 12 dimensions (AEO Score 0–100)
- Generates 8 files: llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml
- Posts AEO score as a GitHub Check directly in PRs (via GitHub Actions, GITHUB_TOKEN)
- Posts score comparison table as a PR comment (upsert, not spam)
- Provides a web dashboard for ongoing monitoring
- Integrates with 10 CMS platforms and 10 web frameworks

## Core philosophy
- Zero config default. `npx aeorank scan https://site.com` works immediately
- GitHub native first. The Action uses only GITHUB_TOKEN — no app registration, no external webhook server, no Cloudflare
- Automation first. A non-developer pastes a URL, downloads a ZIP, uploads files. Done.
- Open core. CLI is MIT. Dashboard monitoring and agency features are paid.

## Tech stack decisions
- Monorepo: pnpm workspaces + Turborepo
- CLI: TypeScript, Node 20+, published as @aeorank/cli
- GitHub Action: @actions/core + @actions/github, runs on ubuntu-latest
- Marketing site: Astro 4 → GitHub Pages via GitHub Actions
- Dashboard: Next.js 15 App Router → Vercel
- Database: Supabase (PostgreSQL + Drizzle ORM)
- Auth: Clerk
- Payments: Stripe
- Email: Resend
- Jobs: Trigger.dev
- Docs: Astro + Starlight → GitHub Pages

## Design aesthetic
37signals (Basecamp, HEY, Once) + Gumroad: warm off-white (#FAF9F7), near-black text (#111), no gradients, no glassmorphism, editorial typography (Inter body, large confident headlines), solid black buttons, real terminal-style code blocks.

## Target users
1. Developer — runs npx aeorank scan in terminal
2. Non-developer / solo founder — pastes URL in web UI, downloads ZIP
3. Agency — manages 10–50 client sites from dashboard
4. Enterprise — API access, CI integration
