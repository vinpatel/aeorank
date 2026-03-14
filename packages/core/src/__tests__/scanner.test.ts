import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { discoverUrls } from "../scanner/discovery.js";
import type { FetchResult } from "../scanner/fetcher.js";
import { scanUrl } from "../scanner/index.js";

const fixturesDir = join(import.meta.dirname, "fixtures");
const sampleHtml = readFileSync(join(fixturesDir, "sample-page.html"), "utf-8");
const robotsTxtContent = readFileSync(join(fixturesDir, "robots.txt"), "utf-8");
const sitemapXml = readFileSync(join(fixturesDir, "sitemap.xml"), "utf-8");

function createMockFetcher(responses: Record<string, Partial<FetchResult>>) {
	return vi.fn(async (url: string): Promise<FetchResult> => {
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
	});
}

describe("scanUrl", () => {
	it("returns a valid scan result with mocked fetcher", async () => {
		const mockFetcher = createMockFetcher({
			"https://example.com/robots.txt": { html: robotsTxtContent },
			"https://example.com/llms.txt": { status: 404 },
			"https://example.com/sitemap.xml": { html: sitemapXml },
			"https://example.com": { html: sampleHtml },
			"https://example.com/about": { html: sampleHtml },
			"https://example.com/blog": { html: sampleHtml },
			"https://example.com/blog/aeo-guide": { html: sampleHtml },
			"https://example.com/pricing": { html: sampleHtml },
		});

		const result = await scanUrl("https://example.com", { maxPages: 10 }, mockFetcher);

		expect(result.pages.length).toBeGreaterThan(0);
		expect(result.meta.url).toBe("https://example.com");
		expect(result.meta.robotsTxt.crawlerAccess.GPTBot).toBe("allowed");
		expect(result.meta.robotsTxt.crawlDelay).toBe(2);
	});

	it("handles fetch errors gracefully", async () => {
		const mockFetcher = createMockFetcher({
			"https://example.com/robots.txt": { status: 404 },
			"https://example.com/llms.txt": { status: 404 },
			"https://example.com/sitemap.xml": { status: 404 },
			"https://example.com": { html: sampleHtml },
		});

		const result = await scanUrl("https://example.com", { maxPages: 5 }, mockFetcher);
		expect(result.pages.length).toBeGreaterThanOrEqual(1);
		expect(result.meta.robotsTxt.raw).toBeNull();
	});

	it("respects maxPages limit", async () => {
		const mockFetcher = createMockFetcher({
			"https://example.com/robots.txt": { status: 404 },
			"https://example.com/llms.txt": { status: 404 },
			"https://example.com/sitemap.xml": { html: sitemapXml },
			"https://example.com": { html: sampleHtml },
			"https://example.com/about": { html: sampleHtml },
			"https://example.com/blog": { html: sampleHtml },
			"https://example.com/blog/aeo-guide": { html: sampleHtml },
			"https://example.com/pricing": { html: sampleHtml },
		});

		const result = await scanUrl("https://example.com", { maxPages: 2 }, mockFetcher);
		expect(result.pages.length).toBeLessThanOrEqual(2);
	});
});

describe("discoverUrls", () => {
	it("extracts URLs from sitemap", async () => {
		const mockFetcher = createMockFetcher({
			"https://example.com/sitemap.xml": { html: sitemapXml },
			"https://example.com": { html: sampleHtml },
		});

		const urls = await discoverUrls("https://example.com", mockFetcher, 10);
		expect(urls.length).toBeGreaterThan(1);
		expect(urls).toContain("https://example.com/about");
	});

	it("respects maxPages limit", async () => {
		const mockFetcher = createMockFetcher({
			"https://example.com/sitemap.xml": { html: sitemapXml },
			"https://example.com": { html: sampleHtml },
		});

		const urls = await discoverUrls("https://example.com", mockFetcher, 3);
		expect(urls.length).toBeLessThanOrEqual(3);
	});

	it("deduplicates URLs", async () => {
		const mockFetcher = createMockFetcher({
			"https://example.com/sitemap.xml": { html: sitemapXml },
			"https://example.com": { html: sampleHtml },
			"https://example.com/about": { html: sampleHtml },
		});

		const urls = await discoverUrls("https://example.com", mockFetcher, 20);
		const unique = new Set(urls);
		expect(urls.length).toBe(unique.size);
	});
});
