import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

/**
 * Keep-alive cron — triggered daily by Vercel Cron.
 *
 * Supabase free-tier projects auto-pause after ~7 days with no activity,
 * which takes the whole app down ("Failed to create site record" etc.).
 * This endpoint issues one trivial read against the database so the project
 * is never considered idle. It deliberately does nothing else, so it can't
 * be broken by unrelated changes to the rescan pipeline.
 *
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically when
 * CRON_SECRET is set on the project — set it, or this (and the rescan cron)
 * will 500 on every run and the DB will pause anyway.
 */
export async function GET(request: Request) {
	const expected = process.env.CRON_SECRET;
	if (!expected) {
		console.error("CRON_SECRET is not configured — refusing to run");
		Sentry.captureMessage("CRON_SECRET missing in cron/keep-alive", { level: "error" });
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${expected}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createServiceSupabaseClient();

	// Cheapest possible query that still hits Postgres: a head count, no rows.
	const { error } = await supabase
		.from("sites")
		.select("*", { count: "exact", head: true });

	if (error) {
		console.error("cron/keep-alive: ping failed", error);
		Sentry.captureException(error, { tags: { source: "cron-keep-alive" } });
		return NextResponse.json({ ok: false, error: "ping_failed" }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}
