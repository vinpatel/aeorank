import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getCliVersion } from "../version.js";

describe("getCliVersion", () => {
	it("matches packages/cli/package.json — one source of truth", () => {
		const pkg = JSON.parse(
			readFileSync(join(import.meta.dirname, "../../package.json"), "utf8"),
		) as { version: string };
		expect(getCliVersion()).toBe(pkg.version);
		expect(getCliVersion()).not.toBe("0.0.1");
	});
});
