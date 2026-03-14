---
phase: 05-saas-dashboard
plan: 01
subsystem: auth
tags: [nextjs, clerk, supabase, postgresql, rls, ssrf, zod, vitest]

# Dependency graph
requires:
  - phase: 04-github-action
    provides: "Complete aeorank/core package with scan() API and ScanResult types"
provides:
  - "Next.js 16 App Router project at apps/web with Turbopack"
  - "Clerk authentication with proxy.ts middleware protecting /dashboard, /sites, /upgrade"
  - "ClerkProvider root layout with sign-in and sign-up pages"
  - "Protected (dashboard) layout with server-side auth() redirect guard"
  - "Supabase client factory with Clerk native accessToken() integration"
  - "Service-role Supabase client for QStash callback contexts"
  - "SSRF-safe validateScanUrl() blocking all private IPs and non-HTTP schemes"
  - "Complete database schema (sites, scans, subscriptions) with RLS policies"
  - ".env.example template with all required variable placeholders"
affects:
  - "05-02 — scan API needs validateScanUrl and createServerSupabaseClient"
  - "05-03 — score history chart reads from scans table defined in schema"
  - "05-04 — ZIP download reads files JSONB column from scans table"
  - "05-05 — Stripe webhook writes to subscriptions table"

# Tech tracking
tech-stack:
  added:
    - "next@16.1.6 (App Router, Turbopack default)"
    - "react@19.2.4 + react-dom@19.2.4"
    - "@clerk/nextjs (latest) — auth, session management"
    - "@supabase/supabase-js@^2.99.1 — database client"
    - "zod@^3.25.76 — URL validation"
    - "vitest@^3 — test framework"
  patterns:
    - "Clerk native Supabase integration via accessToken() factory (not deprecated JWT template)"
    - "proxy.ts middleware for Next.js 16 (replaces deprecated middleware.ts)"
    - "auth.protect() called directly on auth parameter in clerkMiddleware handler"
    - "Service-role client for trusted server-to-server contexts (QStash, webhooks)"
    - "SSRF validation with Zod + URL constructor + blocked host set + IP range regexes"
    - "TDD: test file committed first (RED), implementation second (GREEN)"

key-files:
  created:
    - "apps/web/proxy.ts — Clerk auth middleware protecting dashboard routes"
    - "apps/web/app/layout.tsx — ClerkProvider root layout with Inter font"
    - "apps/web/app/(dashboard)/layout.tsx — Protected layout with auth() redirect guard"
    - "apps/web/app/(dashboard)/dashboard/page.tsx — Dashboard placeholder page"
    - "apps/web/app/sign-in/[[...sign-in]]/page.tsx — Clerk SignIn UI component"
    - "apps/web/app/sign-up/[[...sign-up]]/page.tsx — Clerk SignUp UI component"
    - "apps/web/lib/supabase.ts — createServerSupabaseClient() and createServiceSupabaseClient()"
    - "apps/web/lib/validate-url.ts — SSRF-safe validateScanUrl() with 12-test coverage"
    - "apps/web/lib/validate-url.test.ts — 12 vitest tests for SSRF validation"
    - "apps/web/next.config.ts — outputFileTracingRoot for monorepo @aeorank/core tracing"
    - "apps/web/tsconfig.json — App Router tsconfig with bundler moduleResolution"
    - "apps/web/.env.example — all required env var placeholders"
    - "supabase/schema.sql — complete schema with 3 tables + RLS + indexes"
  modified:
    - "apps/web/package.json — replaced stub with full Next.js 16 project manifest"

key-decisions:
  - "auth.protect() not auth().protect() — Clerk v6 API: auth param in clerkMiddleware is AuthFn with protect() as direct property"
  - "proxy.ts chosen over middleware.ts — Next.js 16 added PROXY_FILENAME constant; proxy.ts is idiomatic for new projects"
  - "Supabase accessToken() factory — uses Clerk native integration, not deprecated JWT template approach"
  - "vitest.config.ts with environment:node added to support test file imports correctly"

patterns-established:
  - "Pattern: Clerk auth middleware in proxy.ts protects /dashboard, /sites, /upgrade routes"
  - "Pattern: createServerSupabaseClient() for user-context queries; createServiceSupabaseClient() for system-level jobs"
  - "Pattern: validateScanUrl() called before any user-submitted URL reaches scan()"

requirements-completed:
  - DASH-01

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 5 Plan 01: Next.js 16 Foundation Summary

