import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Hoisted mocks — vitest requires factory closure here, no top-level vars.
const { supabaseChain, publishJSON } = vi.hoisted(() => ({
	supabaseChain: { result: { data: [] as unknown[] | null, error: null as unknown } },
	publishJSON: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
	captureMessage: vi.fn(),
	captureException: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
	function makeQuery(): unknown {
		const q: Record<string, unknown> = {};
		const passthrough = () => q;
		q.select = passthrough;
		q.eq = passthrough;
		q.not = passthrough;
		q.lte = passthrough;
		q.update = passthrough;
		q.insert = () => ({
			select: () => ({
				single: async () => ({ data: { id: "scan-1" }, error: null }),
			}),
		});
		q.then = (resolve: (v: unknown) => unknown) => Promise.resolve(supabaseChain.result).then(resolve);
		return q;
	}
	return {
		createServiceSupabaseClient: () => ({ from: () => makeQuery() }),
	};
});

vi.mock("@/lib/qstash", () => ({
	getQStashClient: () => ({ publishJSON }),
}));

async function callGet(req: Request) {
	const mod = await import("./route");
	return mod.GET(req);
}

describe("GET /api/cron/rescan", () => {
	beforeEach(() => {
		vi.resetModules();
		supabaseChain.result = { data: [], error: null };
		publishJSON.mockReset();
	});

	afterEach(() => {
		delete process.env.CRON_SECRET;
	});

	it("returns 500 when CRON_SECRET is not configured", async () => {
		const res = await callGet(new Request("http://x/api/cron/rescan"));
		expect(res.status).toBe(500);
	});

	it("returns 401 when authorization header does not match", async () => {
		process.env.CRON_SECRET = "expected-secret";
		const res = await callGet(
			new Request("http://x/api/cron/rescan", {
				headers: { authorization: "Bearer wrong-secret" },
			}),
		);
		expect(res.status).toBe(401);
	});

	it("returns enqueued:0 when no sites are due", async () => {
		process.env.CRON_SECRET = "expected-secret";
		supabaseChain.result = { data: [], error: null };
		const res = await callGet(
			new Request("http://x/api/cron/rescan", {
				headers: { authorization: "Bearer expected-secret" },
			}),
		);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ enqueued: 0 });
		expect(publishJSON).not.toHaveBeenCalled();
	});

	it("returns 500 when the supabase query errors", async () => {
		process.env.CRON_SECRET = "expected-secret";
		supabaseChain.result = { data: null, error: { message: "boom" } };
		const res = await callGet(
			new Request("http://x/api/cron/rescan", {
				headers: { authorization: "Bearer expected-secret" },
			}),
		);
		expect(res.status).toBe(500);
	});
});
