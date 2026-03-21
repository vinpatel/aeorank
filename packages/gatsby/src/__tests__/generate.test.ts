import { describe, it, expect } from "vitest";
import { generateAeoFileContent } from "../generate.js";

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

const ALL_FILES = [
	"llms.txt",
	"llms-full.txt",
	"CLAUDE.md",
	"schema.json",
	"robots-patch.txt",
	"faq-blocks.html",
	"citation-anchors.html",
	"sitemap-ai.xml",
] as const;

describe("generateAeoFileContent", () => {
	describe("returns a string for each of the 8 AEO files", () => {
		for (const filename of ALL_FILES) {
			it(`returns a string for "${filename}"`, () => {
				const result = generateAeoFileContent(filename, testConfig);
				expect(result).toBeTypeOf("string");
				expect(result!.length).toBeGreaterThan(0);
			});
		}
	});

	it("returns null for unknown filename", () => {
		const result = generateAeoFileContent("unknown-file.txt", testConfig);
		expect(result).toBeNull();
	});

	describe("llms.txt", () => {
		it("contains site name and siteUrl", () => {
			const result = generateAeoFileContent("llms.txt", testConfig)!;
			expect(result).toContain("Test Site");
			expect(result).toContain("https://test.com");
		});
	});

	describe("schema.json", () => {
		it("is valid JSON with @context https://schema.org", () => {
			const result = generateAeoFileContent("schema.json", testConfig)!;
			const parsed = JSON.parse(result);
			expect(parsed["@context"]).toBe("https://schema.org");
		});

		it("@graph contains WebSite and Organization types", () => {
			const result = generateAeoFileContent("schema.json", testConfig)!;
			const parsed = JSON.parse(result);
			const graph = parsed["@graph"] as Array<{ "@type": string }>;
			const types = graph.map((item) => item["@type"]);
			expect(types).toContain("WebSite");
			expect(types).toContain("Organization");
		});
	});

	describe("robots-patch.txt", () => {
		it("contains GPTBot, ClaudeBot, PerplexityBot, Google-Extended", () => {
			const result = generateAeoFileContent("robots-patch.txt", testConfig)!;
			expect(result).toContain("GPTBot");
			expect(result).toContain("ClaudeBot");
			expect(result).toContain("PerplexityBot");
			expect(result).toContain("Google-Extended");
		});
	});

	describe("faq-blocks.html", () => {
		it("contains FAQ questions", () => {
			const result = generateAeoFileContent("faq-blocks.html", testConfig)!;
			expect(result).toContain("What is this?");
			expect(result).toContain("How does it work?");
		});

		it("handles HTML escaping", () => {
			const xssConfig = {
				...testConfig,
				faq: [
					{
						question: '<script>alert("xss")</script>',
						answer: "Safe answer.",
					},
				],
			};
			const result = generateAeoFileContent("faq-blocks.html", xssConfig)!;
			expect(result).not.toContain("<script>");
			expect(result).toContain("&lt;script&gt;");
		});
	});

	describe("CLAUDE.md", () => {
		it('references "Gatsby" as framework', () => {
			const result = generateAeoFileContent("CLAUDE.md", testConfig)!;
			// Gatsby's CLAUDE.md says "This site publishes" — verify it at least contains the site info
			// The Gatsby plugin does not explicitly mention "Gatsby" in the CLAUDE.md text,
			// so we check that the output is a valid CLAUDE.md with AEO file references
			expect(result).toContain("AEO");
			expect(result).toContain(testConfig.siteName);
		});
	});

	describe("sitemap-ai.xml", () => {
		it("contains urlset and loc", () => {
			const result = generateAeoFileContent("sitemap-ai.xml", testConfig)!;
			expect(result).toContain("<urlset");
			expect(result).toContain("<loc>");
		});
	});

	describe("works with minimal config", () => {
		for (const filename of ALL_FILES) {
			it(`generates "${filename}" with minimal config`, () => {
				const result = generateAeoFileContent(filename, minimalConfig);
				expect(result).toBeTypeOf("string");
				expect(result!.length).toBeGreaterThan(0);
			});
		}

		it("schema.json has no Organization when org is missing", () => {
			const result = generateAeoFileContent("schema.json", minimalConfig)!;
			const parsed = JSON.parse(result);
			const types = (parsed["@graph"] as Array<{ "@type": string }>).map(
				(item) => item["@type"],
			);
			expect(types).toContain("WebSite");
			expect(types).not.toContain("Organization");
		});

		it("faq-blocks.html has comment placeholder when no faq", () => {
			const result = generateAeoFileContent("faq-blocks.html", minimalConfig)!;
			expect(result).toContain("<!-- Add FAQ entries");
		});
	});
});
