import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Server-side Supabase client that uses Clerk native integration.
 * The Clerk session token is passed as the accessToken for each request.
 * Use this for all authenticated server-side queries (Server Components, Route Handlers, Server Actions).
 */
export function createServerSupabaseClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			async accessToken() {
				return (await auth()).getToken();
			},
		},
	);
}

/**
 * Service-role Supabase client for server-to-server operations.
 * Bypasses RLS — use ONLY in trusted server contexts (QStash callbacks, internal jobs).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export function createServiceSupabaseClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);
}
