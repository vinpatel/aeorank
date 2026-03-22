import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getQStashClient } from "@/lib/qstash";

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
	// Verify cron secret to prevent unauthorized triggers
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createServiceSupabaseClient();

	// Find sites due for rescan
	const { data: sites, error } = await supabase
		.from("sites")
		.select("id, user_id, url, rescan_schedule")
		.not("rescan_schedule", "is", null)
		.lte("next_rescan_at", new Date().toISOString());

	if (error || !sites || sites.length === 0) {
		return NextResponse.json({ enqueued: 0 });
	}

	const qstash = getQStashClient();
	let enqueued = 0;

	for (const site of sites) {
		// Insert pending scan
		const { data: scanRecord, error: scanError } = await supabase
			.from("scans")
			.insert({ user_id: site.user_id, site_id: site.id, status: "pending" })
			.select("id")
			.single();

		if (scanError || !scanRecord) continue;

		// Enqueue via QStash
		try {
			await qstash.publishJSON({
				url: `${process.env.NEXT_PUBLIC_APP_URL}/api/scan/process`,
				body: { scanId: scanRecord.id, url: site.url },
			});
			enqueued++;
		} catch {
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
