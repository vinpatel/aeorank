import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

interface RouteParams {
	params: Promise<{ siteId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { siteId } = await params;

	const supabase = createServerSupabaseClient();

	// Delete scans first (foreign key constraint)
	await supabase
		.from("scans")
		.delete()
		.eq("site_id", siteId)
		.eq("user_id", userId);

	// Delete the site (only if owned by this user)
	const { error } = await supabase
		.from("sites")
		.delete()
		.eq("id", siteId)
		.eq("user_id", userId);

	if (error) {
		console.error("Error deleting site:", error);
		return NextResponse.json(
			{ error: "Failed to delete site" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ ok: true });
}
