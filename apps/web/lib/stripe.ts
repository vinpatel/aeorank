import Stripe from "stripe";

/**
 * Stripe server-side SDK factory — lazy to avoid build-time instantiation errors.
 * STRIPE_SECRET_KEY is not available during `next build`, so we defer client creation.
 * Use only in server contexts (Route Handlers, Server Actions, webhooks).
 * Never expose to the client — use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for browser.
 */
export function getStripeClient(): Stripe {
	return new Stripe(process.env.STRIPE_SECRET_KEY!, {
		apiVersion: "2026-02-25.clover",
		typescript: true,
	});
}

/**
 * Plan configuration — single source of truth for plan names, price IDs, and scan limits.
 * Price IDs are read from env vars set in the Stripe Dashboard.
 */
export const PLANS = {
	free: {
		name: "Free",
		scansPerMonth: 3,
		priceId: null,
	},
	pro: {
		name: "Pro",
		scansPerMonth: 50,
		priceId: process.env.STRIPE_PRO_PRICE_ID,
	},
	api: {
		name: "API",
		scansPerMonth: 500,
		priceId: process.env.STRIPE_API_PRICE_ID,
	},
} as const;

export type PlanKey = keyof typeof PLANS;
