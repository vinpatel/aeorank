import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parsePage } from "../scanner/parser.js";
import { parseRobotsTxt } from "../scanner/robots.js";

const fixturesDir = join(import.meta.dirname, "fixtures");
const sampleHtml = readFileSync(join(fixturesDir, "sample-page.html"), "utf-8");
const robotsTxtContent = readFileSync(join(fixturesDir, "robots.txt"), "utf-8");

describe("parsePage question headings and table/list counts", () => {
	it("extracts question headings starting with 'What'", () => {
		const html = `<html><body><h2>What is AEO?</h2><p>AEO stands for Answer Engine Optimization.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.questionHeadings).toHaveLength(1);
		expect(page.questionHeadings[0]).toEqual({ text: "What is AEO?", level: 2 });
	});

	it("extracts question headings starting with 'How'", () => {
		const html = `<html><body><h3>How do I start?</h3><p>Follow these steps to get started.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.questionHeadings).toHaveLength(1);
		expect(page.questionHeadings[0]).toEqual({ text: "How do I start?", level: 3 });
	});

	it("does not include non-question headings in questionHeadings", () => {
		const html = `<html><body><h2>Getting Started</h2><p>This guide helps you get started.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.questionHeadings).toHaveLength(0);
	});

	it("extracts headings containing question mark as question headings", () => {
		const html = `<html><body><h2>Ready to Begin?</h2><p>Let us help you.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.questionHeadings).toHaveLength(1);
	});

	it("counts tables with thead or th", () => {
		const html = `<html><body><table><thead><tr><th>Name</th></tr></thead><tr><td>Value</td></tr></table><ul><li>Item 1</li><li>Item 2</li></ul></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.tableCount).toBe(1);
		expect(page.listCount).toBe(1);
	});

	it("returns tableCount=0 and listCount=0 when no tables or lists", () => {
		const html = `<html><body><p>No tables or lists here at all.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.tableCount).toBe(0);
		expect(page.listCount).toBe(0);
	});
});

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
		const web = page.schemaOrg.find((s) => (s as Record<string, unknown>)["@type"] === "WebSite");
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
