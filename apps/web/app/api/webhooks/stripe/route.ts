import {
	resolvePlanFromCheckoutSession,
	resolvePlanFromSubscription,
	verifyStripeWebhookEvent,
} from "@/lib/stripe-webhook";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * Stripe webhook handler — PUBLIC route (excluded from Clerk auth in proxy.ts).
 *
 * CRITICAL: Uses request.text() for raw body, NOT request.json().
 * request.json() would re-serialize the body, breaking Stripe's HMAC signature verification.
 *
 * Fails closed (400) when Stripe-Signature or STRIPE_WEBHOOK_SECRET is missing,
 * or when HMAC verification fails.
 *
 * Handles:
 *   - checkout.session.completed → upsert subscription as "active"
 *   - customer.subscription.updated → sync plan, status, period_end
 *   - customer.subscription.deleted → mark subscription "canceled"
 */
export async function POST(request: NextRequest) {
	const body = await request.text();
	const signature = request.headers.get("stripe-signature");
	const verified = verifyStripeWebhookEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

	if (!verified.ok) {
		return NextResponse.json({ error: verified.error }, { status: verified.status });
	}

	const event = verified.event;
	const supabase = createServiceSupabaseClient();

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const { userId, plan } = resolvePlanFromCheckoutSession(session);

				if (!userId || plan === "free") {
					console.error(
						"Stripe webhook: missing userId or paid plan in session metadata",
						session.id,
					);
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
				const plan = resolvePlanFromSubscription(subscription);

				const periodEnd = subscription.items.data[0]?.current_period_end;
				await supabase
					.from("subscriptions")
					.update({
						plan,
						status: subscription.status,
						current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
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
				break;
		}
	} catch (err) {
		console.error("Stripe webhook handler error:", err);
		return NextResponse.json({ error: "Handler error" }, { status: 200 });
	}

	return NextResponse.json({ received: true });
}