**Next.js 16 App Router with Clerk auth (proxy.ts pattern), Supabase client via native Clerk accessToken() integration, SSRF-safe URL validation, and complete 3-table database schema with RLS**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T19:31:41Z
- **Completed:** 2026-03-14T19:45:00Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Next.js 16.1.6 app builds successfully with Turbopack; all routes compile and type-check
- Clerk auth fully wired: proxy.ts middleware, ClerkProvider root layout, sign-in/sign-up pages, protected dashboard layout
- Supabase client factory uses Clerk native accessToken() integration (not the deprecated JWT template)
- SSRF validation blocks all 12 required attack vectors; 12/12 tests pass
- Complete database schema: sites, scans, subscriptions tables with RLS policies and performance indexes

## Task Commits

Each task was committed atomically:

1. **Task 1: Next.js 16 project bootstrap with Clerk auth and Supabase client** - `bab60da` (feat)
2. **Task 2: SSRF validation tests (RED)** - `c0bd0c5` (test)
3. **Task 2: SSRF validation implementation (GREEN)** - `482d707` (feat)

_Note: TDD task 2 has two commits — test file first (RED), implementation second (GREEN)_

## Files Created/Modified
- `apps/web/proxy.ts` — Clerk middleware with clerkMiddleware protecting /dashboard, /sites, /upgrade
- `apps/web/next.config.ts` — outputFileTracingRoot set for @aeorank/core monorepo tracing
- `apps/web/tsconfig.json` — bundler moduleResolution for Next.js 16 App Router
- `apps/web/app/layout.tsx` — ClerkProvider root with Inter font and metadata
- `apps/web/app/(dashboard)/layout.tsx` — Protected layout with server-side auth() redirect
- `apps/web/app/(dashboard)/dashboard/page.tsx` — Placeholder dashboard page
- `apps/web/app/sign-in/[[...sign-in]]/page.tsx` — Clerk SignIn component
- `apps/web/app/sign-up/[[...sign-up]]/page.tsx` — Clerk SignUp component
- `apps/web/lib/supabase.ts` — Supabase client factory (authenticated + service-role)
- `apps/web/lib/validate-url.ts` — SSRF-safe URL validation
- `apps/web/lib/validate-url.test.ts` — 12 vitest tests (all passing)
- `apps/web/.env.example` — env var template
- `apps/web/package.json` — Next.js 16 project manifest with all dependencies
- `supabase/schema.sql` — Complete schema: sites + scans + subscriptions + RLS + indexes

## Decisions Made
- **auth.protect() API:** Clerk v6 changed the middleware auth parameter — it's no longer a callable that returns an object; `protect()` is a direct method on the auth parameter. The research used `auth().protect()` which threw a TypeScript error; fixed to `auth.protect()`.
- **proxy.ts confirmed:** Next.js 16 has `PROXY_FILENAME = 'proxy'` in constants.js alongside `MIDDLEWARE_FILENAME = 'middleware'`, confirming proxy.ts is the idiomatic Next.js 16 pattern.
- **Supabase accessToken():** Using the native Clerk integration as specified in research — no JWT secret sharing required.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Clerk middleware API call pattern**
- **Found during:** Task 1 (Next.js app bootstrap)
- **Issue:** Research showed `auth().protect()` but Clerk v6 type definitions show `auth.protect()` — calling `auth()` returns `Promise<SessionAuthWithRedirect>` which has no `protect()` method
- **Fix:** Changed `auth().protect()` to `auth.protect()` in proxy.ts
- **Files modified:** `apps/web/proxy.ts`
- **Verification:** Next.js build passes TypeScript check with no errors
- **Committed in:** `bab60da` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in research pattern)
**Impact on plan:** Fix was necessary for TypeScript correctness and correct Clerk behavior. No scope creep.

## Issues Encountered
- Clerk docs (research) showed `auth().protect()` but the installed Clerk v6 uses `auth.protect()` — the `auth` parameter in `clerkMiddleware` is `AuthFn` which has `protect` as a direct property, not as a method on the returned session object.

## User Setup Required

**External services require manual configuration before testing the dashboard.** Required environment variables and dashboard steps:

**Clerk:**
1. Create account at clerk.com
2. Create application
3. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from API Keys
4. Add `apps/web/.env.local` with both keys

**Supabase:**
1. Create project at supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Enable Clerk as third-party auth: Auth → Third-party Auth → Add Provider → Clerk
4. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

See `apps/web/.env.example` for all required variables with source instructions.

## Next Phase Readiness
- Next.js 16 app is bootable: `pnpm --filter @aeorank/web dev`
- Auth foundation complete — all subsequent plans can assume Clerk and Supabase are available
- validateScanUrl() is ready for use in scan API route (Phase 5 Plan 02)
- Database schema is ready to deploy to Supabase
- No blockers for Plan 02 (scan API, QStash integration)

---
*Phase: 05-saas-dashboard*
*Completed: 2026-03-14*
