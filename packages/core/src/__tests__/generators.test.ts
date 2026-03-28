import { describe, expect, it } from "vitest";
import { generateFiles } from "../generators/index.js";
import { generateAiTxt } from "../generators/ai-txt.js";
import { generateLlmsFullTxt } from "../generators/llms-full.js";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import { generateRobotsPatch } from "../generators/robots-patch.js";
import { generateSchemaJson } from "../generators/schema-json.js";
import type { DimensionScore, ScanMeta, ScanResult, ScannedPage } from "../types.js";

function makeDimension(id: string): DimensionScore {
	return { id, name: id, score: 5, maxScore: 10, weightPct: 3, status: "warn", hint: "" };
}

function makeMockResult(): ScanResult {
	const pages: ScannedPage[] = [
		{
			url: "https://example.com",
			title: "Home - Example",
			metaDescription: "The example homepage",
			headings: [
				{ level: 1, text: "Welcome", id: null },
				{ level: 2, text: "About Us", id: "about" },
				{ level: 3, text: "Our Team", id: null },
			],
			bodyText: "Welcome to our site. We build great things.",
			schemaOrg: [{ "@type": "Organization", name: "Example" }],
			links: [{ href: "https://example.com/blog", text: "Blog", internal: true }],
			canonical: "https://example.com",
			robotsMeta: "index, follow",
			language: "en",
			wordCount: 50,
			hasDatePublished: true,
			authorName: "Jane Smith",
			paragraphs: ["Welcome to our site.", "We build great things."],
			sentences: ["Welcome to our site.", "We build great things."],
			contentHash: "abc123",
			questionHeadings: [],
			tableCount: 0,
			listCount: 0,
			semanticElements: { main: 1, article: 0, nav: 1, aside: 0, section: 0, header: 1, footer: 1 },
			ariaRoleCount: 0,
			figureCount: 0,
			imgCount: 0,
			imgsWithAlt: 0,
			avgSentenceLength: 5,
			rssFeeds: [],
			timeElementCount: 0,
		},
		{
			url: "https://example.com/blog/first-post",
			title: "AEO Optimization Guide - Example Blog",
			metaDescription: "Our first blog post about AEO",
			headings: [
				{ level: 1, text: "First Post", id: null },
				{ level: 2, text: "What is AEO?", id: "what-is-aeo" },
				{ level: 2, text: "How does it work?", id: null },
			],
			bodyText:
				"AEO stands for AI Engine Optimization. AEO helps your site get cited by AI. AEO is defined as the practice of optimizing content for AI answer engines. AEO refers to a set of techniques. AEO describes the process of structured content creation. This post covers AEO optimization tips.",
			schemaOrg: [],
			links: [],
			canonical: "https://example.com/blog/first-post",
			robotsMeta: null,
			language: "en",
			wordCount: 80,
			hasDatePublished: true,
			authorName: "Jane Smith",
			paragraphs: [
				"AEO stands for AI Engine Optimization.",
				"It helps your site get cited by AI.",
				"AEO is defined as the practice of optimizing content for AI answer engines.",
			],
			sentences: [
				"AEO stands for AI Engine Optimization.",
				"It helps your site get cited by AI.",
				"AEO is defined as the practice of optimizing content for AI answer engines.",
				"AEO refers to a set of techniques.",
				"AEO describes the process of structured content creation.",
			],
			contentHash: "def456",
			questionHeadings: [
				{ text: "What is AEO?", level: 2 },
				{ text: "How does it work?", level: 2 },
			],
			tableCount: 0,
			listCount: 0,
			semanticElements: { main: 1, article: 1, nav: 0, aside: 0, section: 0, header: 0, footer: 0 },
			ariaRoleCount: 0,
			figureCount: 0,
			imgCount: 0,
			imgsWithAlt: 0,
			avgSentenceLength: 8,
			rssFeeds: [],
			timeElementCount: 0,
		},
	];

	const meta: ScanMeta = {
		url: "https://example.com",
		robotsTxt: {
			raw: "User-agent: *\nAllow: /",
			crawlerAccess: {
				GPTBot: "allowed",
				ClaudeBot: "allowed",
				PerplexityBot: "disallowed",
				"Google-Extended": "unknown",
				"anthropic-ai": "unknown",
			},
			crawlDelay: null,
		},
		sitemapXml: null,
		existingLlmsTxt: null,
		platform: null,
		responseTimeMs: 500,
		aiTxt: null,
		sitemapLastmods: [],
	};

	return {
		url: "https://example.com",
		siteName: "Example",
		siteDescription: "An example website for testing",
		score: 65,
		grade: "C",
		dimensions: [
			makeDimension("llms-txt"),
			makeDimension("schema-markup"),
			makeDimension("ai-crawler-access"),
			makeDimension("content-structure"),
			makeDimension("answer-first"),
			makeDimension("faq-speakable"),
			makeDimension("eeat-signals"),
			makeDimension("meta-descriptions"),
			makeDimension("sitemap"),
			makeDimension("https-redirects"),
			makeDimension("page-freshness"),
			makeDimension("citation-anchors"),
		],
		files: [],
		pages,
		meta,
		pagesScanned: 2,
		duration: 1500,
		scannedAt: "2026-03-14T10:00:00Z",
	};
}

