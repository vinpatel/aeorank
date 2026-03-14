import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ScanResult } from "@aeorank/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @aeorank/core
vi.mock("@aeorank/core", () => ({
	scan: vi.fn(),
	DEFAULT_CONFIG: {
		maxPages: 50,
		concurrency: 3,
		timeout: 30000,
		userAgent: "AEOrank/1.0",
		respectCrawlDelay: true,
	},
}));

// Mock ora to avoid TTY issues in tests
vi.mock("ora", () => ({
	default: () => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
		succeed: vi.fn().mockReturnThis(),
		fail: vi.fn().mockReturnThis(),
		text: "",
	}),
}));

const mockResult: ScanResult = {
	url: "https://example.com",
	siteName: "Example",
	siteDescription: "An example site",
	score: 65,
	grade: "C",
	dimensions: [
		{
			id: "llms-txt",
			name: "llms.txt Presence",
			score: 0,
			maxScore: 10,
			weight: "high",
			status: "fail",
			hint: "Create /llms.txt with H1 title and sections",
		},
		{
			id: "schema-markup",
			name: "Schema.org Markup",
			score: 7,
			maxScore: 10,
			weight: "high",
			status: "pass",
			hint: "Add more schema types",
		},
		{
			id: "ai-crawler-access",
			name: "AI Crawler Access",
			score: 4,
			maxScore: 10,
			weight: "medium",
			status: "warn",
			hint: "Allow AI crawlers in robots.txt",
		},
		{
			id: "content-structure",
			name: "Content Structure",
			score: 10,
			maxScore: 10,
			weight: "high",
			status: "pass",
			hint: "Strong content structure",
		},
		{
			id: "answer-first",
			name: "Answer-First Formatting",
			score: 6,
			maxScore: 10,
			weight: "medium",
			status: "warn",
			hint: "Start pages with concise lead paragraphs",
		},
		{
			id: "faq-speakable",
			name: "FAQ & Speakable",
			score: 0,
			maxScore: 10,
			weight: "medium",
			status: "fail",
			hint: "Add FAQPage schema markup",
		},
		{
			id: "eeat-signals",
			name: "E-E-A-T Signals",
			score: 7,
			maxScore: 10,
			weight: "medium",
			status: "pass",
			hint: "Strong E-E-A-T signals",
		},
		{
			id: "meta-descriptions",
			name: "Meta Descriptions",
			score: 7,
			maxScore: 10,
			weight: "medium",
			status: "pass",
			hint: "Meta descriptions are optimal",
		},
		{
			id: "sitemap",
			name: "Sitemap Presence",
			score: 8,
			maxScore: 10,
			weight: "low",
			status: "pass",
			hint: "Sitemap is up to date",
		},
		{
			id: "https-redirects",
			name: "HTTPS & Redirects",
			score: 10,
			maxScore: 10,
			weight: "low",
			status: "pass",
			hint: "HTTPS and canonical URLs configured",
		},
		{
			id: "page-freshness",
			name: "Page Freshness",
			score: 6,
			maxScore: 10,
			weight: "low",
			status: "warn",
			hint: "Add publication dates",
		},
		{
			id: "citation-anchors",
			name: "Citation Anchors",
			score: 6,
			maxScore: 10,
			weight: "medium",
			status: "warn",
			hint: "Add id attributes to headings",
		},
	],
	files: [
		{ name: "llms.txt", content: "# Example\n> Description" },
		{ name: "schema.json", content: '{"@context":"https://schema.org"}' },
	],
	pages: [],
	meta: {
		url: "https://example.com",
		robotsTxt: { raw: null, crawlerAccess: {}, crawlDelay: null },
		sitemapXml: null,
		existingLlmsTxt: null,
		platform: null,
		responseTimeMs: 200,
	},
	pagesScanned: 5,
	duration: 3200,
	scannedAt: "2026-03-14T00:00:00.000Z",
};

describe("scan command", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;
	let tmpDir: string;

	beforeEach(async () => {
		const { scan } = await import("@aeorank/core");
		(scan as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as never);

		tmpDir = join(tmpdir(), `aeorank-test-${Date.now()}`);
		mkdirSync(tmpDir, { recursive: true });
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (existsSync(tmpDir)) {
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});

	it("produces score output in human format", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "output");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--output", outputDir]);

		const allOutput = logSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allOutput).toContain("65/100");
		expect(allOutput).toContain("C");
	});

	it("outputs valid JSON in json format", async () => {
		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync([
			"node",
			"scan",
			"https://example.com",
			"--format",
			"json",
			"--no-files",
		]);

		// Find the JSON output call (the one with the full result)
		const jsonCall = logSpy.mock.calls.find((c) => {
			try {
				const parsed = JSON.parse(String(c[0]));
				return parsed.score !== undefined;
			} catch {
				return false;
			}
		});

		expect(jsonCall).toBeTruthy();
		const parsed = JSON.parse(String(jsonCall?.[0]));
		expect(parsed.score).toBe(65);
		expect(parsed.grade).toBe("C");
		expect(parsed.dimensions).toHaveLength(12);
		expect(parsed.files).toHaveLength(2);
	});

	it("exits with error for invalid URL", async () => {
		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync(["node", "scan", "not-a-url", "--no-files"]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allErrors = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allErrors).toContain("not a valid URL");
	});

	it("writes files to output directory", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "files-output");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--output", outputDir]);

		expect(existsSync(join(outputDir, "llms.txt"))).toBe(true);
		expect(existsSync(join(outputDir, "schema.json"))).toBe(true);
	});

	it("skips file writing with --no-files", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "no-files-output");

		await scanCommand.parseAsync([
			"node",
			"scan",
			"https://example.com",
			"--output",
			outputDir,
			"--no-files",
		]);

		expect(existsSync(outputDir)).toBe(false);
	});

	it("errors when output files exist without --overwrite", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "existing-output");
		mkdirSync(outputDir, { recursive: true });
		writeFileSync(join(outputDir, "existing.txt"), "data");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--output", outputDir]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allErrors = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allErrors).toContain("already exist");
	});

	it("handles scan errors with actionable message", async () => {
		const { scan } = await import("@aeorank/core");
		(scan as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fetch failed"));

		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--no-files"]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allErrors = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allErrors).toContain("Could not reach");
	});
});
