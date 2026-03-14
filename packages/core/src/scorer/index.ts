import { DIMENSION_DEFS, WEIGHT_MULTIPLIER } from "../constants.js";
import type { DimensionScore, ScanMeta, ScannedPage } from "../types.js";
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
