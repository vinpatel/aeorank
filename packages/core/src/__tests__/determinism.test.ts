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

// Enhanced sample page HTML that includes structured data for new dimensions
const enhancedPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>AEO Optimization Guide</title>
  <meta name="description" content="Comprehensive guide to AEO optimization.">
</head>
<body>
  <h1>AEO Optimization Guide</h1>
  <p>AEO optimization is a platform for improving AI visibility. AEO optimization helps businesses achieve better results.</p>
  <h2>What is AEO?</h2>
  <p>AEO is defined as the practice of optimizing content for AI answer extraction.</p>
  <h2>How does optimization work?</h2>
  <p>Optimization refers to the process of making content more accessible to AI systems.</p>
  <table>
    <tr><th>Dimension</th><th>Score</th></tr>
    <tr><td>Content</td><td>8</td></tr>
  </table>
  <ul>
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
  </ul>
  <p>AEO optimization scores are calculated across 25 dimensions.</p>
  <p>The AEO optimization framework provides comprehensive analysis.</p>
</body>
</html>`;

const defaultResponses: Record<string, Partial<FetchResult>> = {
	"https://example.com/robots.txt": { html: robotsTxtContent },
	"https://example.com/llms.txt": { status: 404 },
	"https://example.com/sitemap.xml": { html: sitemapXml },
	"https://example.com": { html: enhancedPageHtml },
	"https://example.com/about": { html: enhancedPageHtml },
	"https://example.com/blog": { html: enhancedPageHtml },
	"https://example.com/blog/aeo-guide": { html: enhancedPageHtml },
	"https://example.com/pricing": { html: enhancedPageHtml },
};

describe("determinism", () => {
	it("10 identical scan runs produce the same score and dimensions", async () => {
		const runs = 10;
		const results = [];

		for (let i = 0; i < runs; i++) {
			const result = await scan(
				"https://example.com",
				{ maxPages: 3 },
				createMockFetcher(defaultResponses),
			);
			results.push(result);
		}

		const firstScore = results[0].score;
		const firstGrade = results[0].grade;
		const firstDimensions = results[0].dimensions.map((d) => ({
			id: d.id,
			score: d.score,
			maxScore: d.maxScore,
			status: d.status,
		}));

		// All 25 dimensions should be present
		expect(results[0].dimensions).toHaveLength(25);

		// All new dimensions should appear in results
		const newDimIds = [
			"topic-coherence",
			"original-data",
			"fact-density",
			"duplicate-content",
			"cross-page-duplication",
			"evidence-packaging",
			"citation-ready-writing",
			"qa-format",
			"direct-answer-density",
			"query-answer-alignment",
			"tables-lists",
			"definition-patterns",
			"entity-disambiguation",
		];
		for (const id of newDimIds) {
			const dim = results[0].dimensions.find((d) => d.id === id);
			expect(dim, `dimension ${id} should be present`).toBeDefined();
		}

		for (let i = 1; i < runs; i++) {
			expect(results[i].score).toBe(firstScore);
			expect(results[i].grade).toBe(firstGrade);

			const dims = results[i].dimensions.map((d) => ({
				id: d.id,
				score: d.score,
				maxScore: d.maxScore,
				status: d.status,
			}));
			expect(dims).toEqual(firstDimensions);

			// Verify each new dimension produces identical score across runs
			for (const id of newDimIds) {
				const dim1 = results[0].dimensions.find((d) => d.id === id)!;
				const dimI = results[i].dimensions.find((d) => d.id === id)!;
				expect(dimI.score).toBe(dim1.score);
			}
		}
	});

	it("10 identical scan runs produce the same file contents", async () => {
		const runs = 10;
		const results = [];

		for (let i = 0; i < runs; i++) {
			const result = await scan(
				"https://example.com",
				{ maxPages: 3 },
				createMockFetcher(defaultResponses),
			);
			results.push(result);
		}

		const firstFiles = results[0].files.map((f) => ({
			name: f.name,
			content: f.content,
		}));

		for (let i = 1; i < runs; i++) {
			const files = results[i].files.map((f) => ({
				name: f.name,
				content: f.content,
			}));
			expect(files).toEqual(firstFiles);
		}
	});

	it("produces same number of pages across runs", async () => {
		const runs = 5;
		const results = [];

		for (let i = 0; i < runs; i++) {
			const result = await scan(
				"https://example.com",
				{ maxPages: 5 },
				createMockFetcher(defaultResponses),
			);
			results.push(result);
		}

		const firstPageCount = results[0].pagesScanned;
		for (let i = 1; i < runs; i++) {
			expect(results[i].pagesScanned).toBe(firstPageCount);
		}
	});
});
