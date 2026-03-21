import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { validateScanUrl } from "@/lib/validate-url";
import { scan } from "@aeorank/core";
import { getCurrentPlan, canAddSite, canRunScan } from "@/lib/plan";

export const maxDuration = 300;

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
			{ error: `Monthly scan limit reached (${scanCheck.used}/${scanCheck.limit}). Upgrade your plan for more scans.`, code: "SCAN_LIMIT" },
			{ status: 403 },
		);
	}

	const siteCheck = await canAddSite(userId, plan);
	if (!siteCheck.allowed) {
		// Check if user already has this URL — re-scanning an existing site is OK
		const supabaseCheck = createServiceSupabaseClient();
		const { data: existingSite } = await supabaseCheck
			.from("sites")
			.select("id")
			.eq("user_id", userId)
			.eq("url", validatedUrl)
			.maybeSingle();

		if (!existingSite) {
			return NextResponse.json(
				{ error: `Site limit reached (${siteCheck.current}/${siteCheck.limit}). Upgrade your plan to add more sites.`, code: "SITE_LIMIT" },
				{ status: 403 },
			);
		}
	}

	const supabase = createServerSupabaseClient();

	const { data: site, error: siteError } = await supabase
		.from("sites")
		.upsert(
			{ user_id: userId, url: validatedUrl },
			{ onConflict: "user_id,url", ignoreDuplicates: false },
		)
		.select("id")
		.single();

	if (siteError || !site) {
		console.error("Error upserting site:", siteError);
		return NextResponse.json(
			{ error: "Failed to create site record" },
			{ status: 500 },
		);
	}

	// Insert scan record as running
	const serviceSupabase = createServiceSupabaseClient();
	const { data: scanRecord, error: scanError } = await supabase
		.from("scans")
		.insert({ user_id: userId, site_id: site.id, status: "running" })
		.select("id")
		.single();

	if (scanError || !scanRecord) {
		console.error("Error inserting scan:", scanError);
		return NextResponse.json(
			{ error: "Failed to create scan record" },
			{ status: 500 },
		);
	}

	// Run scan inline
	try {
		const result = await scan(validatedUrl);

		await serviceSupabase
			.from("scans")
			.update({
				status: "complete",
				score: result.score,
				grade: result.grade,
				dimensions: result.dimensions,
				files: result.files.map((f) => ({ name: f.name, content: f.content })),
				pages_scanned: result.pagesScanned,
				duration_ms: result.duration,
				scanned_at: result.scannedAt,
			})
			.eq("id", scanRecord.id);

		return NextResponse.json(
			{ scanId: scanRecord.id, siteId: site.id },
			{ status: 200 },
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Scan failed";
		console.error("Scan error:", err);
		await serviceSupabase
			.from("scans")
			.update({ status: "error", error: message })
			.eq("id", scanRecord.id);
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}
