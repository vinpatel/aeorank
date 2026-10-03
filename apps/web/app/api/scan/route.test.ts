import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	authMock,
	canRunScan,
	canAddSite,
	getCurrentPlan,
	ensureOwnedSite,
	publishJSON,
	insertedScans,
	existingSites,
} = vi.hoisted(() => ({
	authMock: vi.fn(),
	canRunScan: vi.fn(),
	canAddSite: vi.fn(),
	getCurrentPlan: vi.fn(),
	ensureOwnedSite: vi.fn(),
	publishJSON: vi.fn(),
	insertedScans: [] as unknown[],
	existingSites: { rows: [] as { id: string }[] },
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("@/lib/plan", () => ({
	getCurrentPlan,
	canRunScan,
	canAddSite,
}));

vi.mock("@/lib/owned-site", () => ({
	ensureOwnedSite,
}));

vi.mock("@/lib/qstash", () => ({
	getQStashClient: () => ({ publishJSON }),
}));

vi.mock("@/lib/supabase", () => ({
	createServiceSupabaseClient: () => ({
		from(table: string) {
			const builder: Record<string, unknown> = {};
			const chain = () => builder;
			builder.select = chain;
			builder.eq = chain;
			builder.update = chain;
			builder.insert = (payload: unknown) => {
				if (table === "scans") insertedScans.push(payload);
				return builder;
			};
			builder.single = async () => ({ data: { id: "scan-1" }, error: null });
			builder.limit = async () => ({ data: existingSites.rows, error: null });
			return builder;
		},
	}),
	createServerSupabaseClient: () => {
		throw new Error("user-scoped client must not be used for scan writes");
	},
}));

async function post(body: unknown) {
	const { POST } = await import("./route");
	return POST(
		new Request("http://localhost/api/scan", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		}),
	);
}

describe("POST /api/scan", () => {
	beforeEach(() => {
		vi.resetModules();
		authMock.mockReset();
		canRunScan.mockReset();
		canAddSite.mockReset();
		getCurrentPlan.mockReset();
		ensureOwnedSite.mockReset();
		publishJSON.mockReset();
		insertedScans.length = 0;
		existingSites.rows = [];

		process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
		authMock.mockResolvedValue({ userId: "user_clerk" });
		getCurrentPlan.mockResolvedValue("free");
		canRunScan.mockResolvedValue({ allowed: true, limit: 4, used: 0 });
		canAddSite.mockResolvedValue({ allowed: true, limit: 1, current: 0 });
		ensureOwnedSite.mockResolvedValue({ id: "site-1" });
		publishJSON.mockResolvedValue({});
	});

	it("returns 401 when there is no Clerk user", async () => {
		authMock.mockResolvedValue({ userId: null });
		const res = await post({ url: "https://e-ink.me" });
		expect(res.status).toBe(401);
		expect(ensureOwnedSite).not.toHaveBeenCalled();
	});

	it("returns 202 with scanId and siteId for a new URL", async () => {
		const res = await post({ url: "https://e-ink.me", user_id: "user_attacker" });
		expect(res.status).toBe(202);
		expect(await res.json()).toEqual({ scanId: "scan-1", siteId: "site-1" });
		expect(ensureOwnedSite).toHaveBeenCalledWith("user_clerk", "https://e-ink.me/");
		expect(insertedScans).toEqual([
			expect.objectContaining({
				user_id: "user_clerk",
				site_id: "site-1",
				status: "pending",
			}),
		]);
		expect(publishJSON).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { scanId: "scan-1", url: "https://e-ink.me/" },
			}),
		);
	});

	it("keeps the monthly scan limit", async () => {
		canRunScan.mockResolvedValue({ allowed: false, limit: 4, used: 4 });
		const res = await post({ url: "https://e-ink.me" });
		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({ code: "SCAN_LIMIT" });
		expect(ensureOwnedSite).not.toHaveBeenCalled();
	});

	it("keeps the site limit for a URL the user does not already have", async () => {
		canAddSite.mockResolvedValue({ allowed: false, limit: 1, current: 1 });
		existingSites.rows = [];
		const res = await post({ url: "https://e-ink.me" });
		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({ code: "SITE_LIMIT" });
		expect(ensureOwnedSite).not.toHaveBeenCalled();
	});

	it("allows a rescan of an existing URL at the site cap", async () => {
		canAddSite.mockResolvedValue({ allowed: false, limit: 1, current: 1 });
		existingSites.rows = [{ id: "site-existing" }];
		const res = await post({ url: "https://e-ink.me" });
		expect(res.status).toBe(202);
		expect(ensureOwnedSite).toHaveBeenCalledWith("user_clerk", "https://e-ink.me/");
	});

	it("returns the database code when the site row cannot be created", async () => {
		ensureOwnedSite.mockResolvedValue({
			error: {
				code: "42P10",
				message:
					"there is no unique or exclusion constraint matching the ON CONFLICT specification",
			},
		});
		const res = await post({ url: "https://e-ink.me" });
		expect(res.status).toBe(500);
		const body = (await res.json()) as { error: string };
		expect(body.error).toContain("42P10");
		expect(body.error).toContain("Failed to create site record");
		expect(publishJSON).not.toHaveBeenCalled();
	});
});
