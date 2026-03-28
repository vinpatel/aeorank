---
phase: 05-saas-dashboard
verified: 2026-03-14T00:00:00Z
status: human_needed
score: 4/4 success criteria verified (automated)
re_verification: false
human_verification:
  - test: "Sign up → add site → scan → see score"
    expected: "User completes Clerk sign-up, lands on dashboard, adds a URL, is redirected to site detail page, scan processes via QStash, AEO score and 12-dimension breakdown appear"
    why_human: "Requires live Clerk, Supabase, and QStash credentials; network-bound async pipeline"
  - test: "30-day sparkline chart displays for returning user"
    expected: "After a second scan, site detail page shows a 2-point sparkline above the dimension table with tooltip showing score/date"
    why_human: "Requires multiple real scan records written to Supabase; chart rendering requires a browser"
  - test: "ZIP download delivers all 8 generated files"
    expected: "Clicking 'Download all files (ZIP)' triggers a browser download; ZIP contains 8 files including llms.txt, CLAUDE.md, schema.json, etc."
    why_human: "Requires a completed scan record in Supabase with populated files JSONB column; needs real browser download"
  - test: "Stripe checkout creates subscription and updates plan badge"
    expected: "User clicks Upgrade on Pro tier, Embedded Checkout modal appears, completing with test card 4242 4242 4242 4242 triggers webhook, dashboard nav now shows 'Pro' badge"
    why_human: "Requires live Stripe test keys, webhook endpoint reachable from Stripe (ngrok for local), and full event-driven subscription update"
---

# Phase 5: SaaS Dashboard Verification Report

**Phase Goal:** Users can sign in, add a site by URL, view their AEO score history, download all generated files in a ZIP, and subscribe to a paid plan — the complete SaaS product is live
**Verified:** 2026-03-14
**Status:** human_needed (all automated checks pass — 4 external-service flows need human verification)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Success Criteria (from ROADMAP.md)

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | User can sign up with Clerk, add a URL, trigger a scan, and see AEO score with 12-dimension breakdown | ? HUMAN | All code verified; requires live credentials and QStash callback |
| 2 | Returning user can view a 30-day sparkline chart showing score change over time | ? HUMAN | ScoreChart component verified, query verified; requires multiple scan records |
| 3 | User can click "Download files" and receive a ZIP containing all 8 generated files | ? HUMAN | Download route and DownloadButton verified; requires completed scan with files JSONB |
| 4 | User can upgrade from Free to Pro ($29) via Stripe without manual intervention | ? HUMAN | Checkout flow and webhook handler verified; requires live Stripe test keys and reachable webhook |

**Score:** All 4 automated infrastructure checks pass. Outcome delivery requires human verification with live credentials.

---

### Observable Truths (derived from must_haves across plans 01-04)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Next.js 16 app boots and all routes compile | VERIFIED | `pnpm --filter @aeorank/web build` passes; 11 routes present in build output |
| 2 | Clerk sign-in/sign-up pages render and redirect correctly | VERIFIED | `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` render Clerk's `<SignIn>` and `<SignUp>` components |
| 3 | Protected /dashboard route redirects unauthenticated users to sign-in | VERIFIED | `app/(dashboard)/layout.tsx` calls `auth()`, redirects to `/sign-in` when `userId` is null |
| 4 | Supabase client factory uses Clerk native accessToken() integration | VERIFIED | `lib/supabase.ts` uses `async accessToken() { return (await auth()).getToken(); }` pattern |
| 5 | SSRF validation blocks private IPs, loopback, and non-HTTP schemes | VERIFIED | `lib/validate-url.ts` blocks 12 attack vectors; called in `/api/scan` route before scan dispatch |
| 6 | User can submit a URL via the Add Site form on the dashboard | VERIFIED | `AddSiteForm.tsx` POSTs to `/api/scan` with `{ url }`, redirects to `/sites/[siteId]` on success |
| 7 | Submitting a URL creates a pending scan and enqueues a QStash job | VERIFIED | `app/api/scan/route.ts` upserts site, inserts pending scan, calls `getQStashClient().publishJSON()` |
| 8 | QStash callback processes scan and writes results to Supabase | VERIFIED | `app/api/scan/process/route.ts` verifies QStash signature, calls `scan()` from `@aeorank/core`, writes complete scan record with dimensions + files as JSONB |
| 9 | User can view AEO score with 12-dimension breakdown on site detail page | VERIFIED | `ScoreBreakdown.tsx` renders score/grade header + table of all dimensions (name, score/max, weight badge, status dot, hint); wired into `sites/[siteId]/page.tsx` |
| 10 | Dashboard shows list of user's sites with most recent score | VERIFIED | `dashboard/page.tsx` queries sites with nested scans, filters for completed, renders site cards with score |
| 11 | User can see 30-day sparkline chart of site AEO score history | VERIFIED | `ScoreChart.tsx` renders Recharts AreaChart with 3 states (empty, single-point, multi-point); wired into site detail page |
| 12 | User can click Download and receive a ZIP of all 8 generated files | VERIFIED | `app/api/download/[siteId]/route.ts` generates ZIP via JSZip from files JSONB, returns `application/zip` with ownership check; `DownloadButton.tsx` triggers fetch → blob → anchor download |
| 13 | User can navigate to /upgrade and see Free, Pro, and API tier options | VERIFIED | `upgrade/page.tsx` renders 3 tier cards at $0/$29/$99 per month |
| 14 | User can click upgrade and be presented with Stripe Embedded Checkout | VERIFIED | `CheckoutButton.tsx` calls `createCheckoutSession` Server Action, mounts `EmbeddedCheckoutProvider + EmbeddedCheckout` in a modal |
| 15 | Stripe webhook updates subscriptions table in Supabase | VERIFIED | `app/api/webhooks/stripe/route.ts` handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; upserts to subscriptions table via service role client |
| 16 | Dashboard shows user's current plan | VERIFIED | `DashboardLayout` fetches subscription, renders `PlanBadge` in sidebar nav |

