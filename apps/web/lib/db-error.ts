export interface DbError {
	code?: string;
	message?: string;
}

const SECRET_LIKE =
	/bearer\s+\S+|service_role|sb_secret_|sb_publishable_|sk_live_|sk_test_|eyJ[A-Za-z0-9_-]{20,}/i;

/**
 * Turn a PostgREST/Postgres error into a short client-safe suffix.
 * Keeps the SQLSTATE / PostgREST code and message; drops anything that looks like a credential.
 */
export function formatDbError(error: DbError | null | undefined, fallback: string): string {
	if (!error) return fallback;
	const code = typeof error.code === "string" ? error.code.trim() : "";
	const message = typeof error.message === "string" ? error.message.trim() : "";
	if (!code && !message) return fallback;
	if (SECRET_LIKE.test(message) || SECRET_LIKE.test(code)) {
		return code && !SECRET_LIKE.test(code) ? `${fallback} (${code})` : fallback;
	}
	const detail = [code, message].filter((part) => part.length > 0).join(": ");
	return `${fallback} (${detail.slice(0, 240)})`;
}
