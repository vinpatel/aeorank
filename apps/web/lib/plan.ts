import { normalizeSubscriptionPlan } from "@/lib/checkout-plan";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["vin@vinpatel.pro", "vinpatel.pro@gmail.com"];

/**
 * Get the current user's plan.
 * Source of truth is the Stripe-backed `subscriptions` table. Clerk Billing
 * `has({ plan })` is a fallback only. Admin accounts get the Agency quotas.
 */
export async function getCurrentPlan(): Promise<PlanKey> {
	const user = await currentUser();
	if (user?.emailAddresses.some((e) => ADMIN_EMAILS.includes(e.emailAddress))) {
		return "admin";
	}

	const { userId, has } = await auth();

	if (userId) {
		try {
			const supabase = createServiceSupabaseClient();
			const { data } = await supabase
				.from("subscriptions")
				.select("plan, status")
				.eq("user_id", userId)
				.maybeSingle();

			if (data && (data.status === "active" || data.status === "trialing")) {
				const key = normalizeSubscriptionPlan(data.plan as string);
				if (key === "pro" || key === "api") return key;
			}
		} catch {
			// Supabase not yet configured
		}
	}

	try {
		if (has({ plan: "api" }) || has({ plan: "agency" })) return "api";
		if (has({ plan: "pro" })) return "pro";
	} catch {
		// Clerk billing not yet configured
	}
	return "free";
}

/**
 * Count how many sites a user currently has.
 */
export async function getUserSiteCount(userId: string): Promise<number> {
	const supabase = createServiceSupabaseClient();
	const { count } = await supabase
		.from("sites")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId);
	return count ?? 0;
}

/**
 * Count how many scans a user has run this calendar month.
 */
export async function getUserScansThisMonth(userId: string): Promise<number> {
	const supabase = createServiceSupabaseClient();
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const { count } = await supabase
		.from("scans")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId)
		.gte("scanned_at", startOfMonth);
	return count ?? 0;
}

/**
 * Check if the user can add another site on their current plan.
 */
export async function canAddSite(
	userId: string,
	plan: PlanKey,
): Promise<{ allowed: boolean; limit: number; current: number }> {
	const limit = PLANS[plan].maxSites;
	const current = await getUserSiteCount(userId);
	return { allowed: current < limit, limit, current };
}

/**
 * Check if the user can run another scan this month on their current plan.
 */
export async function canRunScan(
	userId: string,
	plan: PlanKey,
): Promise<{ allowed: boolean; limit: number; used: number }> {
	const limit = PLANS[plan].scansPerMonth;
	const used = await getUserScansThisMonth(userId);
	return { allowed: used < limit, limit, used };
}
