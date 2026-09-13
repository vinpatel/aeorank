import { normalizeSubscriptionPlan, planFromStripePriceId } from "@/lib/checkout-plan";
import Stripe from "stripe";

export type StripeWebhookVerifyResult =
	| { ok: true; event: Stripe.Event }
	| { ok: false; error: string; status: 400 };

/**
 * Fail closed: missing signature or missing webhook secret never proceeds.
 * Uses Stripe's HMAC verification against the raw request body.
 */
export function verifyStripeWebhookEvent(
	body: string,
	signature: string | null,
	secret: string | undefined,
): StripeWebhookVerifyResult {
	if (!signature) {
		return { ok: false, error: "Missing stripe-signature header", status: 400 };
	}
	const webhookSecret = secret?.trim();
	if (!webhookSecret) {
		return { ok: false, error: "Missing STRIPE_WEBHOOK_SECRET", status: 400 };
	}

	try {
		const event = Stripe.webhooks.constructEvent(body, signature, webhookSecret);
		return { ok: true, event };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Invalid signature";
		return {
			ok: false,
			error: `Webhook signature verification failed: ${message}`,
			status: 400,
		};
	}
}

export function resolvePlanFromCheckoutSession(session: Stripe.Checkout.Session): {
	userId: string | undefined;
	plan: "pro" | "api" | "free";
} {
	const userId = session.metadata?.userId ?? session.client_reference_id ?? undefined;
	const fromMeta = normalizeSubscriptionPlan(session.metadata?.plan);
	if (fromMeta !== "free") {
		return { userId, plan: fromMeta };
	}

	const priceId = session.line_items?.data?.[0]?.price?.id;
	return { userId, plan: planFromStripePriceId(priceId) };
}

export function resolvePlanFromSubscription(
	subscription: Stripe.Subscription,
): "free" | "pro" | "api" {
	const fromMeta = normalizeSubscriptionPlan(subscription.metadata?.plan);
	if (fromMeta !== "free") return fromMeta;
	const priceId = subscription.items.data[0]?.price.id;
	return planFromStripePriceId(priceId);
}
