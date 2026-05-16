import { AI_CRAWLERS, parseRobotsTxt } from "@aeorank/core";
import chalk from "chalk";
import { Command } from "commander";
import { handleError } from "../errors.js";
import { createSpinner } from "../ui/spinner.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const BLOCK_STATUSES = new Set([401, 403, 406, 407, 418, 429, 451, 503, 999]);
const WAF_HEADERS = ["cf-mitigated", "x-amzn-waf-action"] as const;

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type RobotsAccess = "allowed" | "blocked" | "unspecified";
export type VerdictStatus = "pass" | "warn" | "fail";

export interface WafSignal {
	header: (typeof WAF_HEADERS)[number];
	value: string;
}

export interface DoctorHeadResult {
	status: number | null;
	blocked: boolean;
	wafSignals: WafSignal[];
	error?: string;
}

export interface CrawlerDoctorResult {
	userAgent: string;
	robots: RobotsAccess;
	target: DoctorHeadResult;
	llmsTxt: DoctorHeadResult;
}

export interface DoctorReport {
	url: string;
	robotsUrl: string;
	llmsTxtUrl: string;
	crawlers: CrawlerDoctorResult[];
	verdict: {
		status: VerdictStatus;
		summary: string;
	};
}

interface RunDoctorOptions {
	fetchImpl?: FetchLike;
	timeoutMs?: number;
}

export const doctorCommand = new Command("doctor")
	.description("Diagnose AI crawler access, WAF blocks, and /llms.txt reachability")
	.argument("<url>", "URL to diagnose")
	.option("-f, --format <format>", "Output format (human or json)", "human")
	.option("--timeout <ms>", "Per-request timeout in milliseconds", String(DEFAULT_TIMEOUT_MS))
	.action(async (url: string, options: DoctorCommandOptions) => {
		const isJson = options.format === "json";
		const spinner = createSpinner(`Diagnosing ${url}...`, isJson);

		try {
			if (options.format !== "human" && options.format !== "json") {
				throw new Error("Output format must be 'human' or 'json'.");
			}

			const timeoutMs = Number.parseInt(options.timeout, 10);
			if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
				throw new Error("--timeout must be a positive number of milliseconds.");
			}

			spinner.start();
			const report = await runDoctor(url, { timeoutMs });
			spinner.stop();

			if (isJson) {
				console.log(JSON.stringify(report, null, 2));
			} else {
				console.log(renderDoctorReport(report));
			}
		} catch (error) {
			spinner.stop();
			const { message, suggestion } = handleError(error);

			if (isJson) {
				console.log(JSON.stringify({ error: message, suggestion }));
			} else {
				console.error(chalk.red(`Error: ${message}`));
				console.error(suggestion);
			}

			process.exit(1);
		}
	});

export async function runDoctor(
	rawUrl: string,
	options: RunDoctorOptions = {},
): Promise<DoctorReport> {
	const targetUrl = new URL(rawUrl);
	targetUrl.hash = "";

	const robotsUrl = new URL("/robots.txt", targetUrl);
	const llmsTxtUrl = new URL("/llms.txt", targetUrl);
	const fetchImpl = options.fetchImpl ?? fetch;
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	const robotsResponse = await fetchText(fetchImpl, robotsUrl, timeoutMs);
	const robotsContent = robotsResponse.status === 200 ? robotsResponse.body : null;
	const robotsInfo = parseRobotsTxt(targetUrl.toString(), robotsContent);

	const crawlers = await Promise.all(
		AI_CRAWLERS.map(async (crawler) => ({
			userAgent: crawler,
			robots: mapRobotsAccess(robotsInfo.crawlerAccess[crawler]),
			target: await fetchHead(fetchImpl, targetUrl, crawler, timeoutMs),
			llmsTxt: await fetchHead(fetchImpl, llmsTxtUrl, crawler, timeoutMs),
		})),
	);

	return {
		url: targetUrl.toString(),
		robotsUrl: robotsUrl.toString(),
		llmsTxtUrl: llmsTxtUrl.toString(),
		crawlers,
		verdict: buildVerdict(crawlers),
	};
}

export function renderDoctorReport(report: DoctorReport): string {
	const rows = [
		["Crawler", "robots.txt", "Target HEAD", "/llms.txt HEAD", "WAF signal"],
		...report.crawlers.map((crawler) => [
			crawler.userAgent,
			formatRobots(crawler.robots),
			formatHead(crawler.target),
			formatHead(crawler.llmsTxt),
			formatWafSignals([...crawler.target.wafSignals, ...crawler.llmsTxt.wafSignals]),
		]),
	];

	const verdictColor =
		report.verdict.status === "pass"
			? chalk.green
			: report.verdict.status === "warn"
				? chalk.yellow
				: chalk.red;

	return [
		"",
		chalk.bold(`AI crawler doctor: ${report.url}`),
		chalk.dim(`robots.txt: ${report.robotsUrl}`),
		chalk.dim(`llms.txt:   ${report.llmsTxtUrl}`),
		"",
		formatTable(rows),
		"",
		verdictColor.bold(
			`Verdict: ${report.verdict.status.toUpperCase()} - ${report.verdict.summary}`,
		),
		"",
	].join("\n");
}

