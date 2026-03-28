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

describe("parsePage semantic elements", () => {
	it("extracts counts for semantic HTML5 elements", () => {
		const html = `<html lang="en"><body>
			<main><p>Main content here for the test page.</p></main>
			<article><p>Article content here for the test page.</p></article>
			<nav><a href="/home">Home</a></nav>
			<aside><p>Sidebar content here for the test page.</p></aside>
			<section><p>Section content here for the test page.</p></section>
			<header><h1>Header here</h1></header>
			<footer><p>Footer here</p></footer>
		</body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.semanticElements.main).toBe(1);
		expect(page.semanticElements.article).toBe(1);
		expect(page.semanticElements.nav).toBe(1);
		expect(page.semanticElements.aside).toBe(1);
		expect(page.semanticElements.section).toBe(1);
		expect(page.semanticElements.header).toBe(1);
		expect(page.semanticElements.footer).toBe(1);
	});

	it("returns zero counts when no semantic elements present", () => {
		const html = `<html><body><div><p>Just div soup content here on the page.</p></div></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.semanticElements.main).toBe(0);
		expect(page.semanticElements.article).toBe(0);
		expect(page.semanticElements.nav).toBe(0);
		expect(page.semanticElements.aside).toBe(0);
		expect(page.semanticElements.section).toBe(0);
		expect(page.semanticElements.header).toBe(0);
		expect(page.semanticElements.footer).toBe(0);
	});

	it("counts ARIA role attributes", () => {
		const html = `<html><body>
			<div role="navigation"><a href="/home">Home</a></div>
			<div role="main"><p>Main content here for the page test.</p></div>
		</body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.ariaRoleCount).toBeGreaterThanOrEqual(2);
	});

	it("returns ariaRoleCount=0 when no ARIA roles present", () => {
		const html = `<html><body><div><p>No ARIA roles here on the page at all.</p></div></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.ariaRoleCount).toBe(0);
	});

	it("counts figure elements containing figcaption", () => {
		const html = `<html><body>
			<figure><img src="chart.png" alt="Revenue chart"><figcaption>Annual revenue growth 2024</figcaption></figure>
			<figure><img src="photo.png" alt="Team photo"><figcaption>Our team at conference</figcaption></figure>
			<figure><img src="bare.png" alt="bare image"></figure>
			<p>Some page content here for the test.</p>
		</body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.figureCount).toBe(2);
	});

	it("returns figureCount=0 when no figure elements with figcaption", () => {
		const html = `<html><body><img src="image.png" alt="test image on the page"><p>Some content here.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.figureCount).toBe(0);
	});

	it("counts total img elements and those with non-empty alt text", () => {
		const html = `<html><body>
			<img src="a.png" alt="First image description">
			<img src="b.png" alt="Second image description">
			<img src="c.png" alt="">
			<p>Some content here for the page test.</p>
		</body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.imgCount).toBe(3);
		expect(page.imgsWithAlt).toBe(2);
	});

	it("returns imgCount=0 and imgsWithAlt=0 when no images", () => {
		const html = `<html><body><p>No images on this page at all in the content.</p></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.imgCount).toBe(0);
		expect(page.imgsWithAlt).toBe(0);
	});

	it("calculates average sentence length from paragraphs", () => {
		// Each sentence is roughly 10 words
		const html = `<html><body>
			<p>This is a sentence with exactly ten words total here. Another sentence with exactly ten words total here.</p>
			<p>One more paragraph with ten words in this one here.</p>
		</body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.avgSentenceLength).toBeGreaterThan(0);
	});

	it("returns avgSentenceLength=0 when no sentences", () => {
		const html = `<html><body></body></html>`;
		const page = parsePage("https://example.com", html, "https://example.com");
		expect(page.avgSentenceLength).toBe(0);
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
