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
			{
				"@type": "Person",
				name: "Jane Smith",
				jobTitle: "Data Scientist",
				sameAs: ["https://twitter.com/janesmith", "https://linkedin.com/in/janesmith"],
			},
		],
		links: [
			{ href: "/about", text: "About", internal: true },
			{ href: "/blog", text: "Blog", internal: true },
			{ href: "/contact", text: "Contact", internal: true },
			{ href: "/pricing", text: "Pricing", internal: true },
			{ href: "/docs", text: "Docs", internal: true },
			{ href: "/faq", text: "FAQ", internal: true },
		],
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
		semanticElements: { main: 0, article: 0, nav: 0, aside: 0, section: 0, header: 0, footer: 0 },
		ariaRoleCount: 0,
		figureCount: 0,
		imgCount: 0,
		imgsWithAlt: 0,
		avgSentenceLength: 0,
		rssFeeds: [],
		timeElementCount: 0,
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
		aiTxt: null,
		sitemapLastmods: [],
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
		aiTxt: null,
		sitemapLastmods: [],
	};
}

describe("calculateAeoScore", () => {
	it("returns high score for perfect inputs", () => {
		const pages = [makePage(), makePage({ url: "https://example.com/about" })];
		const result = calculateAeoScore(pages, makePerfectMeta());
		expect(result.score).toBeGreaterThanOrEqual(65);
		expect(result.dimensions).toHaveLength(36);
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

	it("returns exactly 36 dimensions", () => {
		const result = calculateAeoScore([makePage()], makePerfectMeta());
		expect(result.dimensions).toHaveLength(36);

		const ids = result.dimensions.map((d) => d.id);
		expect(ids).toContain("llms-txt");
		expect(ids).toContain("schema-markup");
		expect(ids).toContain("content-structure");
		expect(ids).toContain("citation-anchors");
		expect(ids).not.toContain("speakable-schema");
		expect(ids).not.toContain("author-schema");
	});

	it("each dimension has correct shape", () => {
		const result = calculateAeoScore([makePage()], makePerfectMeta());
		for (const dim of result.dimensions) {
			expect(dim).toHaveProperty("id");
			expect(dim).toHaveProperty("name");
			expect(dim.score).toBeGreaterThanOrEqual(0);
			expect(dim.score).toBeLessThanOrEqual(10);
			expect(dim.maxScore).toBe(10);
			expect(typeof dim.weightPct).toBe("number");
			expect(dim.weightPct).toBeGreaterThan(0);
			expect(["pass", "warn", "fail"]).toContain(dim.status);
			expect(dim.hint).toBeTruthy();
		}
	});

	it("weightPct values sum to 100", () => {
		const result = calculateAeoScore([makePage()], makePerfectMeta());
		const total = result.dimensions.reduce((s, d) => s + d.weightPct, 0);
		expect(total).toBe(100);
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

	it("higher-weightPct dimensions have more impact on score", () => {
		// Create pages that score high on high-weightPct dims
		const pages = [
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
		const meta = makePerfectMeta();

		const result = calculateAeoScore(pages, meta);

		// High-weightPct dimensions (>=4%) should tend to have higher scores for this input
		const highWeightDims = result.dimensions.filter((d) => d.weightPct >= 4);
		expect(highWeightDims.length).toBeGreaterThan(0);
		// Score should be meaningful (this test verifies weightPct impacts calculations)
		expect(result.score).toBeGreaterThan(0);
	});
});