**Score:** 16/16 truths VERIFIED (automated). 4 success criteria flagged for human testing (external service dependencies).

---

## Required Artifacts

| Artifact | Provides | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `apps/web/proxy.ts` | Clerk auth middleware | Yes | Yes — clerkMiddleware + createRouteMatcher protecting /dashboard, /sites, /upgrade | Yes — exported default, matched by Next.js config | VERIFIED |
| `apps/web/lib/supabase.ts` | Server-side Supabase clients | Yes | Yes — createServerSupabaseClient + createServiceSupabaseClient | Yes — imported in 5+ route files | VERIFIED |
| `apps/web/lib/validate-url.ts` | SSRF-safe URL validation | Yes | Yes — 12 blocked vectors, Zod + URL constructor | Yes — called in /api/scan route | VERIFIED |
| `supabase/schema.sql` | Database schema | Yes | Yes — 3 tables (sites, scans, subscriptions), RLS policies, 5 indexes | Yes — referenced in docs/user setup | VERIFIED |
| `apps/web/app/api/scan/route.ts` | POST scan endpoint | Yes | Yes — auth, SSRF validation, site upsert, scan insert, QStash dispatch | Yes — called by AddSiteForm | VERIFIED |
| `apps/web/app/api/scan/process/route.ts` | QStash callback | Yes | Yes — signature verification, scan() call, DB write with all fields | Yes — enqueued by /api/scan | VERIFIED |
| `apps/web/app/api/scan/status/route.ts` | Scan status polling | Yes | Yes — auth-gated, returns status + error | Yes — polled by ScanStatus component | VERIFIED |
| `apps/web/components/AddSiteForm.tsx` | Site URL form | Yes | Yes — "use client", fetch POST, redirect on success, error display | Yes — rendered in dashboard/page.tsx | VERIFIED |
| `apps/web/components/ScoreBreakdown.tsx` | 12-dimension score table | Yes | Yes — score/grade header, full dimension table with weight badges, status dots, hint text | Yes — rendered in sites/[siteId]/page.tsx | VERIFIED |
| `apps/web/components/ScanStatus.tsx` | Scan polling component | Yes | Yes — "use client", polls every 3s, router.refresh() on complete, error state | Yes — rendered in sites/[siteId]/page.tsx | VERIFIED |
| `apps/web/lib/stripe.ts` | Stripe SDK factory | Yes | Yes — lazy getStripeClient() + PLANS config with free/pro/api tiers | Yes — imported in webhook route and actions | VERIFIED |
| `apps/web/app/api/webhooks/stripe/route.ts` | Stripe webhook handler | Yes | Yes — raw body, signature verify, handles 3 events, upserts subscriptions table | Yes — public route reachable from Stripe | VERIFIED |
| `apps/web/app/(dashboard)/upgrade/page.tsx` | Pricing page | Yes | Yes — 3 tier cards with prices, features, current plan detection | Yes — linked from nav | VERIFIED |
| `apps/web/components/CheckoutButton.tsx` | Stripe Embedded Checkout | Yes | Yes — "use client", calls Server Action, EmbeddedCheckoutProvider modal | Yes — rendered in upgrade/page.tsx | VERIFIED |
| `apps/web/components/ScoreChart.tsx` | 30-day sparkline chart | Yes | Yes — "use client", Recharts AreaChart, 3 states (empty/single/multi), tooltip | Yes — rendered in sites/[siteId]/page.tsx when scoreHistory.length > 0 | VERIFIED |
| `apps/web/app/api/download/[siteId]/route.ts` | ZIP download endpoint | Yes | Yes — auth + ownership check, JSZip with arraybuffer output, Content-Disposition header | Yes — fetched by DownloadButton | VERIFIED |
| `apps/web/components/DownloadButton.tsx` | Download trigger button | Yes | Yes — "use client", fetch + blob URL + anchor click + loading spinner | Yes — rendered in sites/[siteId]/page.tsx | VERIFIED |

