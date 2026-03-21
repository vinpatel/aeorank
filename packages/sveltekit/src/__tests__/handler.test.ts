import { describe, it, expect } from "vitest";
import { createAeoHandler } from "../handler.js";

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

describe("createAeoHandler", () => {
	it("returns a function", () => {
		const handler = createAeoHandler("llms.txt", testConfig);
		expect(handler).toBeTypeOf("function");
	});

	it("returned function returns a Response object", () => {
		const handler = createAeoHandler("llms.txt", testConfig);
		const response = handler();
		expect(response).toBeInstanceOf(Response);
	});

	it("response has status 200 for valid file", () => {
		const handler = createAeoHandler("llms.txt", testConfig);
		const response = handler();
		expect(response.status).toBe(200);
	});

	it('response has correct Content-Type for "llms.txt"', () => {
		const handler = createAeoHandler("llms.txt", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe(
			"text/plain; charset=utf-8",
		);
	});

	it('response has correct Content-Type for "schema.json"', () => {
		const handler = createAeoHandler("schema.json", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe(
			"application/ld+json; charset=utf-8",
		);
	});

	it('response has correct Content-Type for "sitemap-ai.xml"', () => {
		const handler = createAeoHandler("sitemap-ai.xml", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe(
			"application/xml; charset=utf-8",
		);
	});

	it('response has correct Content-Type for "faq-blocks.html"', () => {
		const handler = createAeoHandler("faq-blocks.html", testConfig);
		const response = handler();
		expect(response.headers.get("Content-Type")).toBe(
			"text/html; charset=utf-8",
		);
	});

	it("response has Cache-Control header", () => {
		const handler = createAeoHandler("llms.txt", testConfig);
		const response = handler();
		expect(response.headers.get("Cache-Control")).toBeTruthy();
		expect(response.headers.get("Cache-Control")).toContain("public");
	});

	it("returns 404 for unknown filename", () => {
		const handler = createAeoHandler(
			"nonexistent.txt" as never,
			testConfig,
		);
		const response = handler();
		expect(response.status).toBe(404);
	});
});
