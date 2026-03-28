---
phase: 05-saas-dashboard
plan: 03
subsystem: payments
tags: [stripe, nextjs, embedded-checkout, webhooks, supabase, react]

# Dependency graph
requires:
  - phase: 05-saas-dashboard
    plan: 01
    provides: "Next.js 16 foundation, Clerk auth, Supabase client factories, database schema with subscriptions table"
provides:
  - "Stripe server SDK factory (getStripeClient) — lazy init to avoid build-time env errors"
  - "PLANS config constant with free/pro/api tier definitions including priceIds"
  - "POST /api/webhooks/stripe — handles checkout.session.completed, subscription.updated, subscription.deleted"
  - "createCheckoutSession() Server Action — creates Stripe Embedded Checkout sessions with userId/plan metadata"
  - "CheckoutButton client component — modal Embedded Checkout via EmbeddedCheckoutProvider"
  - "PlanBadge server component — gray/black/blue badge for free/pro/api tiers"
  - "/upgrade page — three pricing cards (Free/Pro/API) with current plan detection"
  - "Dashboard layout updated with PlanBadge showing active plan in sidebar"
affects:
  - "05-04 — ZIP download should gate behind pro/api plan check using subscriptions table"
  - "05-05 — scan limits enforced via PLANS.scansPerMonth config"

# Tech tracking
tech-stack:
  added:
    - "stripe@20.4.1 — server-side Stripe SDK"
    - "@stripe/react-stripe-js — EmbeddedCheckoutProvider + EmbeddedCheckout components"
    - "@stripe/stripe-js — loadStripe() browser SDK"
  patterns:
    - "Lazy Stripe client factory (getStripeClient) — avoids build-time STRIPE_SECRET_KEY requirement"
    - "Stripe Embedded Checkout via ui_mode: embedded + EmbeddedCheckoutProvider in modal"
    - "Webhook userId+plan metadata pattern: set on checkout session → read in webhook handler"
    - "Service-role Supabase client in webhook handler (no Clerk session available)"
    - "current_period_end on Stripe v20 is on subscription.items.data[0], not the subscription itself"

key-files:
  created:
    - "apps/web/lib/stripe.ts — getStripeClient() factory + PLANS config constant"
    - "apps/web/app/api/webhooks/stripe/route.ts — webhook handler for 3 Stripe events"
    - "apps/web/app/(dashboard)/upgrade/actions.ts — createCheckoutSession Server Action"
    - "apps/web/app/(dashboard)/upgrade/page.tsx — pricing page with 3 tier cards"
    - "apps/web/components/CheckoutButton.tsx — Embedded Checkout modal client component"
    - "apps/web/components/PlanBadge.tsx — plan tier display badge"
  modified:
    - "apps/web/app/(dashboard)/layout.tsx — added PlanBadge to sidebar nav"
    - "apps/web/package.json — added stripe + @stripe/react-stripe-js + @stripe/stripe-js"

key-decisions:
  - "Lazy Stripe factory instead of singleton — singleton fails next build when STRIPE_SECRET_KEY not set at build time"
  - "current_period_end from subscription.items.data[0] — Stripe v20 API moved it from top-level Subscription to SubscriptionItem"
  - "Webhook returns 200 for handler errors — prevents Stripe from retrying non-idempotent events on transient DB failures"
  - "createCheckoutSession creates Stripe customer on first checkout and stores stripe_customer_id in subscriptions table for reuse"

patterns-established:
  - "Pattern: All Stripe operations use getStripeClient() factory call, never a module-level singleton"
  - "Pattern: Webhook metadata {userId, plan} written by Server Action, read by webhook handler to associate subscription with user"
  - "Pattern: createServiceSupabaseClient() for webhook handler (no authenticated session available in webhook context)"

requirements-completed:
  - DASH-05

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 5 Plan 03: Stripe Billing Summary

**Stripe Embedded Checkout with webhook sync: users upgrade via modal checkout at /upgrade, subscriptions table updated by webhook on checkout.session.completed and subscription lifecycle events**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-14T23:38:41Z
- **Completed:** 2026-03-14T23:42:25Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Stripe billing fully wired: upgrade page, Embedded Checkout, webhook handler syncing to Supabase
- PLANS config provides single source of truth for tier limits used across upgrade UI and future scan enforcement
- Dashboard nav now shows user's current plan tier via PlanBadge
- Build passes cleanly with all routes including /upgrade and /api/webhooks/stripe

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe SDK, webhook handler, and Server Action for checkout** - `4cb885b` (feat)
2. **Task 2: Upgrade page UI with pricing cards and Embedded Checkout** - `c8a211c` (feat)