---

## Key Link Verification

| From | To | Via | Status | Evidence |
|------|----|-----|--------|----------|
| `proxy.ts` | `@clerk/nextjs/server` | `clerkMiddleware` import | WIRED | Line 1: `import { clerkMiddleware, createRouteMatcher }` |
| `lib/supabase.ts` | `@clerk/nextjs/server` | `accessToken()` pattern | WIRED | `async accessToken() { return (await auth()).getToken(); }` |
| `AddSiteForm.tsx` | `/api/scan` | `fetch` POST | WIRED | `fetch("/api/scan", { method: "POST", body: JSON.stringify({ url }) })` |
| `app/api/scan/route.ts` | `lib/qstash.ts` | `getQStashClient().publishJSON()` | WIRED | Line 87: `await getQStashClient().publishJSON(...)` |
| `app/api/scan/process/route.ts` | `@aeorank/core` | `scan()` import | WIRED | Line 4: `import { scan } from "@aeorank/core"` |
| `ScanStatus.tsx` | `/api/scan/status` | polling `fetch` GET | WIRED | `fetch(\`/api/scan/status?id=...\`)` inside `setInterval` |
| `CheckoutButton.tsx` | `upgrade/actions.ts` | `createCheckoutSession` Server Action | WIRED | Line 9: `import { createCheckoutSession }` + called in `handleClick` |
| `app/api/webhooks/stripe/route.ts` | Supabase subscriptions table | service role client upsert | WIRED | `supabase.from("subscriptions").upsert(...)` in checkout.session.completed handler |
| `ScoreChart.tsx` | Supabase scans data | `data` prop from server component | WIRED | `sites/[siteId]/page.tsx` queries history and passes `scoreHistory` to `<ScoreChart data={scoreHistory} />` |
| `app/api/download/[siteId]/route.ts` | `jszip` | ZIP generation from JSONB files | WIRED | `import JSZip` + `zip.generateAsync({ type: "arraybuffer" })` |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DASH-01 | 05-01, 05-05 | Next.js 16 App Router with Clerk auth | SATISFIED | proxy.ts + ClerkProvider + sign-in/sign-up pages + protected dashboard layout — all verified |
| DASH-02 | 05-02, 05-05 | Add site by URL → scan → display score with 12-dimension breakdown | SATISFIED | Full scan pipeline: AddSiteForm → /api/scan → QStash → /api/scan/process → ScoreBreakdown — all code verified |
| DASH-03 | 05-04, 05-05 | Score history chart (30-day sparkline) | SATISFIED | ScoreChart with Recharts AreaChart; 30-day query in sites/[siteId]/page.tsx; single-point edge case handled |
| DASH-04 | 05-04, 05-05 | One-click ZIP download of all generated files | SATISFIED | GET /api/download/[siteId] with JSZip arraybuffer; DownloadButton client component |
| DASH-05 | 05-03, 05-05 | Stripe subscriptions (Free / Pro $29 / API $99) | SATISFIED | getStripeClient(), PLANS config, createCheckoutSession, webhook handler, upgrade/page.tsx with 3 tiers |

All 5 DASH requirements are code-complete. No orphaned or unmapped requirements found.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `upgrade/page.tsx` | 68 | "Team seats (coming soon)" in feature list | Info | UI copy noting a deferred feature; does not affect billing flow. Expected product language. |
| `AddSiteForm.tsx` | 47 | `placeholder="https://example.com"` | Info | Input placeholder text — not a stub indicator. |

No blockers. No stubs. No empty implementations found.

---

## Build Verification

`pnpm --filter @aeorank/web build` output (captured during verification):

```
✓ Compiled successfully in 1890.0ms
✓ Generating static pages using 9 workers (8/8)

Route (app)
  ○ /_not-found
  ƒ /api/download/[siteId]
  ƒ /api/scan
  ƒ /api/scan/process
  ƒ /api/scan/status
  ƒ /api/webhooks/stripe
  ƒ /dashboard
  ƒ /sign-in/[[...sign-in]]
  ƒ /sign-up/[[...sign-up]]
  ƒ /sites/[siteId]
  ƒ /upgrade
```

