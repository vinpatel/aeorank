import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import {
	resolvePlanFromCheckoutSession,
	resolvePlanFromSubscription,
	verifyStripeWebhookEvent,
} from "./stripe-webhook";

const SECRET = "whsec_test_signature_secret";

function signedPayload(
	event: Record<string, unknown>,
	secret = SECRET,
): {
	body: string;
	signature: string;
} {
	const body = JSON.stringify(event);
	const signature = Stripe.webhooks.generateTestHeaderString({
		payload: body,
		secret,
	});
	return { body, signature };
}

describe("verifyStripeWebhookEvent", () => {
	it("fails closed when the Stripe-Signature header is missing", () => {
		const result = verifyStripeWebhookEvent("{}", null, SECRET);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(400);
			expect(result.error).toMatch(/Missing stripe-signature/i);
		}
	});

	it("fails closed when STRIPE_WEBHOOK_SECRET is missing", () => {
		const { body, signature } = signedPayload({ type: "ping" });
		const result = verifyStripeWebhookEvent(body, signature, undefined);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(400);
			expect(result.error).toMatch(/STRIPE_WEBHOOK_SECRET/);
		}
	});

	it("fails closed on an invalid signature", () => {
		const { body } = signedPayload({ type: "ping" });
		const result = verifyStripeWebhookEvent(body, "t=1,v1=deadbeef", SECRET);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(400);
			expect(result.error).toMatch(/signature verification failed/i);
		}
	});

	it("accepts a valid Stripe-Signature", () => {
		const { body, signature } = signedPayload({
			id: "evt_test",
			object: "event",
			type: "checkout.session.completed",
			data: { object: { id: "cs_test" } },
		});
		const result = verifyStripeWebhookEvent(body, signature, SECRET);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.event.type).toBe("checkout.session.completed");
		}
	});
});

describe("plan resolution from Stripe objects", () => {
	it("reads plan=agency metadata as the API/Agency key", () => {
		const session = {
			metadata: { userId: "user_1", plan: "agency" },
			client_reference_id: null,
		} as unknown as Stripe.Checkout.Session;
		expect(resolvePlanFromCheckoutSession(session)).toEqual({
			userId: "user_1",
			plan: "api",
		});
	});

	it("reads plan=pro metadata", () => {
		const session = {
			metadata: { userId: "user_2", plan: "pro" },
			client_reference_id: "user_fallback",
		} as unknown as Stripe.Checkout.Session;
		expect(resolvePlanFromCheckoutSession(session)).toEqual({
			userId: "user_2",
			plan: "pro",
		});
	});

	it("falls back to client_reference_id when metadata.userId is missing", () => {
		const session = {
			metadata: { plan: "pro" },
			client_reference_id: "user_3",
		} as unknown as Stripe.Checkout.Session;
		expect(resolvePlanFromCheckoutSession(session).userId).toBe("user_3");
	});

	it("resolves subscription plan from metadata or price id", () => {
		const fromMeta = {
			metadata: { plan: "agency" },
			items: { data: [{ price: { id: "price_other" } }] },
		} as unknown as Stripe.Subscription;
		expect(resolvePlanFromSubscription(fromMeta)).toBe("api");

		const prevPro = process.env.STRIPE_PRO_PRICE_ID;
		process.env.STRIPE_PRO_PRICE_ID = "price_pro_29";
		const fromPrice = {
			metadata: {},
			items: { data: [{ price: { id: "price_pro_29" } }] },
		} as unknown as Stripe.Subscription;
		expect(resolvePlanFromSubscription(fromPrice)).toBe("pro");
		if (prevPro === undefined) {
			// biome-ignore lint/performance/noDelete: must remove the key; assigning undefined stringifies
			delete process.env.STRIPE_PRO_PRICE_ID;
		} else process.env.STRIPE_PRO_PRICE_ID = prevPro;
	});
});
