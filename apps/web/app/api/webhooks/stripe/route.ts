import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";

/**
 * Stripe webhook handler — PUBLIC route (excluded from Clerk auth in proxy.ts).
 *
 * CRITICAL: Uses request.text() for raw body, NOT request.json().
 * request.json() would re-serialize the body, breaking Stripe's HMAC signature verification.
 *
 * Handles:
 *   - checkout.session.completed → upsert subscription as "active"
 *   - customer.subscription.updated → sync plan, status, period_end
 *   - customer.subscription.deleted → mark subscription "canceled"
 */
export async function POST(request: NextRequest) {
	const body = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature) {
		return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
	}

	const stripe = getStripeClient();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Invalid signature";
		return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
	}

	const supabase = createServiceSupabaseClient();

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const userId = session.metadata?.userId;
				const plan = session.metadata?.plan;

				if (!userId || !plan) {
					console.error("Stripe webhook: missing userId or plan in session metadata", session.id);
					break;
				}

				await supabase.from("subscriptions").upsert(
					{
						user_id: userId,
						stripe_customer_id: session.customer as string,
						stripe_subscription_id: session.subscription as string,
						plan,
						status: "active",
						updated_at: new Date().toISOString(),
					},
					{ onConflict: "user_id" },
				);
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				const priceId = subscription.items.data[0]?.price.id;

				// Resolve plan key from price ID
				let plan = "free";
				if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";
				else if (priceId === process.env.STRIPE_API_PRICE_ID) plan = "api";

				// Stripe v20: current_period_end is on the subscription item, not the subscription itself
				const periodEnd = subscription.items.data[0]?.current_period_end;
				await supabase
					.from("subscriptions")
					.update({
						plan,
						status: subscription.status,
						current_period_end: periodEnd
							? new Date(periodEnd * 1000).toISOString()
							: null,
						updated_at: new Date().toISOString(),
					})
					.eq("stripe_subscription_id", subscription.id);
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;

				await supabase
					.from("subscriptions")
					.update({
						status: "canceled",
						updated_at: new Date().toISOString(),
					})
					.eq("stripe_subscription_id", subscription.id);
				break;
			}

			default:
				// Return 200 for unhandled events — Stripe retries on non-2xx responses
				break;
		}
	} catch (err) {
		console.error("Stripe webhook handler error:", err);
		// Still return 200 to prevent Stripe from retrying non-idempotent events
		return NextResponse.json({ error: "Handler error" }, { status: 200 });
	}

	return NextResponse.json({ received: true });
}
