import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mergeConfig } from "../config.js";

describe("mergeConfig", () => {
	it("returns defaults when userConfig is null", () => {
		const result = mergeConfig(null, {});
		expect(result.scanConfig.maxPages).toBe(200);
		expect(result.scanConfig.concurrency).toBe(5);
		expect(result.scanConfig.timeout).toBe(30000);
		expect(result.outputDir).toBe("./aeorank-output");
		expect(result.siteUrl).toBeUndefined();
	});

	it("merges user config scanner settings over defaults", () => {
		const userConfig = {
			site: { url: "https://mysite.com" },
			output: { dir: "./custom-output" },
			scanner: { maxPages: 20 },
		};
		const result = mergeConfig(userConfig, {});
		expect(result.scanConfig.maxPages).toBe(20);
		expect(result.scanConfig.concurrency).toBe(5); // kept from default
		expect(result.outputDir).toBe("./custom-output");
		expect(result.siteUrl).toBe("https://mysite.com");
	});

	it("CLI flags override user config", () => {
		const userConfig = {
			site: { url: "https://mysite.com" },
			output: { dir: "./custom-output" },
			scanner: { maxPages: 20 },
		};
		const result = mergeConfig(userConfig, { maxPages: 10, output: "./cli-output" });
		expect(result.scanConfig.maxPages).toBe(10);
		expect(result.outputDir).toBe("./cli-output");
	});

	it("CLI flags override defaults when no user config", () => {
		const result = mergeConfig(null, { maxPages: 5 });
		expect(result.scanConfig.maxPages).toBe(5);
	});

	it("preserves unset default fields when user config is partial", () => {
		const userConfig = {
			site: { url: "https://test.com" },
			output: { dir: "./out" },
			scanner: { timeout: 60000 },
		};
		const result = mergeConfig(userConfig, {});
		expect(result.scanConfig.timeout).toBe(60000);
		expect(result.scanConfig.maxPages).toBe(200); // from default
		expect(result.scanConfig.respectCrawlDelay).toBe(true); // from default
	});
});

describe("loadConfig", () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = join(tmpdir(), `aeorank-config-test-${Date.now()}`);
		mkdirSync(tmpDir, { recursive: true });
	});

	afterEach(() => {
		if (existsSync(tmpDir)) {
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});

	it("returns null when no config file exists", async () => {
		// Mock cwd to tmpDir
		const origCwd = process.cwd;
		process.cwd = () => tmpDir;

		const { loadConfig } = await import("../config.js");
		const result = await loadConfig();

		process.cwd = origCwd;
		expect(result).toBeNull();
	});

	it("throws when explicit config path does not exist", async () => {
		const { loadConfig } = await import("../config.js");
		await expect(loadConfig("/nonexistent/config.js")).rejects.toThrow("not found");
	});
});
