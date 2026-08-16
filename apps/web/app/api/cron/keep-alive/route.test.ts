import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Hoisted mocks — vitest requires factory closure here, no top-level vars.
const { supabaseChain } = vi.hoisted(() => ({
	supabaseChain: { result: { error: null as unknown } },
}));

vi.mock("@sentry/nextjs", () => ({
	captureMessage: vi.fn(),
	captureException: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
	function makeQuery(): unknown {
		const q: Record<string, unknown> = {};
		// select(...) is awaited directly, so it must be a thenable.
		q.select = () => ({
			then: (resolve: (v: unknown) => unknown) =>
				Promise.resolve(supabaseChain.result).then(resolve),
		});
		return q;
	}
	return {
		createServiceSupabaseClient: () => ({ from: () => makeQuery() }),
	};
});

async function callGet(req: Request) {
	const mod = await import("./route");
	return mod.GET(req);
}

describe("GET /api/cron/keep-alive", () => {
	beforeEach(() => {
		vi.resetModules();
		supabaseChain.result = { error: null };
	});

	afterEach(() => {
		delete process.env.CRON_SECRET;
	});

	it("returns 500 when CRON_SECRET is not configured", async () => {
		const res = await callGet(new Request("http://x/api/cron/keep-alive"));
		expect(res.status).toBe(500);
	});

	it("returns 401 when authorization header does not match", async () => {
		process.env.CRON_SECRET = "expected-secret";
		const res = await callGet(
			new Request("http://x/api/cron/keep-alive", {
				headers: { authorization: "Bearer wrong-secret" },
			}),
		);
		expect(res.status).toBe(401);
	});

	it("returns ok:true when the ping succeeds", async () => {
		process.env.CRON_SECRET = "expected-secret";
		supabaseChain.result = { error: null };
		const res = await callGet(
			new Request("http://x/api/cron/keep-alive", {
				headers: { authorization: "Bearer expected-secret" },
			}),
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it("returns 500 when the supabase ping errors", async () => {
		process.env.CRON_SECRET = "expected-secret";
		supabaseChain.result = { error: { message: "boom" } };
		const res = await callGet(
			new Request("http://x/api/cron/keep-alive", {
				headers: { authorization: "Bearer expected-secret" },
			}),
		);
		expect(res.status).toBe(500);
	});
});
