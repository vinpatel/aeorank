# Architecture Research

**Domain:** CLI Scanner + SaaS Dashboard (AEO tooling)
**Researched:** 2026-03-14
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│   @aeorank/  │  GitHub      │  Marketing   │  Docs Site             │
│   cli (npx)  │  Action      │  (Astro 4)   │  (Astro+Starlight)     │
│              │  (.yml file) │  aeorank.dev │  docs.aeorank.dev      │
└──────┬───────┴──────┬───────┴──────────────┴────────────────────────┘
       │              │
       │  optional    │  optional
       │  API key     │  API key
       ▼              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       @aeorank/core (shared)                        │
│  Scanner engine · Scorer · File generators · Type definitions       │
└──────────────────────────┬───────────────────────────────────────────┘
                           │  used by CLI directly; API wraps it
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                     Next.js 15 Dashboard App                        │
│                       (app.aeorank.dev)                             │
├─────────────────────────────────────────────────────────────────────┤
│  App Router Pages │  API Routes (/api/*)  │  Server Actions         │
├───────────────────┴─────────────────────────────────────────────────┤
│  Clerk (Auth)  │  Stripe webhooks  │  Supabase/Drizzle queries      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                         Data Layer                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL  │  Drizzle ORM  │  Supabase Storage (files)  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `@aeorank/core` | Scan engine, scoring, file generation, shared types | Pure TypeScript library, no I/O side effects |
| `@aeorank/cli` | CLI entry point, user output formatting, local file writing | Commander.js or similar, wraps core |
| GitHub Action | CI integration, posts Check + PR comment with score | Composite action calling `npx @aeorank/cli` |
| Next.js Dashboard | Auth'd web UI, scan history, team management, billing | Next.js 15 App Router on Vercel |
| REST API (`/api/*`) | Receives CLI/GitHub Action scan results, returns scan data | Next.js API routes, Clerk auth via API key |
| Marketing site | Public landing page, zero JS | Astro 4 on GitHub Pages, static |
| Docs site | Developer documentation | Astro + Starlight on GitHub Pages or Vercel |
| Supabase | Postgres data store, file storage, RLS enforcement | Managed Postgres via Drizzle ORM |
| Clerk | Auth, user/org management, session tokens | Middleware + server-side session validation |
| Stripe | Subscription billing, plan enforcement | Webhooks synced to Supabase |

## Recommended Project Structure

```
aeorank/                          # Turborepo monorepo root
├── apps/
│   ├── web/                      # Next.js 15 dashboard (app.aeorank.dev)
│   │   ├── app/
│   │   │   ├── (auth)/           # Clerk-protected routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   └── settings/
│   │   │   ├── api/
│   │   │   │   ├── scans/        # POST: receive CLI scan results
│   │   │   │   ├── webhooks/
│   │   │   │   │   └── stripe/   # Stripe event handler
│   │   │   │   └── generate/     # On-demand file generation
│   │   │   └── (marketing)/      # Public pages if colocated
│   │   ├── components/
│   │   └── lib/
│   │       ├── db.ts             # Drizzle client
│   │       └── stripe.ts         # Stripe client
│   ├── marketing/                # Astro 4 (aeorank.dev)
│   │   └── src/
│   │       ├── pages/
│   │       └── content/
│   └── docs/                     # Astro + Starlight (docs.aeorank.dev)
│       └── src/
│           └── content/
│               └── docs/
├── packages/
│   ├── core/                     # @aeorank/core — scan engine
│   │   └── src/
│   │       ├── scanner/          # URL fetcher, DOM parser, robots reader
│   │       ├── scorer/           # 12-dimension scoring logic
│   │       ├── generators/       # llms.txt, schema.json, etc.
│   │       └── types/            # Shared TypeScript interfaces
│   ├── cli/                      # @aeorank/cli — published to npm
│   │   └── src/
│   │       ├── commands/         # scan, generate, check, auth
│   │       ├── formatters/       # terminal output, JSON, CI-friendly
│   │       └── sync.ts           # optional API upload (with API key)
│   └── config/                   # Shared ESLint/TS/Prettier configs
│       ├── eslint/
│       └── typescript/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Structure Rationale

- **`apps/`:** Deployable units — dashboard, marketing, docs. Each is independently deployable.
- **`packages/core`:** The scan engine is the fundamental shared unit. Both the CLI and the dashboard's on-demand scan endpoint use it. Zero I/O — pure computation makes it testable and reusable.
- **`packages/cli`:** Thin wrapper over core. Handles terminal UX, file writing, and optional cloud sync. Published as `@aeorank/cli` to npm.
- **`packages/config`:** Shared lint/TS config prevents drift between workspaces.
- **GitHub Action lives in repo root** as `.github/actions/aeorank/` — it is a composite action that shells out to `npx @aeorank/cli`, keeping the action webhook-free.

## Architectural Patterns

### Pattern 1: Shared Core Library

**What:** The scanner, scorer, and file generators live in `@aeorank/core` — a pure TypeScript package with no side effects. Both the CLI and the API use it.

**When to use:** Whenever the same business logic must run in multiple surfaces (CLI locally, API remotely, GitHub Action in CI).

**Trade-offs:** Requires maintaining a stable internal API between packages. Breaking changes to `core` require updating both CLI and dashboard simultaneously (Turborepo handles this with task graph awareness).

**Example:**
```typescript
// packages/core/src/index.ts
export { scan } from './scanner'
export { score } from './scorer'
export { generateFiles } from './generators'
export type { ScanResult, AEOScore, GeneratedFile } from './types'

// packages/cli/src/commands/scan.ts
import { scan, score, generateFiles } from '@aeorank/core'
const result = await scan(url)
const aeoScore = score(result)
```

### Pattern 2: CLI → API Optional Sync

**What:** The CLI works 100% offline by default. When the user sets `AEORANK_API_KEY`, scan results are POSTed to the dashboard API for storage and history.

**When to use:** Any CLI tool that has an optional cloud-connected tier. Keeps the open-source CLI fully functional without forcing SaaS sign-up.

**Trade-offs:** Two code paths to maintain (local-only vs. sync). API key management adds surface area for support.

**Example:**
```typescript
// packages/cli/src/sync.ts
export async function maybeSyncResult(result: ScanResult, apiKey?: string) {
  if (!apiKey) return  // silent no-op, not an error
  await fetch('https://app.aeorank.dev/api/scans', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  })
}
```

### Pattern 3: Stripe Webhook → Supabase Sync

**What:** Stripe sends subscription events (created, updated, cancelled, payment_failed) to `/api/webhooks/stripe`. The handler updates the `subscriptions` table in Supabase. Plan limits are enforced by checking subscription status in server-side code — never trust client-side state.

**When to use:** All SaaS subscription billing. This is the industry-standard pattern.

**Trade-offs:** Webhook delivery is async — there can be a brief lag between Stripe state and your DB. Stripe's `idempotencyKey` prevents double-processing on webhook retries.

**Example:**
```typescript
// apps/web/app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(await req.text(), sig, WEBHOOK_SECRET)

  switch (event.type) {
    case 'customer.subscription.updated':
      await db.update(subscriptions).set({ status: event.data.object.status })
        .where(eq(subscriptions.stripeSubscriptionId, event.data.object.id))
  }
}
```

### Pattern 4: GitHub Action as CLI Wrapper

**What:** The GitHub Action is a composite action (not a Docker or JS action). It runs `npx @aeorank/cli scan $URL --format github` and parses stdout to post a Check and PR comment using the standard `GITHUB_TOKEN`. No external server, no webhook receiver.

**When to use:** When users should not need to expose their infrastructure or grant additional OAuth scopes. Lowers friction to zero.

**Trade-offs:** Results are not stored in the dashboard unless the user also sets `AEORANK_API_KEY` in their repo secrets. The action has no persistent state — each run is independent.

## Data Flow

### Flow 1: CLI Local Scan

```
User runs: npx @aeorank/cli scan https://example.com
    ↓
CLI command handler (packages/cli)
    ↓ imports
@aeorank/core scan(url)
    ├── Fetches URL (robots.txt, sitemap, HTML pages)
    ├── Parses DOM and metadata
    └── Returns raw ScanData
    ↓
@aeorank/core score(scanData) → AEOScore { total: 72, dimensions: {...} }
    ↓
@aeorank/core generateFiles(scanData) → GeneratedFile[]
    ↓
CLI writes files to ./aeorank-output/
CLI prints score to terminal
    ↓ (if AEORANK_API_KEY set)
CLI POSTs ScanResult to POST /api/scans
    ↓
Returns exit 0 (or exit 1 if score < threshold)
```

### Flow 2: Dashboard On-Demand Scan

```
User pastes URL in dashboard
    ↓
Browser → POST /api/scans/run (authenticated via Clerk session)
    ↓
API route validates plan limits (check subscription in Supabase)
    ↓
API route calls @aeorank/core scan() + score()
    ↓
Results stored in Supabase scans table
    ↓
API route returns scan ID
    ↓
Browser polls GET /api/scans/:id or uses Supabase Realtime subscription
    ↓
Dashboard renders score history chart and file download links
```

### Flow 3: GitHub Action CI Scan

```
PR opened/updated → GitHub triggers workflow
    ↓
Composite Action: npx @aeorank/cli scan ${{ inputs.url }} --format github
    ↓
CLI runs scan (same core as local)
    ↓
CLI outputs structured JSON to stdout (--format github)
    ↓
Action parses JSON, calls GitHub Checks API (creates Check Run)
    ↓
Action posts PR comment with score table
    ↓
(optional) CLI POSTs to /api/scans if AEORANK_API_KEY in repo secrets
```

### Flow 4: Stripe → Plan Enforcement

```
User upgrades in dashboard → POST /api/billing/checkout
    ↓
Creates Stripe Checkout session
    ↓ (user completes payment in Stripe-hosted page)
Stripe sends webhook to POST /api/webhooks/stripe
    ↓
Handler updates subscriptions table in Supabase
    ↓
Server-side plan check on each /api/scans/run request
    └── Reads subscription status from Supabase (not Stripe)
        ← Supabase is the source of truth for plan status
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single Next.js app on Vercel handles everything. Supabase free/pro tier is sufficient. |
| 1k-100k users | Enable Supabase connection pooling (PgBouncer). Add Vercel Edge Caching for scan results. Move scans to a background job queue (Supabase pg_cron or Upstash QStash) to prevent API route timeouts on large sites. |
| 100k+ users | Extract scan worker to a separate service. Consider Vercel Edge Functions for the API key validation hot path. Supabase at scale may need read replicas. |

### Scaling Priorities

1. **First bottleneck:** Scan execution time. Sites with 50+ pages can hit Vercel's 30s API route timeout. Fix: queue-based async scan with polling/webhook callback.
2. **Second bottleneck:** Database connections. Serverless functions create many short-lived connections. Fix: PgBouncer pooling (Supabase Transaction mode).

## Anti-Patterns

### Anti-Pattern 1: Duplicating Scan Logic in CLI and Dashboard

**What people do:** Write separate scan implementations for the CLI and the API route, since they "seem different."

**Why it's wrong:** Two codebases diverge immediately. Scoring differences cause user confusion ("my CLI score is 84 but the dashboard shows 79"). Bugs fixed in one are missed in the other.

**Do this instead:** All scan logic lives exclusively in `@aeorank/core`. The CLI and the API route are thin shells that call the same function.

### Anti-Pattern 2: Storing Stripe Plan State Only in Stripe

**What people do:** Query the Stripe API on every request to check if a user's subscription is active.

**Why it's wrong:** Adds 100-200ms latency per request. Creates a hard dependency on Stripe uptime. Rate limits become a concern at scale.

**Do this instead:** Stripe webhooks sync plan state to your Supabase `subscriptions` table. Enforce limits by querying your own database. Stripe is the payment processor; your DB is the source of truth for plan status.

### Anti-Pattern 3: GitHub App Instead of GitHub Action

**What people do:** Build a GitHub App (Probot) with a webhook receiver that requires a public URL, secrets management, and a running server.

**Why it's wrong:** Adds infrastructure the user must trust and maintain. Requires OAuth app approval. Breaks zero-friction onboarding.

**Do this instead:** Composite GitHub Action that shells to `npx @aeorank/cli`. Runs in the user's CI environment. Only permission needed is the already-present `GITHUB_TOKEN`.

### Anti-Pattern 4: Monolithic Package with No Separation

**What people do:** Put CLI, scoring logic, and file generation all in one package with direct I/O mixed into business logic.

**Why it's wrong:** Can't unit test scoring logic without mocking file system. Can't reuse scanner in the dashboard without pulling in CLI dependencies. Makes the npm package unnecessarily large.

**Do this instead:** `@aeorank/core` is a pure library. `@aeorank/cli` depends on core, adds I/O. Dashboard API route depends on core directly.

### Anti-Pattern 5: Server Components Accessing Stripe/External APIs Directly

**What people do:** Call Stripe or external APIs from Next.js Server Components on every page render.

**Why it's wrong:** Server Components re-render on navigation. External API calls are slow, brittle, and uncached. Rate limits get hit.

**Do this instead:** Use Supabase as the local cache for Stripe state (synced via webhooks). Server Components read from Supabase. External API calls happen only in webhook handlers and explicit user actions.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Clerk | Middleware wraps all `(auth)/` routes; `auth()` in server actions | API key endpoint uses `getAuth()` with custom token, not session cookie |
| Stripe | Checkout Sessions for upgrades; webhook handler for state sync | Verify webhook signature with `stripe.webhooks.constructEvent()` before any DB writes |
| Supabase | Drizzle ORM client with `DATABASE_URL` (pooled for API routes, direct for migrations) | Use Transaction mode pooling for serverless; Direct for schema migrations |
| GitHub API | GitHub Action uses `@actions/github` with `GITHUB_TOKEN` from workflow context | No external OAuth scopes required |
| npm Registry | `@aeorank/cli` published via `npm publish` from CI | Scope under `@aeorank` namespace |

### Internal Package Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `@aeorank/cli` ↔ `@aeorank/core` | Direct import (same monorepo) | Core is a workspace dependency; Turborepo handles build order |
| `apps/web` ↔ `@aeorank/core` | Direct import (same monorepo) | API route uses core for on-demand scans |
| `apps/web` ↔ `packages/cli` | No direct dependency | Dashboard does not depend on CLI package; they share core only |
| `apps/web` ↔ Supabase | Drizzle ORM over pooled PostgreSQL | All DB access server-side only (Server Components, Server Actions, API Routes) |
| `apps/marketing` ↔ `apps/web` | No runtime dependency | Marketing links to dashboard; both are independently deployed |
| CLI ↔ Dashboard API | HTTP REST (`/api/scans`) with Bearer API key | Optional — CLI works fully offline without this |

## Build Order Implications

Turborepo's task graph enforces build order automatically, but the logical dependency order is:

```
1. packages/config         (no dependencies)
2. packages/core           (depends on config)
3. packages/cli            (depends on core)
4. apps/web                (depends on core; independent of cli)
5. apps/marketing          (depends on config only)
6. apps/docs               (depends on config only)
```

**Phase build order recommendation:**
- Build and test `@aeorank/core` first — it is the foundation everything depends on
- Build `@aeorank/cli` second — validates core's public API works end-to-end
- Build dashboard third — uses core, but also introduces auth/billing complexity
- Marketing and docs can be built in parallel with dashboard; no shared runtime dependencies

## Sources

- Turborepo official docs on repository structure: https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository (HIGH confidence — official)
- SaaS architecture patterns with Next.js (multi-tenancy, RLS, Stripe sync): https://vladimirsiedykh.com/blog/saas-architecture-patterns-nextjs (MEDIUM confidence — third-party, well-structured)
- Drizzle + Supabase + Next.js App Router integration: https://makerkit.dev/blog/tutorials/drizzle-supabase (MEDIUM confidence — third-party guide, consistent with official docs)
- Turborepo + pnpm 2025 monorepo patterns: https://medium.com/@TheblogStacker/2025-monorepo-that-actually-scales-turborepo-pnpm-for-next-js-ab4492fbde2a (LOW confidence — community article, consistent with official Turborepo guidance)
- Next.js Supabase Stripe SaaS starter (pattern reference): https://github.com/vercel/nextjs-subscription-payments (MEDIUM confidence — official Vercel example repo)
- AEOrank PROJECT.md (primary source of truth for this project's constraints)

---
*Architecture research for: AEO CLI Scanner + SaaS Dashboard (aeorank)*
*Researched: 2026-03-14*
