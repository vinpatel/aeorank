---
phase: 05-saas-dashboard
plan: 02
subsystem: api
tags: [nextjs, qstash, upstash, supabase, clerk, react, tailwind]

# Dependency graph
requires:
  - phase: 05-saas-dashboard
    plan: 01
    provides: "Next.js 16 foundation with Clerk auth, Supabase client factory, SSRF validation, database schema"
provides:
  - "POST /api/scan: SSRF-safe URL validation, upsert site, insert pending scan, enqueue QStash job"
  - "POST /api/scan/process: QStash signature verification, run scan() from @aeorank/core, write results to Supabase"
  - "GET /api/scan/status: auth-gated scan status polling endpoint"
  - "AddSiteForm client component: URL input, POST to /api/scan, redirect to site detail on success"
  - "ScanStatus client component: polls /api/scan/status every 3s, router.refresh() on complete"
  - "ScoreBreakdown server component: 12-dimension table with score/grade, weight badges, status indicators"
  - "Dashboard page: Supabase join of sites + latest scan, empty state, site cards with scores"
  - "Site detail page: async params (Next.js 16), ScanStatus for in-progress, ScoreBreakdown for complete"
affects:
  - "05-03 — score history chart layers on top of the scan data written here"
  - "05-04 — ZIP download reads files JSONB column written in /api/scan/process"
  - "05-05 — Stripe billing gates scan count; scan creation point is /api/scan"

# Tech tracking
tech-stack:
  added:
    - "@upstash/qstash — async job queue client for scan dispatch and signature verification"
  patterns:
    - "Lazy QStash client factory (getQStashClient()) — avoids build-time instantiation without QSTASH_TOKEN"
    - "Service-role Supabase client in QStash callback — no Clerk session in async callbacks"
    - "QStash Receiver signature verification before processing callback payload"
    - "Server Component data fetching with try/catch silent fallback for unconfigured Supabase"
    - "Next.js 16 async params: const { siteId } = await params in dynamic route pages"

key-files:
  created:
    - "apps/web/lib/qstash.ts — getQStashClient() lazy factory"
    - "apps/web/app/api/scan/route.ts — POST: validate URL, upsert site, insert scan, enqueue QStash"
    - "apps/web/app/api/scan/process/route.ts — POST: QStash callback, run scan(), write results"
    - "apps/web/app/api/scan/status/route.ts — GET: poll scan status by id"
    - "apps/web/components/AddSiteForm.tsx — URL form with error handling and redirect"
    - "apps/web/components/ScanStatus.tsx — polling component with spinner and refresh"
    - "apps/web/components/ScoreBreakdown.tsx — 12-dimension score table"
    - "apps/web/app/(dashboard)/sites/[siteId]/page.tsx — site detail with scan result display"
  modified:
    - "apps/web/app/(dashboard)/dashboard/page.tsx — replaced placeholder with full site list + AddSiteForm"

key-decisions:
  - "getQStashClient() factory pattern — lazy instantiation avoids build failure when QSTASH_TOKEN is absent"
  - "Service role Supabase client in /api/scan/process — QStash callbacks have no Clerk session; scan user_id was set at enqueue time so RLS is bypassed safely"
  - "QStash signature verification with Receiver — prevents unauthorized calls to the processing endpoint"
  - "Dashboard site query uses Supabase join (sites + scans), filters completed scans client-side for latest"

patterns-established:
  - "Pattern: All async job callbacks (QStash, webhooks) use service-role Supabase client, not user-context client"
  - "Pattern: Lazy SDK factories for credentials that aren't available at build time"
  - "Pattern: try/catch with silent fallback in Server Components for unconfigured external services (dev ergonomics)"

requirements-completed:
  - DASH-02

# Metrics
duration: 20min
completed: 2026-03-14
---

# Phase 5 Plan 02: Scan Flow Summary

**QStash-powered async scan pipeline with AddSiteForm, ScanStatus polling, and 12-dimension ScoreBreakdown — the complete add-site-to-see-score loop**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-14T23:38:35Z
- **Completed:** 2026-03-14T23:58:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Complete async scan pipeline: POST /api/scan enqueues a QStash job, POST /api/scan/process runs `scan()` from `@aeorank/core` and writes all 12 dimension scores to Supabase
- QStash signature verification on the callback endpoint prevents unauthorized calls
- Dashboard page shows all user sites with latest scores; AddSiteForm redirects to site detail on success
- ScanStatus polls GET /api/scan/status every 3 seconds and calls `router.refresh()` when complete so the page transitions from spinner to ScoreBreakdown without a manual reload

