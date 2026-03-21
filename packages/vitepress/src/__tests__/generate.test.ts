import { describe, it, expect } from "vitest";
import { generateAeoFileContent } from "../generate.js";

const testConfig = {
	siteName: "Test Site",
	siteUrl: "https://test.com",
	description: "A test site.",
	organization: { name: "Test Org", url: "https://test-org.com", logo: "https://test-org.com/logo.png" },
	faq: [{ question: "What is this?", answer: "A test." }],
};

const minimal = { siteName: "Min", siteUrl: "https://min.com", description: "Minimal." };

const FILES = ["llms.txt", "llms-full.txt", "CLAUDE.md", "schema.json", "robots-patch.txt", "faq-blocks.html", "citation-anchors.html", "sitemap-ai.xml"];

describe("generateAeoFileContent", () => {
	for (const f of FILES) {
		it(`generates ${f}`, () => {
			const c = generateAeoFileContent(f, testConfig);
			expect(c).toBeTypeOf("string");
			expect(c!.length).toBeGreaterThan(0);
		});
	}

	it("returns null for unknown file", () => {
		expect(generateAeoFileContent("nope.txt", testConfig)).toBeNull();
	});

	it("llms.txt contains site name", () => {
		expect(generateAeoFileContent("llms.txt", testConfig)).toContain("Test Site");
	});

	it("schema.json is valid JSON", () => {
		const j = JSON.parse(generateAeoFileContent("schema.json", testConfig)!);
		expect(j["@context"]).toBe("https://schema.org");
		expect(j["@graph"]).toBeDefined();
	});

	it("robots-patch.txt has AI crawlers", () => {
		const c = generateAeoFileContent("robots-patch.txt", testConfig)!;
		expect(c).toContain("GPTBot");
		expect(c).toContain("ClaudeBot");
	});

	it("CLAUDE.md mentions VitePress", () => {
		expect(generateAeoFileContent("CLAUDE.md", testConfig)).toContain("VitePress");
	});

	it("works with minimal config", () => {
		for (const f of FILES) {
			expect(generateAeoFileContent(f, minimal)).toBeTypeOf("string");
		}
	});
});
