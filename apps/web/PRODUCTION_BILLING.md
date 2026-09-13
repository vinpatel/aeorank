# Production Clerk + Stripe (app.aeorank.dev)

Ops note for Vin. No secrets in this file. After any env change, **redeploy** the web app.

Canonical checkout URL: `/upgrade`  
Buyer aliases (redirect to `/upgrade`, query string preserved): `/pricing` `/billing` `/checkout` `/settings/billing`

Paid CTAs pass `?plan=pro` or `?plan=agency`. After sign-up, that query is honored and the user lands on `/upgrade?plan=…`.

Prices are unchanged: **Free / Pro $29 / Agency $99**. Agency uses the existing `STRIPE_API_PRICE_ID` env name.

## 1. Clerk — switch app.aeorank.dev to the Production instance

The app reads Clerk keys **only from env**. There is no committed `pk_test` / `pk_live` fallback.

1. In [Clerk Dashboard](https://dashboard.clerk.com) open the **Production** instance (not Development).
2. **Configure → Domains**
   - Application domain: `app.aeorank.dev`
   - Add `https://app.aeorank.dev` to allowed origins
   - Redirect allow-list must include:
     - `https://app.aeorank.dev/sign-in`
     - `https://app.aeorank.dev/sign-up`
     - `https://app.aeorank.dev/dashboard`
     - `https://app.aeorank.dev/upgrade`
3. **Satellite / proxy:** not required. Marketing (`aeorank.dev`) is a static site that only links to the app. Sign-in and sign-up live on `app.aeorank.dev`. Do not enable a satellite unless you later share a Clerk session across both hosts.
4. Copy the **Production** API keys (they start with `pk_live_` and `sk_live_`).

Set these on Vercel (or the current host) for the **production** web project:

| Env var | What to paste |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production publishable key (`pk_live_…`) |
| `CLERK_SECRET_KEY` | Production secret key (`sk_live_…`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |

Do not put Development (`pk_test_` / `sk_test_` / `clerk.accounts.dev`) keys on production.

## 2. Stripe — live Pro $29 and Agency $99

1. In Stripe Dashboard, switch to **live** mode.
2. Create (or reuse) two recurring products. Do not invent new prices:
   - **Pro** — $29 / month → copy the price id into `STRIPE_PRO_PRICE_ID`
   - **Agency** — $99 / month → copy the price id into `STRIPE_API_PRICE_ID`
3. **Developers → Webhooks → Add endpoint**
   - URL: `https://app.aeorank.dev/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`
4. The handler **fails closed** on a missing `Stripe-Signature` header or a missing/invalid `STRIPE_WEBHOOK_SECRET` (HTTP 400). It never processes an unsigned body.

Set these on the production host:

| Env var | What to paste |
|---|---|
| `STRIPE_SECRET_KEY` | Live secret key (`sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live publishable key (`pk_live_…`) |
| `STRIPE_PRO_PRICE_ID` | Live Pro $29 price id (`price_…`) |
| `STRIPE_API_PRICE_ID` | Live Agency $99 price id (`price_…`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_…`) |
| `NEXT_PUBLIC_APP_URL` | `https://app.aeorank.dev` |

`NEXT_PUBLIC_APP_URL` is used for Stripe **success** and **cancel** return URLs (`/upgrade?checkout=success` / `/upgrade?checkout=canceled`).

## 3. Redeploy

Vercel (and most hosts) bake `NEXT_PUBLIC_*` in at build time. After saving env vars, trigger a production redeploy of `apps/web`. Then confirm:

- View source / network on `https://app.aeorank.dev` shows `pk_live_`, not `pk_test_`, and not `clerk.accounts.dev`
- `https://app.aeorank.dev/upgrade` renders Free / Pro $29 / Agency $99
- `https://app.aeorank.dev/pricing` redirects to `/upgrade`
- Marketing “Start Pro” / “Start Agency” keep `plan=pro` or `plan=agency` through sign-up