async function fetchText(
	fetchImpl: FetchLike,
	url: URL,
	timeoutMs: number,
): Promise<{ status: number | null; body: string | null }> {
	try {
		const response = await fetchImpl(url, {
			method: "GET",
			headers: { "User-Agent": "AEOrank doctor (+https://aeorank.dev)" },
			redirect: "follow",
			signal: AbortSignal.timeout(timeoutMs),
		});

		return { status: response.status, body: await response.text() };
	} catch {
		return { status: null, body: null };
	}
}

async function fetchHead(
	fetchImpl: FetchLike,
	url: URL,
	userAgent: string,
	timeoutMs: number,
): Promise<DoctorHeadResult> {
	try {
		const response = await fetchImpl(url, {
			method: "HEAD",
			headers: {
				"User-Agent": userAgent,
				Accept: "text/plain, text/html, */*",
			},
			redirect: "follow",
			signal: AbortSignal.timeout(timeoutMs),
		});
		const wafSignals = collectWafSignals(response.headers);

		return {
			status: response.status,
			blocked: isBlockedStatus(response.status) || wafSignals.length > 0,
			wafSignals,
		};
	} catch (error) {
		return {
			status: null,
			blocked: false,
			wafSignals: [],
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

function collectWafSignals(headers: Headers): WafSignal[] {
	const signals: WafSignal[] = [];
	for (const header of WAF_HEADERS) {
		const value = headers.get(header);
		if (value) {
			signals.push({ header, value });
		}
	}
	return signals;
}

function isBlockedStatus(status: number): boolean {
	return BLOCK_STATUSES.has(status);
}

function mapRobotsAccess(value: "allowed" | "disallowed" | "unknown" | undefined): RobotsAccess {
	if (value === "allowed") return "allowed";
	if (value === "disallowed") return "blocked";
	return "unspecified";
}

function buildVerdict(crawlers: CrawlerDoctorResult[]): DoctorReport["verdict"] {
	const blockedCrawlers = crawlers.filter(
		(crawler) => crawler.robots === "blocked" || crawler.target.blocked || crawler.llmsTxt.blocked,
	).length;
	const errors = crawlers.filter(
		(crawler) => crawler.target.status === null || crawler.llmsTxt.status === null,
	).length;
	const unspecified = crawlers.filter((crawler) => crawler.robots === "unspecified").length;

	if (blockedCrawlers > 0) {
		return {
			status: "fail",
			summary: `${blockedCrawlers} crawler(s) look blocked.`,
		};
	}

	if (errors > 0 || unspecified > 0) {
		return {
			status: "warn",
			summary: "No explicit blocks found, but some checks were inconclusive.",
		};
	}

	return {
		status: "pass",
		summary: "No AI crawler access blocks detected.",
	};
}

function formatRobots(access: RobotsAccess): string {
	if (access === "allowed") return chalk.green("allowed");
	if (access === "blocked") return chalk.red("blocked");
	return chalk.yellow("unspecified");
}

function formatHead(result: DoctorHeadResult): string {
	if (result.status === null) {
		return chalk.yellow(`error${result.error ? `: ${result.error}` : ""}`);
	}
	if (result.blocked) {
		return chalk.red(`${result.status} blocked`);
	}
	if (result.status === 404) {
		return chalk.dim("404 missing");
	}
	if (result.status === 405) {
		return chalk.dim("405 no HEAD");
	}
	return chalk.green(`${result.status} reachable`);
}

function formatWafSignals(signals: WafSignal[]): string {
	if (signals.length === 0) return "-";

	const uniqueSignals = new Map<string, string>();
	for (const signal of signals) {
		uniqueSignals.set(signal.header, signal.value);
	}

	return [...uniqueSignals.entries()].map(([header, value]) => `${header}=${value}`).join(", ");
}

function formatTable(rows: string[][]): string {
	const widths = rows[0].map((_, columnIndex) =>
		Math.max(...rows.map((row) => stripAnsi(row[columnIndex]).length)),
	);

	return rows
		.map((row, rowIndex) => {
			const line = row
				.map((cell, columnIndex) => cell + " ".repeat(widths[columnIndex] - stripAnsi(cell).length))
				.join("  ");
			return rowIndex === 0 ? chalk.bold(line) : line;
		})
		.join("\n");
}

function stripAnsi(value: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI stripping requires control chars
	return value.replace(/\x1b\[[0-9;]*m/g, "");
}

interface DoctorCommandOptions {
	format: string;
	timeout: string;
}
