import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parsePage } from "../scanner/parser.js";
import { parseRobotsTxt } from "../scanner/robots.js";

const fixturesDir = join(import.meta.dirname, "fixtures");
const sampleHtml = readFileSync(join(fixturesDir, "sample-page.html"), "utf-8");
const robotsTxtContent = readFileSync(join(fixturesDir, "robots.txt"), "utf-8");

describe("parsePage", () => {
	const page = parsePage("https://example.com/about", sampleHtml, "https://example.com");

	it("extracts title", () => {
		expect(page.title).toBe("AEOrank - AI Visibility Scanner");
	});

	it("extracts meta description", () => {
		expect(page.metaDescription).toContain("Scan any website for AI readability");
	});

	it("extracts headings with levels and IDs", () => {
		expect(page.headings.length).toBeGreaterThan(0);

		const h1 = page.headings.find((h) => h.level === 1);
		expect(h1).toBeDefined();
		expect(h1?.text).toBe("AI Visibility Scanner");

		const h2WithId = page.headings.find((h) => h.level === 2 && h.id === "how-it-works");
		expect(h2WithId).toBeDefined();
		expect(h2WithId?.text).toBe("How It Works");

		const h3WithId = page.headings.find((h) => h.level === 3 && h.id === "step-1");
		expect(h3WithId).toBeDefined();

		// h3 without ID
		const h3NoId = page.headings.find(
			(h) => h.level === 3 && h.text === "Step 2: Review Your Score",
		);
		expect(h3NoId).toBeDefined();
		expect(h3NoId?.id).toBeNull();
	});

	it("extracts JSON-LD schema.org blocks", () => {
		expect(page.schemaOrg.length).toBe(2);
		const org = page.schemaOrg.find(
			(s) => (s as Record<string, unknown>)["@type"] === "Organization",
		);
		expect(org).toBeDefined();
		const web = page.schemaOrg.find(
			(s) => (s as Record<string, unknown>)["@type"] === "WebSite",
		);
		expect(web).toBeDefined();
	});

	it("extracts body text", () => {
		expect(page.bodyText.length).toBeGreaterThan(0);
		expect(page.bodyText).toContain("AI Visibility Scanner");
	});

	it("extracts internal and external links", () => {
		const internalLinks = page.links.filter((l) => l.internal);
		const externalLinks = page.links.filter((l) => !l.internal);
		expect(internalLinks.length).toBeGreaterThan(0);
		expect(externalLinks.length).toBeGreaterThan(0);
		expect(externalLinks.some((l) => l.href.includes("github.com"))).toBe(true);
	});

	it("extracts canonical URL", () => {
		expect(page.canonical).toBe("https://example.com/about");
	});

	it("extracts robots meta", () => {
		expect(page.robotsMeta).toBe("index, follow");
	});

	it("detects word count", () => {
		expect(page.wordCount).toBeGreaterThan(50);
	});

	it("detects author name", () => {
		expect(page.authorName).toBe("Jane Smith");
	});

	it("detects date published", () => {
		expect(page.hasDatePublished).toBe(true);
	});

	it("detects language", () => {
		expect(page.language).toBe("en");
	});
});

describe("parseRobotsTxt", () => {
	it("identifies allowed AI crawlers", () => {
		const info = parseRobotsTxt("https://example.com", robotsTxtContent);
		expect(info.crawlerAccess.GPTBot).toBe("allowed");
		expect(info.crawlerAccess.ClaudeBot).toBe("allowed");
	});

	it("identifies disallowed AI crawlers", () => {
		const info = parseRobotsTxt("https://example.com", robotsTxtContent);
		expect(info.crawlerAccess.PerplexityBot).toBe("disallowed");
	});

	it("extracts Crawl-delay", () => {
		const info = parseRobotsTxt("https://example.com", robotsTxtContent);
		expect(info.crawlDelay).toBe(2);
	});

	it("handles null content", () => {
		const info = parseRobotsTxt("https://example.com", null);
		expect(info.raw).toBeNull();
		expect(info.crawlDelay).toBeNull();
	});
});
