import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock ora
vi.mock("ora", () => ({
	default: () => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
		succeed: vi.fn().mockReturnThis(),
		fail: vi.fn().mockReturnThis(),
		text: "",
	}),
}));

describe("init command", () => {
	let tmpDir: string;
	let origCwd: () => string;
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tmpDir = join(tmpdir(), `aeorank-init-test-${Date.now()}`);
		mkdirSync(tmpDir, { recursive: true });

		origCwd = process.cwd;
		process.cwd = () => tmpDir;

		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
	});

	afterEach(() => {
		process.cwd = origCwd;
		vi.restoreAllMocks();
		if (existsSync(tmpDir)) {
			rmSync(tmpDir, { recursive: true, force: true });
		}
	});

	it("creates aeorank.config.js in current directory", async () => {
		const { initCommand } = await import("../commands/init.js");
		await initCommand.parseAsync(["node", "init"]);

		const configPath = join(tmpDir, "aeorank.config.js");
		expect(existsSync(configPath)).toBe(true);
	});

	it("created config contains export default and site.url", async () => {
		const { initCommand } = await import("../commands/init.js");
		await initCommand.parseAsync(["node", "init"]);

		const configPath = join(tmpDir, "aeorank.config.js");
		const content = readFileSync(configPath, "utf-8");
		expect(content).toContain("export default");
		expect(content).toContain("url:");
		expect(content).toContain("https://example.com");
	});

	it("warns and exits when config already exists", async () => {
		const configPath = join(tmpDir, "aeorank.config.js");
		writeFileSync(configPath, "// existing", "utf-8");

		const { initCommand } = await import("../commands/init.js");
		await initCommand.parseAsync(["node", "init"]);

		expect(exitSpy).toHaveBeenCalledWith(1);
		const allErrors = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
		expect(allErrors).toContain("already exists");
	});

	it("overwrites existing config with --overwrite", async () => {
		const configPath = join(tmpDir, "aeorank.config.js");
		writeFileSync(configPath, "// old content", "utf-8");

		const { initCommand } = await import("../commands/init.js");
		await initCommand.parseAsync(["node", "init", "--overwrite"]);

		const content = readFileSync(configPath, "utf-8");
		expect(content).toContain("export default");
		expect(content).not.toContain("old content");
	});
});
