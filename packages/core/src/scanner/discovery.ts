import { normalizeUrl } from "../utils.js";
import type { FetcherFn } from "./fetcher.js";
import { parsePage } from "./parser.js";

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

/** Discover URLs from a starting URL using sitemap and internal links */
export async function discoverUrls(
	startUrl: string,
	fetcher: FetcherFn,
	maxPages: number,
): Promise<string[]> {
	const origin = new URL(startUrl).origin;
	const discovered = new Set<string>();
	const queue: string[] = [];

	discovered.add(normalizeUrl(startUrl));

	// Step 1: Try to parse sitemap.xml
	try {
		const sitemapUrl = `${origin}/sitemap.xml`;
		const result = await fetcher(sitemapUrl);
		if (result.status === 200 && result.html.includes("<urlset")) {
			const urls = extractSitemapUrls(result.html);
			for (const url of urls) {
				const normalized = normalizeUrl(url);
				if (normalized.startsWith(origin) && !discovered.has(normalized)) {
					discovered.add(normalized);
					if (discovered.size >= maxPages) break;
				}
			}
		}
	} catch {
		// Sitemap not available, continue with crawl
	}

	// Step 2: Start BFS from start URL
	queue.push(normalizeUrl(startUrl));

	while (queue.length > 0 && discovered.size < maxPages) {
		const url = queue.shift();
		if (!url) break;

		try {
			const result = await fetcher(url);
			if (result.status !== 200 || !result.html) continue;

			const page = parsePage(url, result.html, origin);
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

	return [...discovered].sort();
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
