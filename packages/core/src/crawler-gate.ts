import { AI_CRAWLERS, CRAWLER_GATE_BOTS } from "./constants.js";
import type { CrawlerGate, CrawlerInternalStatus, CrawlerPublicStatus, ScanMeta } from "./types.js";

const INTERNAL_TO_PUBLIC: Record<CrawlerInternalStatus, CrawlerPublicStatus> = {
	allowed: "allow",
	disallowed: "block",
	unknown: "unknown",
};

/** Map internal robots-parser status to the public allow/block/unknown vocabulary. */
export function toPublicCrawlerStatus(
	status: CrawlerInternalStatus | undefined,
): CrawlerPublicStatus {
	if (!status) return "unknown";
	return INTERNAL_TO_PUBLIC[status];
}

/**
 * Build the per-bot allow/block/unknown map and CI gate from robots.txt parse results.
 *
 * UNKNOWN (missing robots.txt / no matching rule) is never treated as blocked.
 * The gate fails only when a checked bot is explicitly disallowed.
 */
export function buildCrawlerReport(
	robotsTxt: ScanMeta["robotsTxt"],
	checkedBots: readonly string[] = CRAWLER_GATE_BOTS,
): {
	crawlerAccess: Record<string, CrawlerPublicStatus>;
	crawlerGate: CrawlerGate;
} {
	const crawlerAccess: Record<string, CrawlerPublicStatus> = {};
	for (const bot of AI_CRAWLERS) {
		crawlerAccess[bot] = toPublicCrawlerStatus(robotsTxt.crawlerAccess[bot]);
	}
	// Include any extra keys the parser recorded
	for (const [bot, status] of Object.entries(robotsTxt.crawlerAccess)) {
		if (!(bot in crawlerAccess)) {
			crawlerAccess[bot] = toPublicCrawlerStatus(status);
		}
	}

	const blockedBots = checkedBots.filter((bot) => crawlerAccess[bot] === "block");
	const unknownBots = checkedBots.filter((bot) => crawlerAccess[bot] === "unknown");

	return {
		crawlerAccess,
		crawlerGate: {
			checkedBots: [...checkedBots],
			blockedBots,
			unknownBots,
			failed: blockedBots.length > 0,
			robotsTxt: robotsTxt.raw === null ? "missing" : "present",
		},
	};
}

/** Defaults for ScanResult test fixtures (overridden by `scan()`). */
export function emptyCrawlerScanFields(): {
	crawlerAccess: Record<string, CrawlerPublicStatus>;
	crawlerGate: CrawlerGate;
	dimensionCount: number;
	generatedFiles: string[];
} {
	return {
		crawlerAccess: {},
		crawlerGate: {
			checkedBots: [...CRAWLER_GATE_BOTS],
			blockedBots: [],
			unknownBots: [...CRAWLER_GATE_BOTS],
			failed: false,
			robotsTxt: "missing",
		},
		dimensionCount: 0,
		generatedFiles: [],
	};
}

/** Title + summary for a GitHub Check when the crawler gate fails. */
export function crawlerBlockCheckCopy(blockedBots: string[]): { title: string; summary: string } {
	const names = blockedBots.join(", ");
	const verb = blockedBots.length === 1 ? "is" : "are";
	return {
		title: `${names} blocked in robots.txt`,
		summary: `${names} ${verb} blocked in robots.txt. AEOrank fails the check when GPTBot, ClaudeBot, PerplexityBot, or Google-Extended is disallowed — even if the overall score is high. Use --fail-on-crawler-block to fail the PR if GPTBot is blocked.`,
	};
}
