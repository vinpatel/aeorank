import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	parseAeorankConfig,
	parseSiteUrlFromConfig,
	parseHomepageFromPackageJson,
} from "./detect-site-url";

// ─── Unit tests for individual parsers ─────────────────────────────

describe("parseAeorankConfig", () => {
	it("extracts url from valid .aeorank JSON", () => {
		expect(parseAeorankConfig('{"url": "https://example.com"}')).toBe("https://example.com");
	});

	it("returns null for missing url field", () => {
		expect(parseAeorankConfig('{"name": "test"}')).toBeNull();
	});

	it("returns null for non-http url", () => {
		expect(parseAeorankConfig('{"url": "ftp://example.com"}')).toBeNull();
	});

	it("returns null for malformed JSON", () => {
		expect(parseAeorankConfig("{not valid json}")).toBeNull();
	});

	it("returns null for empty string", () => {
		expect(parseAeorankConfig("")).toBeNull();
	});

	it("handles url with trailing path", () => {
		expect(parseAeorankConfig('{"url": "https://example.com/docs"}')).toBe(
			"https://example.com/docs",
		);
	});
});

describe("parseSiteUrlFromConfig", () => {
	it("extracts siteUrl with double quotes", () => {
		const config = 'export default { siteUrl: "https://mysite.com" };';
		expect(parseSiteUrlFromConfig(config)).toBe("https://mysite.com");
	});

	it("extracts siteUrl with single quotes", () => {
		const config = "export default { siteUrl: 'https://mysite.com' };";
		expect(parseSiteUrlFromConfig(config)).toBe("https://mysite.com");
	});

	it("extracts site_url (underscore variant)", () => {
		const config = 'const config = { site_url: "https://mysite.com" };';
		expect(parseSiteUrlFromConfig(config)).toBe("https://mysite.com");
	});

	it("extracts url field starting with http", () => {
		const config = 'export default { url: "https://mysite.com" };';
		expect(parseSiteUrlFromConfig(config)).toBe("https://mysite.com");
	});

	it("handles extra whitespace around colon", () => {
		const config = 'export default { siteUrl :  "https://mysite.com" };';
		expect(parseSiteUrlFromConfig(config)).toBe("https://mysite.com");
	});

	it("returns null for config without URL", () => {
		const config = "export default { name: 'My Site' };";
		expect(parseSiteUrlFromConfig(config)).toBeNull();
	});

	it("returns null for non-http url field", () => {
		const config = 'export default { url: "/relative/path" };';
		expect(parseSiteUrlFromConfig(config)).toBeNull();
	});

	it("handles withAeorank pattern", () => {
		const config = `import { withAeorank } from "@aeorank/next";
export default withAeorank({
  siteName: "My Site",
  siteUrl: "https://example.com",
  description: "My description",
});`;
		expect(parseSiteUrlFromConfig(config)).toBe("https://example.com");
	});
});

describe("parseHomepageFromPackageJson", () => {
	it("extracts homepage URL", () => {
		expect(
			parseHomepageFromPackageJson('{"name":"test","homepage":"https://example.com"}'),
		).toBe("https://example.com");
	});

	it("returns null for missing homepage", () => {
		expect(parseHomepageFromPackageJson('{"name":"test"}')).toBeNull();
	});

	it("returns null for non-http homepage", () => {
		expect(
			parseHomepageFromPackageJson('{"name":"test","homepage":"./index.html"}'),
		).toBeNull();
	});

	it("returns null for malformed JSON", () => {
		expect(parseHomepageFromPackageJson("not json")).toBeNull();
	});

	it("handles http:// URLs", () => {
		expect(
			parseHomepageFromPackageJson('{"homepage":"http://localhost:3000"}'),
		).toBe("http://localhost:3000");
	});
});

// ─── Integration test for detectSiteUrl (mocked fetch) ─────────────

describe("detectSiteUrl priority order", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("returns null when no files exist", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

		const { detectSiteUrl } = await import("./detect-site-url");
		const url = await detectSiteUrl({ token: "test", owner: "o", repo: "r" });
		expect(url).toBeNull();

		globalThis.fetch = originalFetch;
	});

	it(".aeorank takes priority over CNAME", async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes("/.aeorank")) {
				return Promise.resolve({
					ok: true,
					text: () => Promise.resolve('{"url": "https://from-aeorank.com"}'),
				});
			}
			if (url.includes("/CNAME")) {
				return Promise.resolve({
					ok: true,
					text: () => Promise.resolve("from-cname.com"),
				});
			}
			return Promise.resolve({ ok: false, status: 404 });
		});

		const { detectSiteUrl } = await import("./detect-site-url");
		const url = await detectSiteUrl({ token: "test", owner: "o", repo: "r" });
		expect(url).toBe("https://from-aeorank.com");

		globalThis.fetch = originalFetch;
	});

	it("falls back to CNAME when .aeorank and config missing", async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes("/CNAME")) {
				return Promise.resolve({
					ok: true,
					text: () => Promise.resolve("mysite.github.io"),
				});
			}
			return Promise.resolve({ ok: false, status: 404 });
		});

		const { detectSiteUrl } = await import("./detect-site-url");
		const url = await detectSiteUrl({ token: "test", owner: "o", repo: "r" });
		expect(url).toBe("https://mysite.github.io");

		globalThis.fetch = originalFetch;
	});

	it("falls back to package.json homepage when others missing", async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes("/package.json")) {
				return Promise.resolve({
					ok: true,
					text: () =>
						Promise.resolve('{"name":"test","homepage":"https://pkg-homepage.com"}'),
				});
			}
			return Promise.resolve({ ok: false, status: 404 });
		});

		const { detectSiteUrl } = await import("./detect-site-url");
		const url = await detectSiteUrl({ token: "test", owner: "o", repo: "r" });
		expect(url).toBe("https://pkg-homepage.com");

		globalThis.fetch = originalFetch;
	});
});
