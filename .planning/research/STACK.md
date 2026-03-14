# Stack Research

**Domain:** AEO CLI Scanner + SaaS Dashboard
**Researched:** 2026-03-14
**Confidence:** HIGH (most core choices verified via official docs and WebSearch cross-reference)

---

## Critical Version Note

The project's milestone context specifies Next.js 15 App Router, but **Next.js 16 is the current stable release** (released October 21, 2025). Next.js 16 introduces breaking changes (async params/cookies/headers, Turbopack as default bundler, `proxy.ts` replaces `middleware.ts`, `cacheComponents` replaces PPR). Similarly, Astro is now at 5.18.0 with Astro 6 in beta (requires Node 22+, avoid 6 for now). These version choices should be deliberately re-evaluated before greenfield work begins.

**Recommendation:** Start on Next.js 16 from day one on a greenfield project. The upgrade path from 15 → 16 is codemods-heavy; avoiding that debt later is worth starting current.

---

## Recommended Stack

### Monorepo Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| pnpm | 9.x | Package manager | Symlink-based node_modules gives best isolation in monorepos; fastest install times; workspace support is first-class. Standard for JS monorepos in 2026. |
| Turborepo | 2.8.x | Build orchestration and caching | Written in Rust, 2-5x faster CI than alternatives. Vercel remote cache free for hobby/indie projects. Simple `turbo.json` config. In 2026 it is the default choice for pnpm monorepos — lower friction than Nx, more caching than bare workspaces. |
| TypeScript | 5.7+ | Language | Required by Next.js 16 (min 5.1). `tsconfig` sharing via `@aeorank/tsconfig` package keeps all apps in sync. |

### CLI Package (`packages/cli`)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 20.9+ (LTS) | Runtime | Next.js 16 requires Node 20.9+ minimum. Node 20 is the LTS line through 2026. Use `engines` field in package.json to enforce. |
| Commander.js | 14.x | Argument parsing and subcommands | The standard CLI framework for Node.js — 14.0.3 is latest (published ~1 month ago). Requires Node 20+. Well-maintained, typed, minimal. Avoid `yargs` (heavier, less DX-friendly). |
| Inquirer.js | 13.x | Interactive prompts (init wizard) | Current version 13.3.0. ESM-native. Use only for interactive mode (`aeorank init`); not for the core scan path which must be non-interactive for CI. |
| esbuild | 0.24.x | Bundle CLI to single file | Produces a small, fast Node.js bundle. Use `pkgroll` or a manual esbuild script; avoids the ts-node/tsx complexity at dist time. TSX for dev iteration; esbuild for production build. |
| tsx | 4.x | Dev-time TypeScript execution | Faster than ts-node, no complex ESM flags. Use for `turbo dev` tasks. Do NOT use tsx in production — build to JS first. |
| cheerio | 1.x | HTML parsing (static pages) | Lightweight, jQuery-like API. Use for fast HTML scraping of static pages (the common case). Zero browser overhead. |
| Playwright | 1.4x | Headless browser (JS-heavy pages) | Use only as the fallback when a page requires JavaScript rendering. Do NOT use Playwright for the hot path — it adds 2-4s per page and inflates the installed package size by ~300MB. Make it an optional peer dependency or lazy-load it. |
| gray-matter | 4.x | Frontmatter parsing | For parsing Markdown/MDX files in repo scans. Stable, widely used. |
| fast-glob | 3.x | File system scanning | For local directory scans (`aeorank scan ./`) — orders of magnitude faster than node's native `fs.readdir` recursion. |
| chalk | 5.x | Terminal color output | ESM-native in v5. Use for CLI output formatting. Prefer chalk over `picocolors` for its richer API — size difference is negligible in a CLI. |
| ora | 8.x | Spinner/progress display | ESM-native. Use for the 30-second scan progress indicator. |
| zod | 3.x | Config validation | Validate `.aeorank.json` config files and API responses. Same Zod version as the dashboard for shared schemas. |

