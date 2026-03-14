# Phase 5: SaaS Dashboard - Research

**Researched:** 2026-03-14
**Domain:** Next.js 16 App Router, Clerk auth, Supabase, Stripe subscriptions, async scan jobs
**Confidence:** HIGH (core stack verified against official sources; queue mechanism MEDIUM)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | Next.js 16 App Router with Clerk auth | Clerk quickstart + Next.js 16 docs confirm setup; `proxy.ts` pattern verified |
| DASH-02 | Add site by URL → scan → display score with 12-dimension breakdown | `@aeorank/core`'s `scan()` API confirmed; async queue via QStash; score/dimension types verified from `packages/core/src/types.ts` |
| DASH-03 | Score history chart (30-day sparkline) | Recharts AreaChart/LineChart in "use client" component; Supabase `scan_results` table with `scanned_at` timestamp |
| DASH-04 | One-click ZIP download of all generated files | JSZip in server Route Handler; files stored as JSONB in Supabase and zipped on demand |
| DASH-05 | Stripe subscriptions (Free / Pro $29 / API $99) | Stripe Embedded Checkout + webhook Route Handler; `subscriptions` table in Supabase synced by webhook |
</phase_requirements>

---

## Summary

Phase 5 builds the complete SaaS product: authenticated dashboard, async site scanning, score history visualization, ZIP file download, and Stripe billing. The core stack is Next.js 16 App Router + Clerk (auth) + Supabase (database + RLS) + Stripe (payments) + QStash (async scan jobs). All four services have official integrations that are actively maintained as of early 2026.

The most important architectural decision is how scanning is triggered. The `@aeorank/core` `scan()` function performs real HTTP crawling that can take up to 30 seconds — far beyond a serverless function's interactive timeout. Scans must be dispatched as async background jobs via Upstash QStash: the dashboard API route enqueues a job, QStash calls a `/api/scan/process` Route Handler on a separate invocation, and the result is written to Supabase when complete. The UI polls or uses Supabase Realtime to show progress.

A critical security blocker flagged in STATE.md is SSRF prevention on the scan API route. Any user-submitted URL must be validated (block private IPs, loopback, RFC-1918 ranges, non-HTTP schemes) before being passed to `scan()`. This must be implemented in Wave 1 before any live scanning.

**Primary recommendation:** Use Clerk native Supabase integration (not the deprecated JWT template), QStash for async scans, JSZip in a server Route Handler for ZIP downloads, and Stripe Embedded Checkout with a webhook Route Handler to sync subscription state into Supabase.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.0.0 | App Router, React Server Components, Route Handlers | Required by DASH-01; confirmed stable Oct 2025 |
| @clerk/nextjs | latest | Auth, session management, user identity | Official Next.js integration; `proxy.ts` pattern required for Next.js 16 |
| @supabase/supabase-js | ^2.x | Database client (sites, scan results, subscriptions) | Official Postgres client; works with Clerk native integration |
| stripe | ^17.x | Stripe API server-side calls | Official Node SDK; used in Route Handlers and Server Actions |
| @stripe/react-stripe-js | ^3.x | Embedded Checkout React component | PCI-compliant, no-redirect checkout on your domain |
| @upstash/qstash | ^2.x | Async job queue for scan dispatch | Serverless-native HTTP queue; Vercel-compatible |
| jszip | ^3.10.x | ZIP archive generation in server Route Handler | Pure JS, no native deps, works in Node.js Route Handlers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | ^2.x | 30-day sparkline score history chart | Mature React charting library; use AreaChart with ResponsiveContainer |
| file-saver | ^2.x | Client-side ZIP download trigger | Companion to JSZip for blob → download in browser |
| @tanstack/react-query | ^5.x | Data fetching, polling scan status | If Supabase Realtime is too complex; simple polling alternative |
| next-safe-action | ^7.x | Type-safe Server Actions with validation | Optional but recommended for scan form submission |
| zod | ^3.x | URL and input validation (SSRF prevention) | Validate user-submitted URLs before passing to scanner |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| QStash | Trigger.dev, Inngest | Trigger.dev/Inngest have richer UI but more complex setup; QStash is simpler for a single job type |
| QStash | Vercel Background Functions | Background Functions are in beta and require Vercel Pro; QStash works on all plans |
| Supabase Realtime | TanStack Query polling | Realtime is better UX; polling (3s interval) is simpler to implement if Realtime setup is deferred |
| Recharts | Tremor SparkChart | Tremor wraps Recharts and is lighter to configure; either works |

