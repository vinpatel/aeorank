# Project Research Summary

**Project:** AEOrank — AEO CLI Scanner + SaaS Dashboard
**Domain:** Answer Engine Optimization (AEO) tooling — website audit, AI readability scoring, and AI-optimized file generation
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH

## Executive Summary

AEOrank is a technical audit tool that occupies a genuinely empty niche: every existing AEO/GEO competitor (HubSpot AEO Grader, Otterly, Profound, Scrunch) is a monitoring and analytics product that tells you whether AI engines cite your brand. None of them generate the actual files that make a website AI-readable. AEOrank's core competitive moat is file generation — producing all 8 AI-readability files (llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml) from a scan. The recommended approach is a Turborepo monorepo with a shared `@aeorank/core` scan engine that runs identically in the open-source CLI, the GitHub Action, and the SaaS dashboard API — ensuring score consistency across all surfaces.

The recommended technology choices are well-established and high-confidence: Next.js 16 (current stable, October 2025) for the dashboard, Astro 5.x for marketing and docs, pnpm + Turborepo for the monorepo, Drizzle ORM + Supabase for data, Clerk for auth, and Stripe for billing. The CLI should use Commander.js with cheerio as the primary HTML parser (fast, static pages), with Playwright loaded lazily only for JS-heavy pages. The architecture decision to extract scan logic into a pure `@aeorank/core` package — with no I/O side effects — is essential: it enables the CLI, GitHub Action, and SaaS scan API to score the same URL identically, which is a baseline user trust requirement.

The top risks are security-critical and must be addressed before any public access: SSRF via user-supplied scan URLs (the SaaS API accepts a URL and fetches it server-side, which is an AWS metadata endpoint attack vector without IP validation), Supabase RLS being disabled on new tables by default (every user-data table needs explicit `ENABLE ROW LEVEL SECURITY`), and Stripe webhook non-idempotency (Stripe retries on failures and the handler must deduplicate on `event.id`). Score instability is a product-trust risk: scoring must weight structural, deterministic signals at 80%+ and must not use raw TTFB as a direct multiplier. All five critical pitfalls are well-documented and preventable with specific code patterns — they are engineering discipline issues, not research gaps.

## Key Findings

### Recommended Stack

The monorepo runs on pnpm 9.x + Turborepo 2.8.x, which is the 2026 standard for this scale (3 apps, ~4 shared packages). TypeScript 5.7+ is required throughout. The CLI is built on Commander.js 14 for argument parsing, cheerio 1.x for static HTML parsing (the fast path covering ~80% of pages), and Playwright 1.4x as a lazy-loaded fallback for JS-heavy pages only — loading Playwright for every scan adds ~300MB to the package and 2-4 seconds per page. esbuild bundles the CLI to a single JS file for distribution; tsx handles dev-time execution.

The dashboard runs Next.js 16 (not 15 as previously planned — Next.js 16 is current stable and `middleware.ts` is now `proxy.ts`), with Clerk for auth, Supabase + Drizzle ORM for the database, and Stripe for subscriptions. Supabase is preferred over Neon or PlanetScale because it provides Postgres, Realtime subscriptions (live score updates), and Storage (generated file downloads) in one managed service. Drizzle ORM's 7.4kb bundle vs Prisma's ~25MB makes it the only viable choice for a shared package used by both CLI and dashboard. The marketing site is Astro 5.18.x (not 6, which is still beta); docs use Astro + Starlight 0.37.x.

**Core technologies:**
- **pnpm + Turborepo:** Monorepo package management and build caching — fastest CI, simplest config for this scale
- **Next.js 16 + React 19.2:** Dashboard framework — current stable, Turbopack default, React Compiler enabled
- **Clerk @clerk/nextjs 7.x:** Auth — explicit Next.js 16 support including `proxy.ts` awareness; richer than Supabase Auth
- **Drizzle ORM 0.45.x + Supabase:** Database layer — 7.4kb bundle fits CLI; Supabase adds Realtime and Storage
- **Stripe 20.x:** Subscriptions — use Stripe Customer Portal to avoid building billing UI
- **Astro 5.18.x + Starlight 0.37.x:** Marketing and docs — zero JS by default, best-in-class docs framework
- **Commander.js 14 + cheerio 1.x:** CLI parsing and fast HTML scraping — cover the static-page majority without browser overhead
- **Biome:** Linting + formatting — replaces ESLint + Prettier; Next.js 16 removed `next lint`

