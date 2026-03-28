import type { DimensionScore, DimensionDef, PageScore, ScanResult } from "@aeorank/core";
import { DIMENSION_DEFS, PAGE_SCORE_MAX, PILLAR_GROUPS } from "@aeorank/core";
import chalk from "chalk";

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
		chalk.dim(
			`  ${result.siteName} — ${result.pagesScanned} pages scanned in ${(result.duration / 1000).toFixed(1)}s`,
		),
		"",
	];
	return lines.join("\n");
}

/** Render the dimension breakdown table, grouped by pillar with optional filter */
export function renderDimensionTable(dimensions: DimensionScore[], pillarFilter?: string): string {
	// Validate pillarFilter if provided
	if (pillarFilter !== undefined) {
		const validIds = PILLAR_GROUPS.map((p) => p.id);
		if (!validIds.includes(pillarFilter)) {
			return (
				`\n  Unknown pillar: "${pillarFilter}". Valid pillar IDs:\n` +
				validIds.map((id) => `    - ${id}`).join("\n") +
				"\n"
			);
		}
	}

	// Determine which pillars to render
	const pillarsToRender = pillarFilter
		? PILLAR_GROUPS.filter((p) => p.id === pillarFilter)
		: PILLAR_GROUPS;

	const lines: string[] = [chalk.bold("  Dimensions by Pillar"), ""];

	for (const pillar of pillarsToRender) {
		// Filter dimensions to those in this pillar
		const pillarDims = dimensions.filter((d) => pillar.dimensionIds.includes(d.id));

		// Skip pillar if no dimensions match (no data for this pillar)
		if (pillarDims.length === 0) continue;

		// Sort: weightPct descending, then score ascending
		const sorted = [...pillarDims].sort((a, b) => {
			const wDiff = b.weightPct - a.weightPct;
			if (wDiff !== 0) return wDiff;
			return a.score - b.score;
		});

		// Calculate pillar aggregate score
		const weightedScoreSum = pillarDims.reduce((s, d) => s + d.score * d.weightPct, 0);
		const weightedMaxSum = pillarDims.reduce((s, d) => s + d.maxScore * d.weightPct, 0);
		const pillarScore = weightedMaxSum > 0 ? (weightedScoreSum / weightedMaxSum) * 10 : 0;
		const pillarWeightSum = pillarDims.reduce((s, d) => s + d.weightPct, 0);

		// Render pillar header
		const scoreStr = pillarScore.toFixed(1);
		lines.push(
			`  ${chalk.bold(pillar.name)}  ${scoreStr}/10  ${chalk.dim(`[${pillarWeightSum}%]`)}`,
		);

		// Render each dimension row
		for (const dim of sorted) {
			const icon = STATUS_ICON[dim.status];
			const name = dim.name.padEnd(25);
			const score = `${dim.score}/${dim.maxScore}`.padEnd(6);
			const weight = chalk.dim(`[${dim.weightPct}%]`.padEnd(8));
			const hint = dim.status !== "pass" ? chalk.dim(` — ${dim.hint}`) : "";

			lines.push(`    ${icon} ${name} ${score} ${weight}${hint}`);
		}

		lines.push("");
	}

	return lines.join("\n");
}

/** Render per-page score with dimension breakdown — score shown as X/75 */
export function renderPageScore(page: PageScore, allDefs: DimensionDef[] = DIMENSION_DEFS): string {
	const color = colorForScore((page.score / PAGE_SCORE_MAX) * 100);
	const lines: string[] = [
		"",
		color.bold(`  Page Score: ${page.score}/${PAGE_SCORE_MAX} (${page.grade})`),
		"",
		chalk.dim(`  ${page.title} — ${page.url}`),
		"",
		chalk.bold("  Dimensions"),
		"",
	];

	// Sort dimensions ascending by score (worst first) for actionability
	const sorted = [...page.dimensions].sort((a, b) => a.score - b.score);

	for (const dim of sorted) {
		const def = allDefs.find((d) => d.id === dim.id);
		const name = (def?.name ?? dim.id).padEnd(30);
		const score = `${dim.score}/10`.padEnd(7);
		const icon = STATUS_ICON[dim.status] ?? chalk.dim("?");
		lines.push(`    ${icon} ${name} ${score}`);
	}

	lines.push("");
	return lines.join("\n");
}

/** Render top 3 actionable fix recommendations ranked by priority, with optional pillar filter */
export function renderNextSteps(dimensions: DimensionScore[], pillarFilter?: string): string {
	// Filter dimensions by pillar if requested
	let filteredDims = dimensions;
	if (pillarFilter !== undefined) {
		const pillar = PILLAR_GROUPS.find((p) => p.id === pillarFilter);
		if (pillar) {
			filteredDims = dimensions.filter((d) => pillar.dimensionIds.includes(d.id));
		}
	}

	const failing = filteredDims.filter((d) => d.status !== "pass");

	if (failing.length === 0) {
		return `\n  ${chalk.green.bold("All dimensions passing!")} Your site has excellent AEO coverage.\n`;
	}

	// Sort: weightPct descending, then score ascending
	const sorted = [...failing].sort((a, b) => {
		const wDiff = b.weightPct - a.weightPct;
		if (wDiff !== 0) return wDiff;
		return a.score - b.score;
	});

	const top = sorted.slice(0, 3);

	const lines: string[] = [chalk.bold("  Next Steps"), ""];

	for (let i = 0; i < top.length; i++) {
		const dim = top[i];
		const color = dim.weightPct >= 5 ? chalk.red : dim.weightPct >= 3 ? chalk.yellow : chalk.dim;
		lines.push(`  ${i + 1}. ${color(`[${dim.weightPct}%]`)} ${dim.hint}`);
	}

	lines.push("");
	return lines.join("\n");
}