**Installation:**
```bash
pnpm --filter @aeorank/web add next @clerk/nextjs @supabase/supabase-js stripe @stripe/react-stripe-js @stripe/stripe-js @upstash/qstash jszip recharts file-saver zod
pnpm --filter @aeorank/web add -D @types/file-saver
```

---

## Architecture Patterns

### Recommended Project Structure
```
apps/web/
├── proxy.ts                     # Clerk auth middleware (NOT middleware.ts — Next.js 16)
├── next.config.ts               # outputFileTracingRoot for monorepo module resolution
├── app/
│   ├── layout.tsx               # ClerkProvider wraps body
│   ├── (marketing)/             # Public routes (if any)
│   ├── (dashboard)/             # Protected routes (auth required)
│   │   ├── layout.tsx           # auth() guard, redirect to sign-in
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Sites list, add site form
│   │   ├── sites/[siteId]/
│   │   │   └── page.tsx         # Score breakdown + sparkline
│   │   └── upgrade/
│   │       └── page.tsx         # Stripe Embedded Checkout
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx             # <SignIn /> Clerk component
│   ├── sign-up/[[...sign-up]]/
│   │   └── page.tsx             # <SignUp /> Clerk component
│   └── api/
│       ├── scan/
│       │   ├── route.ts         # POST: validate URL, enqueue QStash job, create pending record
│       │   └── process/
│       │       └── route.ts     # POST (QStash callback): run scan(), write result to Supabase
│       ├── download/[siteId]/
│       │   └── route.ts         # GET: fetch files from Supabase, return ZIP blob
│       └── webhooks/stripe/
│           └── route.ts         # POST: verify Stripe signature, upsert subscription record
├── components/
│   ├── AddSiteForm.tsx          # "use client" form
│   ├── ScoreBreakdown.tsx       # Dimension table (server component)
│   ├── ScoreChart.tsx           # "use client" Recharts sparkline
│   └── CheckoutButton.tsx       # "use client" Stripe Embedded Checkout trigger
└── lib/
    ├── supabase.ts              # createServerSupabaseClient() factory (Clerk token)
    ├── stripe.ts                # Stripe SDK singleton
    ├── qstash.ts                # QStash client singleton
    └── validate-url.ts          # SSRF-safe URL validation with Zod
```

### Pattern 1: Clerk + Supabase Native Integration (No JWT Template)

**What:** Clerk acts as the third-party auth provider for Supabase. The Clerk session token is passed as a Bearer token to Supabase. Supabase RLS policies use `auth.jwt()->>'sub'` to get the Clerk user ID.

**When to use:** All authenticated Supabase queries from Server Components, Server Actions, and Route Handlers.

**Example:**
```typescript
// Source: https://clerk.com/docs/guides/development/integrations/databases/supabase
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}
```

### Pattern 2: Next.js 16 proxy.ts (Auth Middleware)

**What:** `middleware.ts` is deprecated in Next.js 16. The file is now `proxy.ts` with the exported function named `proxy`.

**When to use:** Required for Next.js 16. Protects all dashboard routes.

**Example:**
```typescript
// Source: https://nextjs.org/blog/next-16#proxyts-formerly-middlewarets
// proxy.ts (root of apps/web/ or src/)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/sites(.*)",
  "/upgrade(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

> **Note:** `middleware.ts` still works in Next.js 16 (deprecated, not removed) but Clerk docs already use `proxy.ts`. Use `proxy.ts` for new projects.

### Pattern 3: Async Scan via QStash

**What:** Scanning is a long-running job (up to 30s). The dashboard POST route enqueues it; QStash calls the process handler asynchronously.

**When to use:** Any time a user submits a URL to scan.

**Example:**
```typescript
// Source: https://upstash.com/docs/qstash/features/background-jobs
// app/api/scan/route.ts
import { Client } from "@upstash/qstash";
import { auth } from "@clerk/nextjs/server";
import { validateScanUrl } from "@/lib/validate-url";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { url } = await req.json();
  const safeUrl = validateScanUrl(url); // SSRF prevention — throws on invalid

  // Create pending scan record
  const supabase = createServerSupabaseClient();
  const { data: scan } = await supabase
    .from("scans")
    .insert({ user_id: userId, site_url: safeUrl, status: "pending" })
    .select()
    .single();

  // Enqueue scan job
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/scan/process`,
    body: { scanId: scan.id, url: safeUrl },
  });

  return Response.json({ scanId: scan.id });
}
```

