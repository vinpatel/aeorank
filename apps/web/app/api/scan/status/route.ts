import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

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
		.select("status, error, progress")
		.eq("id", id)
		.eq("user_id", userId)
		.single();

	if (error || !scan) {
		return NextResponse.json({ error: "Scan not found" }, { status: 404 });
	}

	return NextResponse.json({
		status: scan.status,
		...(scan.error ? { error: scan.error as string } : {}),
		...(scan.progress != null ? { progress: scan.progress as number } : {}),
	});
}
