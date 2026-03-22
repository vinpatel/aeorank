import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const VALID_SCHEDULES = ["daily", "weekly", "monthly", null];

const SCHEDULE_INTERVALS: Record<string, number> = {
	daily: 24 * 60 * 60 * 1000,
	weekly: 7 * 24 * 60 * 60 * 1000,
	monthly: 30 * 24 * 60 * 60 * 1000,
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

	const nextRescan = body.schedule
		? new Date(Date.now() + (SCHEDULE_INTERVALS[body.schedule] ?? SCHEDULE_INTERVALS.weekly)).toISOString()
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
