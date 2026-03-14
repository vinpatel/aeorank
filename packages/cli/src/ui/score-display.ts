import chalk from "chalk";
import type { DimensionScore, ScanResult } from "@aeorank/core";

const WEIGHT_PRIORITY: Record<string, number> = {
	high: 3,
	medium: 2,
	low: 1,
};

const WEIGHT_LABEL: Record<string, string> = {
	high: "HIGH",
	medium: "MEDIUM",
	low: "LOW",
};

const STATUS_ICON: Record<string, string> = {
	pass: chalk.green("✓"),
	warn: chalk.yellow("⚠"),
	fail: chalk.red("✗"),
};

function colorForScore(score: number): typeof chalk {
	if (score >= 70) return chalk.green;
	if (score >= 40) return chalk.yellow;
	return chalk.red;
}

/** Render the overall AEO score prominently with color */
export function renderScore(result: ScanResult): string {
	const color = colorForScore(result.score);
	const lines: string[] = [
		"",
		color.bold(`  AEO Score: ${result.score}/100 (${result.grade})`),
		"",
		chalk.dim(`  ${result.siteName} — ${result.pagesScanned} pages scanned in ${(result.duration / 1000).toFixed(1)}s`),
		"",
	];
	return lines.join("\n");
}

/** Render the dimension breakdown table */
export function renderDimensionTable(dimensions: DimensionScore[]): string {
	// Sort: weight priority descending, then score ascending (worst first within group)
	const sorted = [...dimensions].sort((a, b) => {
		const wDiff = WEIGHT_PRIORITY[b.weight] - WEIGHT_PRIORITY[a.weight];
		if (wDiff !== 0) return wDiff;
		return a.score - b.score;
	});

	const lines: string[] = [chalk.bold("  Dimensions"), ""];

	for (const dim of sorted) {
		const icon = STATUS_ICON[dim.status];
		const name = dim.name.padEnd(25);
		const score = `${dim.score}/${dim.maxScore}`.padEnd(6);
		const weight = chalk.dim(`[${WEIGHT_LABEL[dim.weight]}]`.padEnd(10));
		const hint = dim.status !== "pass" ? chalk.dim(` — ${dim.hint}`) : "";

		lines.push(`  ${icon} ${name} ${score} ${weight}${hint}`);
	}

	lines.push("");
	return lines.join("\n");
}

/** Render top 3 actionable fix recommendations ranked by priority */
export function renderNextSteps(dimensions: DimensionScore[]): string {
	const failing = dimensions.filter((d) => d.status !== "pass");

	if (failing.length === 0) {
		return `\n  ${chalk.green.bold("All dimensions passing!")} Your site has excellent AEO coverage.\n`;
	}

	// Sort: weight priority descending, then score ascending
	const sorted = [...failing].sort((a, b) => {
		const wDiff = WEIGHT_PRIORITY[b.weight] - WEIGHT_PRIORITY[a.weight];
		if (wDiff !== 0) return wDiff;
		return a.score - b.score;
	});

	const top = sorted.slice(0, 3);

	const lines: string[] = [chalk.bold("  Next Steps"), ""];

	for (let i = 0; i < top.length; i++) {
		const dim = top[i];
		const label = WEIGHT_LABEL[dim.weight];
		const color =
			label === "HIGH" ? chalk.red : label === "MEDIUM" ? chalk.yellow : chalk.dim;
		lines.push(`  ${i + 1}. ${color(`[${label}]`)} ${dim.hint}`);
	}

	lines.push("");
	return lines.join("\n");
}
