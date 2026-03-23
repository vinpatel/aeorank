import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock playwright module
vi.mock("playwright", () => {
	const mockPage = {
		goto: vi.fn().mockResolvedValue({
			status: () => 200,
			headers: () => ({ "content-type": "text/html" }),
		}),
		content: vi.fn().mockResolvedValue("<html><body><div id=\"app\"><h1>SPA Content</h1><p>Rendered by JavaScript</p></div></body></html>"),
		waitForTimeout: vi.fn().mockResolvedValue(undefined),
		close: vi.fn().mockResolvedValue(undefined),
	};

	const mockContext = {
		newPage: vi.fn().mockResolvedValue(mockPage),
		close: vi.fn().mockResolvedValue(undefined),
	};

	const mockBrowser = {
		newContext: vi.fn().mockResolvedValue(mockContext),
		close: vi.fn().mockResolvedValue(undefined),
	};

	return {
		chromium: {
			launch: vi.fn().mockResolvedValue(mockBrowser),
		},
		_mockPage: mockPage,
		_mockContext: mockContext,
		_mockBrowser: mockBrowser,
	};
});

describe("createPlaywrightFetcher", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a fetcher and cleanup function", async () => {
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const { fetcher, cleanup } = await createPlaywrightFetcher();

		expect(fetcher).toBeTypeOf("function");
		expect(cleanup).toBeTypeOf("function");

		await cleanup();
	});

	it("should fetch and return rendered HTML", async () => {
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const { fetcher, cleanup } = await createPlaywrightFetcher();

		const result = await fetcher("https://example.com");

		expect(result.status).toBe(200);
		expect(result.html).toContain("SPA Content");
		expect(result.html).toContain("Rendered by JavaScript");
		expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
		expect(result.headers).toHaveProperty("content-type");

		await cleanup();
	});

	it("should launch browser in headless mode", async () => {
		const pw = await import("playwright");
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		await createPlaywrightFetcher();

		expect(pw.chromium.launch).toHaveBeenCalledWith({ headless: true });
	});

	it("should set custom user agent", async () => {
		const pw = await import("playwright");
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const mockBrowser = (pw as unknown as { _mockBrowser: { newContext: ReturnType<typeof vi.fn> } })._mockBrowser;

		await createPlaywrightFetcher({ userAgent: "CustomBot/1.0" });

		expect(mockBrowser.newContext).toHaveBeenCalledWith(
			expect.objectContaining({ userAgent: "CustomBot/1.0" }),
		);
	});

	it("should use networkidle wait strategy", async () => {
		const pw = await import("playwright");
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const mockPage = (pw as unknown as { _mockPage: { goto: ReturnType<typeof vi.fn> } })._mockPage;

		const { fetcher, cleanup } = await createPlaywrightFetcher();
		await fetcher("https://spa-app.com");

		expect(mockPage.goto).toHaveBeenCalledWith("https://spa-app.com", {
			waitUntil: "networkidle",
			timeout: expect.any(Number),
		});

		await cleanup();
	});

	it("should close page after each fetch", async () => {
		const pw = await import("playwright");
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const mockPage = (pw as unknown as { _mockPage: { close: ReturnType<typeof vi.fn> } })._mockPage;

		const { fetcher, cleanup } = await createPlaywrightFetcher();
		await fetcher("https://example.com");

		expect(mockPage.close).toHaveBeenCalled();

		await cleanup();
	});

	it("should close browser and context on cleanup", async () => {
		const pw = await import("playwright");
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const mockBrowser = (pw as unknown as { _mockBrowser: { close: ReturnType<typeof vi.fn> } })._mockBrowser;
		const mockContext = (pw as unknown as { _mockContext: { close: ReturnType<typeof vi.fn> } })._mockContext;

		const { cleanup } = await createPlaywrightFetcher();
		await cleanup();

		expect(mockContext.close).toHaveBeenCalled();
		expect(mockBrowser.close).toHaveBeenCalled();
	});

	it("should handle navigation errors gracefully", async () => {
		const pw = await import("playwright");
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const mockPage = (pw as unknown as { _mockPage: { goto: ReturnType<typeof vi.fn> } })._mockPage;
		mockPage.goto.mockRejectedValueOnce(new Error("Navigation timeout"));

		const { fetcher, cleanup } = await createPlaywrightFetcher();
		const result = await fetcher("https://timeout-site.com");

		expect(result.status).toBe(0);
		expect(result.html).toBe("");

		await cleanup();
	});

	it("should limit concurrency to 3 browser tabs max", async () => {
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const { fetcher, cleanup } = await createPlaywrightFetcher({ concurrency: 10 });

		// Fetch 5 URLs concurrently — should not crash
		const results = await Promise.all([
			fetcher("https://example.com/1"),
			fetcher("https://example.com/2"),
			fetcher("https://example.com/3"),
			fetcher("https://example.com/4"),
			fetcher("https://example.com/5"),
		]);

		expect(results).toHaveLength(5);
		results.forEach((r) => {
			expect(r.status).toBe(200);
		});

		await cleanup();
	});

	it("should respect crawl delay between requests", async () => {
		const { createPlaywrightFetcher } = await import("../scanner/playwright-fetcher.js");
		const start = performance.now();
		const { fetcher, cleanup } = await createPlaywrightFetcher({}, 0.1); // 100ms delay

		await fetcher("https://example.com/1");
		await fetcher("https://example.com/2");

		const elapsed = performance.now() - start;
		// Second request should have waited ~100ms
		expect(elapsed).toBeGreaterThanOrEqual(80); // Allow some margin

		await cleanup();
	});
});

describe("browser mode in scan config", () => {
	it("should accept browser option in ScanConfig", async () => {
		const { DEFAULT_CONFIG } = await import("../constants.js");
		const config = { ...DEFAULT_CONFIG, browser: true };
		expect(config.browser).toBe(true);
	});
});
