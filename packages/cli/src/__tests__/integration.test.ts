import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// Mock ora
vi.mock("ora", () => ({
	default: () => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
		succeed: vi.fn().mockReturnThis(),
		fail: vi.fn().mockReturnThis(),
		text: "",
	}),
}));

// Strip ANSI color codes
function stripAnsi(str: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI stripping requires control chars
	return str.replace(/\x1b\[[0-9;]*m/g, "");
}

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
			hint: "Comprehensive schema.org markup present",
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
			hint: "Add FAQPage schema markup with 3+ Q&A pairs",
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
			hint: "Add publication and last-modified dates",
		},
		{
			id: "citation-anchors",
			name: "Citation Anchors",
			score: 6,
			maxScore: 10,
			weight: "medium",
			status: "warn",
			hint: "Add id attributes to H2 and H3 headings",
		},
	],
	files: [
		{
			name: "llms.txt",
			content: "# Example\n> An example site\n\n## Pages\n- [Home](https://example.com)",
		},
		{ name: "llms-full.txt", content: "Full text content..." },
		{ name: "CLAUDE.md", content: "# Example\nTech stack: HTML" },
		{ name: "schema.json", content: '{"@context":"https://schema.org","@type":"Organization"}' },
		{ name: "robots-patch.txt", content: "User-agent: GPTBot\nAllow: /" },
		{ name: "faq-blocks.html", content: '<script type="application/ld+json">{}</script>' },
		{ name: "citation-anchors.html", content: '<h2 id="about">About</h2>' },
		{ name: "sitemap-ai.xml", content: '<?xml version="1.0"?><urlset></urlset>' },
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

describe("CLI Integration Tests", () => {
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

		tmpDir = join(tmpdir(), `aeorank-integration-${Date.now()}`);
		mkdirSync(tmpDir, { recursive: true });
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (existsSync(tmpDir)) {
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});

	// CLI-01: Colored terminal output with spinner, score, dimension table, and next steps
	it("CLI-01: scan produces score, dimension table, and next steps", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "cli01");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--output", outputDir]);

		const allOutput = logSpy.mock.calls.map((c) => stripAnsi(String(c[0]))).join("\n");

		// Score displayed
		expect(allOutput).toContain("65/100");
		expect(allOutput).toContain("C");
		expect(allOutput).toContain("AEO Score");

		// Dimension table present
		expect(allOutput).toContain("Dimensions");
		expect(allOutput).toContain("llms.txt Presence");
		expect(allOutput).toContain("Schema.org Markup");
		expect(allOutput).toContain("AI Crawler Access");

		// Next steps present
		expect(allOutput).toContain("Next Steps");
	});

	// CLI-02: JSON output via --format json
	it("CLI-02: --format json outputs valid JSON to stdout", async () => {
		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync([
			"node",
			"scan",
			"https://example.com",
			"--format",
			"json",
			"--no-files",
		]);

		// Find the JSON result in log calls
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
		expect(parsed.files).toHaveLength(8);
		expect(parsed.url).toBe("https://example.com");

		// Verify no ANSI codes in JSON output
		const raw = String(jsonCall?.[0]);
		// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI detection
		expect(raw).not.toMatch(/\x1b\[/);
	});

	// CLI-03: init creates config, scan reads it
	it("CLI-03: init creates config file", async () => {
		const origCwd = process.cwd;
		process.cwd = () => tmpDir;

		const { initCommand } = await import("../commands/init.js");
		await initCommand.parseAsync(["node", "init"]);

		process.cwd = origCwd;

		const configPath = join(tmpDir, "aeorank.config.js");
		expect(existsSync(configPath)).toBe(true);

		const content = readFileSync(configPath, "utf-8");
		expect(content).toContain("export default");
		expect(content).toContain("url:");
		expect(content).toContain("maxPages");
	});

	// CLI-04: Every error includes actionable suggestion
	it("CLI-04: invalid URL error includes actionable suggestion", async () => {
		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync(["node", "scan", "not-a-url", "--no-files"]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allErrors = errorSpy.mock.calls.map((c) => stripAnsi(String(c[0]))).join("\n");
		expect(allErrors).toContain("not a valid URL");
	});

	it("CLI-04: network error includes actionable suggestion", async () => {
		const { scan } = await import("@aeorank/core");
		(scan as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fetch failed"));

		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--no-files"]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allErrors = errorSpy.mock.calls.map((c) => stripAnsi(String(c[0]))).join("\n");
		const allSuggestions = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allErrors + allSuggestions).toContain("Check the URL");
	});

	it("CLI-04: timeout error suggests --max-pages", async () => {
		const { scan } = await import("@aeorank/core");
		(scan as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Scan timed out after 30s"));

		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--no-files"]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allOutput = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allOutput).toContain("--max-pages");
	});

	// CLI-05: Fix recommendations ranked High/Medium/Low
	it("CLI-05: dimension output includes priority labels", async () => {
		const { scanCommand } = await import("../commands/scan.js");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--no-files"]);

		const allOutput = logSpy.mock.calls.map((c) => stripAnsi(String(c[0]))).join("\n");

		// Next steps should have priority labels
		expect(allOutput).toContain("[HIGH]");

		// Dimension table should have weight labels
		expect(allOutput).toContain("[HIGH]");
		expect(allOutput).toContain("[MEDIUM]");
		expect(allOutput).toContain("[LOW]");
	});

	// File writing integration
	it("writes all generated files to output directory", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "file-output");

		await scanCommand.parseAsync(["node", "scan", "https://example.com", "--output", outputDir]);

		expect(existsSync(join(outputDir, "llms.txt"))).toBe(true);
		expect(existsSync(join(outputDir, "schema.json"))).toBe(true);
		expect(existsSync(join(outputDir, "CLAUDE.md"))).toBe(true);
		expect(existsSync(join(outputDir, "robots-patch.txt"))).toBe(true);
		expect(existsSync(join(outputDir, "sitemap-ai.xml"))).toBe(true);
	});

	it("--no-files prevents file writing", async () => {
		const { scanCommand } = await import("../commands/scan.js");
		const outputDir = join(tmpDir, "no-files");

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
});
