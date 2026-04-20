import pLimit from "p-limit";
import { DEFAULT_CONFIG } from "../constants.js";
import type { ScanConfig } from "../types.js";

export interface FetchResult {
	html: string;
	status: number;
	headers: Record<string, string>;
	responseTimeMs: number;
}

export type FetcherFn = (url: string) => Promise<FetchResult>;

const MAX_RETRIES = 3;
const RETRY_CODES = new Set([429, 503]);

// SSRF defense: validate URL before fetching. Only allow http/https, and
// (unless opted out) block requests to loopback / link-local / RFC1918
// address literals so a user-supplied URL can't be used to reach internal
// metadata services or intranet hosts.
const PRIVATE_HOSTNAME_RES: readonly RegExp[] = [
	/^localhost$/i,
	/\.localhost$/i,
	/^127\./,
	/^10\./,
	/^192\.168\./,
	/^172\.(1[6-9]|2\d|3[01])\./,
	/^169\.254\./,
	/^0\./,
	/^\[::1\]$/,
	/^\[::\]$/,
	/^\[fc[0-9a-f]{2}:/i,
	/^\[fd[0-9a-f]{2}:/i,
	/^\[fe[89ab][0-9a-f]:/i,
];

function assertFetchableUrl(rawUrl: string, allowPrivate: boolean): string {
	let parsed: URL;
	try {
		parsed = new URL(rawUrl);
	} catch {
		throw new Error(`Invalid URL: ${rawUrl}`);
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error(`Unsupported protocol: ${parsed.protocol}`);
	}
	if (!allowPrivate) {
		const host = parsed.hostname.toLowerCase();
		for (const re of PRIVATE_HOSTNAME_RES) {
			if (re.test(host) || re.test(`[${host}]`)) {
				throw new Error(`Private/loopback addresses are not allowed: ${host}`);
			}
		}
	}
	return parsed.toString();
}

/** Create a rate-limited fetcher function */
export function createFetcher(config: Partial<ScanConfig> = {}, crawlDelay = 0): FetcherFn {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config };
	const limit = pLimit(mergedConfig.concurrency);

	const delay = Math.max(crawlDelay * 1000, 0);
	const allowPrivate = mergedConfig.allowPrivateHosts ?? false;

	return (url: string) =>
		limit(async () => {
			let safeUrl: string;
			try {
				safeUrl = assertFetchableUrl(url, allowPrivate);
			} catch {
				return { html: "", status: 0, headers: {}, responseTimeMs: 0 };
			}

			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
				try {
					const start = performance.now();
					const response = await fetch(safeUrl, {
						headers: {
							"User-Agent": mergedConfig.userAgent,
						},
						signal: AbortSignal.timeout(mergedConfig.timeout),
						redirect: "follow",
					});

					const responseTimeMs = Math.round(performance.now() - start);

					if (RETRY_CODES.has(response.status) && attempt < MAX_RETRIES) {
						const backoff = 2 ** attempt * 1000;
						await new Promise((resolve) => setTimeout(resolve, backoff));
						continue;
					}

					const html = await response.text();
					const headers: Record<string, string> = {};
					response.headers.forEach((value, key) => {
						headers[key] = value;
					});

					return { html, status: response.status, headers, responseTimeMs };
				} catch {
					if (attempt === MAX_RETRIES) {
						return { html: "", status: 0, headers: {}, responseTimeMs: 0 };
					}
					const backoff = 2 ** attempt * 1000;
					await new Promise((resolve) => setTimeout(resolve, backoff));
				}
			}

			return { html: "", status: 0, headers: {}, responseTimeMs: 0 };
		});
}
