/**
 * Resolve the public origin used to build QStash callback URLs
 * (`${origin}/api/scan/process`).
 *
 * QStash accepts a published job as long as the URL is syntactically valid,
 * then delivers it asynchronously. If the origin is wrong — most commonly a
 * stale or localhost `NEXT_PUBLIC_APP_URL` carried into a deployment — the job
 * is accepted but the callback never lands, so the scan sits at "pending"
 * forever ("Queued — scan starting soon…"). This helper prevents that class of
 * silent failure by:
 *   1. trusting an explicit `NEXT_PUBLIC_APP_URL` unless we're deployed and it
 *      points at localhost,
 *   2. otherwise deriving the origin from the incoming request (Vercel forwards
 *      the real public host via `x-forwarded-host` / `x-forwarded-proto`),
 *   3. falling back to Vercel's injected production URL,
 *   4. throwing if it can only resolve a localhost origin while deployed — so
 *      the caller surfaces an immediate "Failed to enqueue" error instead of a
 *      five-minute hang.
 */

function stripTrailingSlashes(value: string): string {
	return value.replace(/\/+$/, "");
}

/** True for hostnames/origins that QStash's cloud workers cannot reach. */
export function isLocalhostOrigin(value: string): boolean {
	let host: string;
	try {
		host = value.includes("://") ? new URL(value).hostname : value.split(":")[0];
	} catch {
		return false;
	}
	return (
		host === "localhost" ||
		host === "127.0.0.1" ||
		host === "0.0.0.0" ||
		host === "::1" ||
		host.endsWith(".localhost")
	);
}

export function resolveAppUrl(request: Request): string {
	const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
	const cleanedConfigured = configured ? stripTrailingSlashes(configured) : "";

	// On Vercel this is always set ("production" | "preview" | "development").
	// Absent locally, where a localhost origin is expected and fine.
	const deployed = Boolean(process.env.VERCEL_ENV || process.env.VERCEL);

	// 1. Trust an explicit URL, unless deployed + pointing at localhost.
	if (cleanedConfigured && !(deployed && isLocalhostOrigin(cleanedConfigured))) {
		return cleanedConfigured;
	}

	// 2. Derive from the incoming request. Vercel forwards the real public host.
	const forwardedHost = request.headers.get("x-forwarded-host");
	const host = forwardedHost ?? request.headers.get("host");
	if (host && !isLocalhostOrigin(host)) {
		const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
		return `${proto}://${stripTrailingSlashes(host)}`;
	}

	// 3. Vercel-injected production URL (no scheme).
	const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
	if (vercelHost && !isLocalhostOrigin(vercelHost)) {
		return `https://${stripTrailingSlashes(vercelHost)}`;
	}

	// 4. Not deployed: a configured localhost origin is exactly what we want.
	if (cleanedConfigured && !deployed) {
		return cleanedConfigured;
	}

	throw new Error(
		"Cannot resolve a reachable app URL for the scan callback. " +
			"Set NEXT_PUBLIC_APP_URL to the deployment's public origin.",
	);
}
