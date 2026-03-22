import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import type { ScanResult, DimensionScore } from "@aeorank/core";

export const compareCommand = new Command("compare")
	.description("Compare two scan results (JSON files)")
	.argument("<before>", "Path to the first scan result JSON")
	.argument("<after>", "Path to the second scan result JSON")
	.action((beforePath: string, afterPath: string) => {
		const absA = resolve(beforePath);
		const absB = resolve(afterPath);

		if (!existsSync(absA)) {
			console.error(chalk.red(`File not found: ${absA}`));
			process.exit(1);
		}
		if (!existsSync(absB)) {
			console.error(chalk.red(`File not found: ${absB}`));
			process.exit(1);
		}

		let before: ScanResult;
		let after: ScanResult;
		try {
			before = JSON.parse(readFileSync(absA, "utf-8")) as ScanResult;
			after = JSON.parse(readFileSync(absB, "utf-8")) as ScanResult;
		} catch {
			console.error(chalk.red("Failed to parse scan result JSON files."));
			process.exit(1);
		}

		const scoreDelta = after.score - before.score;
		const scoreColor = scoreDelta > 0 ? chalk.green : scoreDelta < 0 ? chalk.red : chalk.gray;

		console.log("");
		console.log(chalk.bold("  Scan Comparison"));
		console.log(chalk.dim(`  ${before.url}`));
		console.log("");
		console.log(
			`  Overall: ${chalk.dim(String(before.score))} → ${after.score >= 70 ? chalk.green.bold(String(after.score)) : after.score >= 40 ? chalk.yellow.bold(String(after.score)) : chalk.red.bold(String(after.score))}  ${scoreColor(
				`${scoreDelta > 0 ? "+" : ""}${scoreDelta} pts`,
			)}`,
		);
		console.log("");

		// Build lookup for before dimensions
		const beforeDims = new Map<string, DimensionScore>();
		for (const d of before.dimensions) {
			beforeDims.set(d.id, d);
		}

		const lines: string[] = [];
		for (const dim of after.dimensions) {
			const prev = beforeDims.get(dim.id);
			const prevScore = prev?.score ?? 0;
			const delta = dim.score - prevScore;

			const deltaStr =
				delta > 0
					? chalk.green(`+${delta}`)
					: delta < 0
						? chalk.red(String(delta))
						: chalk.gray(" 0");

			const name = dim.name.padEnd(25);
			const before = `${prevScore}/${dim.maxScore}`.padEnd(6);
			const after = `${dim.score}/${dim.maxScore}`.padEnd(6);

			lines.push(`  ${name} ${chalk.dim(before)} → ${after} ${deltaStr}`);
		}

		console.log(chalk.bold("  Dimension".padEnd(27) + "Before".padEnd(8) + "  After".padEnd(9) + "Change"));
		console.log(chalk.dim("  " + "─".repeat(55)));
		for (const line of lines) {
			console.log(line);
		}
		console.log("");
	});
