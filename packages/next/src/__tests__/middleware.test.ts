import { describe, it, expect } from "vitest";
import { serveAeoFile } from "../middleware.js";

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

describe("serveAeoFile", () => {
	it("returns a function", () => {
		const handler = serveAeoFile("llms.txt", testConfig);
		expect(handler).toBeTypeOf("function");
	});

	it("returned function returns a Response", () => {
		const handler = serveAeoFile("llms.txt", testConfig);
		const response = handler();
		expect(response).toBeInstanceOf(Response);
	});

	it("response status is 200 for valid file", () => {
		const handler = serveAeoFile("llms.txt", testConfig);
		const response = handler();
		expect(response.status).toBe(200);
	});

	it("response has correct content-type for text files", () => {
		const handler = serveAeoFile("llms.txt", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
	});

	it("response has correct content-type for CLAUDE.md", () => {
		const handler = serveAeoFile("CLAUDE.md", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
	});

	it("response has correct content-type for JSON", () => {
		const handler = serveAeoFile("schema.json", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe("application/ld+json; charset=utf-8");
	});

	it("response has correct content-type for XML", () => {
		const handler = serveAeoFile("sitemap-ai.xml", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
	});

	it("response has correct content-type for HTML", () => {
		const handler = serveAeoFile("faq-blocks.html", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
	});

	it("response has Cache-Control header", () => {
		const handler = serveAeoFile("llms.txt", testConfig);
		const response = handler();
		const cacheControl = response.headers.get("Cache-Control");
		expect(cacheControl).toBeTruthy();
		expect(cacheControl).toContain("public");
		expect(cacheControl).toContain("max-age=");
	});

	it("returns 404 for unknown file", () => {
		const handler = serveAeoFile("nonexistent.txt" as never, testConfig);
		const response = handler();
		expect(response.status).toBe(404);
	});
});
