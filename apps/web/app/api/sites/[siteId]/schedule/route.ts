import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const VALID_SCHEDULES = ["daily", "weekly", "monthly", null];

const DAY_MS = 24 * 60 * 60 * 1000;

const SCHEDULE_INTERVALS: Record<string, number> = {
	daily: DAY_MS,
	weekly: 7 * DAY_MS,
	monthly: 30 * DAY_MS,
};

interface RouteParams {
	params: Promise<{ siteId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { siteId } = await params;

	let body: { schedule: string | null };
	try {
		body = (await request.json()) as { schedule: string | null };
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (!VALID_SCHEDULES.includes(body.schedule)) {
		return NextResponse.json({ error: "Invalid schedule. Use daily, weekly, monthly, or null." }, { status: 400 });
	}

	const supabase = createServerSupabaseClient();

	// Subtract one cron period (24h) so the very next 6am UTC tick after
	// roughly `interval` has elapsed picks this site up. Without this offset,
	// "daily" lags ~44h, "weekly" lags ~7d 20h on the first run.
	const nextRescan = body.schedule
		? new Date(
			Date.now() + (SCHEDULE_INTERVALS[body.schedule] ?? SCHEDULE_INTERVALS.weekly) - DAY_MS,
		).toISOString()
		: null;

	const { error } = await supabase
		.from("sites")
		.update({
			rescan_schedule: body.schedule,
			next_rescan_at: nextRescan,
		})
		.eq("id", siteId)
		.eq("user_id", userId);

	if (error) {
		return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
	}

	return NextResponse.json({ schedule: body.schedule, nextRescanAt: nextRescan });
}