### Marketing Site (`apps/web`)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 5.18.x | Static site framework | Zero JS by default. Perfect for marketing pages on GitHub Pages. The "Content Layer" API in Astro 5 handles MDX blog posts cleanly. Do NOT upgrade to Astro 6 yet — it is in beta, requires Node 22+, and removes Astro.glob(). Stick to 5.x for stability. |
| @astrojs/starlight | 0.37.x | Documentation site | Current stable version 0.37.6. Built on Astro 5. Best-in-class docs framework: built-in search, sidebar navigation, i18n, versioning. Runs at docs.aeorank.dev. |
| Tailwind CSS | 4.x | Styling | Astro 5 has first-class Tailwind 4 support via `@astrojs/tailwind`. Use for design system utility classes that match the 37signals aesthetic. |

### Dashboard (`apps/dashboard`)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x | Full-stack React framework | Current stable version (released Oct 2025). App Router is mature in v16 with Turbopack as default bundler. Key for AEOrank: React Server Components fetch scan history server-side (no client waterfall), Partial Prerendering shows static shell + dynamic score data. |
| React | 19.2 | UI library | Bundled with Next.js 16. React Compiler is now stable in v16 — enables it to auto-memoize without manual `useMemo`/`useCallback`. |
| Tailwind CSS | 4.x | Styling | Next.js 16 starter includes Tailwind 4. Use for the 37signals-inspired design system. |
| shadcn/ui | latest | Component primitives | Radix UI-based, copy-paste components (not installed as a dependency). Use for dashboard data tables, modals, and form elements. Not a library — components live in `components/ui/`. |

### Database Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase | (managed) | PostgreSQL hosting + auth helpers | Every Supabase project is a full Postgres instance. Use Supabase for: hosted Postgres, Realtime subscriptions (live score updates), Storage (generated file downloads), Edge Functions (optional). Do NOT use Supabase Auth — use Clerk instead (see Auth). |
| @supabase/supabase-js | 2.99.x | Supabase JS client | Current version 2.99.1. Use for direct Postgres queries in server components and Edge Functions. |
| @supabase/ssr | 0.x | SSR-compatible Supabase client | Required for Next.js App Router server components — handles cookie-based session management correctly. |
| Drizzle ORM | 0.45.x | Type-safe query builder | Current stable: 0.45.1. v1.0.0 is in beta but not yet stable. Drizzle is not a traditional ORM — it is a query builder with a SQL-like syntax that gives full control. Bundle size ~7.4kb vs Prisma's ~25MB. Serverless-friendly. Use with `pg` driver against Supabase PostgreSQL. |
| drizzle-kit | 0.x | Schema migrations | CLI tool for generating and running SQL migrations. Use `drizzle-kit generate` → `drizzle-kit migrate` workflow. Avoid `drizzle-kit push` in production. |
| postgres (pg) | 3.x | PostgreSQL driver | Use `postgres` (npm package) rather than `pg` for better ESM support and a cleaner async API. Drizzle's recommended driver for Supabase. |

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Clerk | @clerk/nextjs 7.x | Auth + user management | Current version @clerk/nextjs 7.0.4. Has explicit Next.js 16 support including `proxy.ts` awareness and "use cache" error detection. Use `clerkMiddleware()` in `proxy.ts` (Next.js 16 pattern). Clerk is the correct choice over Supabase Auth when you need: magic links, OAuth, org management, and user metadata without custom server logic. |

### Payments

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Stripe | stripe 20.x | Subscriptions and billing | stripe npm package is at v20.4.0, pinned to API version 2026-03-04. Use Stripe Customer Portal for self-serve plan management (saves building billing UI). Use Stripe webhooks (via Next.js 16 Route Handlers) for subscription lifecycle events. |
| @stripe/stripe-js | 5.x | Client-side Stripe Elements | For the checkout flow. Use `loadStripe()` lazily — only load on checkout pages. |

