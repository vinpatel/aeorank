import type { DbError } from "@/lib/db-error";
import { createServiceSupabaseClient } from "@/lib/supabase";

export interface OwnedSitesDb {
	upsertSite(
		userId: string,
		url: string,
	): Promise<{ data: { id: string } | null; error: DbError | null }>;
	findSite(
		userId: string,
		url: string,
	): Promise<{ data: { id: string } | null; error: DbError | null }>;
	insertSite(
		userId: string,
		url: string,
	): Promise<{ data: { id: string } | null; error: DbError | null }>;
}

/** Postgres: ON CONFLICT target has no matching unique constraint. */
const MISSING_CONFLICT_TARGET = "42P10";
/** Postgres: unique_violation (lost an insert race after the constraint exists). */
const UNIQUE_VIOLATION = "23505";

function toDbError(error: { code?: string; message?: string } | null): DbError | null {
	if (!error) return null;
	return {
		...(error.code ? { code: error.code } : {}),
		...(error.message ? { message: error.message } : {}),
	};
}

/**
 * Service-role access to `sites`, always keyed by the Clerk user id the caller
 * already authenticated. Does not read a user id from the request body.
 */
export function serviceOwnedSitesDb(): OwnedSitesDb {
	const supabase = createServiceSupabaseClient();
	return {
		async upsertSite(userId, url) {
			const { data, error } = await supabase
				.from("sites")
				.upsert({ user_id: userId, url }, { onConflict: "user_id,url", ignoreDuplicates: false })
				.select("id")
				.maybeSingle();
			return { data: data?.id ? { id: data.id } : null, error: toDbError(error) };
		},
		async findSite(userId, url) {
			const { data, error } = await supabase
				.from("sites")
				.select("id")
				.eq("user_id", userId)
				.eq("url", url)
				.limit(1);
			const row = data?.[0];
			return { data: row?.id ? { id: row.id } : null, error: toDbError(error) };
		},
		async insertSite(userId, url) {
			const { data, error } = await supabase
				.from("sites")
				.insert({ user_id: userId, url })
				.select("id")
				.maybeSingle();
			return { data: data?.id ? { id: data.id } : null, error: toDbError(error) };
		},
	};
}

/**
 * Create or reuse the signed-in user's site row.
 *
 * Prefers `ON CONFLICT (user_id, url)` when `sites_user_id_url_key` exists.
 * If that constraint was never applied (SQLSTATE 42P10), falls back to a
 * scoped select + insert so the scan can still start.
 */
export async function ensureOwnedSite(
	userId: string,
	url: string,
	db: OwnedSitesDb = serviceOwnedSitesDb(),
): Promise<{ id: string } | { error: DbError }> {
	const upserted = await db.upsertSite(userId, url);
	if (upserted.data?.id) return { id: upserted.data.id };

	if (upserted.error?.code === MISSING_CONFLICT_TARGET) {
		return insertWithoutConflictTarget(db, userId, url);
	}

	if (upserted.error) return { error: upserted.error };
	return { error: { message: "Site upsert returned no row" } };
}

async function insertWithoutConflictTarget(
	db: OwnedSitesDb,
	userId: string,
	url: string,
): Promise<{ id: string } | { error: DbError }> {
	const existing = await db.findSite(userId, url);
	if (existing.error) return { error: existing.error };
	if (existing.data?.id) return { id: existing.data.id };

	const inserted = await db.insertSite(userId, url);
	if (inserted.data?.id) return { id: inserted.data.id };

	if (inserted.error?.code === UNIQUE_VIOLATION) {
		const raced = await db.findSite(userId, url);
		if (raced.data?.id) return { id: raced.data.id };
		if (raced.error) return { error: raced.error };
	}

	if (inserted.error) return { error: inserted.error };
	return { error: { message: "Site insert returned no row" } };
}
