import { describe, it, expect } from "vitest";
import aeorank from "../index.js";

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

describe("@aeorank/astro default export", () => {
	it("default export is a function", () => {
		expect(aeorank).toBeTypeOf("function");
	});

	it('returns object with name "@aeorank/astro"', () => {
		const integration = aeorank(testConfig);
		expect(integration.name).toBe("@aeorank/astro");
	});

	it("returns object with hooks property", () => {
		const integration = aeorank(testConfig);
		expect(integration.hooks).toBeDefined();
		expect(typeof integration.hooks).toBe("object");
	});

	it('hooks has "astro:config:setup" key', () => {
		const integration = aeorank(testConfig);
		expect(integration.hooks["astro:config:setup"]).toBeDefined();
		expect(integration.hooks["astro:config:setup"]).toBeTypeOf("function");
	});

	it('hooks has "astro:build:done" key', () => {
		const integration = aeorank(testConfig);
		expect(integration.hooks["astro:build:done"]).toBeDefined();
		expect(integration.hooks["astro:build:done"]).toBeTypeOf("function");
	});
});
