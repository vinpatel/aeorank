import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DEFAULT_CONFIG } from "@aeorank/core";
import type { AeorankConfig, ScanConfig } from "@aeorank/core";

/** Default config filename */
export const CONFIG_FILENAME = "aeorank.config.js";

/** Load config from file. Returns null if no config found (zero-config mode). */
export async function loadConfig(configPath?: string): Promise<AeorankConfig | null> {
	const resolvedPath = configPath ? resolve(configPath) : resolve(process.cwd(), CONFIG_FILENAME);

	if (!existsSync(resolvedPath)) {
		if (configPath) {
			throw new Error(`Config file not found: ${configPath}`);
		}
		return null;
	}

	try {
		// Dynamic import for ESM config files
		const fileUrl = pathToFileURL(resolvedPath).href;
		const module = await import(fileUrl);
		const config = module.default || module;

		return config as AeorankConfig;
	} catch (error) {
		throw new Error(`Could not read config at ${resolvedPath}. Check the file for syntax errors.`);
	}
}

/** Merge user config with defaults and CLI flag overrides */
export function mergeConfig(
	userConfig: AeorankConfig | null,
	cliFlags: { maxPages?: number; output?: string },
): {
	scanConfig: Partial<ScanConfig>;
	outputDir: string;
	siteUrl?: string;
} {
	// Start with defaults
	const scanConfig: Partial<ScanConfig> = { ...DEFAULT_CONFIG };

	let outputDir = "./aeorank-output";
	let siteUrl: string | undefined;

	// Layer user config
	if (userConfig) {
		if (userConfig.scanner) {
			Object.assign(scanConfig, userConfig.scanner);
		}
		if (userConfig.output?.dir) {
			outputDir = userConfig.output.dir;
		}
		if (userConfig.site?.url) {
			siteUrl = userConfig.site.url;
		}
	}

	// Layer CLI flags (highest priority)
	if (cliFlags.maxPages !== undefined) {
		scanConfig.maxPages = cliFlags.maxPages;
	}
	if (cliFlags.output !== undefined) {
		outputDir = cliFlags.output;
	}

	return { scanConfig, outputDir, siteUrl };
}