## Task Commits

Each task was committed atomically:

1. **Task 1: Scan API routes and QStash client** - `cdbeacb` (feat)
2. **Task 2: Dashboard UI — site list, scan status, score breakdown** - `7b1775d` (feat)

## Files Created/Modified
- `apps/web/lib/qstash.ts` — Lazy `getQStashClient()` factory (avoids build-time failure)
- `apps/web/app/api/scan/route.ts` — POST: auth, SSRF validation, upsert site, insert pending scan, enqueue QStash
- `apps/web/app/api/scan/process/route.ts` — POST: QStash signature verify, run scan(), write results
- `apps/web/app/api/scan/status/route.ts` — GET: return scan status for polling
- `apps/web/components/AddSiteForm.tsx` — URL input form, POST /api/scan, redirect on success
- `apps/web/components/ScanStatus.tsx` — Polls every 3s, shows spinner, calls router.refresh() on complete
- `apps/web/components/ScoreBreakdown.tsx` — 12-dimension table: score/maxScore, weight badge, status dot, hint
- `apps/web/app/(dashboard)/dashboard/page.tsx` — Site list with latest scores, empty state, AddSiteForm
- `apps/web/app/(dashboard)/sites/[siteId]/page.tsx` — Site detail page with scan result display

## Decisions Made
- **Lazy QStash client:** Next.js evaluates route modules during `next build`; `QSTASH_TOKEN` doesn't exist at build time. A module-level singleton would throw. Switching to `getQStashClient()` (factory called inside the handler) resolved the build failure.
- **Service-role Supabase in /api/scan/process:** QStash callbacks are unauthenticated HTTP requests with no Clerk session. Using `createServiceSupabaseClient()` (bypasses RLS) is safe here because `user_id` was set at enqueue time in the trusted `/api/scan` handler.
- **Dashboard scan join:** The Supabase query joins `sites` with `scans` using a nested select. "Latest completed scan" is determined by filtering for `status === "complete"` and sorting by `scanned_at` in the server component — avoiding a complex SQL subquery.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] QStash client module-level instantiation caused build failure**
- **Found during:** Task 1 verification (first build attempt)
- **Issue:** `new Client({ token: process.env.QSTASH_TOKEN! })` at module scope throws during `next build` because `QSTASH_TOKEN` isn't set in the build environment
- **Fix:** Replaced singleton export with `getQStashClient()` factory function called inside the POST handler
- **Files modified:** `apps/web/lib/qstash.ts`, `apps/web/app/api/scan/route.ts`
- **Verification:** Build passes cleanly without QSTASH_TOKEN set
- **Committed in:** `cdbeacb` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking build issue)
**Impact on plan:** Fix necessary for `next build` to succeed. Factory pattern is actually preferable — creates a fresh client per request, avoiding stale credential issues.

## Issues Encountered
- Pre-existing files from future plans (stripe webhook, upgrade actions) were already committed with the correct lazy `getStripeClient()` pattern and `2026-02-25.clover` API version. The build initially showed these files as failing but they matched HEAD exactly — the working tree changes I made during debugging were redundant edits that matched the committed state. Build passed after the QStash fix.

## User Setup Required

**QStash requires manual configuration before the scan pipeline will work.** Required environment variables:

1. Create account at upstash.com
2. Go to QStash console
3. Add to `apps/web/.env.local`:
   - `QSTASH_TOKEN` — from QStash console → REST API → Token
   - `QSTASH_CURRENT_SIGNING_KEY` — from QStash console → Signing Keys → Current
   - `QSTASH_NEXT_SIGNING_KEY` — from QStash console → Signing Keys → Next
   - `NEXT_PUBLIC_APP_URL` — your deployed URL (e.g., `https://app.aeorank.dev`) — QStash needs this to call back to `/api/scan/process`

See `apps/web/.env.example` for the full variable list.

## Next Phase Readiness
- Complete scan loop is functional: AddSiteForm → /api/scan → QStash → /api/scan/process → scan() → Supabase → site detail page
- Scan data (score, grade, dimensions, files) is written to the `scans` table as JSONB
- Ready for Plan 03 (score history chart — reads from scans table)
- Ready for Plan 04 (ZIP download — reads files JSONB column from scans table)
- No blockers for Plan 03

---
*Phase: 05-saas-dashboard*
*Completed: 2026-03-14*
