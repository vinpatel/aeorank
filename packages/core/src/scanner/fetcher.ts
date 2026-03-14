import pLimit from "p-limit";
import type { ScanConfig } from "../types.js";
import { DEFAULT_CONFIG } from "../constants.js";

export interface FetchResult {
	html: string;
	status: number;
	headers: Record<string, string>;
	responseTimeMs: number;
}

export type FetcherFn = (url: string) => Promise<FetchResult>;

const MAX_RETRIES = 3;
const RETRY_CODES = new Set([429, 503]);

/** Create a rate-limited fetcher function */
export function createFetcher(
	config: Partial<ScanConfig> = {},
	crawlDelay = 0,
): FetcherFn {
	const mergedConfig = { ...DEFAULT_CONFIG, ...config };
	const limit = pLimit(mergedConfig.concurrency);

	const delay = Math.max(crawlDelay * 1000, 0);

	return (url: string) =>
		limit(async () => {
			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
				try {
					const start = performance.now();
					const response = await fetch(url, {
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
