import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createServiceSupabaseClient } from "@/lib/supabase";

// Scans stuck in pending/running for longer than this are considered stale
const STALE_SCAN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return NextResponse.json({ error: "id is required" }, { status: 400 });
	}

	const supabase = createServerSupabaseClient();

	const { data: scan, error } = await supabase
		.from("scans")
		.select("id, status, error, progress, scanned_at")
		.eq("id", id)
		.eq("user_id", userId)
		.single();

	if (error || !scan) {
		return NextResponse.json({ error: "Scan not found" }, { status: 404 });
	}

	// Detect stale scans — if pending/running for too long, mark as error so user can retry
	if (scan.status === "pending" || scan.status === "running") {
		const scannedAt = scan.scanned_at as string | null;
		if (scannedAt) {
			const elapsed = Date.now() - new Date(scannedAt).getTime();
			if (elapsed > STALE_SCAN_TIMEOUT_MS) {
				const serviceSupabase = createServiceSupabaseClient();
				const timeoutMsg = scan.status === "pending"
					? "Scan did not start processing. The job queue may not have delivered the request. Please retry."
					: "Scan timed out while processing. Please retry.";

				await serviceSupabase
					.from("scans")
					.update({ status: "error", error: timeoutMsg })
					.eq("id", id);

				return NextResponse.json({ status: "error", error: timeoutMsg });
			}
		}
	}

	return NextResponse.json({
		status: scan.status,
		...(scan.error ? { error: scan.error as string } : {}),
		...(scan.progress != null ? { progress: scan.progress as number } : {}),
	});
}
