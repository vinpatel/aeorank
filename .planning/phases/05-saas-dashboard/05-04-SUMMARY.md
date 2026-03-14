---
phase: 05-saas-dashboard
plan: 04
subsystem: ui
tags: [recharts, jszip, nextjs, react, supabase, clerk, sparkline, download]

# Dependency graph
requires:
  - phase: 05-saas-dashboard
    plan: 02
    provides: "Scan pipeline writing scores + files JSONB to Supabase scans table"
  - phase: 05-saas-dashboard
    plan: 03
    provides: "Stripe billing with subscriptions table"
provides:
  - "ScoreChart client component: Recharts AreaChart 30-day sparkline with single-point dot handling"
  - "GET /api/download/[siteId]: auth-gated ZIP download of all 8 generated files from JSONB"
  - "DownloadButton client component: fetch + blob URL trigger + loading spinner"
  - "Site detail page updated with score history chart and download button above ScoreBreakdown"
affects:
  - "05-05 — plan 5 can assume ScoreChart + download complete for site detail"

# Tech tracking
tech-stack:
  added:
    - "recharts@^2 — AreaChart sparkline with ResponsiveContainer, XAxis, YAxis, Area, Dot, Tooltip"
    - "jszip@^3 — ZIP generation from JSONB files array; arraybuffer output type for Web API compat"
    - "@types/jszip — TypeScript types for jszip"
  patterns:
    - "JSZip generateAsync arraybuffer type (not nodebuffer/uint8array) for Next.js Route Handler Response BodyInit compatibility"
    - "Single data point edge case: render <Dot> explicitly instead of relying on chart auto-render"
    - "Score history query: 30-day window with .gte() filter + ascending order for chronological sparkline"
    - "ZIP filename derived from site URL hostname via URL constructor; falls back to siteId on error"

key-files:
  created:
    - "apps/web/components/ScoreChart.tsx — Recharts sparkline chart with 3 states: empty, single point, multi-point"
    - "apps/web/app/api/download/[siteId]/route.ts — GET handler: auth, ownership check, JSZip, arraybuffer Response"
    - "apps/web/components/DownloadButton.tsx — Client button: fetch /api/download, blob URL, anchor click trigger"
  modified:
    - "apps/web/app/(dashboard)/sites/[siteId]/page.tsx — added scoreHistory query, ScoreChart + DownloadButton rendering"
    - "apps/web/package.json — added recharts, jszip, @types/jszip"

key-decisions:
  - "JSZip arraybuffer output type — nodebuffer yields Buffer<ArrayBufferLike> (Node-only), uint8array yields Uint8Array<ArrayBufferLike>; both fail TypeScript's BodyInit assignability check in strict mode. arraybuffer returns ArrayBuffer which is assignable to BodyInit."
  - "ScoreChart renders only when scoreHistory.length > 0 — avoids empty chart rendering for sites with no completed scans in window"
  - "DownloadButton always shown when scan is complete (not gated on plan tier in this plan) — plan 05 can add gating if needed"

patterns-established:
  - "Pattern: JSZip in Next.js Route Handlers must use arraybuffer output type to satisfy Web API Response BodyInit"
  - "Pattern: Recharts single-point rendering requires explicit <Dot> component in Area dot prop"

requirements-completed:
  - DASH-03
  - DASH-04

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 5 Plan 04: Score Chart + ZIP Download Summary

**Recharts 30-day score sparkline and JSZip-powered authenticated file download — site detail page now shows AEO progress history and one-click delivery of all 8 generated files**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T23:59:00Z
- **Completed:** 2026-03-15T00:01:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- ScoreChart renders a 30-day score sparkline using Recharts AreaChart; handles empty state (placeholder) and single data point (explicit Dot) without crashing
- GET /api/download/[siteId] returns authenticated ZIP of all 8 generated files from the JSONB `files` column; rejects with 401 if no session, 404 if no completed scan
- DownloadButton triggers browser download via fetch → blob → object URL → hidden anchor click with loading spinner state
- Build passes cleanly with both new routes visible in Next.js output

## Task Commits

Each task was committed atomically:

1. **Task 1: Score history sparkline chart** - `eaabd59` (feat)
2. **Task 2: ZIP download route and button** - `9bbd4cc` (feat)

## Files Created/Modified
- `apps/web/components/ScoreChart.tsx` — Recharts sparkline: empty/single/multi states, tooltip with formatted date
- `apps/web/app/api/download/[siteId]/route.ts` — GET: Clerk auth, ownership-verified scan query, JSZip, arraybuffer Response
- `apps/web/components/DownloadButton.tsx` — Client component: fetch, blob URL, anchor trigger, loading spinner, error display
- `apps/web/app/(dashboard)/sites/[siteId]/page.tsx` — Added 30-day history query, ScoreChart section, DownloadButton above ScoreBreakdown
- `apps/web/package.json` + `pnpm-lock.yaml` — recharts, jszip, @types/jszip added

## Decisions Made
- **JSZip arraybuffer:** Both `nodebuffer` and `uint8array` output types from JSZip fail TypeScript's `BodyInit` assignability check in strict mode in Next.js Route Handlers. `arraybuffer` returns an `ArrayBuffer` which is a valid `BodyInit`. This is the correct Web API output format for route handlers that run in edge/Node runtimes.
- **DownloadButton not plan-gated:** Plan 03 notes say plan 04 "should gate behind pro/api plan check" — but the plan spec for 04 says "only show if latest scan status is complete" with no mention of tier gating. Kept it ungated to match the spec; plan 05 can add tier enforcement if needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] JSZip nodebuffer incompatible with Next.js Route Handler Response**
- **Found during:** Task 2 verification (first build attempt)
- **Issue:** `zip.generateAsync({ type: "nodebuffer" })` returns `Buffer<ArrayBufferLike>` (Node.js type) which TypeScript's `BodyInit` type doesn't accept. Second attempt with `uint8array` also failed — `Uint8Array<ArrayBufferLike>` generic mismatch with `BodyInit`.
- **Fix:** Changed to `type: "arraybuffer"` which returns `ArrayBuffer`, a valid `BodyInit` per Web API spec
- **Files modified:** `apps/web/app/api/download/[siteId]/route.ts`
- **Verification:** `pnpm --filter @aeorank/web build` passes TypeScript check with no errors
- **Committed in:** `9bbd4cc` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — JSZip output type incompatibility with Web API Response)
**Impact on plan:** Fix required for TypeScript correctness. arraybuffer is actually the preferred Web API format for binary responses. No scope creep.

## Issues Encountered
- JSZip offers multiple output types (`nodebuffer`, `uint8array`, `arraybuffer`, `blob`, etc.); both `nodebuffer` and `uint8array` have generic type parameters that cause TypeScript strict mode failures with `new Response()`. The Web-API-native `arraybuffer` type resolves this cleanly.

## User Setup Required
None — no new external services. Features use the existing Clerk auth and Supabase setup from plans 01/02.

## Next Phase Readiness
- Score history chart and ZIP download complete — site detail page delivers full value proposition
- ScoreChart and DownloadButton are standalone components; plan 05 can reuse or reference without changes
- No blockers for Plan 05 (scan limits / final polish)

---
*Phase: 05-saas-dashboard*
*Completed: 2026-03-14*

## Self-Check: PASSED

All 4 files verified present. Both task commits (eaabd59, 9bbd4cc) confirmed in git history.