describe("generateFiles", () => {
	it("returns exactly 9 files", () => {
		const files = generateFiles(makeMockResult());
		expect(files).toHaveLength(9);
	});

	it("returns correct file names", () => {
		const files = generateFiles(makeMockResult());
		const names = files.map((f) => f.name);
		expect(names).toEqual([
			"llms.txt",
			"llms-full.txt",
			"CLAUDE.md",
			"schema.json",
			"robots-patch.txt",
			"faq-blocks.html",
			"citation-anchors.html",
			"sitemap-ai.xml",
			"ai.txt",
		]);
	});

	it("each file has non-empty content", () => {
		const files = generateFiles(makeMockResult());
		for (const file of files) {
			expect(file.content.length).toBeGreaterThan(0);
		}
	});
});

describe("generateLlmsTxt", () => {
	it("starts with H1 site name", () => {
		const content = generateLlmsTxt(makeMockResult());
		expect(content).toMatch(/^# Example/);
	});

	it("includes blockquote description", () => {
		const content = generateLlmsTxt(makeMockResult());
		expect(content).toContain("> An example website for testing");
	});

	it("groups pages into H2 sections", () => {
		const content = generateLlmsTxt(makeMockResult());
		expect(content).toContain("## ");
	});

	it("includes page links in markdown format", () => {
		const content = generateLlmsTxt(makeMockResult());
		expect(content).toMatch(/\[.*?\]\(https:\/\/example\.com/);
	});
});

describe("generateLlmsFullTxt", () => {
	it("contains all page body text", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("Welcome to our site");
		expect(content).toContain("AEO stands for AI Engine Optimization");
	});

	it("separates pages with dividers", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("---");
	});

	it("includes URLs for each page", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("URL: https://example.com");
		expect(content).toContain("URL: https://example.com/blog/first-post");
	});

	it("contains Q&A section when page has questionHeadings", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("## Q&A");
	});

	it("Q&A section pairs question headings with paragraph text", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("**Q: What is AEO?**");
	});

	it("contains Definitions section when definition patterns found", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("## Definitions");
	});

	it("definition patterns match 'is defined as' sentences", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("is defined as");
	});

	it("contains Key Entities section with entity from page title", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("## Key Entities");
	});

	it("pages without questionHeadings omit Q&A section", () => {
		const result = makeMockResult();
		// Use only the homepage which has no question headings
		const homePage = result.pages.find((p) => p.url === "https://example.com")!;
		const singlePageResult = { ...result, pages: [homePage] };
		const content = generateLlmsFullTxt(singlePageResult);
		expect(content).not.toContain("## Q&A");
	});

	it("page separator '---' still present between pages", () => {
		const content = generateLlmsFullTxt(makeMockResult());
		expect(content).toContain("\n---\n");
	});
});

describe("generateAiTxt", () => {
	it("returns string starting with '# ai.txt'", () => {
		const content = generateAiTxt(makeMockResult());
		expect(content).toMatch(/^# ai\.txt/);
	});

	it("output contains 'User-Agent: *' directive line", () => {
		const content = generateAiTxt(makeMockResult());
		expect(content).toContain("User-Agent: *");
	});

	it("output contains 'Allow-AI-Training:' directive", () => {
		const content = generateAiTxt(makeMockResult());
		expect(content).toContain("Allow-AI-Training:");
	});

	it("output contains 'Allow-AI-Inference:' directive", () => {
		const content = generateAiTxt(makeMockResult());
		expect(content).toContain("Allow-AI-Inference:");
	});

	it("output contains site URL", () => {
		const content = generateAiTxt(makeMockResult());
		expect(content).toContain("https://example.com");
	});

	it("output contains site name", () => {
		const content = generateAiTxt(makeMockResult());
		expect(content).toContain("Example");
	});

	it("includes note comment when site already has ai.txt", () => {
		const result = makeMockResult();
		result.meta.aiTxt = "User-Agent: *\nAllow-AI-Training: Yes";
		const content = generateAiTxt(result);
		expect(content).toContain("# Note: Site already has ai.txt");
	});

	it("does not include note comment when aiTxt is null", () => {
		const result = makeMockResult();
		result.meta.aiTxt = null;
		const content = generateAiTxt(result);
		expect(content).not.toContain("# Note: Site already has ai.txt");
	});
});

describe("generateSchemaJson", () => {
	it("produces valid JSON", () => {
		const content = generateSchemaJson(makeMockResult());
		const parsed = JSON.parse(content);
		expect(parsed).toBeDefined();
	});

	it("has @context schema.org", () => {
		const parsed = JSON.parse(generateSchemaJson(makeMockResult()));
		expect(parsed["@context"]).toBe("https://schema.org");
	});

	it("includes Organization and WebSite", () => {
		const parsed = JSON.parse(generateSchemaJson(makeMockResult()));
		const types = parsed["@graph"].map((item: Record<string, unknown>) => item["@type"]);
		expect(types).toContain("Organization");
		expect(types).toContain("WebSite");
	});
});

describe("generateRobotsPatch", () => {
	it("marks already-allowed crawlers", () => {
		const content = generateRobotsPatch(makeMockResult());
		expect(content).toContain("# GPTBot: Already allowed");
		expect(content).toContain("# ClaudeBot: Already allowed");
	});

	it("generates Allow directives for non-allowed crawlers", () => {
		const content = generateRobotsPatch(makeMockResult());
		expect(content).toContain("User-agent: PerplexityBot");
		expect(content).toContain("Allow: /");
	});
});
