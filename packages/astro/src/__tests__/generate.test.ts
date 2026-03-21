import { describe, it, expect } from "vitest";
import { generateAllFiles } from "../generate.js";

const testConfig = {
	siteName: "Test Site",
	siteUrl: "https://test.com",
	description: "A test site for unit testing.",
	organization: {
		name: "Test Org",
		url: "https://test-org.com",
		logo: "https://test-org.com/logo.png",
	},
	faq: [
		{ question: "What is this?", answer: "A test site." },
		{ question: "How does it work?", answer: "It works well." },
	],
};

const minimalConfig = {
	siteName: "Minimal",
	siteUrl: "https://minimal.com",
	description: "Minimal config.",
};

const EXPECTED_FILENAMES = [
	"llms.txt",
	"llms-full.txt",
	"CLAUDE.md",
	"schema.json",
	"robots-patch.txt",
	"faq-blocks.html",
	"citation-anchors.html",
	"sitemap-ai.xml",
];

describe("generateAllFiles", () => {
	it("returns array of 8 files", () => {
		const files = generateAllFiles(testConfig);
		expect(files).toHaveLength(8);
	});

	it("each file has name and content properties", () => {
		const files = generateAllFiles(testConfig);
		for (const file of files) {
			expect(file).toHaveProperty("name");
			expect(file).toHaveProperty("content");
			expect(file.name).toBeTypeOf("string");
			expect(file.content).toBeTypeOf("string");
			expect(file.content.length).toBeGreaterThan(0);
		}
	});

	it("file names match expected AEO files", () => {
		const files = generateAllFiles(testConfig);
		const names = files.map((f) => f.name);
		for (const expected of EXPECTED_FILENAMES) {
			expect(names).toContain(expected);
		}
	});

	describe("llms.txt", () => {
		it("contains site name", () => {
			const files = generateAllFiles(testConfig);
			const llms = files.find((f) => f.name === "llms.txt")!;
			expect(llms.content).toContain("Test Site");
		});
	});

	describe("llms-full.txt", () => {
		it("contains organization when provided", () => {
			const files = generateAllFiles(testConfig);
			const llmsFull = files.find((f) => f.name === "llms-full.txt")!;
			expect(llmsFull.content).toContain("Test Org");
		});

		it("contains FAQ when provided", () => {
			const files = generateAllFiles(testConfig);
			const llmsFull = files.find((f) => f.name === "llms-full.txt")!;
			expect(llmsFull.content).toContain("What is this?");
			expect(llmsFull.content).toContain("A test site.");
			expect(llmsFull.content).toContain("How does it work?");
		});
	});

	describe("CLAUDE.md", () => {
		it('references "Astro" as framework', () => {
			const files = generateAllFiles(testConfig);
			const claude = files.find((f) => f.name === "CLAUDE.md")!;
			expect(claude.content).toContain("Astro");
		});
	});

	describe("schema.json", () => {
		it("is valid JSON with @graph", () => {
			const files = generateAllFiles(testConfig);
			const schema = files.find((f) => f.name === "schema.json")!;
			const parsed = JSON.parse(schema.content);
			expect(parsed["@context"]).toBe("https://schema.org");
			expect(parsed["@graph"]).toBeDefined();
			expect(Array.isArray(parsed["@graph"])).toBe(true);
		});

		it("includes FAQPage when faq provided", () => {
			const files = generateAllFiles(testConfig);
			const schema = files.find((f) => f.name === "schema.json")!;
			const parsed = JSON.parse(schema.content);
			const faqPage = parsed["@graph"].find(
				(item: Record<string, unknown>) => item["@type"] === "FAQPage",
			);
			expect(faqPage).toBeDefined();
			expect(faqPage.mainEntity).toHaveLength(2);
		});

		it("does not include FAQPage when no faq provided", () => {
			const files = generateAllFiles(minimalConfig);
			const schema = files.find((f) => f.name === "schema.json")!;
			const parsed = JSON.parse(schema.content);
			const faqPage = parsed["@graph"].find(
				(item: Record<string, unknown>) => item["@type"] === "FAQPage",
			);
			expect(faqPage).toBeUndefined();
		});
	});

	describe("robots-patch.txt", () => {
		it("contains AI crawler names", () => {
			const files = generateAllFiles(testConfig);
			const robots = files.find((f) => f.name === "robots-patch.txt")!;
			expect(robots.content).toContain("GPTBot");
			expect(robots.content).toContain("ClaudeBot");
			expect(robots.content).toContain("PerplexityBot");
			expect(robots.content).toContain("Google-Extended");
		});
	});

	describe("faq-blocks.html", () => {
		it("includes schema.org FAQPage markup when faq provided", () => {
			const files = generateAllFiles(testConfig);
			const faq = files.find((f) => f.name === "faq-blocks.html")!;
			expect(faq.content).toContain("FAQPage");
			expect(faq.content).toContain("What is this?");
			expect(faq.content).toContain("application/ld+json");
		});

		it("shows placeholder when no faq", () => {
			const files = generateAllFiles(minimalConfig);
			const faq = files.find((f) => f.name === "faq-blocks.html")!;
			expect(faq.content).toContain("No FAQ content configured");
		});
	});

	describe("citation-anchors.html", () => {
		it("contains site URL", () => {
			const files = generateAllFiles(testConfig);
			const citations = files.find((f) => f.name === "citation-anchors.html")!;
			expect(citations.content).toContain("https://test.com");
		});
	});

	describe("sitemap-ai.xml", () => {
		it("has urlset root element", () => {
			const files = generateAllFiles(testConfig);
			const sitemap = files.find((f) => f.name === "sitemap-ai.xml")!;
			expect(sitemap.content).toContain("<urlset");
			expect(sitemap.content).toContain("</urlset>");
		});

		it("contains XML declaration", () => {
			const files = generateAllFiles(testConfig);
			const sitemap = files.find((f) => f.name === "sitemap-ai.xml")!;
			expect(sitemap.content).toContain('<?xml version="1.0"');
		});
	});

	describe("works with minimal config (no org, no faq)", () => {
		it("generates all 8 files without errors", () => {
			const files = generateAllFiles(minimalConfig);
			expect(files).toHaveLength(8);
			for (const file of files) {
				expect(file.content.length).toBeGreaterThan(0);
			}
		});
	});

	describe("escapeHtml", () => {
		it("escapes special chars in FAQ content (<, >, &, \")", () => {
			const configWithSpecialChars = {
				...minimalConfig,
				faq: [
					{
						question: 'Is 1 < 2 & 2 > 1 "always"?',
						answer: "Yes, <b>always</b> & forever.",
					},
				],
			};
			const files = generateAllFiles(configWithSpecialChars);
			const faq = files.find((f) => f.name === "faq-blocks.html")!;
			// The HTML portion (itemprop attributes) should have escaped entities
			expect(faq.content).toContain("&lt;b&gt;always&lt;/b&gt;");
			expect(faq.content).toContain("&amp;");
			expect(faq.content).toContain("&quot;");
			// The itemprop="name" h3 should have escaped content
			expect(faq.content).toContain('itemprop="name">Is 1 &lt; 2 &amp; 2 &gt; 1 &quot;always&quot;?</h3>');
		});
	});
});
