import { DIMENSION_DEFS, WEIGHT_MULTIPLIER } from "../constants.js";
import type { DimensionScore, PageScore, ScanMeta, ScannedPage } from "../types.js";
import { DIMENSION_SCORERS } from "./dimensions.js";
import { getGrade } from "./grades.js";

export { getGrade, getStatus, getDimensionStatus } from "./grades.js";
export { DIMENSION_SCORERS } from "./dimensions.js";

/** Calculate the complete AEO score from scanned pages and metadata */
export function calculateAeoScore(
	pages: ScannedPage[],
	meta: ScanMeta,
): { score: number; grade: string; dimensions: DimensionScore[] } {
	const dimensions: DimensionScore[] = [];

	for (const def of DIMENSION_DEFS) {
		const scorer = DIMENSION_SCORERS[def.id];
		if (scorer) {
			dimensions.push(scorer(pages, meta));
		}
	}

	// Calculate weighted score
	let weightedSum = 0;
	let totalWeight = 0;

	for (const dim of dimensions) {
		const multiplier = WEIGHT_MULTIPLIER[dim.weight];
		weightedSum += (dim.score / dim.maxScore) * multiplier;
		totalWeight += multiplier;
	}

	const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
	const grade = getGrade(score);

	return { score, grade, dimensions };
}

/** Dimensions that can be scored per-page (excludes site-level dimensions) */
const PAGE_LEVEL_DIMENSIONS = [
	"content-structure",
	"answer-first",
	"meta-descriptions",
	"page-freshness",
	"citation-anchors",
	"schema-markup",
	"eeat-signals",
	"fact-density",
	"duplicate-content",
	"evidence-packaging",
	"citation-ready-writing",
	"qa-format",
	"direct-answer-density",
	"query-answer-alignment",
	"tables-lists",
	"definition-patterns",
	"entity-disambiguation",
];

/** Score each page individually across page-level dimensions */
export function scorePerPage(pages: ScannedPage[], meta: ScanMeta): PageScore[] {
	return pages.map((page) => {
		const dims: PageScore["dimensions"] = [];
		let weightedSum = 0;
		let totalWeight = 0;

		for (const dimId of PAGE_LEVEL_DIMENSIONS) {
			const scorer = DIMENSION_SCORERS[dimId];
			const def = DIMENSION_DEFS.find((d) => d.id === dimId);
			if (!scorer || !def) continue;

			const result = scorer([page], meta);
			dims.push({ id: result.id, score: result.score, status: result.status });

			const multiplier = WEIGHT_MULTIPLIER[def.weight];
			weightedSum += (result.score / result.maxScore) * multiplier;
			totalWeight += multiplier;
		}

		const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

		return {
			url: page.url,
			title: page.title || page.url,
			score,
			grade: getGrade(score),
			dimensions: dims,
		};
	});
}
