import { describe, expect, it } from "vitest";
import { renderCrawlerMarkdown, resolveAeoCheck } from "./github-check";

describe("resolveAeoCheck", () => {
	it("fails the Check when GPTBot is blocked even if the score is high", () => {
		const check = resolveAeoCheck({
			score: 92,
			grade: "A",
			url: "https://example.com",
			crawlerGate: { failed: true, blockedBots: ["GPTBot"] },
		});
		expect(check.conclusion).toBe("failure");
		expect(check.title).toContain("GPTBot");
		expect(check.summary).toContain("GPTBot");
	});

	it("does not fail on unknown (missing robots.txt)", () => {
		const check = resolveAeoCheck({
			score: 80,
			grade: "B",
			url: "https://example.com",
			crawlerGate: { failed: false, blockedBots: [] },
		});
		expect(check.conclusion).toBe("success");
		expect(check.title).toContain("80/100");
	});

	it("uses the score bands when no crawler is blocked", () => {
		expect(resolveAeoCheck({ score: 30, grade: "F", url: "https://x.com" }).conclusion).toBe(
			"failure",
		);
		expect(resolveAeoCheck({ score: 50, grade: "D", url: "https://x.com" }).conclusion).toBe(
			"neutral",
		);
	});
});

describe("renderCrawlerMarkdown", () => {
	it("leads with a per-bot allow/block/unknown table", () => {
		const md = renderCrawlerMarkdown(
			{ GPTBot: "block", ClaudeBot: "allow", PerplexityBot: "unknown", "Google-Extended": "allow" },
			{ robotsTxt: "present", blockedBots: ["GPTBot"] },
		);
		expect(md).toContain("AI Crawler Access");
		expect(md).toContain("| GPTBot | block |");
		expect(md).toContain("| ClaudeBot | allow |");
		expect(md).toContain("| PerplexityBot | unknown |");
		expect(md).toContain("GPTBot");
	});
});
