/**
 * Paid-plan query + Stripe price mapping for Pro ($29) and Agency ($99).
 *
 * Public query slug is `pro` | `agency`. The Agency price ID is the existing
 * `STRIPE_API_PRICE_ID` env var (kept so Vin does not invent a new price).
 * Internally the subscriptions table still stores Agency as `api` for
 * backward compatibility with the 05-03 schema.
 */

export const PAID_PLAN_SLUGS = ["pro", "agency"] as const;
export type PaidPlanSlug = (typeof PAID_PLAN_SLUGS)[number];

export const CHECKOUT_ALIAS_PATHS = [
	"/pricing",
	"/billing",
	"/checkout",
	"/settings/billing",
] as const;

export const CANONICAL_CHECKOUT_PATH = "/upgrade";

export function parsePaidPlanSlug(
	value: string | string[] | undefined | null,
): PaidPlanSlug | null {
	const raw = Array.isArray(value) ? value[0] : value;
	if (!raw) return null;
	const normalized = raw.trim().toLowerCase();
	if (normalized === "pro") return "pro";
	if (normalized === "agency" || normalized === "api") return "agency";
	return null;
}

export function paidPlanToInternalKey(slug: PaidPlanSlug): "pro" | "api" {
	return slug === "agency" ? "api" : "pro";
}

export function internalKeyToPaidSlug(key: string | null | undefined): PaidPlanSlug | null {
	if (key === "pro") return "pro";
	if (key === "api" || key === "agency") return "agency";
	return null;
}

export function normalizeSubscriptionPlan(plan: string | null | undefined): "free" | "pro" | "api" {
	if (plan === "pro") return "pro";
	if (plan === "api" || plan === "agency") return "api";
	return "free";
}

export function afterAuthPath(plan: PaidPlanSlug | null): string {
	return plan ? `${CANONICAL_CHECKOUT_PATH}?plan=${plan}` : "/dashboard";
}

export function getStripePriceIdForPaidPlan(slug: PaidPlanSlug): string | undefined {
	const priceId =
		slug === "pro" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_API_PRICE_ID;
	return priceId?.trim() || undefined;
}

export function planFromStripePriceId(
	priceId: string | undefined,
	env: { pro?: string; api?: string } = {
		pro: process.env.STRIPE_PRO_PRICE_ID,
		api: process.env.STRIPE_API_PRICE_ID,
	},
): "free" | "pro" | "api" {
	if (!priceId) return "free";
	if (env.pro && priceId === env.pro) return "pro";
	if (env.api && priceId === env.api) return "api";
	return "free";
}

export function resolveCheckoutAppUrl(): string {
	const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
	if (configured) return configured.replace(/\/+$/, "");
	return "http://localhost:3000";
}

export function checkoutReturnUrls(plan: PaidPlanSlug): {
	success_url: string;
	cancel_url: string;
} {
	const appUrl = resolveCheckoutAppUrl();
	return {
		success_url: `${appUrl}${CANONICAL_CHECKOUT_PATH}?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${appUrl}${CANONICAL_CHECKOUT_PATH}?checkout=canceled&plan=${plan}`,
	};
}

export function checkoutAliasRedirects(): {
	source: string;
	destination: string;
	permanent: false;
}[] {
	return CHECKOUT_ALIAS_PATHS.map((source) => ({
		source,
		destination: CANONICAL_CHECKOUT_PATH,
		permanent: false as const,
	}));
}
