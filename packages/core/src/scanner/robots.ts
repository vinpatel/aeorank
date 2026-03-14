import robotsParserModule from "robots-parser";

// robots-parser exports a default function but types have declare module wrapper
const robotsParser = robotsParserModule as unknown as (
	url: string,
	content: string,
) => {
	isAllowed(url: string, ua?: string): boolean | undefined;
	getCrawlDelay(ua?: string): number | undefined;
	getSitemaps(): string[];
};
import { AI_CRAWLERS } from "../constants.js";

export interface RobotsInfo {
	raw: string | null;
	crawlerAccess: Record<string, "allowed" | "disallowed" | "unknown">;
	crawlDelay: number | null;
}

/** Parse a robots.txt string and check AI crawler access */
export function parseRobotsTxt(url: string, content: string | null): RobotsInfo {
	if (!content) {
		return {
			raw: null,
			crawlerAccess: Object.fromEntries(AI_CRAWLERS.map((c) => [c, "unknown" as const])),
			crawlDelay: null,
		};
	}

	const robotsUrl = new URL("/robots.txt", url).toString();
	const robots = robotsParser(robotsUrl, content);

	const testUrl = new URL("/", url).toString();
	const crawlerAccess: Record<string, "allowed" | "disallowed" | "unknown"> = {};
	for (const crawler of AI_CRAWLERS) {
		const isAllowed = robots.isAllowed(testUrl, crawler);
		if (isAllowed === true) {
			crawlerAccess[crawler] = "allowed";
		} else if (isAllowed === false) {
			crawlerAccess[crawler] = "disallowed";
		} else {
			crawlerAccess[crawler] = "unknown";
		}
	}

	// Extract Crawl-delay
	const crawlDelayMatch = content.match(/Crawl-delay:\s*(\d+)/i);
	const crawlDelay = crawlDelayMatch ? Number.parseInt(crawlDelayMatch[1], 10) : null;

	return {
		raw: content,
		crawlerAccess,
		crawlDelay,
	};
}
