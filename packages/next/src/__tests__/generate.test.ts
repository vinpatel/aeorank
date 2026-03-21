import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateAeoFiles, generateAeoFileContent } from "../generate.js";

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

const AEO_FILENAMES = [
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
	it("returns a string for each of the 8 AEO files", () => {
		for (const filename of AEO_FILENAMES) {
			const content = generateAeoFileContent(filename, testConfig);
			expect(content).toBeTypeOf("string");
			expect(content!.length).toBeGreaterThan(0);
		}
	});

	it("returns null for unknown filename", () => {
		const content = generateAeoFileContent("unknown-file.txt", testConfig);
		expect(content).toBeNull();
	});

	it("each generated file contains expected content (siteName, siteUrl, description)", () => {
		for (const filename of AEO_FILENAMES) {
			const content = generateAeoFileContent(filename, testConfig)!;
			// robots-patch.txt and sitemap-ai.xml do not include siteName
			if (filename === "robots-patch.txt" || filename === "sitemap-ai.xml") continue;
			expect(content).toContain(testConfig.siteName);
		}
	});

	describe("llms.txt", () => {
		it("contains site name and description", () => {
			const content = generateAeoFileContent("llms.txt", testConfig)!;
			expect(content).toContain("Test Site");
			expect(content).toContain("A test site for unit testing.");
		});
	});

	describe("schema.json", () => {
		it("is valid JSON with @context and @graph", () => {
			const content = generateAeoFileContent("schema.json", testConfig)!;
			const parsed = JSON.parse(content);
			expect(parsed["@context"]).toBe("https://schema.org");
			expect(parsed["@graph"]).toBeDefined();
			expect(Array.isArray(parsed["@graph"])).toBe(true);
		});

		it("includes Organization when org is provided", () => {
			const content = generateAeoFileContent("schema.json", testConfig)!;
			const parsed = JSON.parse(content);
			const orgEntry = parsed["@graph"].find(
				(item: Record<string, unknown>) => item["@type"] === "Organization",
			);
			expect(orgEntry).toBeDefined();
			expect(orgEntry.name).toBe("Test Org");
			expect(orgEntry.url).toBe("https://test-org.com");
			expect(orgEntry.logo).toBe("https://test-org.com/logo.png");
		});

		it("does not include Organization when org is not provided", () => {
			const content = generateAeoFileContent("schema.json", minimalConfig)!;
			const parsed = JSON.parse(content);
			const orgEntry = parsed["@graph"].find(
				(item: Record<string, unknown>) => item["@type"] === "Organization",
			);
			expect(orgEntry).toBeUndefined();
		});
	});

	describe("robots-patch.txt", () => {
		it("contains GPTBot, ClaudeBot, PerplexityBot", () => {
			const content = generateAeoFileContent("robots-patch.txt", testConfig)!;
			expect(content).toContain("GPTBot");
			expect(content).toContain("ClaudeBot");
			expect(content).toContain("PerplexityBot");
		});
	});

	describe("faq-blocks.html", () => {
		it("contains FAQ questions when provided", () => {
			const content = generateAeoFileContent("faq-blocks.html", testConfig)!;
			expect(content).toContain("What is this?");
			expect(content).toContain("A test site.");
			expect(content).toContain("How does it work?");
			expect(content).toContain("It works well.");
		});

		it("escapes HTML entities", () => {
			const configWithHtml = {
				...minimalConfig,
				faq: [
					{
						question: 'Is 1 < 2 & 2 > 1 "true"?',
						answer: "Yes, <b>obviously</b> & always.",
					},
				],
			};
			const content = generateAeoFileContent("faq-blocks.html", configWithHtml)!;
			expect(content).toContain("&lt;");
			expect(content).toContain("&gt;");
			expect(content).toContain("&amp;");
			expect(content).toContain("&quot;");
			// Should not contain raw unescaped angle brackets in the FAQ content
			expect(content).not.toContain("<b>obviously</b>");
		});

		it("shows placeholder when no faq provided", () => {
			const content = generateAeoFileContent("faq-blocks.html", minimalConfig)!;
			expect(content).toContain("Add FAQ entries");
		});
	});

	describe("citation-anchors.html", () => {
		it("contains site name", () => {
			const content = generateAeoFileContent("citation-anchors.html", testConfig)!;
			expect(content).toContain("Test Site");
		});

		it("contains site URL", () => {
			const content = generateAeoFileContent("citation-anchors.html", testConfig)!;
			expect(content).toContain("https://test.com");
		});
	});

	describe("sitemap-ai.xml", () => {
		it("is valid XML structure", () => {
			const content = generateAeoFileContent("sitemap-ai.xml", testConfig)!;
			expect(content).toContain('<?xml version="1.0"');
			expect(content).toContain("<urlset");
			expect(content).toContain("</urlset>");
			expect(content).toContain("<url>");
			expect(content).toContain("<loc>");
		});

		it("contains site URL", () => {
			const content = generateAeoFileContent("sitemap-ai.xml", testConfig)!;
			expect(content).toContain("https://test.com");
		});
	});

	describe("CLAUDE.md", () => {
		it("contains AEO Files section", () => {
			const content = generateAeoFileContent("CLAUDE.md", testConfig)!;
			expect(content).toContain("## AEO Files");
			expect(content).toContain("llms.txt");
			expect(content).toContain("schema.json");
		});
	});

	describe("works with minimal config (no org, no faq)", () => {
		it("generates all 8 files without errors", () => {
			for (const filename of AEO_FILENAMES) {
				const content = generateAeoFileContent(filename, minimalConfig);
				expect(content).toBeTypeOf("string");
				expect(content!.length).toBeGreaterThan(0);
			}
		});

		it("llms.txt uses minimal config values", () => {
			const content = generateAeoFileContent("llms.txt", minimalConfig)!;
			expect(content).toContain("Minimal");
			expect(content).toContain("https://minimal.com");
			expect(content).toContain("Minimal config.");
		});
	});
});

describe("generateAeoFiles", () => {
	let tmpDir: string;

	afterEach(() => {
		if (tmpDir && existsSync(tmpDir)) {
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});

	it("writes files to disk and returns file paths", () => {
		tmpDir = mkdtempSync(join(tmpdir(), "aeorank-test-"));
		const config = { ...testConfig, outputDir: tmpDir };
		const paths = generateAeoFiles(config);

		expect(paths).toHaveLength(8);

		for (const filePath of paths) {
			expect(existsSync(filePath)).toBe(true);
			const content = readFileSync(filePath, "utf-8");
			expect(content.length).toBeGreaterThan(0);
		}
	});

	it("creates output directory if it does not exist", () => {
		tmpDir = mkdtempSync(join(tmpdir(), "aeorank-test-"));
		const nestedDir = join(tmpDir, "nested", "output");
		const config = { ...testConfig, outputDir: nestedDir };
		const paths = generateAeoFiles(config);

		expect(existsSync(nestedDir)).toBe(true);
		expect(paths).toHaveLength(8);
	});

	it("writes correct content to each file", () => {
		tmpDir = mkdtempSync(join(tmpdir(), "aeorank-test-"));
		const config = { ...testConfig, outputDir: tmpDir };
		generateAeoFiles(config);

		const llmsTxt = readFileSync(join(tmpDir, "llms.txt"), "utf-8");
		expect(llmsTxt).toContain("Test Site");

		const schemaJson = readFileSync(join(tmpDir, "schema.json"), "utf-8");
		const parsed = JSON.parse(schemaJson);
		expect(parsed["@context"]).toBe("https://schema.org");
	});
});
