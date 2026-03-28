import pLimit from "p-limit";
import { DEFAULT_CONFIG, MAX_CRAWL_DELAY, SCAN_TIME_BUDGET_MS } from "../constants.js";
import type { ScanConfig, ScanMeta, ScanResult, ScannedPage } from "../types.js";
import { discoverUrls } from "./discovery.js";
import { type FetcherFn, createFetcher } from "./fetcher.js";
import { parsePage } from "./parser.js";
import { parseRobotsTxt } from "./robots.js";

export { parsePage } from "./parser.js";
export { parseRobotsTxt } from "./robots.js";
export type { RobotsInfo } from "./robots.js";
export { createFetcher } from "./fetcher.js";
export type { FetcherFn, FetchResult } from "./fetcher.js";
export { discoverUrls } from "./discovery.js";
export { createPlaywrightFetcher } from "./playwright-fetcher.js";

/** Scan a URL and return raw pages + metadata (no scoring or file generation) */
export async function scanUrl(
	url: string,
	config?: Partial<ScanConfig>,
	customFetcher?: FetcherFn,
): Promise<{ pages: ScannedPage[]; meta: ScanMeta }> {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config };
	const startTime = performance.now();
	const origin = new URL(url).origin;

	// Step 1: Fetch and parse robots.txt
	let robotsContent: string | null = null;
	const fetcher = customFetcher ?? createFetcher(mergedConfig);

	try {
		const robotsResult = await fetcher(`${origin}/robots.txt`);
		if (robotsResult.status === 200) {
			robotsContent = robotsResult.html;
		}
	} catch {
		// No robots.txt available
	}

	const robotsInfo = parseRobotsTxt(url, robotsContent);

	// Step 2: Create rate-limited fetcher (respecting Crawl-delay, capped)
	const rawCrawlDelay =
		mergedConfig.respectCrawlDelay && robotsInfo.crawlDelay ? robotsInfo.crawlDelay : 0;
	const crawlDelay = Math.min(rawCrawlDelay, MAX_CRAWL_DELAY);
	const scanFetcher = customFetcher ?? createFetcher(mergedConfig, crawlDelay);

	// Step 3: Check for existing llms.txt
	let existingLlmsTxt: string | null = null;
	try {
		const llmsResult = await scanFetcher(`${origin}/llms.txt`);
		if (llmsResult.status === 200 && llmsResult.html.startsWith("#")) {
			existingLlmsTxt = llmsResult.html;
		}
	} catch {
		// No llms.txt
	}

	// Step 3b: Check for ai.txt
	let aiTxt: string | null = null;
	try {
		const aiTxtResult = await scanFetcher(`${origin}/ai.txt`);
		if (aiTxtResult.status === 200 && aiTxtResult.html.trim().length > 0) {
			aiTxt = aiTxtResult.html;
		}
	} catch {
		// No ai.txt
	}

	// Step 4: Discover URLs (returns cached pages from BFS crawl)
	// Cap maxPages based on time budget when crawl delay is active
	let effectiveMaxPages = mergedConfig.maxPages;
	if (crawlDelay > 0) {
		const avgFetchMs = (mergedConfig.timeout / 2) + (crawlDelay * 1000);
		const pagesPerBatch = mergedConfig.concurrency;
		const batchTime = avgFetchMs;
		const maxBatches = Math.floor(SCAN_TIME_BUDGET_MS / batchTime);
		effectiveMaxPages = Math.min(effectiveMaxPages, Math.max(maxBatches * pagesPerBatch, 10));
	}
	const { urls, cachedPages, sitemapLastmods } = await discoverUrls(url, scanFetcher, effectiveMaxPages);

	// Step 5: Fetch remaining pages concurrently (skip already-cached ones)
	const pages: ScannedPage[] = [...cachedPages.values()];
	let totalResponseTime = 0;

	const uncachedUrls = urls.filter((u) => !cachedPages.has(u));
	const limit = pLimit(mergedConfig.concurrency);
	const totalPages = uncachedUrls.length + cachedPages.size;
	let fetchedCount = cachedPages.size;

	mergedConfig.onProgress?.(5, `Discovered ${totalPages} pages`);

	const fetchResults = await Promise.all(
		uncachedUrls.map((pageUrl) =>
			limit(async () => {
				try {
					const result = await scanFetcher(pageUrl);
					totalResponseTime += result.responseTimeMs;
					fetchedCount++;
					const pct = Math.round((fetchedCount / totalPages) * 75) + 5;
					mergedConfig.onProgress?.(pct, `Scanning page ${fetchedCount}/${totalPages}`);
					if (result.status === 200 && result.html) {
						return parsePage(pageUrl, result.html, origin);
					}
				} catch {
					fetchedCount++;
					// Skip failed pages
				}
				return null;
			}),
		),
	);

	for (const page of fetchResults) {
		if (page) pages.push(page);
	}

	// Sort pages by URL for deterministic output
	pages.sort((a, b) => a.url.localeCompare(b.url));

	// Detect platform
	const platform = detectPlatform(pages);

	const meta: ScanMeta = {
		url,
		robotsTxt: {
			raw: robotsContent,
			crawlerAccess: robotsInfo.crawlerAccess,
			crawlDelay: robotsInfo.crawlDelay,
		},
		sitemapXml: null,
		existingLlmsTxt,
		platform,
		responseTimeMs: totalResponseTime,
		aiTxt,
		sitemapLastmods,
	};

	return { pages, meta };
}

function detectPlatform(pages: ScannedPage[]): string | null {
	for (const page of pages) {
		const html = page.bodyText + page.links.map((l) => l.href).join(" ");
		if (html.includes("wp-content") || html.includes("WordPress")) return "WordPress";
		if (html.includes("_next") || html.includes("__next")) return "Next.js";
		if (html.includes("__nuxt")) return "Nuxt";
		if (html.includes("astro")) return "Astro";
		if (html.includes("gatsby")) return "Gatsby";
	}
	return null;
}
