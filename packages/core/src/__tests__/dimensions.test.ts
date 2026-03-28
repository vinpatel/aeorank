import { describe, expect, it } from "vitest";
import {
	scoreAiCrawlerAccess,
	scoreCitationAnchors,
	scoreContentStructure,
	scoreDuplicateContent,
	scoreEeatSignals,
	scoreFactDensity,
	scoreFaqSpeakable,
	scoreLlmsTxt,
	scoreMetaDescriptions,
	scoreOriginalData,
	scoreSchemaMarkup,
	scoreTopicCoherence,
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

describe("scoreTopicCoherence", () => {
	it("returns 5 with hint when fewer than 2 pages", () => {
		const result = scoreTopicCoherence([makePage()], makeMeta());
		expect(result.score).toBe(5);
		expect(result.hint).toContain("Not enough pages");
	});

	it("returns 0 when no pages", () => {
		const result = scoreTopicCoherence([], makeMeta());
		expect(result.score).toBe(5);
	});

	it("returns high score for pages sharing common heading keywords", () => {
		const pages = [
			makePage({
				url: "https://example.com/page1",
				headings: [{ level: 1, text: "JavaScript Performance Optimization", id: null }],
				bodyText: "javascript performance optimization tips for web developers",
			}),
			makePage({
				url: "https://example.com/page2",
				headings: [{ level: 1, text: "JavaScript Best Practices", id: null }],
				bodyText: "javascript best practices for performance in web apps",
			}),
			makePage({
				url: "https://example.com/page3",
				headings: [{ level: 1, text: "Optimize JavaScript Performance", id: null }],
				bodyText: "how to optimize javascript performance in production",
			}),
		];
		const result = scoreTopicCoherence(pages, makeMeta());
		expect(result.score).toBeGreaterThanOrEqual(7);
	});

	it("returns low score for pages with unrelated headings", () => {
		const pages = [
			makePage({
				url: "https://example.com/page1",
				headings: [{ level: 1, text: "Cooking Recipes", id: null }],
				bodyText: "delicious cooking recipes for home chefs",
			}),
			makePage({
				url: "https://example.com/page2",
				headings: [{ level: 1, text: "Space Exploration Mission", id: null }],
				bodyText: "nasa space exploration missions to mars",
			}),
			makePage({
				url: "https://example.com/page3",
				headings: [{ level: 1, text: "Quantum Physics Theory", id: null }],
				bodyText: "quantum physics theory explained simply",
			}),
		];
		const result = scoreTopicCoherence(pages, makeMeta());
		expect(result.score).toBeLessThanOrEqual(4);
	});
});

describe("scoreOriginalData", () => {
	it("returns 0 when no original data markers", () => {
		const page = makePage({
			sentences: ["This is generic content.", "No specific data here.", "Just basic information."],
		});
		const result = scoreOriginalData([page], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 0 when no pages", () => {
		const result = scoreOriginalData([], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns high score for pages with original research markers", () => {
		const page = makePage({
			sentences: [
				"Our research found that 85% of respondents prefer automated tools.",
				"We discovered significant improvements in performance metrics.",
				"This case study demonstrates our proprietary approach.",
			],
		});
		const result = scoreOriginalData([page], makeMeta());
		expect(result.score).toBeGreaterThanOrEqual(7);
	});

	it("returns 2 for at least one page with original data", () => {
		const richPage = makePage({
			url: "https://example.com/research",
			sentences: ["Our study found that conversion rates improved by 40%."],
		});
		const genericPages = Array.from({ length: 9 }, (_, i) =>
			makePage({
				url: `https://example.com/page${i}`,
				sentences: ["Generic content without data markers."],
			}),
		);
		const result = scoreOriginalData([richPage, ...genericPages], makeMeta());
		expect(result.score).toBeGreaterThanOrEqual(2);
	});
});

describe("scoreFactDensity", () => {
	it("returns 0 when no facts", () => {
		const page = makePage({
			sentences: ["This page has no numbers or statistics.", "Just plain text content here."],
		});
		const result = scoreFactDensity([page], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns 0 when no pages", () => {
		const result = scoreFactDensity([], makeMeta());
		expect(result.score).toBe(0);
	});

	it("returns high score for pages with many statistics", () => {
		const page = makePage({
			sentences: [
				"Revenue grew by 25% last year.",
				"The company raised $100M in Series B funding.",
				"In 2024, adoption rates reached 3 million users.",
				"Performance improved by 40 percent compared to baseline.",
				"We processed 1.5 billion requests per month.",
				"Latency dropped to 50ms on average.",
			],
		});
		const result = scoreFactDensity([page], makeMeta());
		expect(result.score).toBeGreaterThanOrEqual(8);
	});

	it("returns 4 for moderate fact density", () => {
		const page = makePage({
			sentences: ["Revenue was $50M.", "Growth was 10%."],
		});
		const result = scoreFactDensity([page], makeMeta());
		expect(result.score).toBeGreaterThanOrEqual(4);
	});
});

describe("scoreDuplicateContent", () => {
	it("returns 10 when no duplicate paragraphs", () => {
		const page = makePage({
			paragraphs: [
				"This is the first unique paragraph with enough content.",
				"This is the second paragraph with completely different content.",
				"This is the third paragraph that talks about something else.",
			],
		});
		const result = scoreDuplicateContent([page], makeMeta());
		expect(result.score).toBe(10);
	});

	it("returns 10 when no pages", () => {
		const result = scoreDuplicateContent([], makeMeta());
		expect(result.score).toBe(10);
	});

	it("returns low score when many duplicate paragraphs", () => {
		const repeatedPara = "This exact paragraph appears multiple times on the page as duplicate content.";
		const page = makePage({
			paragraphs: [repeatedPara, repeatedPara, repeatedPara, "One unique paragraph here."],
		});
		const result = scoreDuplicateContent([page], makeMeta());
		expect(result.score).toBeLessThanOrEqual(3);
	});

	it("returns intermediate score for some duplicates", () => {
		const repeatedPara = "This paragraph is repeated once as a duplicate block.";
		const page = makePage({
			paragraphs: [
				"First unique paragraph with content.",
				repeatedPara,
				repeatedPara,
				"Third unique paragraph with different content.",
			],
		});
		const result = scoreDuplicateContent([page], makeMeta());
		expect(result.score).toBeLessThan(10);
		expect(result.score).toBeGreaterThan(0);
	});
});
