import { AI_CRAWLERS } from "@aeorank/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { doctorCommand, renderDoctorReport, runDoctor } from "../commands/doctor.js";

vi.mock("ora", () => ({
	default: () => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
		succeed: vi.fn().mockReturnThis(),
		fail: vi.fn().mockReturnThis(),
		text: "",
	}),
}));

describe("doctor command", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("reports robots blocks, HEAD status, /llms.txt status, and WAF signals per crawler", async () => {
		const fetchMock = makeFetchMock({
			robots: ["User-agent: GPTBot", "Disallow: /", "", "User-agent: ClaudeBot", "Allow: /"].join(
				"\n",
			),
			targetByUserAgent: {
				GPTBot: { status: 403, headers: { "cf-mitigated": "challenge" } },
			},
			llmsByUserAgent: {
				GPTBot: { status: 403 },
			},
		});

		const report = await runDoctor("https://example.com", {
			fetchImpl: fetchMock,
			timeoutMs: 1000,
		});

		expect(report.crawlers).toHaveLength(AI_CRAWLERS.length);

		const gptBot = report.crawlers.find((crawler) => crawler.userAgent === "GPTBot");
		expect(gptBot?.robots).toBe("blocked");
		expect(gptBot?.target.status).toBe(403);
		expect(gptBot?.target.blocked).toBe(true);
		expect(gptBot?.target.wafSignals).toEqual([{ header: "cf-mitigated", value: "challenge" }]);
		expect(gptBot?.llmsTxt.blocked).toBe(true);

		const claudeBot = report.crawlers.find((crawler) => crawler.userAgent === "ClaudeBot");
		expect(claudeBot?.robots).toBe("allowed");
		expect(claudeBot?.target.status).toBe(200);

		expect(report.verdict.status).toBe("fail");
		expect(report.verdict.summary).toContain("1 crawler");
	});

	it("does not flag 404 /llms.txt or 405 HEAD responses as firewall blocks", async () => {
		const fetchMock = makeFetchMock({
			robots: "User-agent: *\nAllow: /",
			defaultTarget: { status: 405 },
			defaultLlms: { status: 404 },
		});

		const report = await runDoctor("https://example.com", {
			fetchImpl: fetchMock,
			timeoutMs: 1000,
		});

		expect(report.verdict.status).toBe("pass");
		for (const crawler of report.crawlers) {
			expect(crawler.robots).toBe("allowed");
			expect(crawler.target.blocked).toBe(false);
			expect(crawler.llmsTxt.blocked).toBe(false);
			expect(crawler.target.wafSignals).toHaveLength(0);
			expect(crawler.llmsTxt.wafSignals).toHaveLength(0);
		}
	});

	it("renders a human-readable table with crawler and WAF details", async () => {
		const report = await runDoctor("https://example.com", {
			fetchImpl: makeFetchMock({
				robots: "User-agent: GPTBot\nDisallow: /",
				targetByUserAgent: {
					GPTBot: { status: 403, headers: { "x-amzn-waf-action": "BLOCK" } },
				},
			}),
			timeoutMs: 1000,
		});

		const output = stripAnsi(renderDoctorReport(report));

		expect(output).toContain("AI crawler doctor");
		expect(output).toContain("Crawler");
		expect(output).toContain("GPTBot");
		expect(output).toContain("robots.txt");
		expect(output).toContain("x-amzn-waf-action=BLOCK");
		expect(output).toContain("Verdict: FAIL");
	});

	it("prints JSON from the command action", async () => {
		vi.stubGlobal(
			"fetch",
			makeFetchMock({
				robots: "User-agent: *\nAllow: /",
				defaultTarget: { status: 200 },
				defaultLlms: { status: 404 },
			}),
		);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await doctorCommand.parseAsync(["node", "doctor", "https://example.com", "--format", "json"]);

		const jsonCall = logSpy.mock.calls.find((call) => {
			try {
				const parsed = JSON.parse(String(call[0]));
				return parsed.url === "https://example.com/";
			} catch {
				return false;
			}
		});

		expect(jsonCall).toBeTruthy();
		const parsed = JSON.parse(String(jsonCall?.[0]));
		expect(parsed.verdict.status).toBe("pass");
		expect(parsed.crawlers).toHaveLength(AI_CRAWLERS.length);
	});
});

interface MockResponseSpec {
	status: number;
	headers?: Record<string, string>;
}

interface MockFetchOptions {
	robots: string | null;
	defaultTarget?: MockResponseSpec;
	defaultLlms?: MockResponseSpec;
	targetByUserAgent?: Record<string, MockResponseSpec>;
	llmsByUserAgent?: Record<string, MockResponseSpec>;
}

function makeFetchMock(options: MockFetchOptions) {
	return vi.fn(async (input: string | URL, init?: RequestInit) => {
		const url = input.toString();
		const method = init?.method ?? "GET";
		const userAgent = getUserAgent(init?.headers);

		if (url === "https://example.com/robots.txt" && method === "GET") {
			if (options.robots === null) {
				return new Response("", { status: 404 });
			}
			return new Response(options.robots, { status: 200 });
		}

		if (url === "https://example.com/" && method === "HEAD") {
			return responseFor(options.targetByUserAgent?.[userAgent] ?? options.defaultTarget);
		}

		if (url === "https://example.com/llms.txt" && method === "HEAD") {
			return responseFor(options.llmsByUserAgent?.[userAgent] ?? options.defaultLlms);
		}

		return new Response("", { status: 404 });
	});
}

function responseFor(spec: MockResponseSpec = { status: 200 }) {
	return new Response("", {
		status: spec.status,
		headers: spec.headers,
	});
}

function getUserAgent(headers: RequestInit["headers"]): string {
	if (!headers) return "";
	if (headers instanceof Headers) return headers.get("User-Agent") ?? "";
	if (Array.isArray(headers)) {
		const entry = headers.find(([key]) => key.toLowerCase() === "user-agent");
		return entry?.[1] ?? "";
	}
	return (headers as Record<string, string>)["User-Agent"] ?? "";
}

function stripAnsi(str: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI stripping requires control chars
	return str.replace(/\x1b\[[0-9;]*m/g, "");
}