All 11 routes compiled. Zero TypeScript errors. Zero build warnings.

---

## Commit Verification

All documented commits confirmed in git history:

| Commit | Description |
|--------|-------------|
| `bab60da` | feat(05-01): Next.js 16 foundation with Clerk auth and Supabase client |
| `c0bd0c5` | test(05-01): add failing SSRF validation tests for validateScanUrl |
| `482d707` | feat(05-01): implement SSRF-safe URL validation with Zod |
| `cdbeacb` | feat(05-02): scan API routes and QStash client |
| `7b1775d` | feat(05-02): dashboard UI — site list, scan status, score breakdown |
| `4cb885b` | feat(05-03): Stripe SDK factory, webhook handler, and checkout Server Action |
| `c8a211c` | feat(05-03): upgrade page, pricing cards, PlanBadge, and Embedded Checkout UI |
| `eaabd59` | feat(05-04): add ScoreChart 30-day sparkline with Recharts |
| `9bbd4cc` | feat(05-04): add ZIP download route and DownloadButton |

---

## Human Verification Required

Four end-to-end flows require live external service credentials for verification. All code paths are wired and substantive — these cannot be verified programmatically.

### 1. Sign-up → Scan → Score Display (DASH-01, DASH-02)

**Prerequisites:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `NEXT_PUBLIC_APP_URL` (publicly reachable URL for QStash callback)

**Test:** Start `pnpm --filter @aeorank/web dev`. Visit `http://localhost:3000/dashboard` — verify redirect to sign-in. Sign up. Verify empty state "No sites yet." Add `https://example.com`. Verify redirect to `/sites/[siteId]` with ScanStatus spinner. Wait for scan to complete. Verify AEO score number, grade letter, and 12-row dimension table appear.

**Expected:** Score 0-100, grade A/B/C/D/F, dimension table with columns Dimension / Score / Weight / Status / Hint.

**Why human:** QStash delivers the callback to `/api/scan/process` from Upstash's infrastructure — this requires a live, publicly-reachable deployment or ngrok tunnel.

### 2. Score History Sparkline (DASH-03)

**Prerequisites:** Same as above, plus at least 2 completed scans for the same site.

**Test:** After the first scan completes, re-scan the same URL. Navigate to the site detail page. Verify a sparkline chart appears above the dimension table under the "Score History (30 days)" heading with at least 2 data points and a hoverable tooltip showing score and date.

**Expected:** AreaChart with 2+ points, tooltip on hover showing "NN/100" and "Mon DD" formatted date.

**Why human:** Chart rendering requires a browser; sparkline with multiple points requires multiple DB records which only exist after real scans.

### 3. ZIP Download (DASH-04)

**Prerequisites:** A completed scan with files written to Supabase (from test 1 above).

**Test:** On the site detail page with a completed scan, click "Download all files (ZIP)". Verify a ZIP file downloads to the browser with filename `aeorank-{hostname}-files.zip`. Unzip and verify 8 files are present (llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml).

**Expected:** ZIP file containing exactly 8 named files with non-empty content.

**Why human:** Requires a real Supabase scan record with populated `files` JSONB column; browser download flow can't be verified with grep.

### 4. Stripe Upgrade Flow (DASH-05)

**Prerequisites:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_API_PRICE_ID`. For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

**Test:** Navigate to `/upgrade`. Verify 3 tier cards (Free $0, Pro $29, API $99) are shown. Click "Upgrade to Pro". Verify Stripe Embedded Checkout modal appears. Complete with test card `4242 4242 4242 4242`, exp `12/34`, CVC `123`. Verify modal closes, return to dashboard. Verify sidebar nav now shows "Pro" badge (black pill).

**Expected:** After payment, `subscriptions` table in Supabase has `plan = 'pro'`, `status = 'active'` for the test user. Dashboard nav shows the black "PRO" badge.

**Why human:** Requires live Stripe test credentials, a webhook endpoint reachable by Stripe (ngrok locally), and real payment processing.

---

## Notes on Public Route Configuration

`proxy.ts` uses a positive-match pattern: only routes matching `/dashboard(.*)`, `/sites(.*)`, `/upgrade(.*)` call `auth.protect()`. Routes not in the protected list (including `/api/scan/process` and `/api/webhooks/stripe`) pass through Clerk middleware without authentication enforcement. This is correct behavior — QStash callbacks and Stripe webhooks authenticate via their own signature mechanisms, not Clerk sessions.

---

*Verified: 2026-03-14*
*Verifier: Claude (gsd-verifier)*
