import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { validateScanUrl } from "@/lib/validate-url";
import { getQStashClient } from "@/lib/qstash";

export async function POST(request: Request) {
	// Auth check
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Parse body
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

	// Validate URL (SSRF-safe)
	let validatedUrl: string;
	try {
		validatedUrl = validateScanUrl(rawUrl);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Invalid URL";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	const supabase = createServerSupabaseClient();

	// Upsert site record (user_id + url must be unique)
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

	// Insert pending scan record
	const { data: scan, error: scanError } = await supabase
		.from("scans")
		.insert({ user_id: userId, site_id: site.id, status: "pending" })
		.select("id")
		.single();

	if (scanError || !scan) {
		console.error("Error inserting scan:", scanError);
		return NextResponse.json(
			{ error: "Failed to create scan record" },
			{ status: 500 },
		);
	}

	// Enqueue QStash job pointing to /api/scan/process
	const appUrl = process.env.NEXT_PUBLIC_APP_URL;
	if (!appUrl) {
		return NextResponse.json(
			{ error: "NEXT_PUBLIC_APP_URL is not configured" },
			{ status: 500 },
		);
	}

	try {
		await getQStashClient().publishJSON({
			url: `${appUrl}/api/scan/process`,
			body: { scanId: scan.id, url: validatedUrl },
		});
	} catch (err) {
		console.error("Error enqueuing QStash job:", err);
		// Mark scan as error since we couldn't enqueue it
		await supabase
			.from("scans")
			.update({ status: "error", error: "Failed to enqueue scan job" })
			.eq("id", scan.id);
		return NextResponse.json(
			{ error: "Failed to enqueue scan job" },
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{ scanId: scan.id, siteId: site.id },
		{ status: 202 },
	);
}
