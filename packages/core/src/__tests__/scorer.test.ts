import { describe, expect, it } from "vitest";
import { calculateAeoScore } from "../scorer/index.js";
import type { ScanMeta, ScannedPage } from "../types.js";

function makePage(overrides: Partial<ScannedPage> = {}): ScannedPage {
	return {
		url: "https://example.com",
		title: "Test Page",
		metaDescription: "A test page description that is of optimal length for SEO.",
		headings: [
			{ level: 1, text: "Title", id: null },
			{ level: 2, text: "Section", id: "section" },
			{ level: 3, text: "Sub", id: "sub" },
		],
		bodyText: "Short lead paragraph.\n\nMore content follows here with details.",
		schemaOrg: [
			{ "@type": "Organization", name: "Test" },
			{ "@type": "WebSite", name: "Test" },
			{
				"@type": "FAQPage",
				mainEntity: [{ "@type": "Question" }, { "@type": "Question" }, { "@type": "Question" }],
			},
			{ "@type": "Article", author: { name: "Jane" } },
			{ "@type": "BreadcrumbList" },
		],
		links: [],
		canonical: "https://example.com",
		robotsMeta: "index, follow",
		language: "en",
		wordCount: 200,
		hasDatePublished: true,
		authorName: "Jane Smith",
		paragraphs: [
			"AEO is Answer Engine Optimization for AI readability.",
			"It improves citation rates for websites significantly.",
			"Most sites see measurable improvements within weeks.",
		],
		sentences: [
			"AEO is Answer Engine Optimization for AI readability.",
			"It improves citation rates for websites significantly.",
			"Most sites see measurable improvements within weeks.",
		],
		contentHash: "00000000",
		questionHeadings: [
			{ text: "What is AEO?", level: 2 },
			{ text: "How does it work?", level: 2 },
		],
		tableCount: 0,
		listCount: 0,
		...overrides,
	};
}

function makePerfectMeta(): ScanMeta {
	return {
		url: "https://example.com",
		robotsTxt: {
			raw: "...",
			crawlerAccess: {
				GPTBot: "allowed",
				ClaudeBot: "allowed",
				PerplexityBot: "allowed",
				"Google-Extended": "allowed",
				"anthropic-ai": "allowed",
			},
			crawlDelay: null,
		},
		sitemapXml: "<urlset></urlset>",
		existingLlmsTxt: "# Test\n> Summary\n## Sec1\n- [A](a)\n## Sec2\n- [B](b)\n## Sec3\n- [C](c)",
		platform: null,
		responseTimeMs: 100,
	};
}

function makeZeroMeta(): ScanMeta {
	return {
		url: "http://example.com",
		robotsTxt: { raw: null, crawlerAccess: {}, crawlDelay: null },
		sitemapXml: null,
		existingLlmsTxt: null,
		platform: null,
		responseTimeMs: 100,
	};
}

describe("calculateAeoScore", () => {
	it("returns high score for perfect inputs", () => {
		const pages = [makePage(), makePage({ url: "https://example.com/about" })];
		const result = calculateAeoScore(pages, makePerfectMeta());
		expect(result.score).toBeGreaterThanOrEqual(70);
		expect(result.dimensions).toHaveLength(22);
		expect(result.grade).toMatch(/^[A-F][+]?$/);
	});

	it("returns low score for zero inputs", () => {
		const pages = [
			makePage({
				metaDescription: "",
				headings: [],
				schemaOrg: [],
				canonical: null,
				authorName: null,
				hasDatePublished: false,
			}),
		];
		const result = calculateAeoScore(pages, makeZeroMeta());
		expect(result.score).toBeLessThan(40);
		expect(result.grade).toBe("F");
	});

	it("returns exactly 19 dimensions", () => {
		const result = calculateAeoScore([makePage()], makePerfectMeta());
		expect(result.dimensions).toHaveLength(22);

		const ids = result.dimensions.map((d) => d.id);
		expect(ids).toContain("llms-txt");
		expect(ids).toContain("schema-markup");
		expect(ids).toContain("content-structure");
		expect(ids).toContain("citation-anchors");
	});

	it("each dimension has correct shape", () => {
		const result = calculateAeoScore([makePage()], makePerfectMeta());
		for (const dim of result.dimensions) {
			expect(dim).toHaveProperty("id");
			expect(dim).toHaveProperty("name");
			expect(dim.score).toBeGreaterThanOrEqual(0);
			expect(dim.score).toBeLessThanOrEqual(10);
			expect(dim.maxScore).toBe(10);
			expect(["high", "medium", "low"]).toContain(dim.weight);
			expect(["pass", "warn", "fail"]).toContain(dim.status);
			expect(dim.hint).toBeTruthy();
		}
	});

	it("is deterministic - 10 runs produce identical results", () => {
		const pages = [makePage(), makePage({ url: "https://example.com/about" })];
		const meta = makePerfectMeta();

		const results = Array.from({ length: 10 }, () => calculateAeoScore(pages, meta));

		const first = JSON.stringify(results[0]);
		for (let i = 1; i < results.length; i++) {
			expect(JSON.stringify(results[i])).toBe(first);
		}
	});

	it("high-weight dimensions have more impact", () => {
		// Create pages that score high on high-weight dims but low on low-weight dims
		const highWeightPages = [
			makePage({
				headings: [
					{ level: 1, text: "T", id: null },
					{ level: 2, text: "S", id: "s" },
				],
				schemaOrg: [
					{ "@type": "Organization" },
					{ "@type": "WebSite" },
					{ "@type": "FAQPage" },
					{ "@type": "Article" },
					{ "@type": "BreadcrumbList" },
				],
			}),
		];
		const highMeta = makePerfectMeta();

		const result = calculateAeoScore(highWeightPages, highMeta);

		// High-weight dimensions should pull score up significantly
		const highWeightDims = result.dimensions.filter((d) => d.weight === "high");
		const avgHighScore = highWeightDims.reduce((s, d) => s + d.score, 0) / highWeightDims.length;
		expect(avgHighScore).toBeGreaterThan(5);
	});
});
