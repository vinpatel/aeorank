/**
 * Clerk keys are read only from environment variables — never hardcoded.
 * Production hosting must set pk_live_ / sk_live_ values; this module does
 * not ship a Development fallback key.
 */

export function getClerkPublishableKey(): string | undefined {
	const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
	return key || undefined;
}

export function isDevelopmentClerkKey(key: string | undefined): boolean {
	return Boolean(key?.startsWith("pk_test_"));
}

export function isLiveClerkKey(key: string | undefined): boolean {
	return Boolean(key?.startsWith("pk_live_"));
}

export function isProductionAppHost(
	appUrl = process.env.NEXT_PUBLIC_APP_URL,
	vercelEnv = process.env.VERCEL_ENV,
): boolean {
	const url = appUrl?.trim() ?? "";
	if (vercelEnv === "production") return true;
	try {
		const host = url.includes("://") ? new URL(url).hostname : url;
		return host === "app.aeorank.dev";
	} catch {
		return false;
	}
}

/**
 * Soft guard: log when a production host is still on Development Clerk.
 * Does not throw — a hard throw would take down the app during the env cutover.
 */
export function warnIfClerkKeyMismatch(key = getClerkPublishableKey()): void {
	if (isProductionAppHost() && isDevelopmentClerkKey(key)) {
		console.error(
			"Clerk is using a Development publishable key (pk_test_) on the production host. " +
				"Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_… and CLERK_SECRET_KEY=sk_live_… " +
				"on the hosting environment, then redeploy. See apps/web/PRODUCTION_BILLING.md.",
		);
	}
}
