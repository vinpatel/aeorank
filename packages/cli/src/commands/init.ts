import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { CONFIG_FILENAME } from "../config.js";

const CONFIG_TEMPLATE = `/** @type {import('@aeorank/core').AeorankConfig} */
export default {
  site: {
    url: "https://example.com",
  },
  output: {
    dir: "./aeorank-output",
  },
  scanner: {
    maxPages: 50,
    // concurrency: 3,
    // timeout: 30000,
  },
};
`;

export const initCommand = new Command("init")
	.description("Create an aeorank.config.js configuration file")
	.option("--overwrite", "Overwrite existing config file")
	.action((options: { overwrite?: boolean }) => {
		const configPath = join(process.cwd(), CONFIG_FILENAME);

		if (existsSync(configPath) && !options.overwrite) {
			console.error(chalk.yellow(`${CONFIG_FILENAME} already exists.`));
			console.error("Use --overwrite to replace it.");
			process.exit(1);
		}

		writeFileSync(configPath, CONFIG_TEMPLATE, "utf-8");
		console.log(chalk.green(`Created ${CONFIG_FILENAME}`));
		console.log(`Edit the site URL and run ${chalk.bold("aeorank scan")}`);
	});