### CI/CD Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| GitHub Actions | N/A | CI pipeline + AEO Check integration | The GitHub Action (`aeorank/action`) posts AEO scores as GitHub Check runs. Uses only `GITHUB_TOKEN` — no external credentials required. This is a core product differentiator, not just a CI tool. |
| Vercel | N/A | Dashboard hosting | Native Next.js 16 support. Automatic preview deployments per PR. Edge network for global performance. Free tier sufficient for early SaaS. |
| GitHub Pages | N/A | Marketing/docs hosting | Free, zero-config with Astro's built-in GitHub Pages adapter (`@astrojs/github-pages` or manual `gh-pages` action). |

### Shared Packages (`packages/`)

| Package | Purpose | Notes |
|---------|---------|-------|
| `@aeorank/types` | Shared TypeScript types (AEOScore, ScanResult, etc.) | No runtime code — type-only exports. |
| `@aeorank/tsconfig` | Shared tsconfig base | `tsconfig.base.json` with strict mode. All apps extend from it. |
| `@aeorank/eslint-config` | Shared ESLint flat config | One config, consistent rules across all packages. |
| `@aeorank/schema` | Drizzle schema + Zod validation schemas | Shared between CLI (validation) and dashboard (DB queries). |

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | latest | Conditional class names | Use in every component that has conditional Tailwind classes. Replace with `cn()` utility (shadcn pattern). |
| date-fns | 4.x | Date formatting | Score history charts, "Last scanned X ago". Prefer over `moment` (EOL) and `dayjs` (smaller API). |
| recharts | 2.x | Score history charts | React-native chart library. Use for AEO score trend charts in the dashboard. Alternative: tremor (higher-level but more opinionated). |
| react-hook-form | 7.x | Dashboard forms | Performant form library with minimal re-renders. Use with Zod resolver for schema validation. |
| @tanstack/react-table | 8.x | Data tables | Headless table logic. Use for the scan history table, site inventory, and report views. Pair with shadcn/ui table components for styling. |
| posthog-js | 1.x | Product analytics | Use for funnel tracking, feature flags, and session replay. Self-hostable if needed. Do NOT use Mixpanel or Amplitude for MVP (overkill). |
| sentry | 8.x | Error monitoring | `@sentry/nextjs` for dashboard, `@sentry/node` for CLI telemetry (opt-in). |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Biome | Linting + formatting | Replaces ESLint + Prettier in Next.js 16 (the `next lint` command is removed in v16). Use `biome check` in CI. Note: Next.js 16 officially removed `next lint` — you now wire Biome or ESLint directly. |
| Vitest | Unit and integration tests | ESM-native, fast, compatible with TypeScript. Use for CLI scanner logic and schema validation tests. |
| Playwright (testing) | E2E tests for dashboard | Same package as scraping use above but used here for E2E. Run in CI on PR merges only. |
| changesets | Versioning CLI packages | `@changesets/cli` for versioning `@aeorank/cli` and related packages. Integrates with GitHub Actions for automated npm publishes. |

---

## Alternatives Considered