## Files Created/Modified
- `apps/web/lib/stripe.ts` — getStripeClient() lazy factory + PLANS tier config
- `apps/web/app/api/webhooks/stripe/route.ts` — Stripe webhook: checkout.session.completed, subscription.updated, subscription.deleted
- `apps/web/app/(dashboard)/upgrade/actions.ts` — createCheckoutSession Server Action (customer lookup/create + embedded session)
- `apps/web/app/(dashboard)/upgrade/page.tsx` — Pricing page: 3 tier cards, current plan detection, CheckoutButton
- `apps/web/components/CheckoutButton.tsx` — Client component: Embedded Checkout modal
- `apps/web/components/PlanBadge.tsx` — Plan badge with gray/black/blue styling per tier
- `apps/web/app/(dashboard)/layout.tsx` — Added PlanBadge + AEOrank branding to sidebar nav
- `apps/web/package.json` + `pnpm-lock.yaml` — Stripe packages added

## Decisions Made
- **Lazy Stripe factory:** Stripe v20 throws "apiKey not provided" at module evaluation if instantiated as a singleton at top level. `getStripeClient()` defers creation to request time, matching the pattern established by `getQStashClient()` in plan 02.
- **current_period_end location:** Stripe v20 API moved this field from the top-level `Subscription` object to `SubscriptionItem`. Using `subscription.items.data[0]?.current_period_end` resolves the TypeScript error.
- **Webhook 200 on handler errors:** Returning 200 (not 500) on Supabase failures prevents Stripe from treating a transient DB error as a permanent webhook failure and retrying the same checkout.session.completed event multiple times.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Stripe singleton fails next build without STRIPE_SECRET_KEY**
- **Found during:** Task 1 verification (build)
- **Issue:** `new Stripe(process.env.STRIPE_SECRET_KEY!)` at module level throws during `next build` when the env var isn't set — Next.js evaluates route modules at build time
- **Fix:** Changed `export const stripe = new Stripe(...)` to `export function getStripeClient()` factory pattern; updated webhook route and actions.ts to call factory per request
- **Files modified:** `apps/web/lib/stripe.ts`, `apps/web/app/api/webhooks/stripe/route.ts`, `apps/web/app/(dashboard)/upgrade/actions.ts`
- **Verification:** `pnpm --filter @aeorank/web build` passes without errors
- **Committed in:** `4cb885b` (Task 1 commit)

**2. [Rule 1 - Bug] Stripe v20 removed current_period_end from Subscription top-level**
- **Found during:** Task 1 verification (TypeScript error)
- **Issue:** `subscription.current_period_end` does not exist on `Stripe.Subscription` in stripe@20.4.1 — the field moved to `SubscriptionItem`
- **Fix:** Changed to `subscription.items.data[0]?.current_period_end` in webhook handler
- **Files modified:** `apps/web/app/api/webhooks/stripe/route.ts`
- **Verification:** TypeScript compilation passes
- **Committed in:** `4cb885b` (Task 1 commit, auto-fixed by biome before commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — Stripe v20 API differences from plan assumptions)
**Impact on plan:** Both fixes required for build correctness. No scope creep. Same architectural intent, different call signatures.

## Issues Encountered
- Stripe v20 is meaningfully different from v15/v16 patterns in plan research: singleton → factory, current_period_end on item not subscription. Both caught by TypeScript and build verification.

## User Setup Required

**External service configuration required before billing is live:**

**Stripe Dashboard:**
1. Create Pro product ($29/mo recurring) — copy `price_XXX` ID
2. Create API product ($99/mo recurring) — copy `price_XXX` ID
3. Add webhook endpoint: `{APP_URL}/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy signing secret

**Environment variables to add to `apps/web/.env.local`:**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_API_PRICE_ID=price_...
```

**Local webhook testing:** Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Next Phase Readiness
- Billing UI and webhook handler complete — subscriptions table will be populated after first real checkout
- PLANS.scansPerMonth constants ready for scan limit enforcement in plans 04/05
- /upgrade page accessible; PlanBadge renders on Free tier by default (Supabase query gracefully falls back)
- No blockers for Plan 04 (score history chart)

---
*Phase: 05-saas-dashboard*
*Completed: 2026-03-14*

## Self-Check: PASSED

All files exist and all commits are present in git history.
