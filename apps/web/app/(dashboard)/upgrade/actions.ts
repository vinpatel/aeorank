"use server";

import { auth } from "@clerk/nextjs/server";
import { getStripeClient } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";

/**
 * Creates a Stripe Embedded Checkout session for the given price/plan.
 *
 * Flow:
 *   1. Get authenticated userId from Clerk
 *   2. Look up existing Stripe customer ID (stored in subscriptions table)
 *      or create a new Stripe customer
 *   3. Create checkout session with ui_mode: "embedded" and plan metadata
 *   4. Return clientSecret so the browser can mount the EmbeddedCheckout component
 *
 * The metadata.userId and metadata.plan fields are used by the webhook handler
 * to associate the completed checkout with the correct user and plan.
 */
export async function createCheckoutSession(
	priceId: string,
	plan: string,
): Promise<{ clientSecret: string }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Not authenticated");
	}

	const supabase = createServiceSupabaseClient();

	// Look up existing Stripe customer ID for this user
	const { data: existingSubscription } = await supabase
		.from("subscriptions")
		.select("stripe_customer_id")
		.eq("user_id", userId)
		.maybeSingle();

	let customerId = existingSubscription?.stripe_customer_id as string | undefined;

	// Create a Stripe customer if we don't have one yet
	if (!customerId) {
		const stripe = getStripeClient();
		const customer = await stripe.customers.create({
			metadata: { userId },
		});
		customerId = customer.id;

		// Store the new customer ID so future checkouts reuse it
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

	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

	const session = await getStripeClient().checkout.sessions.create({
		customer: customerId,
		ui_mode: "embedded",
		mode: "subscription",
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: { userId, plan },
		return_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
	});

	if (!session.client_secret) {
		throw new Error("Stripe did not return a client_secret for the checkout session");
	}

	return { clientSecret: session.client_secret };
}
