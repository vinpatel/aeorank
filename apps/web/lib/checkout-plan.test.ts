import { afterEach, describe, expect, it } from "vitest";
import {
	CANONICAL_CHECKOUT_PATH,
	afterAuthPath,
	checkoutAliasRedirects,
	checkoutReturnUrls,
	getStripePriceIdForPaidPlan,
	internalKeyToPaidSlug,
	normalizeSubscriptionPlan,
	paidPlanToInternalKey,
	parsePaidPlanSlug,
	planFromStripePriceId,
	resolveCheckoutAppUrl,
} from "./checkout-plan";

const ENV_KEYS = ["NEXT_PUBLIC_APP_URL", "STRIPE_PRO_PRICE_ID", "STRIPE_API_PRICE_ID"] as const;

afterEach(() => {
	for (const k of ENV_KEYS) {
		delete process.env[k];
	}
});

describe("parsePaidPlanSlug", () => {
	it("accepts pro and agency (case-insensitive)", () => {
		expect(parsePaidPlanSlug("pro")).toBe("pro");
		expect(parsePaidPlanSlug("PRO")).toBe("pro");
		expect(parsePaidPlanSlug("agency")).toBe("agency");
		expect(parsePaidPlanSlug("Agency")).toBe("agency");
	});

	it("treats api as the Agency alias (STRIPE_API_PRICE_ID)", () => {
		expect(parsePaidPlanSlug("api")).toBe("agency");
	});

	it("rejects unknown or empty values", () => {
		expect(parsePaidPlanSlug(undefined)).toBeNull();
		expect(parsePaidPlanSlug("")).toBeNull();
		expect(parsePaidPlanSlug("enterprise")).toBeNull();
		expect(parsePaidPlanSlug("free")).toBeNull();
	});

	it("reads the first value from an array (searchParams)", () => {
		expect(parsePaidPlanSlug(["agency", "pro"])).toBe("agency");
	});
});

describe("plan key mapping", () => {
	it("maps public slugs to the subscriptions-table keys", () => {
		expect(paidPlanToInternalKey("pro")).toBe("pro");
		expect(paidPlanToInternalKey("agency")).toBe("api");
	});

	it("maps stored keys back to public slugs", () => {
		expect(internalKeyToPaidSlug("pro")).toBe("pro");
		expect(internalKeyToPaidSlug("api")).toBe("agency");
		expect(internalKeyToPaidSlug("agency")).toBe("agency");
		expect(internalKeyToPaidSlug("free")).toBeNull();
	});

	it("normalizes webhook/subscription plan strings", () => {
		expect(normalizeSubscriptionPlan("pro")).toBe("pro");
		expect(normalizeSubscriptionPlan("agency")).toBe("api");
		expect(normalizeSubscriptionPlan("api")).toBe("api");
		expect(normalizeSubscriptionPlan("free")).toBe("free");
		expect(normalizeSubscriptionPlan(undefined)).toBe("free");
	});
});

describe("afterAuthPath", () => {
	it("keeps paid intent after sign-up", () => {
		expect(afterAuthPath("pro")).toBe("/upgrade?plan=pro");
		expect(afterAuthPath("agency")).toBe("/upgrade?plan=agency");
		expect(afterAuthPath(null)).toBe("/dashboard");
	});
});

describe("price IDs and return URLs", () => {
	it("reads Pro/Agency price IDs from env (does not invent prices)", () => {
		process.env.STRIPE_PRO_PRICE_ID = "price_pro_29";
		process.env.STRIPE_API_PRICE_ID = "price_agency_99";
		expect(getStripePriceIdForPaidPlan("pro")).toBe("price_pro_29");
		expect(getStripePriceIdForPaidPlan("agency")).toBe("price_agency_99");
	});

	it("resolves plan from Stripe price IDs", () => {
		expect(
			planFromStripePriceId("price_pro_29", { pro: "price_pro_29", api: "price_agency_99" }),
		).toBe("pro");
		expect(
			planFromStripePriceId("price_agency_99", { pro: "price_pro_29", api: "price_agency_99" }),
		).toBe("api");
		expect(planFromStripePriceId("price_other", { pro: "price_pro_29" })).toBe("free");
	});

	it("builds success/cancel URLs from NEXT_PUBLIC_APP_URL", () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://app.aeorank.dev/";
		expect(resolveCheckoutAppUrl()).toBe("https://app.aeorank.dev");
		expect(checkoutReturnUrls("pro")).toEqual({
			success_url:
				"https://app.aeorank.dev/upgrade?checkout=success&plan=pro&session_id={CHECKOUT_SESSION_ID}",
			cancel_url: "https://app.aeorank.dev/upgrade?checkout=canceled&plan=pro",
		});
		expect(checkoutReturnUrls("agency").cancel_url).toBe(
			"https://app.aeorank.dev/upgrade?checkout=canceled&plan=agency",
		);
	});
});

describe("checkout alias redirects", () => {
	it("sends buyer URLs to the canonical /upgrade path", () => {
		const redirects = checkoutAliasRedirects();
		expect(redirects.every((r) => r.destination === CANONICAL_CHECKOUT_PATH)).toBe(true);
		expect(redirects.map((r) => r.source)).toEqual([
			"/pricing",
			"/billing",
			"/checkout",
			"/settings/billing",
		]);
		expect(redirects.every((r) => r.permanent === false)).toBe(true);
	});
});
