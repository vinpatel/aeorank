import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scan } from "../index.js";
import type { FetchResult } from "../scanner/fetcher.js";

const fixturesDir = join(import.meta.dirname, "fixtures");
const sampleHtml = readFileSync(join(fixturesDir, "sample-page.html"), "utf-8");
const robotsTxtContent = readFileSync(join(fixturesDir, "robots.txt"), "utf-8");
const sitemapXml = readFileSync(join(fixturesDir, "sitemap.xml"), "utf-8");

function createMockFetcher(responses: Record<string, Partial<FetchResult>>) {
	return async (url: string): Promise<FetchResult> => {
		const resp = responses[url];
		if (resp) {
			return {
				html: resp.html ?? "",
				status: resp.status ?? 200,
				headers: resp.headers ?? {},
				responseTimeMs: resp.responseTimeMs ?? 50,
			};
		}
		return { html: "", status: 404, headers: {}, responseTimeMs: 10 };
	};
}

const defaultResponses: Record<string, Partial<FetchResult>> = {
	"https://example.com/robots.txt": { html: robotsTxtContent },
	"https://example.com/llms.txt": { status: 404 },
	"https://example.com/sitemap.xml": { html: sitemapXml },
	"https://example.com": { html: sampleHtml },
	"https://example.com/about": { html: sampleHtml },
	"https://example.com/blog": { html: sampleHtml },
	"https://example.com/blog/aeo-guide": { html: sampleHtml },
	"https://example.com/pricing": { html: sampleHtml },
};

describe("scan() full pipeline", () => {
	it("returns a complete ScanResult", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 5 },
			createMockFetcher(defaultResponses),
		);

		expect(result.url).toBe("https://example.com");
		expect(result.score).toBeGreaterThanOrEqual(0);
		expect(result.score).toBeLessThanOrEqual(100);
		expect(result.grade).toMatch(/^(A\+|A|B|C|D|F)$/);
		expect(result.pagesScanned).toBeGreaterThan(0);
		expect(result.duration).toBeGreaterThanOrEqual(0);
		expect(result.scannedAt).toBeTruthy();
	});

	it("produces exactly 32 dimensions", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 3 },
			createMockFetcher(defaultResponses),
		);

		expect(result.dimensions).toHaveLength(32);
		for (const dim of result.dimensions) {
			expect(dim.score).toBeGreaterThanOrEqual(0);
			expect(dim.score).toBeLessThanOrEqual(dim.maxScore);
			expect(["pass", "warn", "fail"]).toContain(dim.status);
		}
	});

	it("generates exactly 8 files", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 3 },
			createMockFetcher(defaultResponses),
		);

		expect(result.files).toHaveLength(8);
		const names = result.files.map((f) => f.name);
		expect(names).toEqual([
			"llms.txt",
			"llms-full.txt",
			"CLAUDE.md",
			"schema.json",
			"robots-patch.txt",
			"faq-blocks.html",
			"citation-anchors.html",
			"sitemap-ai.xml",
		]);

		for (const file of result.files) {
			expect(file.content.length).toBeGreaterThan(0);
		}
	});

	it("extracts site name from schema.org Organization", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 1 },
			createMockFetcher(defaultResponses),
		);

		// The sample page has Organization with name "AEOrank"
		expect(result.siteName).toBe("AEOrank");
	});

	it("extracts site description from meta description", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 1 },
			createMockFetcher(defaultResponses),
		);

		expect(result.siteDescription).toContain("Scan any website");
	});

	it("includes pages array with parsed page data", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 2 },
			createMockFetcher(defaultResponses),
		);

		expect(result.pages.length).toBeGreaterThan(0);
		for (const page of result.pages) {
			expect(page.url).toBeTruthy();
			expect(page.title).toBeTruthy();
			expect(page.headings.length).toBeGreaterThan(0);
			expect(page.wordCount).toBeGreaterThan(0);
		}
	});

	it("includes meta with robots and sitemap info", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 1 },
			createMockFetcher(defaultResponses),
		);

		expect(result.meta.url).toBe("https://example.com");
		expect(result.meta.robotsTxt.crawlerAccess.GPTBot).toBe("allowed");
		expect(result.meta.robotsTxt.crawlerAccess.PerplexityBot).toBe("disallowed");
	});

	it("handles single-page scan", async () => {
		const minimalResponses: Record<string, Partial<FetchResult>> = {
			"https://single.com/robots.txt": { status: 404 },
			"https://single.com/llms.txt": { status: 404 },
			"https://single.com/sitemap.xml": { status: 404 },
			"https://single.com": { html: sampleHtml },
		};

		const result = await scan(
			"https://single.com",
			{ maxPages: 1 },
			createMockFetcher(minimalResponses),
		);

		expect(result.pagesScanned).toBe(1);
		expect(result.score).toBeGreaterThanOrEqual(0);
		expect(result.files).toHaveLength(8);
	});

	it("works when robots.txt and sitemap are missing", async () => {
		const minimalResponses: Record<string, Partial<FetchResult>> = {
			"https://bare.com/robots.txt": { status: 404 },
			"https://bare.com/llms.txt": { status: 404 },
			"https://bare.com/sitemap.xml": { status: 404 },
			"https://bare.com": { html: sampleHtml },
		};

		const result = await scan(
			"https://bare.com",
			{ maxPages: 1 },
			createMockFetcher(minimalResponses),
		);

		expect(result.pagesScanned).toBe(1);
		expect(result.score).toBeGreaterThanOrEqual(0);
		expect(result.files).toHaveLength(8);
		expect(result.meta.robotsTxt.raw).toBeNull();
	});

	it("schema.json output is valid JSON", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 2 },
			createMockFetcher(defaultResponses),
		);

		const schemaFile = result.files.find((f) => f.name === "schema.json");
		expect(schemaFile).toBeDefined();
		const parsed = JSON.parse(schemaFile?.content);
		expect(parsed["@context"]).toBe("https://schema.org");
	});

	it("sitemap-ai.xml contains scanned page URLs", async () => {
		const result = await scan(
			"https://example.com",
			{ maxPages: 3 },
			createMockFetcher(defaultResponses),
		);

		const sitemapFile = result.files.find((f) => f.name === "sitemap-ai.xml");
		expect(sitemapFile).toBeDefined();
		expect(sitemapFile?.content).toContain("https://example.com");
	});
});
