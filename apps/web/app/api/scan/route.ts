import { resolveAppUrl } from "@/lib/app-url";
import { formatDbError } from "@/lib/db-error";
import { ensureOwnedSite } from "@/lib/owned-site";
import { canAddSite, canRunScan, getCurrentPlan } from "@/lib/plan";
import { getQStashClient } from "@/lib/qstash";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { validateScanUrl } from "@/lib/validate-url";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (
		!body ||
		typeof body !== "object" ||
		!("url" in body) ||
		typeof (body as Record<string, unknown>).url !== "string"
	) {
		return NextResponse.json({ error: "url is required" }, { status: 400 });
	}

	const rawUrl = (body as { url: string }).url;

	let validatedUrl: string;
	try {
		validatedUrl = validateScanUrl(rawUrl);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Invalid URL";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	// Enforce plan limits
	const plan = await getCurrentPlan();

	const scanCheck = await canRunScan(userId, plan);
	if (!scanCheck.allowed) {
		return NextResponse.json(
			{
				error: `Monthly scan limit reached (${scanCheck.used}/${scanCheck.limit}). Upgrade your plan for more scans.`,
				code: "SCAN_LIMIT",
			},
			{ status: 403 },
		);
	}

	const siteCheck = await canAddSite(userId, plan);
	if (!siteCheck.allowed) {
		// Re-scanning a URL this user already has is allowed at the site cap.
		const supabaseCheck = createServiceSupabaseClient();
		const { data: existingRows, error: existingError } = await supabaseCheck
			.from("sites")
			.select("id")
			.eq("user_id", userId)
			.eq("url", validatedUrl)
			.limit(1);

		if (existingError) {
			console.error("Error checking existing site:", existingError);
		}

		if (!existingRows?.[0]) {
			return NextResponse.json(
				{
					error: `Site limit reached (${siteCheck.current}/${siteCheck.limit}). Upgrade your plan to add more sites.`,
					code: "SITE_LIMIT",
				},
				{ status: 403 },
			);
		}
	}

	// Service role, scoped to the Clerk userId from auth() — not the request body.
	// The user-scoped client writes `user_id` but RLS evaluates auth.jwt()->>'sub'.
	// Those diverge when the Clerk session token is missing or Supabase does not
	// accept it, so plan-limit checks (service role) passed and this upsert 500'd.
	const supabase = createServiceSupabaseClient();
	const siteResult = await ensureOwnedSite(userId, validatedUrl);

	if ("error" in siteResult) {
		console.error("Error upserting site:", siteResult.error);
		return NextResponse.json(
			{ error: formatDbError(siteResult.error, "Failed to create site record") },
			{ status: 500 },
		);
	}

	const { data: scanRecord, error: scanError } = await supabase
		.from("scans")
		.insert({
			user_id: userId,
			site_id: siteResult.id,
			status: "pending",
			scanned_at: new Date().toISOString(),
		})
		.select("id")
		.single();

	if (scanError || !scanRecord) {
		console.error("Error inserting scan:", scanError);
		return NextResponse.json(
			{ error: formatDbError(scanError, "Failed to create scan record") },
			{ status: 500 },
		);
	}

	// Enqueue scan via QStash
	try {
		const qstash = getQStashClient();
		await qstash.publishJSON({
			url: `${resolveAppUrl(request)}/api/scan/process`,
			body: { scanId: scanRecord.id, url: validatedUrl },
		});
	} catch (err) {
		console.error("QStash publish error:", err);
		await supabase
			.from("scans")
			.update({ status: "error", error: "Failed to enqueue scan" })
			.eq("id", scanRecord.id)
			.eq("user_id", userId);
		return NextResponse.json({ error: "Failed to enqueue scan" }, { status: 500 });
	}

	return NextResponse.json({ scanId: scanRecord.id, siteId: siteResult.id }, { status: 202 });
}
