import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { scan } from "@aeorank/core";
import type { ScanConfig } from "@aeorank/core";
import chalk from "chalk";
import { Command } from "commander";
import { loadConfig, mergeConfig } from "../config.js";
import { handleError } from "../errors.js";
import { renderDimensionTable, renderNextSteps, renderScore } from "../ui/score-display.js";
import { createSpinner } from "../ui/spinner.js";

export const scanCommand = new Command("scan")
	.description("Scan a URL for AEO (AI Engine Optimization) score")
	.argument("<url>", "URL to scan")
	.option("-f, --format <format>", "Output format (human or json)", "human")
	.option("-o, --output <dir>", "Output directory for generated files", "./aeorank-output")
	.option("--max-pages <n>", "Maximum pages to scan", Number.parseInt as unknown as undefined)
	.option("-v, --verbose", "Show detailed scan progress")
	.option("--overwrite", "Overwrite existing output files")
	.option("--no-files", "Skip writing generated files")
	.option("-c, --config <path>", "Path to config file")
	.option("-b, --browser", "Use Playwright for JavaScript-rendered pages (SPAs)")
	.action(async (url: string, options: ScanOptions) => {
		const isJson = options.format === "json";
		const spinner = createSpinner(`Scanning ${url}...`, isJson);

		try {
			// Validate URL
			try {
				new URL(url);
			} catch {
				const suggestion = url.includes(".")
					? `Did you mean https://${url}?`
					: "Provide a full URL like https://example.com";
				if (isJson) {
					console.log(JSON.stringify({ error: `'${url}' is not a valid URL.`, suggestion }));
				} else {
					console.error(chalk.red(`Error: '${url}' is not a valid URL.`));
					console.error(suggestion);
				}
				process.exit(1);
			}

			// Load and merge config
			const userConfig = await loadConfig(options.config);
			const { scanConfig, outputDir: configOutputDir } = mergeConfig(userConfig, {
				maxPages: options.maxPages,
				output: options.output !== "./aeorank-output" ? options.output : undefined,
				browser: options.browser ?? false,
			});

			// Use config output dir if CLI didn't override
			if (options.output === "./aeorank-output" && configOutputDir !== "./aeorank-output") {
				options.output = configOutputDir;
			}

			// Start scanning
			if (options.browser) {
				console.log("  Using browser mode (Playwright) for JavaScript rendering...\n");
			}
			spinner.start();

			const result = await scan(url, scanConfig);

			spinner.stop();

			// JSON output mode
			if (isJson) {
				console.log(JSON.stringify(result, null, 2));
			} else {
				// Human output mode
				console.log(renderScore(result));
				console.log(renderDimensionTable(result.dimensions));
				console.log(renderNextSteps(result.dimensions));
			}

			// Write files
			if (options.files !== false) {
				const outputDir = resolve(options.output);

				// Check for existing files
				if (existsSync(outputDir) && readdirSync(outputDir).length > 0 && !options.overwrite) {
					console.error(chalk.red(`Error: Output files already exist in ${outputDir}.`));
					console.error("Use --overwrite to replace existing files.");
					process.exit(1);
				}

				mkdirSync(outputDir, { recursive: true });

				const writtenFiles: string[] = [];
				for (const file of result.files) {
					const filePath = join(outputDir, file.name);
					writeFileSync(filePath, file.content, "utf-8");
					writtenFiles.push(filePath);
				}

				if (!isJson && writtenFiles.length > 0) {
					console.log(chalk.bold("\n  Files written:"));
					for (const fp of writtenFiles) {
						console.log(`    ${chalk.dim("→")} ${fp}`);
					}
					console.log("");
				}
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

interface ScanOptions {
	format: string;
	output: string;
	maxPages?: number;
	verbose?: boolean;
	overwrite?: boolean;
	files?: boolean;
	config?: string;
	browser?: boolean;
}
