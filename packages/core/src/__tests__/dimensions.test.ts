import { describe, expect, it } from "vitest";
import {
	scoreAiCrawlerAccess,
	scoreCitationAnchors,
	scoreContentStructure,
	scoreEeatSignals,
	scoreFaqSpeakable,
	scoreLlmsTxt,
	scoreMetaDescriptions,
	scoreSchemaMarkup,
} from "../scorer/dimensions.js";
import type { ScanMeta, ScannedPage } from "../types.js";

function makePage(overrides: Partial<ScannedPage> = {}): ScannedPage {
	return {
		url: "https://example.com",
		title: "Test Page",
		metaDescription: "A test page for scoring",
		headings: [],
		bodyText: "This is test content for the page.",
		schemaOrg: [],
		links: [],
		canonical: null,
		robotsMeta: null,
		language: "en",
		wordCount: 100,
		hasDatePublished: false,
		authorName: null,
		paragraphs: [],
		sentences: [],
		contentHash: "00000000",
		...overrides,
	};
}

function makeMeta(overrides: Partial<ScanMeta> = {}): ScanMeta {
	return {
		url: "https://example.com",
		robotsTxt: {
			raw: null,
			crawlerAccess: {},
			crawlDelay: null,
		},
		sitemapXml: null,
		existingLlmsTxt: null,
		platform: null,
		responseTimeMs: 100,
		...overrides,
	};
}

describe("scoreLlmsTxt", () => {
	it("returns 0 when no llms.txt", () => {
		const result = scoreLlmsTxt([], makeMeta());
		expect(result.score).toBe(0);
		expect(result.status).toBe("fail");
	});

	it("returns 3 for minimal llms.txt", () => {
		const result = scoreLlmsTxt([], makeMeta({ existingLlmsTxt: "Some content here" }));
		expect(result.score).toBe(3);
	});

	it("returns 6 for llms.txt with H1 + blockquote + 1 section", () => {
		const txt = "# My Site\n> A great site\n## Section One\n- [Page](url)";
		const result = scoreLlmsTxt([], makeMeta({ existingLlmsTxt: txt }));
		expect(result.score).toBe(6);
	});

	it("returns 10 for well-structured llms.txt", () => {
		const txt =
			"# My Site\n> A great site\n## Section One\n- [Page](url)\n## Section Two\n- [Page2](url2)\n## Section Three\n- [Page3](url3)";
		const result = scoreLlmsTxt([], makeMeta({ existingLlmsTxt: txt }));
		expect(result.score).toBe(10);
	});
});

