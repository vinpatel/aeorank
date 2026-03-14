import { describe, expect, it } from "vitest";
import { generateFiles } from "../generators/index.js";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import { generateLlmsFullTxt } from "../generators/llms-full.js";
import { generateSchemaJson } from "../generators/schema-json.js";
import { generateRobotsPatch } from "../generators/robots-patch.js";
import type { ScanResult, ScannedPage, ScanMeta, DimensionScore } from "../types.js";

function makeDimension(id: string): DimensionScore {
	return { id, name: id, score: 5, maxScore: 10, weight: "medium", status: "warn", hint: "" };
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
		},
		{
			url: "https://example.com/blog/first-post",
			title: "First Post - Example Blog",
			metaDescription: "Our first blog post about AEO",
			headings: [
				{ level: 1, text: "First Post", id: null },
				{ level: 2, text: "What is AEO?", id: "what-is-aeo" },
				{ level: 2, text: "How does it work?", id: null },
			],
			bodyText: "AEO stands for AI Engine Optimization. It helps your site get cited by AI.",
			schemaOrg: [],
			links: [],
			canonical: "https://example.com/blog/first-post",
			robotsMeta: null,
			language: "en",
			wordCount: 80,
			hasDatePublished: true,
			authorName: "Jane Smith",
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
	it("returns exactly 8 files", () => {
		const files = generateFiles(makeMockResult());
		expect(files).toHaveLength(8);
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