### Expected Features

**Must have (table stakes — v1 launch):**
- `npx aeorank scan <url>` in under 30 seconds — core user promise
- AEO score 0–100 across 12 weighted dimensions with letter grades — anchor metric
- Robots.txt AI crawler check (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) — high surprise value, low complexity
- Schema markup validation (Organization, FAQPage, Article, Author) — #1 citation-likelihood lever
- llms.txt presence and structure check (per llmstxt.org spec) — growing standard
- Content structure analysis (heading hierarchy, answer-first, FAQ detection) — 2.8x citation likelihood for sequential H1-H3
- E-E-A-T signal detection (named authors, About page, credential links, publication dates)
- Actionable fix recommendations ranked High/Medium/Low per failed check
- File generation (all 8 files) — primary competitive moat; no competitor does this
- Web UI paste-and-download — non-developer acquisition with zero friction
- Marketing site (Astro) and docs site (Starlight) — needed for organic discovery and credibility

**Should have (competitive differentiators — v1.x):**
- GitHub Action — posts AEO score as GitHub Check + PR comment using only `GITHUB_TOKEN`
- Score history and trend charts — enables agencies to show ROI; requires Clerk + Supabase
- Local directory scanning — `aeorank scan ./` for pre-deploy CI use; no competitor does this
- Framework integration guides (Next.js, Astro, WordPress, Shopify)
- Full SaaS dashboard with Clerk auth and Stripe subscriptions

**Defer (v2+):**
- AI citation tracker / live monitoring — requires LLM API polling budget; different product category
- Agency multi-client dashboard — requires multi-site data model; targets $499/mo tier
- White-label PDF reports — PDF rendering pipeline; agency-tier feature
- Bulk CSV import — defer until API tier has traction
- SSO/SAML — enterprise gate
- Browser extension — separate distribution pipeline; web UI covers 90% of the use case

### Architecture Approach

The architecture centers on `@aeorank/core` as a pure TypeScript package with no I/O side effects — scan, score, and generateFiles all live here. Both the CLI and the dashboard's API route import core directly; the CLI adds terminal output and file I/O on top. This shared-core pattern is the critical architectural decision: it guarantees score consistency across CLI, GitHub Action, and dashboard, which is a baseline trust requirement for users. The CLI works entirely offline by default; when `AEORANK_API_KEY` is set, it POSTs results to the dashboard API. The SaaS scan API runs the same core engine but must use async job queuing (not inline API response) for large sites to avoid Vercel's 30-second function timeout.

**Major components:**
1. **`@aeorank/core`** — Pure scan engine, scorer, file generators, shared types. No I/O. Used by CLI and API route.
2. **`@aeorank/cli`** — Commander.js wrapper around core. Handles terminal UX, file writing, `--json` output flag, optional cloud sync. Published to npm as MIT.
3. **`apps/web` (Next.js 16 dashboard)** — Auth'd SaaS with App Router, Clerk middleware in `proxy.ts`, Supabase + Drizzle for persistence, Stripe webhooks for subscription lifecycle.
4. **`apps/marketing` (Astro 5.x)** — Zero-JS marketing site on GitHub Pages.
5. **`apps/docs` (Astro + Starlight)** — Developer documentation at docs.aeorank.dev.
6. **GitHub Action** — Composite action (not Docker/JS). Shells to `npx @aeorank/cli`. Posts Check + PR comment via `GITHUB_TOKEN`. No external server.
7. **Supabase** — PostgreSQL via Drizzle ORM, Realtime subscriptions for live score updates, Storage for generated file downloads.

**Build order is enforced by Turborepo:** `packages/config` → `packages/core` → `packages/cli` → `apps/web` → `apps/marketing` / `apps/docs` (parallel).

### Critical Pitfalls

1. **SSRF via user-supplied URLs** — The SaaS scan API calls `fetch(userUrl)` server-side. Without IP validation, attackers hit AWS metadata, Redis, or internal VPC hosts. Prevention: validate DNS resolution against RFC 1918 / loopback / link-local ranges before any fetch; disallow non-HTTPS schemes; use `ssrf-req-filter`; run scan workers with no internal network access. Treat as a launch blocker.

