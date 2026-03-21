import { describe, it, expect } from "vitest";
import { createAeoLoader } from "../loader.js";

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

describe("createAeoLoader", () => {
	it("returns a function", () => {
		const loader = createAeoLoader("llms.txt", testConfig);
		expect(loader).toBeTypeOf("function");
	});

	it("returned function returns a Response object", () => {
		const loader = createAeoLoader("llms.txt", testConfig);
		const response = loader();
		expect(response).toBeInstanceOf(Response);
	});

	it("response has status 200 for valid file", () => {
		const loader = createAeoLoader("llms.txt", testConfig);
		const response = loader();
		expect(response.status).toBe(200);
	});

	it('response has correct Content-Type for "llms.txt"', () => {
		const loader = createAeoLoader("llms.txt", testConfig);
		const response = loader();
		expect(response.headers.get("Content-Type")).toBe(
			"text/plain; charset=utf-8",
		);
	});

	it('response has correct Content-Type for "schema.json"', () => {
		const loader = createAeoLoader("schema.json", testConfig);
		const response = loader();
		expect(response.headers.get("Content-Type")).toBe(
			"application/ld+json; charset=utf-8",
		);
	});

	it('response has correct Content-Type for "sitemap-ai.xml"', () => {
		const loader = createAeoLoader("sitemap-ai.xml", testConfig);
		const response = loader();
		expect(response.headers.get("Content-Type")).toBe(
			"application/xml; charset=utf-8",
		);
	});

	it('response has correct Content-Type for "faq-blocks.html"', () => {
		const loader = createAeoLoader("faq-blocks.html", testConfig);
		const response = loader();
		expect(response.headers.get("Content-Type")).toBe(
			"text/html; charset=utf-8",
		);
	});

	it("response has Cache-Control header", () => {
		const loader = createAeoLoader("llms.txt", testConfig);
		const response = loader();
		expect(response.headers.get("Cache-Control")).toBeTruthy();
		expect(response.headers.get("Cache-Control")).toContain("public");
	});

	it("returns 404 for unknown filename", () => {
		const loader = createAeoLoader(
			"nonexistent.txt" as never,
			testConfig,
		);
		const response = loader();
		expect(response.status).toBe(404);
	});
});
