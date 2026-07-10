import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getQStashClient } from "@/lib/qstash";
import { resolveAppUrl } from "@/lib/app-url";

const SCHEDULE_INTERVALS: Record<string, number> = {
	daily: 24 * 60 * 60 * 1000,
	weekly: 7 * 24 * 60 * 60 * 1000,
	monthly: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Cron endpoint — triggered by Vercel Cron or external scheduler.
 * Finds sites due for rescan and enqueues them via QStash.
 */
export async function GET(request: Request) {
	const expected = process.env.CRON_SECRET;
	if (!expected) {
		console.error("CRON_SECRET is not configured — refusing to run");
		Sentry.captureMessage("CRON_SECRET missing in cron/rescan", { level: "error" });
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${expected}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createServiceSupabaseClient();

	// Find sites due for rescan
	const { data: sites, error } = await supabase
		.from("sites")
		.select("id, user_id, url, rescan_schedule")
		.not("rescan_schedule", "is", null)
		.lte("next_rescan_at", new Date().toISOString());

	if (error) {
		console.error("cron/rescan: query failed", error);
		Sentry.captureException(error, { tags: { source: "cron-rescan-query" } });
		return NextResponse.json({ error: "query_failed" }, { status: 500 });
	}

	if (!sites || sites.length === 0) {
		return NextResponse.json({ enqueued: 0 });
	}

	const qstash = getQStashClient();
	let enqueued = 0;

	// Resolve the callback origin once. If it can only resolve to an
	// unreachable (localhost) origin, publishing would silently strand every
	// rescan at "pending" — fail the whole run loudly instead.
	let callbackBase: string;
	try {
		callbackBase = resolveAppUrl(request);
	} catch (err) {
		console.error("cron/rescan: cannot resolve app URL for callback", err);
		Sentry.captureException(err, { tags: { source: "cron-rescan-app-url" } });
		return NextResponse.json({ error: "app_url_unresolved" }, { status: 500 });
	}

	for (const site of sites) {
		// Insert pending scan
		const { data: scanRecord, error: scanError } = await supabase
			.from("scans")
			.insert({ user_id: site.user_id, site_id: site.id, status: "pending" })
			.select("id")
			.single();

		if (scanError || !scanRecord) {
			console.error("cron/rescan: failed to insert scan row", { siteId: site.id, scanError });
			Sentry.captureException(scanError ?? new Error("scan insert returned no row"), {
				tags: { source: "cron-rescan-insert" },
			});
			continue;
		}

		// Enqueue via QStash
		try {
			await qstash.publishJSON({
				url: `${callbackBase}/api/scan/process`,
				body: { scanId: scanRecord.id, url: site.url },
			});
			enqueued++;
		} catch (err) {
			console.error("cron/rescan: QStash publish failed", { siteId: site.id, err });
			Sentry.captureException(err, { tags: { source: "cron-rescan-qstash" } });
			await supabase
				.from("scans")
				.update({ status: "error", error: "Failed to enqueue rescan" })
				.eq("id", scanRecord.id);
			continue;
		}

		// Update next_rescan_at
		const interval = SCHEDULE_INTERVALS[site.rescan_schedule ?? "weekly"] ?? SCHEDULE_INTERVALS.weekly;
		await supabase
			.from("sites")
			.update({ next_rescan_at: new Date(Date.now() + interval).toISOString() })
			.eq("id", site.id);
	}

	return NextResponse.json({ enqueued });
}