### Pattern 4: Stripe Subscription with Embedded Checkout

**What:** Server Action creates Checkout Session; client renders `<EmbeddedCheckout>`; webhook Route Handler syncs subscription state.

**When to use:** Upgrade flow from Free to Pro or API tier.

**Example:**
```typescript
// Source: https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33
// Server Action (app/upgrade/actions.ts)
"use server";
import Stripe from "stripe";

export async function createCheckoutSession(priceId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  });
  return { clientSecret: session.client_secret! };
}

// Webhook Route Handler — MUST use await request.text() not request.body
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const body = await request.text(); // Required for Stripe signature verification
  const signature = request.headers.get("stripe-signature")!;
  const event = stripe.webhooks.constructEvent(
    body, signature, process.env.STRIPE_WEBHOOK_SECRET!
  );
  // Handle: checkout.session.completed, customer.subscription.updated, etc.
}
```

### Pattern 5: ZIP Download Route Handler

**What:** Server Route Handler fetches generated files from Supabase JSONB, zips them with JSZip, returns binary response.

**When to use:** When user clicks "Download files".

**Example:**
```typescript
// Source: https://stuk.github.io/jszip/documentation/examples/download-zip-file.html
// app/api/download/[siteId]/route.ts
import JSZip from "jszip";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { siteId } = await params; // params is async in Next.js 16
  const supabase = createServerSupabaseClient();

  const { data: scan } = await supabase
    .from("scans")
    .select("files")
    .eq("id", siteId)
    .eq("user_id", userId) // RLS also enforces this
    .single();

  const zip = new JSZip();
  for (const file of scan.files) {
    zip.file(file.name, file.content);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return new Response(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="aeorank-files.zip"`,
    },
  });
}
```

### Anti-Patterns to Avoid

- **Using `middleware.ts` for protected routes without understanding deprecation:** Still works in Next.js 16 but emits warnings. Use `proxy.ts` for new code.
- **Calling `cookies()` synchronously:** Next.js 16 requires `await cookies()`, `await headers()`, `await params`. Sync access throws.
- **Running `scan()` directly in a POST Route Handler:** Scans take up to 30s. Serverless timeout on Vercel hobby is 10s, Pro is 60s. Always dispatch via QStash.
- **Storing generated file content in separate DB rows:** Store all 8 files as a JSONB array in the `scans` table. Avoids 8× round trips.
- **Using the deprecated Clerk JWT template for Supabase:** Deprecated April 2025. Use native integration (`accessToken()` factory pattern).
- **Trusting `request.body` in Stripe webhooks:** Use `await request.text()` to get raw body for signature verification. `request.body` breaks webhook validation.
- **Skipping SSRF validation:** Any user-submitted URL that gets fetched server-side is a SSRF vector. Validate before passing to `scan()`.
- **Using `revalidateTag()` without second arg:** Next.js 16 changed `revalidateTag()` signature — second `cacheLife` argument is now required.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User authentication and sessions | Custom JWT auth | Clerk (`@clerk/nextjs`) | Session management, CSRF, refresh tokens, social login complexity |
| Async job queue | Cron + DB polling | Upstash QStash | Serverless-hostile to maintain polling workers; QStash handles retries, backoff, dead letters |
| Payment processing and PCI compliance | Custom card forms | Stripe Embedded Checkout | PCI DSS scope, card tokenization, webhook reliability |
| Row-level data access control | Application-layer user ID checks | Supabase RLS policies | DB-level enforcement survives bugs in application code |
| ZIP file generation | Manual binary buffer construction | JSZip | ZIP format has complex compression variants; JSZip handles all correctly |
| Sparkline time series chart | Canvas/SVG from scratch | Recharts AreaChart | Responsive, accessible, well-tested; saves 2-3 days |
| SSRF-safe URL parsing | Manual regex | Zod + `URL` constructor + IP range checks | Edge cases: IPv6, encoded characters, redirect chains |

**Key insight:** The dangerous-to-hand-roll items are auth, payments, and the job queue. All three have well-maintained official integrations that handle the failure modes that cause production incidents.

---

## Common Pitfalls

### Pitfall 1: `params` is async in Next.js 16
**What goes wrong:** `const { siteId } = params` throws `TypeError: Cannot destructure property 'siteId' of 'params'` because params is a Promise.
**Why it happens:** Next.js 16 made `params` and `searchParams` async. Breaking change from Next.js 15.
**How to avoid:** Always `await params` before destructuring: `const { siteId } = await params`
**Warning signs:** TypeScript type shows `params: Promise<{ siteId: string }>` — if destructuring without await, TS will warn.

### Pitfall 2: Webhook body consumed before Stripe signature verification
**What goes wrong:** Stripe `constructEvent()` throws `No signatures found matching the expected signature` despite correct secret.
**Why it happens:** `request.json()` or `request.body` in Next.js App Router consumes/parses the body stream, altering the raw bytes that Stripe's HMAC verification expects.
**How to avoid:** Use `await request.text()` (raw string) in the Stripe webhook Route Handler, never `request.json()`.
**Warning signs:** Webhook works locally with Stripe CLI but fails in production.

### Pitfall 3: QStash calls /api/scan/process but Clerk auth blocks it
**What goes wrong:** QStash HTTP callback gets a 401 from Clerk middleware because QStash has no user session.
**Why it happens:** clerkMiddleware protects all `/api/*` routes by default.
**How to avoid:** Add `/api/scan/process` to the public routes list in `proxy.ts`. Verify the QStash signature with `@upstash/qstash`'s `verifySignature` instead of relying on Clerk auth for this internal endpoint.
**Warning signs:** QStash shows jobs failing with HTTP 401; scan records stay stuck in "pending" status.

### Pitfall 4: Supabase RLS rejects QStash process handler inserts
**What goes wrong:** The QStash process handler runs as the Supabase service role (no Clerk token available) and RLS blocks the insert.
**Why it happens:** RLS uses `auth.jwt()->>'sub'` but there's no Clerk JWT in the QStash callback context.
**How to avoid:** Use the Supabase **service role key** (not anon key) in the scan process handler. Store it in `SUPABASE_SERVICE_ROLE_KEY` env var and use it exclusively in server-to-server contexts (never expose to client).
**Warning signs:** Scan process Route Handler returns 200 but scan results don't appear in the DB.

### Pitfall 5: monorepo module tracing for `@aeorank/core`
**What goes wrong:** Vercel build fails with `Module not found: Can't resolve '@aeorank/core'` even though it works locally.
**Why it happens:** Next.js production builds trace file dependencies for serverless function bundling, but by default they only trace within the app's directory. Workspace packages in `packages/` are outside this boundary.
**How to avoid:** Add `outputFileTracingRoot` to `next.config.ts`:
```typescript
// apps/web/next.config.ts
import path from "path";
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
};
export default nextConfig;
```
**Warning signs:** Works in `next dev` (uses source maps), fails only in `next build` or Vercel deploys.

### Pitfall 6: SSRF via user-submitted scan URL
**What goes wrong:** A user submits `http://169.254.169.254/latest/meta-data/` and the scanner fetches AWS instance metadata.
**Why it happens:** `scan()` in `@aeorank/core` does real HTTP fetches. Any user-controlled URL on a server with cloud metadata endpoints is a SSRF vector.
**How to avoid:** Before calling `scan()`, resolve and validate the URL:
  1. Parse with `new URL()` — rejects malformed URLs
  2. Block non-HTTP/HTTPS schemes
  3. Resolve hostname to IP, block private/loopback/link-local ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x, ::1, fc00::/7)
  4. Block localhost variants
**Warning signs:** This is a launch blocker (flagged in STATE.md). Must be in Wave 1.

### Pitfall 7: Scan timeout on Vercel Hobby plan
**What goes wrong:** Scans of large sites (50 pages) exceed the 10-second serverless function limit on Vercel Hobby.
**Why it happens:** `scan()` can take up to 30 seconds. Hobby plan has 10s timeout; Pro plan has 60s.
**How to avoid:** Always use QStash for scan dispatch (async). Never run `scan()` synchronously in a user-facing Route Handler.
**Warning signs:** Pro plan (60s) can be an escape hatch during development, but production architecture should always be async.

---

## Code Examples

### Supabase Database Schema (SQL)
```sql
-- Source: Supabase RLS + Clerk native integration pattern
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Sites table: one row per user-added site
create table sites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,  -- Clerk user ID (auth.jwt()->>'sub')
  url         text not null,
  name        text,
  created_at  timestamptz default now()
);

-- Scan results: one row per scan run
create table scans (
  id          uuid primary key default uuid_generate_v4(),
  site_id     uuid references sites(id) on delete cascade,
  user_id     text not null,
  status      text not null default 'pending', -- pending | running | complete | error
  score       integer,
  grade       text,
  dimensions  jsonb,   -- DimensionScore[] from @aeorank/core
  files       jsonb,   -- GeneratedFile[] from @aeorank/core (name + content)
  pages_scanned integer,
  duration_ms integer,
  error       text,
  scanned_at  timestamptz default now()
);

-- Subscriptions: synced from Stripe webhooks
create table subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             text not null unique,
  stripe_customer_id  text,
  stripe_subscription_id text,
  plan                text not null default 'free',  -- free | pro | api
  status              text not null default 'active', -- active | canceled | past_due
  current_period_end  timestamptz,
  updated_at          timestamptz default now()
);

-- RLS policies
alter table sites enable row level security;
alter table scans enable row level security;
alter table subscriptions enable row level security;

create policy "users_own_sites" on sites
  for all using ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans" on scans
  for all using ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_subscription" on subscriptions
  for select using ((select auth.jwt()->>'sub') = user_id);
-- Subscriptions are updated only by service role (Stripe webhook handler)
```

### SSRF-Safe URL Validation
```typescript
// Source: MDN SSRF guide + Zod docs
// lib/validate-url.ts
import { z } from "zod";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // AWS metadata
  /^fc00:/i,
  /^fe80:/i,
];

export function validateScanUrl(raw: string): string {
  const parsed = z.string().url().safeParse(raw);
  if (!parsed.success) throw new Error("Invalid URL format");

  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP/HTTPS URLs are allowed");
  }
  if (BLOCKED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("Private/loopback hosts are not allowed");
  }
  for (const range of PRIVATE_IP_RANGES) {
    if (range.test(url.hostname)) throw new Error("Private IP ranges are not allowed");
  }
  return url.toString();
}
```

### Recharts 30-Day Sparkline
```typescript
// Source: Recharts docs + recharts.org
// components/ScoreChart.tsx
"use client";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ScorePoint { date: string; score: number }

export function ScoreChart({ data }: { data: ScorePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data}>
        <XAxis dataKey="date" hide />
        <Tooltip
          formatter={(v: number) => [`${v}`, "AEO Score"]}
          labelFormatter={(l) => new Date(l).toLocaleDateString()}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#111"
          fill="#111"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### next.config.ts for Monorepo
```typescript
// Source: Vercel monorepo docs + Next.js outputFileTracingRoot
// apps/web/next.config.ts
import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for @aeorank/core to be traced correctly in production builds
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Turbopack is default in Next.js 16; webpack still available via CLI flag
};

export default nextConfig;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` (exported as `proxy`) | Next.js 16 (Oct 2025) | Must rename file; `middleware.ts` deprecated, warns |
| Clerk JWT template for Supabase | Clerk native Supabase integration (`accessToken()`) | April 2025 (JWT template deprecated) | No more JWT secret sharing; simpler client factory |
| `params.siteId` (sync) | `(await params).siteId` (async) | Next.js 16 (Oct 2025) | Breaking: sync access throws in production |
| `revalidateTag(tag)` | `revalidateTag(tag, 'max')` | Next.js 16 (Oct 2025) | Second argument required for SWR behavior |
| `experimental.ppr` config | `cacheComponents: true` | Next.js 16 (Oct 2025) | PPR evolved into Cache Components; old flag removed |
| Webpack default | Turbopack default | Next.js 16 (Oct 2025) | Faster builds; webpack opt-out via `--webpack` flag |
| API Routes (`pages/api/`) | Route Handlers (`app/api/*/route.ts`) | Next.js 13+ | Standard App Router pattern; confirmed for all API work |

**Deprecated/outdated:**
- `middleware.ts`: Works in Next.js 16 but deprecated — rename to `proxy.ts` for new projects
- Clerk JWT template for Supabase: Deprecated April 1, 2025 — use native `accessToken()` integration
- `experimental.turbopack` config key: Moved to top-level `turbopack` in Next.js 16
- `serverRuntimeConfig`/`publicRuntimeConfig`: Removed in Next.js 16 — use `.env` files

---

## Open Questions

1. **Stripe product/price IDs**
   - What we know: Three tiers needed — Free, Pro ($29/mo), API ($99/mo)
   - What's unclear: Price IDs need to be created in Stripe Dashboard before implementation; test vs. live mode management
   - Recommendation: Create placeholder `STRIPE_PRO_PRICE_ID` and `STRIPE_API_PRICE_ID` env vars in Wave 1; actual IDs set during verification

2. **Supabase Realtime vs. polling for scan status**
   - What we know: Supabase Realtime can subscribe to row changes; polling with 3s interval is simpler
   - What's unclear: Realtime requires additional setup (replication slots, channel management); polling is easier to debug
   - Recommendation: Use polling (TanStack Query with `refetchInterval: 3000`) in Wave 2; can upgrade to Realtime post-launch

3. **QStash signature verification key rotation**
   - What we know: QStash signs its HTTP callbacks; `@upstash/qstash`'s `verifySignature` middleware handles verification
   - What's unclear: Development environment setup — QStash local development requires ngrok or a public URL
   - Recommendation: Use `QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY` env vars; for local dev, skip verification via env flag or use QStash's local dev emulator

4. **File storage: Supabase JSONB vs. Supabase Storage**
   - What we know: 8 generated files are text-only, typically 1-50KB each total. JSONB in the `scans` table is simplest.
   - What's unclear: If very large sites produce large `llms-full.txt` files (>1MB), JSONB becomes unwieldy
   - Recommendation: Start with JSONB in `scans.files` column. If file sizes exceed 500KB, migrate to Supabase Storage bucket in a later phase.

5. **Vercel deployment tier for scan processing**
   - What we know: QStash async dispatch sidesteps the 10s Hobby limit for the user-facing API. The process handler itself may still hit limits.
   - What's unclear: What timeout does Vercel apply to the QStash-called `/api/scan/process` route?
   - Recommendation: Use Vercel Pro (60s timeout) for production launch. Configure QStash max retries to 3 with exponential backoff. Document as a launch requirement.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/blog/next-16 — Next.js 16 changelog: `proxy.ts`, async `params`, breaking changes, Turbopack stable
- https://clerk.com/docs/nextjs/getting-started/quickstart — Clerk Next.js setup, `proxy.ts` file naming, environment variables
- https://clerk.com/docs/guides/development/integrations/databases/supabase — Native Clerk+Supabase integration (not JWT template)
- https://supabase.com/docs/guides/auth/third-party/clerk — Supabase third-party auth configuration for Clerk
- `packages/core/src/index.ts` — `scan()` API, `ScanResult`, `GeneratedFile`, `DimensionScore` types (read directly)
- `packages/core/src/types.ts` — Complete type definitions for dashboard data model

### Secondary (MEDIUM confidence)
- https://dev.to/sameer_saleem/the-ultimate-guide-to-stripe-nextjs-2026-edition-2f33 — Stripe Embedded Checkout + Server Actions pattern; webhook body must use `request.text()`
- https://upstash.com/docs/qstash/features/background-jobs — QStash background jobs with Next.js Route Handlers
- https://stuk.github.io/jszip/documentation/examples/download-zip-file.html — JSZip in-memory ZIP generation
- https://github.com/vercel/next.js/discussions/33989 — Background job limitations on Vercel serverless

### Tertiary (LOW confidence — needs validation)
- Community reports about QStash 401s from Clerk middleware — verify by testing public route exclusion for `/api/scan/process`
- Vercel Pro 60s timeout for QStash-callback routes — verify against current Vercel docs before launch

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js 16, Clerk, Supabase native integration all verified from official sources
- Architecture: HIGH — `proxy.ts`, async `params`, QStash pattern all from official docs
- Pitfalls: HIGH for SSRF + async params (confirmed breaking changes); MEDIUM for QStash/Clerk 401 (logical deduction, not directly tested)
- Stripe: HIGH for webhook body pattern; MEDIUM for Embedded Checkout (verified via multiple sources)

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days; Next.js 16.x is stable but Clerk/Supabase native integration may update)
