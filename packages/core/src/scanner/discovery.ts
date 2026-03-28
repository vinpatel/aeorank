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
	/** lastmod dates extracted from sitemap.xml entries */
	sitemapLastmods: string[];
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
	const allSitemapLastmods: string[] = [];

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
							allSitemapLastmods.push(...extractSitemapLastmods(subResult.html));
						}
					} catch {
						// Skip failed sub-sitemaps
					}
				}
			} else if (result.html.includes("<urlset")) {
				sitemapUrls = extractSitemapUrls(result.html);
				allSitemapLastmods.push(...extractSitemapLastmods(result.html));
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

	const allUrls = [...discovered].sort();

	// Smart sampling: if we have more URLs than maxPages, stratify by path segment
	const sampled = allUrls.length > maxPages ? smartSample(allUrls, maxPages, startUrl) : allUrls;

	return { urls: sampled, cachedPages, sitemapLastmods: allSitemapLastmods };
}

/**
 * Stratified page sampling — picks a representative subset across URL path segments.
 * Always includes the homepage, then distributes slots proportionally across path buckets.
 */
function smartSample(urls: string[], limit: number, startUrl: string): string[] {
	const origin = new URL(startUrl).origin;
	const homepage = normalizeUrl(origin);

	// Group URLs by their first path segment (e.g., /blog, /products, /)
	const buckets = new Map<string, string[]>();
	for (const url of urls) {
		const path = new URL(url).pathname;
		const segment = path === "/" ? "/" : `/${path.split("/").filter(Boolean)[0]}`;
		if (!buckets.has(segment)) buckets.set(segment, []);
		buckets.get(segment)!.push(url);
	}

	const selected = new Set<string>();

	// Always include homepage
	if (urls.includes(homepage)) {
		selected.add(homepage);
	}

	// Distribute remaining slots proportionally across buckets
	const remaining = limit - selected.size;
	const bucketEntries = [...buckets.entries()];
	const totalUrls = urls.length;

	for (const [, bucketUrls] of bucketEntries) {
		// Proportional allocation (at least 1 per bucket)
		const share = Math.max(1, Math.round((bucketUrls.length / totalUrls) * remaining));
		// Pick evenly spaced URLs from this bucket
		const step = Math.max(1, Math.floor(bucketUrls.length / share));
		for (let i = 0; i < bucketUrls.length && selected.size < limit; i += step) {
			selected.add(bucketUrls[i]);
		}
	}

	return [...selected].sort();
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

function extractSitemapLastmods(xml: string): string[] {
	const dates: string[] = [];
	const lastmodRegex = /<lastmod>\s*(.*?)\s*<\/lastmod>/g;
	let match = lastmodRegex.exec(xml);
	while (match) {
		dates.push(match[1]);
		match = lastmodRegex.exec(xml);
	}
	return dates;
}
