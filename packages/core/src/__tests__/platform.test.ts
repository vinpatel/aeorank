import { describe, expect, it } from "vitest";
import { detectPlatformFromHtml } from "../scanner/platform.js";
import { parsePage } from "../scanner/parser.js";

describe("detectPlatformFromHtml", () => {
	it("labels Webflow from data-wf attributes", () => {
		const html = `<html data-wf-domain="mindtrades.com" data-wf-site="abc123"><body>Hello</body></html>`;
		expect(detectPlatformFromHtml(html)).toBe("Webflow");
	});

	it("does not label Webflow as WordPress when copy mentions WordPress", () => {
		const html = `<html data-wf-site="abc"><body><p>We migrated off WordPress last year.</p></body></html>`;
		expect(detectPlatformFromHtml(html)).toBe("Webflow");
	});

	it("labels WordPress from /wp-content/ asset paths, not body copy", () => {
		const html = `<html><head><link href="/wp-content/themes/twentytwenty/style.css"></head><body></body></html>`;
		expect(detectPlatformFromHtml(html)).toBe("WordPress");
	});

	it("does not treat the word WordPress in body text as a platform signal", () => {
		const html = `<html><body><p>Compared to WordPress, this stack is simpler.</p></body></html>`;
		expect(detectPlatformFromHtml(html)).toBeNull();
	});

	it("labels Next.js from __NEXT_DATA__", () => {
		const html = `<html><script id="__NEXT_DATA__" type="application/json">{}</script></html>`;
		expect(detectPlatformFromHtml(html)).toBe("Next.js");
	});
});

describe("parsePage platformHint", () => {
	it("attaches Webflow from raw HTML", () => {
		const page = parsePage(
			"https://www.mindtrades.com/",
			`<html data-wf-domain="www.mindtrades.com"><head></head><body><h1>Home</h1></body></html>`,
			"https://www.mindtrades.com",
		);
		expect(page.platformHint).toBe("Webflow");
	});
});
