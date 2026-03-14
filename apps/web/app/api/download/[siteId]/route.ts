import { auth } from "@clerk/nextjs/server";
import JSZip from "jszip";
import { createServerSupabaseClient } from "@/lib/supabase";

interface GeneratedFile {
	name: string;
	content: string;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ siteId: string }> },
) {
	// Auth check
	const { userId } = await auth();
	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	// Next.js 16 async params
	const { siteId } = await params;

	const supabase = createServerSupabaseClient();

	// Query the latest complete scan for this site, verifying user ownership
	const { data: scan, error } = await supabase
		.from("scans")
		.select("id, files, site_id")
		.eq("site_id", siteId)
		.eq("user_id", userId)
		.eq("status", "complete")
		.order("scanned_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error || !scan) {
		return new Response("No completed scan found", { status: 404 });
	}

	// Parse files from JSONB
	const files = scan.files as GeneratedFile[] | null;
	if (!files || files.length === 0) {
		return new Response("No files available for download", { status: 404 });
	}

	// Build ZIP
	const zip = new JSZip();
	for (const file of files) {
		zip.file(file.name, file.content);
	}

	// Use arraybuffer for Web API Response compatibility
	const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

	// Derive a clean hostname for the filename
	let hostname = siteId;
	try {
		// Try to get the site URL from supabase for a friendlier filename
		const { data: site } = await supabase
			.from("sites")
			.select("url")
			.eq("id", siteId)
			.eq("user_id", userId)
			.single();

		if (site?.url) {
			hostname = new URL(site.url).hostname.replace(/[^a-zA-Z0-9.-]/g, "_");
		}
	} catch {
		// Fall back to siteId if URL parsing fails
	}

	return new Response(zipArrayBuffer, {
		status: 200,
		headers: {
			"Content-Type": "application/zip",
			"Content-Disposition": `attachment; filename="aeorank-${hostname}-files.zip"`,
			"Content-Length": String(zipArrayBuffer.byteLength),
		},
	});
}
