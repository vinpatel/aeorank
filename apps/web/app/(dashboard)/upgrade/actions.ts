"use server";

import {
	type PaidPlanSlug,
	checkoutReturnUrls,
	getStripePriceIdForPaidPlan,
	paidPlanToInternalKey,
	parsePaidPlanSlug,
} from "@/lib/checkout-plan";
import { getStripeClient } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

/**
 * Creates a Stripe Checkout session (hosted) for Pro or Agency.
 *
 * Price IDs come from env (`STRIPE_PRO_PRICE_ID` / `STRIPE_API_PRICE_ID`) —
 * the client cannot pass an arbitrary price. Success and cancel URLs are
 * built from `NEXT_PUBLIC_APP_URL`.
 */
export async function createCheckoutSession(planSlug: string): Promise<{ url: string }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Not authenticated");
	}

	const plan = parsePaidPlanSlug(planSlug);
	if (!plan) {
		throw new Error("Invalid plan. Choose Pro or Agency.");
	}

	const priceId = getStripePriceIdForPaidPlan(plan);
	if (!priceId) {
		throw new Error(
			plan === "pro"
				? "STRIPE_PRO_PRICE_ID is not configured"
				: "STRIPE_API_PRICE_ID is not configured",
		);
	}

	const supabase = createServiceSupabaseClient();

	const { data: existingSubscription } = await supabase
		.from("subscriptions")
		.select("stripe_customer_id")
		.eq("user_id", userId)
		.maybeSingle();

	let customerId = existingSubscription?.stripe_customer_id as string | undefined;

	if (!customerId) {
		const customer = await getStripeClient().customers.create({
			metadata: { userId },
		});
		customerId = customer.id;

		await supabase.from("subscriptions").upsert(
			{
				user_id: userId,
				stripe_customer_id: customerId,
				plan: "free",
				status: "incomplete",
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id" },
		);
	}

	const internalPlan = paidPlanToInternalKey(plan);
	const { success_url, cancel_url } = checkoutReturnUrls(plan);

	const session = await getStripeClient().checkout.sessions.create({
		customer: customerId,
		mode: "subscription",
		line_items: [{ price: priceId, quantity: 1 }],
		client_reference_id: userId,
		metadata: { userId, plan: internalPlan, planSlug: plan },
		subscription_data: {
			metadata: { userId, plan: internalPlan, planSlug: plan },
		},
		success_url,
		cancel_url,
	});

	if (!session.url) {
		throw new Error("Stripe did not return a checkout URL");
	}

	return { url: session.url };
}

export async function startCheckout(plan: PaidPlanSlug): Promise<{ url: string }> {
	return createCheckoutSession(plan);
}
