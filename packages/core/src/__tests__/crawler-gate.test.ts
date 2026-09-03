import { describe, expect, it } from "vitest";
import { CRAWLER_GATE_BOTS } from "../constants.js";
import { buildCrawlerReport, crawlerBlockCheckCopy, toPublicCrawlerStatus } from "../crawler-gate.js";
import { parseRobotsTxt } from "../scanner/robots.js";

const ALLOW_ALL = `User-agent: *
Allow: /
`;

const DENY_GPTBOT = `User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /
`;

describe("toPublicCrawlerStatus", () => {
	it("maps allowed → allow, disallowed → block, unknown → unknown", () => {
		expect(toPublicCrawlerStatus("allowed")).toBe("allow");
		expect(toPublicCrawlerStatus("disallowed")).toBe("block");
		expect(toPublicCrawlerStatus("unknown")).toBe("unknown");
		expect(toPublicCrawlerStatus(undefined)).toBe("unknown");
	});
});

describe("robots allow all", () => {
	it("reports allow for every gate bot and does not fail the gate", () => {
		const parsed = parseRobotsTxt("https://example.com", ALLOW_ALL);
		const { crawlerAccess, crawlerGate } = buildCrawlerReport({
			raw: ALLOW_ALL,
			crawlerAccess: parsed.crawlerAccess,
			crawlDelay: null,
		});

		for (const bot of CRAWLER_GATE_BOTS) {
			expect(crawlerAccess[bot]).toBe("allow");
		}
		expect(crawlerGate.failed).toBe(false);
		expect(crawlerGate.blockedBots).toEqual([]);
		expect(crawlerGate.robotsTxt).toBe("present");
	});
});

describe("robots deny GPTBot", () => {
	it("reports block for GPTBot and fails the gate", () => {
		const parsed = parseRobotsTxt("https://example.com", DENY_GPTBOT);
		const { crawlerAccess, crawlerGate } = buildCrawlerReport({
			raw: DENY_GPTBOT,
			crawlerAccess: parsed.crawlerAccess,
			crawlDelay: null,
		});

		expect(crawlerAccess.GPTBot).toBe("block");
		expect(crawlerAccess.ClaudeBot).toBe("allow");
		expect(crawlerGate.failed).toBe(true);
		expect(crawlerGate.blockedBots).toEqual(["GPTBot"]);
	});
});

describe("missing robots (unknown)", () => {
	it("reports unknown for every bot and does not treat 404 as blocked", () => {
		const parsed = parseRobotsTxt("https://example.com", null);
		const { crawlerAccess, crawlerGate } = buildCrawlerReport({
			raw: null,
			crawlerAccess: parsed.crawlerAccess,
			crawlDelay: null,
		});

		for (const bot of CRAWLER_GATE_BOTS) {
			expect(crawlerAccess[bot]).toBe("unknown");
			expect(parsed.crawlerAccess[bot]).toBe("unknown");
		}
		expect(crawlerGate.failed).toBe(false);
		expect(crawlerGate.blockedBots).toEqual([]);
		expect(crawlerGate.unknownBots).toEqual([...CRAWLER_GATE_BOTS]);
		expect(crawlerGate.robotsTxt).toBe("missing");
	});
});

describe("crawlerBlockCheckCopy", () => {
	it("names the blocked bot in the Check title", () => {
		const copy = crawlerBlockCheckCopy(["GPTBot"]);
		expect(copy.title).toContain("GPTBot");
		expect(copy.summary).toContain("GPTBot");
		expect(copy.summary).toContain("fail the PR if GPTBot is blocked");
	});
});