| Recommended | Alternative | Why Not Alternative |
|-------------|-------------|---------------------|
| Next.js 16 | Remix | Next.js has better Vercel integration, larger ecosystem, and Clerk/Stripe have first-party Next.js SDKs. Remix is excellent but adds migration friction for a greenfield SaaS. |
| Drizzle ORM | Prisma | Prisma's ~25MB client is inappropriate for CLI distribution. Drizzle's 7.4kb bundle is correct here. Prisma is not serverless-optimized. |
| Clerk | Supabase Auth | Clerk has richer user management UI, organization support, and better Next.js 16 integration. Supabase Auth works but requires custom UI for all auth flows. |
| Supabase (Postgres) | PlanetScale / Neon | Supabase includes Storage (for generated file downloads) and Realtime (live score updates) — one service for three needs. PlanetScale dropped free tier. Neon is excellent but Supabase offers more for this use case. |
| Commander.js | yargs | yargs is heavier and has a more complex API. Commander 14 is fully typed and minimal. |
| cheerio (primary) + Playwright (fallback) | Playwright-only | Playwright-only means every scan launches a Chromium process — adding 2-4 seconds and ~300MB to the package. Cheerio handles static HTML (80% of use cases) in milliseconds. |
| Astro 5.x | Astro 6 beta | Astro 6 requires Node 22+ and has breaking changes. Not production-ready yet for a new project. Stick to 5.x and upgrade when 6 reaches stable. |
| pnpm + Turborepo | Nx | Nx is more powerful but significantly more complex to configure. For a 3-app monorepo with 3-4 shared packages, Turborepo is sufficient and the team ramp-up is minimal. |
| Vitest | Jest | Jest requires additional config for ESM. Vitest is ESM-native and faster out of the box for TypeScript projects. |
| Biome | ESLint + Prettier | Next.js 16 removed `next lint`; Biome is faster, handles both lint and format in one tool, and has good Next.js support. Avoids the Prettier/ESLint conflict configuration overhead. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `ts-node` | Complex ESM configuration, requires `--loader` flags, slow cold starts | `tsx` for development, `esbuild` for production builds |
| Prisma | ~25MB generated client is incompatible with CLI distribution. Not serverless-optimized. | Drizzle ORM |
| `moment.js` | EOL, enormous bundle size | `date-fns` 4.x |
| Supabase Auth (for dashboard users) | Requires custom UI for all auth flows; Clerk's pre-built UI and organization support are a significant DX advantage for a SaaS product | Clerk |
| GitHub App (Probot / webhook server) | Requires hosting an external server, OAuth credentials per installation, and complexity the user must manage | GitHub Action with `GITHUB_TOKEN` only |
| `next lint` | Removed in Next.js 16 | Biome directly, or ESLint CLI |
| `middleware.ts` (Next.js 16+) | Deprecated in Next.js 16 in favor of `proxy.ts` | `proxy.ts` — rename immediately when scaffolding |
| Playwright for every scan | Chromium binary is ~300MB, each page launch adds 2-4s | cheerio for static pages, Playwright lazy-loaded only for JS-heavy pages |
| Astro 6 beta | Node 22+ requirement, breaking API changes, not production stable | Astro 5.18.x |
| Webpack (explicit opt-in in Next.js 16) | Turbopack is now the default and 2-5x faster | Turbopack (no action needed — it is the default in Next.js 16) |

---

## Stack Patterns by Variant

**For the CLI `aeorank scan <url>` hot path:**
- Use native `fetch` + cheerio for static HTML pages (zero external process)
- Lazy-load Playwright only if the page fails to yield structured content via fetch (detect via missing `<body>` content or explicit `--js` flag)
- Because: scan must complete in < 30 seconds for 50 pages; Playwright per-page adds 2-4s each

**For the GitHub Action:**
- Use Node.js 20 action, call `@aeorank/cli` directly via `npx`
- Post results via `@actions/core` and `@actions/github` (GitHub Actions toolkit)
- Because: zero external credentials required — only GITHUB_TOKEN

**For the dashboard real-time score updates:**
- Use Supabase Realtime subscriptions from the client
- Because: Supabase Realtime is already included, avoids building a WebSocket server or polling

