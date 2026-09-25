import { describe, expect, it, vi } from "vitest";
import type { DbError } from "./db-error";
import { type OwnedSitesDb, ensureOwnedSite } from "./owned-site";

function db(overrides: Partial<OwnedSitesDb>): OwnedSitesDb {
	return {
		upsertSite: vi.fn(async () => ({ data: null, error: null as DbError | null })),
		findSite: vi.fn(async () => ({ data: null, error: null as DbError | null })),
		insertSite: vi.fn(async () => ({ data: null, error: null as DbError | null })),
		...overrides,
	};
}

describe("ensureOwnedSite", () => {
	it("returns the upserted row for this user id", async () => {
		const sites = db({
			upsertSite: vi.fn(async () => ({ data: { id: "site-1" }, error: null })),
		});

		await expect(ensureOwnedSite("user_123", "https://e-ink.me/", sites)).resolves.toEqual({
			id: "site-1",
		});
		expect(sites.upsertSite).toHaveBeenCalledWith("user_123", "https://e-ink.me/");
		expect(sites.insertSite).not.toHaveBeenCalled();
	});

	it("falls back to a scoped select + insert when the conflict target is missing", async () => {
		const sites = db({
			upsertSite: vi.fn(async () => ({
				data: null,
				error: {
					code: "42P10",
					message:
						"there is no unique or exclusion constraint matching the ON CONFLICT specification",
				},
			})),
			findSite: vi.fn(async () => ({ data: null, error: null })),
			insertSite: vi.fn(async () => ({ data: { id: "site-new" }, error: null })),
		});

		await expect(ensureOwnedSite("user_123", "https://e-ink.me/", sites)).resolves.toEqual({
			id: "site-new",
		});
		expect(sites.findSite).toHaveBeenCalledWith("user_123", "https://e-ink.me/");
		expect(sites.insertSite).toHaveBeenCalledWith("user_123", "https://e-ink.me/");
	});

	it("reuses an existing row when the conflict target is missing", async () => {
		const sites = db({
			upsertSite: vi.fn(async () => ({
				data: null,
				error: { code: "42P10", message: "no unique constraint" },
			})),
			findSite: vi.fn(async () => ({ data: { id: "site-existing" }, error: null })),
		});

		await expect(ensureOwnedSite("user_123", "https://e-ink.me/", sites)).resolves.toEqual({
			id: "site-existing",
		});
		expect(sites.insertSite).not.toHaveBeenCalled();
	});

	it("re-reads after a unique violation on the insert race", async () => {
		const findSite = vi
			.fn()
			.mockResolvedValueOnce({ data: null, error: null })
			.mockResolvedValueOnce({ data: { id: "site-raced" }, error: null });
		const sites = db({
			upsertSite: vi.fn(async () => ({
				data: null,
				error: { code: "42P10", message: "no unique constraint" },
			})),
			findSite,
			insertSite: vi.fn(async () => ({
				data: null,
				error: { code: "23505", message: "duplicate key value violates unique constraint" },
			})),
		});

		await expect(ensureOwnedSite("user_123", "https://e-ink.me/", sites)).resolves.toEqual({
			id: "site-raced",
		});
	});

	it("returns an RLS error instead of writing around it", async () => {
		const sites = db({
			upsertSite: vi.fn(async () => ({
				data: null,
				error: {
					code: "42501",
					message: 'new row violates row-level security policy for table "sites"',
				},
			})),
		});

		await expect(ensureOwnedSite("user_123", "https://e-ink.me/", sites)).resolves.toEqual({
			error: {
				code: "42501",
				message: 'new row violates row-level security policy for table "sites"',
			},
		});
		expect(sites.insertSite).not.toHaveBeenCalled();
	});
});