2. **Supabase RLS disabled by default** — Every new Postgres table created via migration has RLS off. Without explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` plus user policies, any authenticated user can read all other users' scan history through Supabase's PostgREST API. Prevention: add RLS enable to every migration; maintain two Drizzle clients (`adminDb` with service role, `clientDb` with user JWT); test policies exclusively via the JS SDK (never SQL Editor, which bypasses RLS).

3. **Stripe webhook non-idempotency** — Stripe retries delivery for up to 3 days on any failure. Without deduplication on `event.id`, duplicate processing causes double-provisioning, billing errors, and unique-constraint violations. Prevention: store `event.id` in a `stripe_events` table with a unique constraint; return 200 immediately and queue work asynchronously; respond within 5 seconds.

4. **AEO score instability across runs** — Variable signals (TTFB, A/B-tested page variants, CDN edge variance) cause score drift that destroys user trust and creates CLI/dashboard inconsistency. Prevention: weight structural, deterministic signals at 80%+; use median of 3 fetches for performance signals; cache fetched page content for the session; pin scoring algorithm version in output.

5. **Crawl rate overload** — Default concurrent fetching overwhelms small/shared-hosting targets, triggering WAF blocks and producing false scan errors. Prevention: default concurrency of 3 req/sec with exponential backoff on 429/503; set `User-Agent: AEOrank/1.0 (+https://aeorank.dev)`; respect `Crawl-delay` from robots.txt; cap at 50 pages per CLI run.

## Implications for Roadmap

Based on the feature dependency graph and architectural build order, six phases are recommended:

### Phase 1: Monorepo Foundation + Core Engine
**Rationale:** Everything depends on `@aeorank/core` being stable. Build order is non-negotiable: config → core → everything else. The scan engine is the product; all other phases are interfaces on top of it.
**Delivers:** Working `pnpm + Turborepo` monorepo; `@aeorank/core` with scanner (cheerio + lazy Playwright), scorer (12 dimensions), and all 8 file generators; shared TypeScript types; full Vitest test suite for score determinism.
**Addresses:** CLI scan by URL, AEO score 0–100, file generation (all 8 files), robots.txt check, schema validation, llms.txt check, content structure, E-E-A-T detection, FAQ detection.
**Avoids:** Score instability (design determinism into scoring from day one), crawl rate overload (add rate limiting and User-Agent to core crawler), score divergence between CLI and dashboard (single shared engine).

### Phase 2: CLI Package + npm Publish
**Rationale:** The CLI is the primary acquisition channel for developer users and the prerequisite for the GitHub Action. Publishing to npm early enables real-world testing before the dashboard is built.
**Delivers:** `@aeorank/cli` published as MIT to npm; `npx aeorank scan <url>` completing in under 30 seconds; `--json` output flag; actionable fix recommendations ranked by priority; spinner, color output, and per-page error reporting; `aeorank generate` command for on-demand file generation.
**Uses:** Commander.js 14, chalk 5, ora 8, esbuild (production bundle), tsx (dev).
**Avoids:** npx cold start bloat (minimize CLI deps, target under 5MB install), silent exit on redirect loops (log per-page errors to stderr), generated files silently overwriting user edits (require `--overwrite` flag).

### Phase 3: Marketing Site + Docs
**Rationale:** Organic discovery and credibility are needed before any SaaS sign-up flow. The docs explaining the 8 generated files and scoring model reduce support burden for all future phases. These can be built in parallel with Phase 2's CLI work.
**Delivers:** `aeorank.dev` marketing site on Astro 5.x deployed to GitHub Pages; `docs.aeorank.dev` on Astro + Starlight; documentation covering the scoring model, file formats, and CLI usage.
**Uses:** Astro 5.18.x, Starlight 0.37.x, Tailwind 4.x.
**Avoids:** Shipping before credibility exists; GitHub Pages deployment is zero-cost and zero-maintenance.

### Phase 4: GitHub Action
**Rationale:** The GitHub Action is a composite action (not a server) that wraps the Phase 2 CLI — implementation effort is low once the CLI's `--format github` output flag exists. This is a critical differentiator; no competitor offers CI-native AEO scoring.
**Delivers:** `.github/actions/aeorank/` composite action; AEO score posted as GitHub Check Run; PR comment posted only when score drops below threshold (reduces noise); pinned CLI version in action YAML.
**Avoids:** Using `pull_request_target` event (security risk — runs in base branch context with elevated privileges), referencing `@latest` CLI version (unpinned breakage on CLI releases).

### Phase 5: SaaS Dashboard (Auth + Billing + Scan History)
**Rationale:** The dashboard unlocks the paid tiers and score history, but it requires auth, billing, and database infrastructure — the highest-complexity phase. Must be built after the core engine is validated in production via the CLI.
**Delivers:** Next.js 16 dashboard on Vercel; Clerk auth with `proxy.ts` middleware; Supabase schema with RLS on all user-data tables; Stripe subscriptions (Free / Pro $29 / API $99); scan history with trend charts; web paste-and-download UI for non-developer users; optional API key for CLI → dashboard sync.
**Uses:** Next.js 16, Clerk 7.x, Drizzle ORM 0.45.x, Supabase, Stripe 20.x, recharts, @tanstack/react-table, shadcn/ui.
**Avoids (critical):** SSRF on scan API route (validate all URLs before fetch, run scan worker in isolated process), RLS disabled (enable on every user-data table, test cross-tenant reads), Stripe webhook non-idempotency (deduplicate on `event.id`), inline sync scan causing Vercel timeout for large sites (use async job queue).

### Phase 6: Local Directory Scanning + Framework Guides
**Rationale:** These are v1.x features that extend the core CLI use case (dev-loop, pre-deploy CI) and reduce implementation friction for specific tech stacks. Low complexity relative to value.
**Delivers:** `aeorank scan ./` local directory scanning using fast-glob; gray-matter for MDX/Markdown frontmatter parsing; framework-specific integration guides for Next.js, Astro, WordPress, Shopify in the docs site.
**Uses:** fast-glob 3.x, gray-matter 4.x.
**Avoids:** Scope creep into monitoring features (AI citation tracking, competitor benchmarking) — these are v2 territory.

### Phase Ordering Rationale

- **Core first:** The feature dependency graph is explicit — scanner → scorer → file generators, and everything else is a thin shell on top. Building the core before any UI prevents the anti-pattern of duplicating scan logic in CLI and API route.
- **CLI before dashboard:** Real-world usage via the CLI validates the scoring model and file formats before investing in SaaS infrastructure. Bugs discovered in CLI (score instability, crawl rate issues) are cheap to fix; the same bugs discovered after a dashboard launch with paying users are expensive.
- **Marketing before SaaS:** Organic discovery requires the marketing site to exist. Publishing the CLI to npm and launching the marketing site before the paid dashboard builds waitlist demand.
- **GitHub Action before dashboard:** The Action is low-effort (wraps existing CLI) and is a stronger acquisition signal than the dashboard for the developer audience.
- **Dashboard last among core features:** It introduces the highest complexity (auth, billing, RLS, async jobs) and is where all the security-critical pitfalls live. Validate the product with CLI users first.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (SaaS Dashboard):** Clerk + Supabase JWT integration requires explicit user ID sync; `@supabase/ssr` cookie handling in Next.js 16 with `proxy.ts` has not been widely documented in this exact configuration. Needs spike before full planning.
- **Phase 5 (Async scan jobs):** The right queuing mechanism for Vercel-hosted scan jobs (Supabase pg_cron, Upstash QStash, or Vercel Background Functions) depends on plan limits and latency requirements. Needs research when Phase 5 planning begins.
- **Phase 1 (Scoring model weights):** The 12-dimension weights and their citation-likelihood correlation are based on third-party research (AirOps, SEOShouts) with MEDIUM confidence. Weights should be treated as v1 defaults, not ground truth. Plan to externalize weights into a config before SaaS launch.

Phases with standard patterns (skip research-phase):
- **Phase 2 (CLI):** Commander.js + esbuild CLI patterns are extremely well-documented. No research needed.
- **Phase 3 (Marketing/Docs):** Astro + Starlight deployment to GitHub Pages is a solved problem with official adapters.
- **Phase 4 (GitHub Action):** Composite action wrapping a CLI is a standard pattern. GitHub Actions toolkit documentation is official and comprehensive.
- **Phase 6 (Local scanning):** fast-glob + gray-matter are stable, well-documented libraries.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Most choices verified against official docs and npm registries. Version numbers are current as of 2026-03-14. Critical note: project previously specified Next.js 15 but Next.js 16 is current stable — use 16 from day one. |
| Features | MEDIUM-HIGH | Competitor feature sets verified across multiple sources. File generation gap is confirmed (no competitor does it). llms.txt adoption rate (~10%) sourced from a single article — treat as directional, not authoritative. |
| Architecture | MEDIUM-HIGH | Core patterns (shared library, Stripe webhook sync, composite GitHub Action) are well-documented industry standards. Specific Clerk + Supabase JWT integration in Next.js 16 context has lower confidence. |
| Pitfalls | MEDIUM | Security pitfalls (SSRF, RLS, Stripe) sourced from official docs and well-regarded security resources — HIGH confidence. AEO-specific pitfalls (score instability, crawl rate) sourced from community articles and domain inference — MEDIUM confidence. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Clerk + Supabase JWT sync in Next.js 16:** Clerk uses a different JWT issuer than Supabase. The pattern for syncing Clerk user IDs into Supabase RLS policies in a Next.js 16 `proxy.ts` context needs a dedicated spike during Phase 5 planning.
- **Async scan job queue selection:** Vercel Background Functions, Supabase pg_cron, and Upstash QStash all have different latency and cost profiles. Decision should be deferred to Phase 5 planning when actual site-size distribution and Vercel plan are known.
- **Scoring model calibration:** The 12-dimension weights (structural vs. performance, individual dimension weights) are based on third-party citation-likelihood research with MEDIUM confidence. Treat v1 weights as configurable defaults; plan to externalize into a config object in `@aeorank/core` before SaaS launch to allow recalibration without a code release.
- **llms.txt adoption trajectory:** Current adoption is ~10% overall, 5-15% for tech sites. The AEO space is moving fast; llms.txt could become mandatory or irrelevant within 12 months. Track this signal; do not over-invest in llms.txt-specific features at the expense of schema and E-E-A-T signals, which have deeper citation-likelihood research behind them.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — version, breaking changes, Turbopack default, `proxy.ts`
- [Next.js Upgrade Guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16) — migration path
- [Clerk @clerk/nextjs npm](https://www.npmjs.com/package/@clerk/nextjs) — version 7.0.4, Next.js 16 support
- [Drizzle ORM latest releases](https://orm.drizzle.team/docs/latest-releases) — v0.45.1 stable
- [Drizzle ORM RLS support](https://orm.drizzle.team/docs/rls) — RLS integration patterns
- [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests) — webhook deduplication
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policies
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — v2.99.1
- [Astro 5.0 blog](https://astro.build/blog/astro-5/) — stable features
- [llmstxt.org official spec](https://llmstxt.org/) — llms.txt required/optional fields
- [GitHub Actions Security Lab](https://securitylab.github.com/resources/github-actions-new-patterns-and-mitigations/) — `pull_request_target` risk

### Secondary (MEDIUM confidence)
- [AirOps: AEO audit checklist](https://www.airops.com/blog/aeo-audit-checklist) — scoring dimension categories
- [SEOShouts GEO/AEO Checker](https://seoshouts.com/tools/geo-aeo-checker/) — 7-dimension scoring model
- [HubSpot AEO Grader](https://www.hubspot.com/aeo-grader) — competitor feature analysis
- [Turborepo official docs](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository) — monorepo structure
- [Drizzle + Supabase guide](https://orm.drizzle.team/docs/get-started/supabase-new) — integration pattern
- [Scrunch: best AEO/GEO tools 2026](https://scrunch.com/blog/best-answer-engine-optimization-aeo-generative-engine-optimization-geo-tools-2026) — competitor landscape
- [Sitebulb: crawl responsibly](https://sitebulb.com/resources/guides/how-to-crawl-responsibly-the-need-for-less-speed/) — crawl rate patterns
- [Stripe Webhook Best Practices](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) — idempotency patterns
- [OWASP SSRF Prevention in Node.js](https://owasp.org/www-community/pages/controls/SSRF_Prevention_in_Nodejs) — SSRF prevention

### Tertiary (LOW confidence — treat as directional)
- [llms.txt adoption state 2026](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026) — ~10% adoption; single source, needs monitoring
- [WebSearch: AEO tool pricing/features 2026](https://nicklafferty.com/blog/best-aeo-tools-answer-engine-optimization/) — pricing tiers; single source
- [WebSearch: AI visibility SaaS agency features](https://llmpulse.ai/blog/white-label-ai-seo-software/) — agency tier patterns; marketing copy

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
