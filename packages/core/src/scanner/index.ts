import pLimit from "p-limit";
import { DEFAULT_CONFIG } from "../constants.js";
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

	// Step 2: Create rate-limited fetcher (respecting Crawl-delay)
	const crawlDelay =
		mergedConfig.respectCrawlDelay && robotsInfo.crawlDelay ? robotsInfo.crawlDelay : 0;
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

	// Step 4: Discover URLs (returns cached pages from BFS crawl)
	const { urls, cachedPages } = await discoverUrls(url, scanFetcher, mergedConfig.maxPages);

	// Step 5: Fetch remaining pages concurrently (skip already-cached ones)
	const pages: ScannedPage[] = [...cachedPages.values()];
	let totalResponseTime = 0;

	const uncachedUrls = urls.filter((u) => !cachedPages.has(u));
	const limit = pLimit(mergedConfig.concurrency);

	const fetchResults = await Promise.all(
		uncachedUrls.map((pageUrl) =>
			limit(async () => {
				try {
					const result = await scanFetcher(pageUrl);
					totalResponseTime += result.responseTimeMs;
					if (result.status === 200 && result.html) {
						return parsePage(pageUrl, result.html, origin);
					}
				} catch {
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
