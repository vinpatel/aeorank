import pLimit from "p-limit";
import { DEFAULT_CONFIG } from "../constants.js";
import type { ScanConfig } from "../types.js";
import type { FetchResult, FetcherFn } from "./fetcher.js";

/**
 * Creates a Playwright-based fetcher that renders JavaScript before returning HTML.
 * Useful for SPAs (React, Vue, Angular) where content is client-side rendered.
 *
 * Requires `playwright` as a peer dependency:
 *   npm install playwright
 */
export async function createPlaywrightFetcher(
	config: Partial<ScanConfig> = {},
	crawlDelay = 0,
): Promise<{ fetcher: FetcherFn; cleanup: () => Promise<void> }> {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config };
	const limit = pLimit(Math.min(mergedConfig.concurrency, 3)); // Browser tabs are heavier
	const delay = Math.max(crawlDelay * 1000, 0);

	// Dynamic import — playwright is an optional peer dependency
	let chromium: typeof import("playwright").chromium;
	try {
		const pw = await import("playwright");
		chromium = pw.chromium;
	} catch {
		throw new Error(
			"Playwright is required for browser-based scanning. Install it with: npm install playwright",
		);
	}

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		userAgent: mergedConfig.userAgent,
		viewport: { width: 1280, height: 720 },
	});

	const fetcher: FetcherFn = (url: string) =>
		limit(async () => {
			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			const page = await context.newPage();
			try {
				const start = performance.now();
				const response = await page.goto(url, {
					waitUntil: "networkidle",
					timeout: mergedConfig.timeout,
				});

				// Wait for any remaining dynamic content
				await page.waitForTimeout(500);

				const html = await page.content();
				const responseTimeMs = Math.round(performance.now() - start);
				const status = response?.status() ?? 0;

				const headers: Record<string, string> = {};
				const responseHeaders = response?.headers() ?? {};
				for (const [key, value] of Object.entries(responseHeaders)) {
					if (typeof value === "string") headers[key] = value;
				}

				return { html, status, headers, responseTimeMs };
			} catch {
				return { html: "", status: 0, headers: {}, responseTimeMs: 0 };
			} finally {
				await page.close();
			}
		});

	const cleanup = async () => {
		await context.close();
		await browser.close();
	};

	return { fetcher, cleanup };
}
