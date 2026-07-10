import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isLocalhostOrigin, resolveAppUrl } from "./app-url";

function req(headers: Record<string, string> = {}): Request {
	return new Request("http://internal/api/scan", { headers });
}

const ENV_KEYS = [
	"NEXT_PUBLIC_APP_URL",
	"VERCEL_ENV",
	"VERCEL",
	"VERCEL_URL",
	"VERCEL_PROJECT_PRODUCTION_URL",
] as const;

describe("isLocalhostOrigin", () => {
	it("detects localhost forms", () => {
		for (const v of [
			"http://localhost:3000",
			"localhost",
			"127.0.0.1",
			"http://127.0.0.1:3000",
			"0.0.0.0",
			"app.localhost",
		]) {
			expect(isLocalhostOrigin(v)).toBe(true);
		}
	});

	it("passes real hosts", () => {
		for (const v of ["https://aeorank.dev", "aeorank.dev", "app.aeorank.dev"]) {
			expect(isLocalhostOrigin(v)).toBe(false);
		}
	});
});

describe("resolveAppUrl", () => {
	beforeEach(() => {
		for (const k of ENV_KEYS) delete process.env[k];
	});
	afterEach(() => {
		for (const k of ENV_KEYS) delete process.env[k];
	});

	it("uses NEXT_PUBLIC_APP_URL when set (non-deployed) and strips trailing slash", () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://aeorank.dev/";
		expect(resolveAppUrl(req())).toBe("https://aeorank.dev");
	});

	it("returns configured localhost when not deployed (local dev)", () => {
		process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
		expect(resolveAppUrl(req())).toBe("http://localhost:3000");
	});

	it("ignores a localhost NEXT_PUBLIC_APP_URL when deployed and derives from request", () => {
		process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
		process.env.VERCEL_ENV = "production";
		const url = resolveAppUrl(
			req({ "x-forwarded-host": "aeorank.dev", "x-forwarded-proto": "https" }),
		);
		expect(url).toBe("https://aeorank.dev");
	});

	it("prefers x-forwarded-host over host header", () => {
		process.env.VERCEL_ENV = "production";
		process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
		const url = resolveAppUrl(
			req({ "x-forwarded-host": "public.aeorank.dev", host: "internal.vercel.app" }),
		);
		expect(url).toBe("https://public.aeorank.dev");
	});

	it("falls back to VERCEL_PROJECT_PRODUCTION_URL when deployed with no usable host", () => {
		process.env.VERCEL_ENV = "production";
		process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
		process.env.VERCEL_PROJECT_PRODUCTION_URL = "aeorank.vercel.app";
		expect(resolveAppUrl(req())).toBe("https://aeorank.vercel.app");
	});

	it("throws when deployed and only a localhost origin can be resolved", () => {
		process.env.VERCEL_ENV = "production";
		process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
		expect(() => resolveAppUrl(req({ host: "localhost:3000" }))).toThrow();
	});
});
