import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { scan } from "@aeorank/core";

// Public route — excluded from Clerk in proxy.ts
// Must be added to clerkMiddleware public routes

export async function POST(request: Request) {
	// Verify QStash signature
	const receiver = new Receiver({
		currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
		nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
	});

	const body = await request.text();
	const signature = request.headers.get("upstash-signature") ?? "";

	const isValid = await receiver.verify({
		signature,
		body,
	});

	if (!isValid) {
		return NextResponse.json(
			{ error: "Invalid QStash signature" },
			{ status: 401 },
		);
	}

	// Parse body
	let payload: { scanId: string; url: string };
	try {
		payload = JSON.parse(body) as { scanId: string; url: string };
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const { scanId, url } = payload;

	if (!scanId || !url) {
		return NextResponse.json(
			{ error: "scanId and url are required" },
			{ status: 400 },
		);
	}

	// Use service role client — QStash callback has no user session
	const supabase = createServiceSupabaseClient();

	// Update status to running
	const { error: updateError } = await supabase
		.from("scans")
		.update({ status: "running" })
		.eq("id", scanId);

	if (updateError) {
		console.error("Error updating scan status to running:", updateError);
		// Continue anyway — best effort
	}

	// Run the scan
	try {
		const result = await scan(url);

		// Write results back to Supabase
		const { error: resultError } = await supabase
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
			.eq("id", scanId);

		if (resultError) {
			console.error("Error writing scan results:", resultError);
			await supabase
				.from("scans")
				.update({ status: "error", error: "Failed to write scan results" })
				.eq("id", scanId);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Scan failed";
		console.error("Scan error:", err);
		await supabase
			.from("scans")
			.update({ status: "error", error: message })
			.eq("id", scanId);
	}

	return NextResponse.json({ ok: true });
}
