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

describe("generateAllFiles (nuxt)", () => {
	it("returns array of 8 files", () => {
		const files = generateAllFiles(testConfig);
		expect(files).toHaveLength(8);
	});

	it("each file has path, content, and contentType properties", () => {
		const files = generateAllFiles(testConfig);
		for (const file of files) {
			expect(file).toHaveProperty("path");
			expect(file).toHaveProperty("content");
			expect(file).toHaveProperty("contentType");
			expect(file.path).toBeTypeOf("string");
			expect(file.content).toBeTypeOf("string");
			expect(file.contentType).toBeTypeOf("string");
			expect(file.content.length).toBeGreaterThan(0);
		}
	});

	it("paths start with /", () => {
		const files = generateAllFiles(testConfig);
		for (const file of files) {
			expect(file.path.startsWith("/")).toBe(true);
		}
	});

	it("content types are correct for each file type", () => {
		const files = generateAllFiles(testConfig);
		const fileMap = new Map(files.map((f) => [f.path, f.contentType]));

		expect(fileMap.get("/llms.txt")).toBe("text/plain; charset=utf-8");
		expect(fileMap.get("/llms-full.txt")).toBe("text/plain; charset=utf-8");
		expect(fileMap.get("/CLAUDE.md")).toBe("text/markdown; charset=utf-8");
		expect(fileMap.get("/schema.json")).toBe("application/json; charset=utf-8");
		expect(fileMap.get("/robots-patch.txt")).toBe("text/plain; charset=utf-8");
		expect(fileMap.get("/faq-blocks.html")).toBe("text/html; charset=utf-8");
		expect(fileMap.get("/citation-anchors.html")).toBe("text/html; charset=utf-8");
		expect(fileMap.get("/sitemap-ai.xml")).toBe("application/xml; charset=utf-8");
	});

	describe("llms.txt", () => {
		it("contains site name and description", () => {
			const files = generateAllFiles(testConfig);
			const llms = files.find((f) => f.path === "/llms.txt")!;
			expect(llms.content).toContain("Test Site");
			expect(llms.content).toContain("A test site for unit testing.");
		});
	});

	describe("CLAUDE.md", () => {
		it('references "Nuxt 3" as framework', () => {
			const files = generateAllFiles(testConfig);
			const claude = files.find((f) => f.path === "/CLAUDE.md")!;
			expect(claude.content).toContain("Nuxt 3");
		});
	});

	describe("schema.json", () => {
		it("is valid JSON", () => {
			const files = generateAllFiles(testConfig);
			const schema = files.find((f) => f.path === "/schema.json")!;
			const parsed = JSON.parse(schema.content);
			expect(parsed["@context"]).toBe("https://schema.org");
			expect(parsed["@graph"]).toBeDefined();
			expect(Array.isArray(parsed["@graph"])).toBe(true);
		});
	});

	describe("robots-patch.txt", () => {
		it("contains AI crawlers", () => {
			const files = generateAllFiles(testConfig);
			const robots = files.find((f) => f.path === "/robots-patch.txt")!;
			expect(robots.content).toContain("GPTBot");
			expect(robots.content).toContain("ClaudeBot");
			expect(robots.content).toContain("PerplexityBot");
			expect(robots.content).toContain("Google-Extended");
		});
	});

	describe("faq-blocks.html", () => {
		it("includes FAQ content", () => {
			const files = generateAllFiles(testConfig);
			const faq = files.find((f) => f.path === "/faq-blocks.html")!;
			expect(faq.content).toContain("What is this?");
			expect(faq.content).toContain("A test site.");
			expect(faq.content).toContain("FAQPage");
		});

		it("shows placeholder when no faq provided", () => {
			const files = generateAllFiles(minimalConfig);
			const faq = files.find((f) => f.path === "/faq-blocks.html")!;
			expect(faq.content).toContain("No FAQ content configured");
		});
	});

	describe("sitemap-ai.xml", () => {
		it("has XML declaration", () => {
			const files = generateAllFiles(testConfig);
			const sitemap = files.find((f) => f.path === "/sitemap-ai.xml")!;
			expect(sitemap.content).toContain('<?xml version="1.0"');
		});

		it("has urlset element", () => {
			const files = generateAllFiles(testConfig);
			const sitemap = files.find((f) => f.path === "/sitemap-ai.xml")!;
			expect(sitemap.content).toContain("<urlset");
			expect(sitemap.content).toContain("</urlset>");
		});
	});

	describe("works with minimal config", () => {
		it("generates all 8 files without errors", () => {
			const files = generateAllFiles(minimalConfig);
			expect(files).toHaveLength(8);
			for (const file of files) {
				expect(file.content.length).toBeGreaterThan(0);
			}
		});

		it("llms.txt uses minimal config values", () => {
			const files = generateAllFiles(minimalConfig);
			const llms = files.find((f) => f.path === "/llms.txt")!;
			expect(llms.content).toContain("Minimal");
			expect(llms.content).toContain("https://minimal.com");
		});
	});
});
