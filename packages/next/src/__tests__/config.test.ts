import { describe, it, expect } from "vitest";
import { withAeorank } from "../config.js";

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

describe("withAeorank", () => {
	it("returns a function", () => {
		const wrapper = withAeorank(testConfig);
		expect(wrapper).toBeTypeOf("function");
	});

	it("returned function wraps next config", () => {
		const wrapper = withAeorank(testConfig);
		const nextConfig = { reactStrictMode: true };
		const result = wrapper(nextConfig);
		expect(result).toBeDefined();
		expect(typeof result).toBe("object");
	});

	it("adds headers function to config", () => {
		const wrapper = withAeorank(testConfig);
		const result = wrapper({});
		expect(result.headers).toBeTypeOf("function");
	});

	it("headers include text/plain for .txt files", async () => {
		const wrapper = withAeorank(testConfig);
		const result = wrapper({});
		const headers = (await (result.headers as () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>)()) as Array<{
			source: string;
			headers: Array<{ key: string; value: string }>;
		}>;

		const txtHeader = headers.find((h) => h.source.includes("llms\\.txt"));
		expect(txtHeader).toBeDefined();
		expect(txtHeader!.headers[0].value).toBe("text/plain; charset=utf-8");
	});

	it("headers include application/ld+json for schema.json", async () => {
		const wrapper = withAeorank(testConfig);
		const result = wrapper({});
		const headers = (await (result.headers as () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>)()) as Array<{
			source: string;
			headers: Array<{ key: string; value: string }>;
		}>;

		const jsonHeader = headers.find((h) => h.source.includes("schema.json"));
		expect(jsonHeader).toBeDefined();
		expect(jsonHeader!.headers[0].value).toBe("application/ld+json; charset=utf-8");
	});

	it("headers include application/xml for sitemap-ai.xml", async () => {
		const wrapper = withAeorank(testConfig);
		const result = wrapper({});
		const headers = (await (result.headers as () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>)()) as Array<{
			source: string;
			headers: Array<{ key: string; value: string }>;
		}>;

		const xmlHeader = headers.find((h) => h.source.includes("sitemap-ai.xml"));
		expect(xmlHeader).toBeDefined();
		expect(xmlHeader!.headers[0].value).toBe("application/xml; charset=utf-8");
	});

	it("preserves existing headers", async () => {
		const wrapper = withAeorank(testConfig);
		const existingHeader = {
			source: "/custom",
			headers: [{ key: "X-Custom", value: "test" }],
		};
		const result = wrapper({
			async headers() {
				return [existingHeader];
			},
		});

		const headers = (await (result.headers as () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>)()) as Array<{
			source: string;
			headers: Array<{ key: string; value: string }>;
		}>;

		const customHeader = headers.find((h) => h.source === "/custom");
		expect(customHeader).toBeDefined();
		expect(customHeader!.headers[0].key).toBe("X-Custom");
		// Also verify AEO headers are still present
		expect(headers.length).toBeGreaterThan(1);
	});

	it("preserves existing next config properties", () => {
		const wrapper = withAeorank(testConfig);
		const result = wrapper({
			reactStrictMode: true,
			images: { domains: ["example.com"] },
		});

		expect((result as Record<string, unknown>).reactStrictMode).toBe(true);
		expect((result as Record<string, unknown>).images).toEqual({
			domains: ["example.com"],
		});
	});
});
