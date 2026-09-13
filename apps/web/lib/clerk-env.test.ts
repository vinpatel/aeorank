import { afterEach, describe, expect, it } from "vitest";
import {
	getClerkPublishableKey,
	isDevelopmentClerkKey,
	isLiveClerkKey,
	isProductionAppHost,
} from "./clerk-env";

afterEach(() => {
	// biome-ignore lint/performance/noDelete: must remove the key; assigning undefined stringifies
	delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
	// biome-ignore lint/performance/noDelete: must remove the key; assigning undefined stringifies
	delete process.env.NEXT_PUBLIC_APP_URL;
	// biome-ignore lint/performance/noDelete: must remove the key; assigning undefined stringifies
	delete process.env.VERCEL_ENV;
});

describe("clerk env helpers", () => {
	it("reads the publishable key only from env", () => {
		expect(getClerkPublishableKey()).toBeUndefined();
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "  pk_live_example  ";
		expect(getClerkPublishableKey()).toBe("pk_live_example");
	});

	it("detects Development vs Production Clerk keys", () => {
		expect(isDevelopmentClerkKey("pk_test_abc")).toBe(true);
		expect(isDevelopmentClerkKey("pk_live_abc")).toBe(false);
		expect(isLiveClerkKey("pk_live_abc")).toBe(true);
		expect(isLiveClerkKey("pk_test_abc")).toBe(false);
	});

	it("treats app.aeorank.dev and Vercel production as the production host", () => {
		expect(isProductionAppHost("https://app.aeorank.dev", undefined)).toBe(true);
		expect(isProductionAppHost("http://localhost:3000", "production")).toBe(true);
		expect(isProductionAppHost("http://localhost:3000", "development")).toBe(false);
	});
});
