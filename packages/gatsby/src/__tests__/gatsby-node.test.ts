import { describe, it, expect, vi, beforeEach } from "vitest";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { onPostBuild } from "../gatsby-node.js";

vi.mock("node:fs", () => ({
	writeFileSync: vi.fn(),
	existsSync: vi.fn().mockReturnValue(true),
	mkdirSync: vi.fn(),
}));

const FAKE_CWD = "/tmp/fake-gatsby-project";

describe("onPostBuild", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(process, "cwd").mockReturnValue(FAKE_CWD);
		vi.mocked(existsSync).mockReturnValue(true);
		vi.mocked(writeFileSync).mockImplementation(() => {});
		vi.mocked(mkdirSync).mockImplementation(() => undefined as never);
	});

	it("is a function", () => {
		expect(onPostBuild).toBeTypeOf("function");
	});

	it("writes 8 files to the public/ directory", () => {
		onPostBuild(undefined, {
			siteName: "Test",
			siteUrl: "https://test.com",
			description: "Test",
		});

		expect(writeFileSync).toHaveBeenCalledTimes(8);
	});

	it("writes llms.txt to the public directory", () => {
		onPostBuild(undefined, {
			siteName: "Test",
			siteUrl: "https://test.com",
			description: "Test",
		});

		const calls = vi.mocked(writeFileSync).mock.calls;
		const paths = calls.map((call) => call[0] as string);
		expect(paths.some((p) => p.endsWith("/llms.txt"))).toBe(true);
	});

	it("writes schema.json to the public directory", () => {
		onPostBuild(undefined, {
			siteName: "Test",
			siteUrl: "https://test.com",
			description: "Test",
		});

		const calls = vi.mocked(writeFileSync).mock.calls;
		const paths = calls.map((call) => call[0] as string);
		expect(paths.some((p) => p.endsWith("/schema.json"))).toBe(true);
	});

	it("writes all 8 expected files", () => {
		onPostBuild(undefined, {
			siteName: "Test",
			siteUrl: "https://test.com",
			description: "Test",
		});

		const expectedFiles = [
			"llms.txt",
			"llms-full.txt",
			"CLAUDE.md",
			"schema.json",
			"robots-patch.txt",
			"faq-blocks.html",
			"citation-anchors.html",
			"sitemap-ai.xml",
		];

		const calls = vi.mocked(writeFileSync).mock.calls;
		const paths = calls.map((call) => call[0] as string);

		for (const file of expectedFiles) {
			expect(paths.some((p) => p.endsWith(`/${file}`))).toBe(true);
		}
	});

	it("writes files under process.cwd()/public", () => {
		onPostBuild(undefined, {
			siteName: "Test",
			siteUrl: "https://test.com",
			description: "Test",
		});

		const calls = vi.mocked(writeFileSync).mock.calls;
		const paths = calls.map((call) => call[0] as string);

		for (const p of paths) {
			expect(p).toContain(FAKE_CWD);
			expect(p).toContain("public");
		}
	});

	it("creates public directory if it does not exist", () => {
		vi.mocked(existsSync).mockReturnValue(false);

		onPostBuild(undefined, {
			siteName: "Test",
			siteUrl: "https://test.com",
			description: "Test",
		});

		expect(mkdirSync).toHaveBeenCalled();
	});
});
