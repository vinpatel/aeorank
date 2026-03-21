import { normalizeUrl } from "../utils.js";
import type { FetcherFn } from "./fetcher.js";
import { parsePage } from "./parser.js";
import type { ScannedPage } from "../types.js";

const SKIP_EXTENSIONS = new Set([
	".xml",
	".json",
	".pdf",
	".zip",
	".png",
	".jpg",
	".jpeg",
	".gif",
	".svg",
	".css",
	".js",
	".woff",
	".woff2",
	".ttf",
	".ico",
]);

const SKIP_PATHS = ["/wp-admin", "/cdn-cgi", "/api/", "/_next/", "/__nuxt/", "/admin/"];

export interface DiscoveryResult {
	urls: string[];
	/** Pages already fetched and parsed during discovery (avoids double-fetching) */
	cachedPages: Map<string, ScannedPage>;
}

/** Discover URLs from a starting URL using sitemap and internal links */
export async function discoverUrls(
	startUrl: string,
	fetcher: FetcherFn,
	maxPages: number,
): Promise<DiscoveryResult> {
	const origin = new URL(startUrl).origin;
	const discovered = new Set<string>();
	const queue: string[] = [];
	const cachedPages = new Map<string, ScannedPage>();

	discovered.add(normalizeUrl(startUrl));

	// Step 1: Try to parse sitemap.xml (with sitemap index support)
	try {
		const sitemapUrl = `${origin}/sitemap.xml`;
		const result = await fetcher(sitemapUrl);
		if (result.status === 200) {
			let sitemapUrls: string[] = [];

			if (result.html.includes("<sitemapindex")) {
				// Sitemap index — fetch each sub-sitemap
				const subSitemapUrls = extractSitemapUrls(result.html);
				for (const subUrl of subSitemapUrls) {
					if (discovered.size >= maxPages) break;
					try {
						const subResult = await fetcher(subUrl);
						if (subResult.status === 200 && subResult.html.includes("<urlset")) {
							sitemapUrls.push(...extractSitemapUrls(subResult.html));
						}
					} catch {
						// Skip failed sub-sitemaps
					}
				}
			} else if (result.html.includes("<urlset")) {
				sitemapUrls = extractSitemapUrls(result.html);
			}

			for (const url of sitemapUrls) {
				const normalized = normalizeUrl(url);
				if (normalized.startsWith(origin) && !discovered.has(normalized) && shouldCrawl(normalized)) {
					discovered.add(normalized);
					if (discovered.size >= maxPages) break;
				}
			}
		}
	} catch {
		// Sitemap not available, continue with crawl
	}

	// Step 2: Start BFS from start URL (only if sitemap didn't fill quota)
	if (discovered.size < maxPages) {
		queue.push(normalizeUrl(startUrl));
	}

	while (queue.length > 0 && discovered.size < maxPages) {
		const url = queue.shift();
		if (!url) break;

		try {
			const result = await fetcher(url);
			if (result.status !== 200 || !result.html) continue;

			const page = parsePage(url, result.html, origin);
			// Cache the parsed page so scanUrl doesn't re-fetch it
			cachedPages.set(url, page);

			for (const link of page.links) {
				if (!link.internal) continue;
				const normalized = normalizeUrl(link.href);
				if (discovered.has(normalized)) continue;
				if (!shouldCrawl(normalized)) continue;

				discovered.add(normalized);
				queue.push(normalized);
				if (discovered.size >= maxPages) break;
			}
		} catch {
			// Skip failed pages
		}
	}

	return { urls: [...discovered].sort(), cachedPages };
}

function shouldCrawl(url: string): boolean {
	try {
		const parsed = new URL(url);
		const path = parsed.pathname.toLowerCase();

		// Skip non-HTML extensions
		for (const ext of SKIP_EXTENSIONS) {
			if (path.endsWith(ext)) return false;
		}

		// Skip known non-content paths
		for (const skipPath of SKIP_PATHS) {
			if (path.startsWith(skipPath)) return false;
		}

		// Skip fragments and query-heavy URLs
		if (parsed.hash) return false;

		return true;
	} catch {
		return false;
	}
}

function extractSitemapUrls(xml: string): string[] {
	const urls: string[] = [];
	const locRegex = /<loc>\s*(.*?)\s*<\/loc>/g;
	let match = locRegex.exec(xml);
	while (match) {
		urls.push(match[1]);
		match = locRegex.exec(xml);
	}
	return urls;
}
