import { describe, expect, it } from "vitest";
import { formatDbError } from "./db-error";

describe("formatDbError", () => {
	it("includes the postgres code and message", () => {
		expect(
			formatDbError(
				{
					code: "42P10",
					message:
						"there is no unique or exclusion constraint matching the ON CONFLICT specification",
				},
				"Failed to create site record",
			),
		).toBe(
			"Failed to create site record (42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification)",
		);
	});

	it("keeps the code and drops a message that looks like a credential", () => {
		expect(
			formatDbError(
				{
					code: "PGRST301",
					message: "Invalid JWT: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig",
				},
				"Failed to create site record",
			),
		).toBe("Failed to create site record (PGRST301)");
	});

	it("returns the fallback when there is no detail", () => {
		expect(formatDbError(null, "Failed to create site record")).toBe(
			"Failed to create site record",
		);
		expect(formatDbError({}, "Failed to create site record")).toBe("Failed to create site record");
	});
});