describe("scoreSchemaMarkup", () => {
	it("returns 0 when no schema", () => {
		const result = scoreSchemaMarkup([makePage()], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 4 for 1-2 types", () => {
		const page = makePage({
			schemaOrg: [{ "@type": "Organization", name: "Test" }],
		});
		const result = scoreSchemaMarkup([page], makeMeta());
		expect(result.score).toBe(4);
	});

	it("returns 7 for 3-4 types", () => {
		const page = makePage({
			schemaOrg: [
				{ "@type": "Organization", name: "Test" },
				{ "@type": "WebSite", name: "Test" },
				{ "@type": "FAQPage", mainEntity: [] },
			],
		});
		const result = scoreSchemaMarkup([page], makeMeta());
		expect(result.score).toBe(7);
	});

	it("returns 10 for 5+ types", () => {
		const page = makePage({
			schemaOrg: [
				{ "@type": "Organization" },
				{ "@type": "WebSite" },
				{ "@type": "FAQPage" },
				{ "@type": "Article" },
				{ "@type": "BreadcrumbList" },
			],
		});
		const result = scoreSchemaMarkup([page], makeMeta());
		expect(result.score).toBe(10);
	});
});

describe("scoreAiCrawlerAccess", () => {
	it("returns 0 when no crawlers allowed", () => {
		const result = scoreAiCrawlerAccess([], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 4 for 1-2 crawlers allowed", () => {
		const meta = makeMeta({
			robotsTxt: {
				raw: "...",
				crawlerAccess: { GPTBot: "allowed", ClaudeBot: "allowed" },
				crawlDelay: null,
			},
		});
		const result = scoreAiCrawlerAccess([], meta);
		expect(result.score).toBe(4);
	});

	it("returns 10 for all 5 crawlers allowed", () => {
		const meta = makeMeta({
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
		});
		const result = scoreAiCrawlerAccess([], meta);
		expect(result.score).toBe(10);
	});
});

describe("scoreContentStructure", () => {
	it("returns 0 for empty pages", () => {
		const result = scoreContentStructure([], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 10 for pages with proper hierarchy", () => {
		const pages = Array.from({ length: 5 }, (_, i) =>
			makePage({
				url: `https://example.com/page-${i}`,
				headings: [
					{ level: 1, text: "Title", id: null },
					{ level: 2, text: "Section", id: "section" },
					{ level: 3, text: "Subsection", id: null },
				],
			}),
		);
		const result = scoreContentStructure(pages, makeMeta());
		expect(result.score).toBe(10);
	});

	it("returns low score when no H1 on pages", () => {
		const pages = [
			makePage({
				headings: [{ level: 2, text: "Section", id: null }],
			}),
		];
		const result = scoreContentStructure(pages, makeMeta());
		expect(result.score).toBeLessThanOrEqual(3);
	});
});

describe("scoreFaqSpeakable", () => {
	it("returns 0 when no FAQ content", () => {
		const result = scoreFaqSpeakable([makePage()], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 3 for FAQ headings without schema", () => {
		const page = makePage({
			headings: [{ level: 2, text: "What is AEO?", id: null }],
		});
		const result = scoreFaqSpeakable([page], makeMeta());
		expect(result.score).toBe(3);
	});

	it("returns 10 for FAQPage schema with 3+ Q&As", () => {
		const page = makePage({
			schemaOrg: [
				{
					"@type": "FAQPage",
					mainEntity: [
						{ "@type": "Question", name: "Q1" },
						{ "@type": "Question", name: "Q2" },
						{ "@type": "Question", name: "Q3" },
					],
				},
			],
		});
		const result = scoreFaqSpeakable([page], makeMeta());
		expect(result.score).toBe(10);
	});
});

describe("scoreEeatSignals", () => {
	it("returns 0 when no signals", () => {
		const result = scoreEeatSignals([makePage()], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 10 with author + dates + about page", () => {
		const pages = [
			makePage({ authorName: "Jane", hasDatePublished: true }),
			makePage({ url: "https://example.com/about" }),
		];
		const result = scoreEeatSignals(pages, makeMeta());
		expect(result.score).toBe(10);
	});
});

describe("scoreMetaDescriptions", () => {
	it("returns 0 when no meta descriptions", () => {
		const result = scoreMetaDescriptions([makePage({ metaDescription: "" })], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 10 when all pages have optimal-length meta", () => {
		const pages = Array.from({ length: 5 }, (_, i) =>
			makePage({
				url: `https://example.com/page-${i}`,
				metaDescription: "A well-crafted meta description that provides context.",
			}),
		);
		const result = scoreMetaDescriptions(pages, makeMeta());
		expect(result.score).toBe(10);
	});
});

describe("scoreCitationAnchors", () => {
	it("returns 0 when no headings have IDs", () => {
		const page = makePage({
			headings: [
				{ level: 2, text: "Section", id: null },
				{ level: 3, text: "Sub", id: null },
			],
		});
		const result = scoreCitationAnchors([page], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 10 when >60% H2/H3 have IDs", () => {
		const page = makePage({
			headings: [
				{ level: 2, text: "A", id: "a" },
				{ level: 2, text: "B", id: "b" },
				{ level: 3, text: "C", id: "c" },
				{ level: 3, text: "D", id: null },
			],
		});
		const result = scoreCitationAnchors([page], makeMeta());
		expect(result.score).toBe(10);
	});
});
