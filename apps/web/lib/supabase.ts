import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * User-scoped Supabase client. Sends the Clerk session token; RLS applies
 * `auth.jwt()->>'sub' = user_id`.
 *
 * Do not use this for dashboard writes. If `getToken()` is null, supabase-js
 * falls back to the anon key, and if Supabase is not configured to accept the
 * Clerk session (third-party auth + `role: authenticated`), PostgREST rejects
 * the JWT. Either failure is a 500 on insert while service-role reads still work.
 * Dashboard routes that already called `auth()` should use
 * {@link createServiceSupabaseClient} and set/filter `user_id` themselves.
 */
export function createServerSupabaseClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			async accessToken() {
				const token = await (await auth()).getToken();
				if (!token) {
					console.error(
						"Clerk getToken() returned no session token; Supabase will not see auth.jwt()->>'sub'",
					);
				}
				return token;
			},
		},
	);
}

/**
 * Service-role Supabase client. Bypasses RLS.
 * Use for trusted server work: QStash callbacks, webhooks, and route handlers
 * that already authenticated a Clerk user and scope every query to that userId.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client, and never take user_id
 * from the request body when using this client.
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
