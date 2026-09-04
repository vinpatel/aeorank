import { crawlerBlockCheckCopy } from "@aeorank/core";
import type { CrawlerGate } from "@aeorank/core";

export interface CheckResolution {
	conclusion: "success" | "neutral" | "failure";
	title: string;
	summary: string;
}

/**
 * GitHub Check conclusion for an AEOrank scan.
 * Crawler *block* always fails the Check, even when the overall score is high.
 * Missing robots.txt (unknown) does not fail.
 */
export function resolveAeoCheck(input: {
	score: number;
	grade: string;
	url: string;
	crawlerGate?: Pick<CrawlerGate, "failed" | "blockedBots">;
}): CheckResolution {
	const blocked = input.crawlerGate?.blockedBots ?? [];
	if (input.crawlerGate?.failed || blocked.length > 0) {
		const copy = crawlerBlockCheckCopy(blocked);
		return {
			conclusion: "failure",
			title: copy.title,
			summary: `${copy.summary} Score: ${input.score}/100 (${input.grade}). Scanned: ${input.url}`,
		};
	}

	let conclusion: CheckResolution["conclusion"];
	if (input.score >= 70) conclusion = "success";
	else if (input.score >= 40) conclusion = "neutral";
	else conclusion = "failure";

	return {
		conclusion,
		title: `AEO Score: ${input.score}/100 (${input.grade})`,
		summary: `Your site scored **${input.score}** — Grade **${input.grade}** | Scanned: ${input.url}`,
	};
}

export function renderCrawlerMarkdown(
	crawlerAccess: Record<string, string> | undefined,
	crawlerGate: Pick<CrawlerGate, "robotsTxt" | "blockedBots"> | undefined,
): string {
	const lines = ["### AI Crawler Access", ""];
	if (crawlerGate?.robotsTxt === "missing") {
		lines.push("_robots.txt missing — status **unknown** (not treated as blocked)._");
		lines.push("");
	}
	lines.push("| Bot | Status |");
	lines.push("|-----|--------|");
	const bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
	for (const bot of bots) {
		const raw = crawlerAccess?.[bot] ?? "unknown";
		const status = raw === "allowed" ? "allow" : raw === "disallowed" ? "block" : raw;
		lines.push(`| ${bot} | ${status} |`);
	}
	if (crawlerGate?.blockedBots?.length) {
		lines.push("");
		lines.push(`**Blocked:** ${crawlerGate.blockedBots.join(", ")}`);
	}
	lines.push("");
	return lines.join("\n");
}
