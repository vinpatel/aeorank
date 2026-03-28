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
