import { describe, expect, it } from "vitest";
import { AeorankError, handleError } from "../errors.js";

describe("AeorankError", () => {
	it("stores message and suggestion", () => {
		const err = new AeorankError("Something went wrong", "Try again later");
		expect(err.message).toBe("Something went wrong");
		expect(err.suggestion).toBe("Try again later");
		expect(err.name).toBe("AeorankError");
	});
});

describe("handleError", () => {
	it("returns message and suggestion for AeorankError", () => {
		const err = new AeorankError("Custom error", "Custom suggestion");
		const result = handleError(err);
		expect(result.message).toBe("Custom error");
		expect(result.suggestion).toBe("Custom suggestion");
	});

	it("suggests https:// prefix for invalid URL TypeError", () => {
		const err = new TypeError("Invalid URL: example.com");
		const result = handleError(err);
		expect(result.message).toContain("not a valid URL");
		expect(result.suggestion).toContain("https://");
		expect(result.suggestion).toContain("example.com");
	});

	it("suggests checking connection for network errors", () => {
		const err = new Error("fetch failed");
		const result = handleError(err);
		expect(result.suggestion).toContain("Check the URL and your internet connection");
	});

	it("suggests checking connection for ECONNREFUSED", () => {
		const err = Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" });
		const result = handleError(err);
		expect(result.suggestion).toContain("Check the URL and your internet connection");
	});

	it("suggests checking connection for ENOTFOUND", () => {
		const err = Object.assign(new Error("getaddrinfo ENOTFOUND"), { code: "ENOTFOUND" });
		const result = handleError(err);
		expect(result.suggestion).toContain("Check the URL and your internet connection");
	});

	it("suggests --max-pages for timeout errors", () => {
		const err = new Error("Scan timed out after 30s");
		const result = handleError(err);
		expect(result.suggestion).toContain("--max-pages 20");
	});

	it("suggests --max-pages for ETIMEDOUT", () => {
		const err = Object.assign(new Error("ETIMEDOUT"), { code: "ETIMEDOUT" });
		const result = handleError(err);
		expect(result.suggestion).toContain("--max-pages 20");
	});

	it("suggests checking permissions for EACCES", () => {
		const err = Object.assign(new Error("permission denied"), { code: "EACCES" });
		const result = handleError(err);
		expect(result.suggestion).toContain("permissions");
		expect(result.suggestion).toContain("--output");
	});

	it("returns generic suggestion for unknown errors", () => {
		const err = new Error("Something weird happened");
		const result = handleError(err);
		expect(result.suggestion).toBeTruthy();
		expect(result.suggestion.length).toBeGreaterThan(0);
	});

	it("handles non-Error values", () => {
		const result = handleError("string error");
		expect(result.message).toBe("string error");
		expect(result.suggestion).toBeTruthy();
	});

	it("always returns a non-empty suggestion", () => {
		const cases = [
			new TypeError("Invalid URL: foo"),
			new Error("fetch failed"),
			new Error("timed out"),
			Object.assign(new Error("EACCES"), { code: "EACCES" }),
			new Error("unknown thing"),
			"string",
			42,
			null,
		];

		for (const err of cases) {
			const result = handleError(err);
			expect(result.suggestion, `suggestion for ${String(err)}`).toBeTruthy();
			expect(result.suggestion.length, `suggestion length for ${String(err)}`).toBeGreaterThan(0);
		}
	});
});