**For CLI file generation (llms.txt, schema.json, etc.):**
- Use Node.js native `fs/promises` — no third-party library needed
- Template strings over template engines (no Handlebars/EJS overhead)
- Because: the generated files are simple and the CLI must stay lean

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@clerk/nextjs@7.x` | Next.js 16.x | Explicitly supports `proxy.ts` and Next.js 16 cache components. Use `clerkMiddleware()` exported from `@clerk/nextjs/server`. |
| `drizzle-orm@0.45.x` | `@supabase/supabase-js@2.x` | Use Drizzle with the `postgres` driver pointed at Supabase's pooler URL. Set `prepare: false` when using Transaction pool mode. |
| `astro@5.18.x` | `@astrojs/starlight@0.37.x` | Starlight 0.37.x is built for Astro 5. Do NOT mix with Astro 6 beta. |
| `next@16.x` | `react@19.2`, `react-dom@19.2` | Next.js 16 bundles React 19.2 (Canary). Do not install React separately — use `npm install next@latest react@latest react-dom@latest`. |
| `turbo@2.8.x` | `pnpm@9.x` | Turborepo 2.x requires `packageManager` field in root `package.json`. Use `"packageManager": "pnpm@9.x.x"`. |
| `stripe@20.x` | Node.js 20+ | Stripe SDK v20 requires Node.js 12+ (well within our Node 20 floor). Pinned to API version `2026-03-04`. |

---

## Installation

```bash
# Root monorepo setup
pnpm add -D turbo@latest typescript@latest

# CLI package
pnpm --filter @aeorank/cli add commander@14 chalk@5 ora@8 cheerio@1 fast-glob@3 gray-matter@4 zod@3
pnpm --filter @aeorank/cli add -D tsx esbuild vitest

# Dashboard package
pnpm --filter @aeorank/dashboard add next@latest react@latest react-dom@latest
pnpm --filter @aeorank/dashboard add @clerk/nextjs drizzle-orm @supabase/supabase-js @supabase/ssr stripe zod
pnpm --filter @aeorank/dashboard add -D drizzle-kit @types/node

# Marketing site
pnpm --filter @aeorank/web add astro@^5 @astrojs/starlight tailwindcss

# Shared packages
pnpm --filter @aeorank/schema add drizzle-orm zod
```

---

## Sources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — version, breaking changes, Turbopack default, proxy.ts — HIGH confidence
- [Next.js Upgrade Guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16) — migration path — HIGH confidence
- [Clerk @clerk/nextjs npm](https://www.npmjs.com/package/@clerk/nextjs) — version 7.0.4, Next.js 16 support confirmed — HIGH confidence
- [Drizzle ORM latest releases](https://orm.drizzle.team/docs/latest-releases) — v0.45.1 stable, v1 beta — HIGH confidence
- [Drizzle + Supabase guide](https://orm.drizzle.team/docs/get-started/supabase-new) — integration pattern, prepare:false — HIGH confidence
- [Stripe npm](https://www.npmjs.com/package/stripe) — v20.4.0, API 2026-03-04 — HIGH confidence
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — v2.99.1 — HIGH confidence
- [Astro 5.0 blog](https://astro.build/blog/astro-5/) — features, stable — HIGH confidence
- [Astro 6 beta](https://astro.build/blog/astro-6-beta/) — beta only, Node 22+ required — HIGH confidence
- [@astrojs/starlight npm](https://www.npmjs.com/package/@astrojs/starlight) — v0.37.6 — HIGH confidence
- [Turborepo npm](https://www.npmjs.com/package/turbo) — v2.8.17 — HIGH confidence
- [Commander npm](https://www.npmjs.com/package/commander) — v14.0.3 — HIGH confidence (via WebSearch)
- [Inquirer.js npm](https://www.npmjs.com/package/inquirer) — v13.3.0 — MEDIUM confidence (via WebSearch)
- [llms.txt state of adoption](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026) — ~10% adoption rate overall, 5-15% for tech sites — MEDIUM confidence
- [Playwright vs Puppeteer](https://blog.apify.com/playwright-vs-puppeteer/) — Playwright 1.6s faster but heavier — MEDIUM confidence
- [tsx vs ts-node comparison](https://betterstack.com/community/guides/scaling-nodejs/tsx-vs-ts-node/) — tsx recommended over ts-node for dev — MEDIUM confidence
- [Monorepo tools 2026 comparison](https://viadreams.cc/en/blog/monorepo-tools-2026/) — Turborepo + pnpm is standard — MEDIUM confidence (WebSearch, industry consensus)

---

*Stack research for: AEO CLI Scanner + SaaS Dashboard (aeorank.dev)*
*Researched: 2026-03-14*
