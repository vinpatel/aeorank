import { DIMENSION_DEFS, PAGE_LEVEL_DIMENSIONS, PAGE_SCORE_MAX } from "../constants.js";
import type { DimensionScore, PageScore, ScanMeta, ScannedPage } from "../types.js";
import { DIMENSION_SCORERS } from "./dimensions.js";
import { getGrade } from "./grades.js";

export { getGrade, getStatus, getDimensionStatus, getWeightCategory } from "./grades.js";
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

	// Calculate weighted score using percentage weights (weightPct sums to 100)
	let weightedSum = 0;

	for (const dim of dimensions) {
		const def = DIMENSION_DEFS.find((d) => d.id === dim.id);
		if (!def) continue;
		weightedSum += (dim.score / dim.maxScore) * def.weightPct;
	}

	// weightedSum is already on 0-100 scale since weightPct sums to 100
	let score = Math.round(weightedSum);

	// Coherence gate: topic-coherence < 6 caps the final score at coherence_score * 10
	// e.g., coherence=4 -> score cannot exceed 40
	const coherenceDim = dimensions.find((d) => d.id === "topic-coherence");
	const coherenceGated = coherenceDim !== undefined && coherenceDim.score < 6;
	if (coherenceGated && coherenceDim) {
		const cap = coherenceDim.score * 10;
		score = Math.min(score, cap);
	}

	const grade = getGrade(score);

	return { score, grade, dimensions };
}

/**
 * Count duplicate paragraph blocks within a single page.
 * Normalizes paragraph text and counts repeated occurrences.
 */
function countDuplicateBlocks(page: ScannedPage): number {
	const seen = new Set<string>();
	let dupeCount = 0;
	for (const para of page.paragraphs) {
		const normalized = para.toLowerCase().replace(/\s+/g, " ").trim();
		if (seen.has(normalized)) {
			dupeCount++;
		} else {
			seen.add(normalized);
		}
	}
	return dupeCount;
}

/** Score each page individually across page-level dimensions */
export function scorePerPage(pages: ScannedPage[], meta: ScanMeta): PageScore[] {
	return pages.map((page) => {
		const dims: PageScore["dimensions"] = [];
		let weightedSum = 0;
		let totalPageWeight = 0;

		for (const dimId of PAGE_LEVEL_DIMENSIONS) {
			const scorer = DIMENSION_SCORERS[dimId];
			const def = DIMENSION_DEFS.find((d) => d.id === dimId);
			if (!scorer || !def) continue;

			const result = scorer([page], meta);
			dims.push({ id: result.id, score: result.score, status: result.status });

			weightedSum += (result.score / result.maxScore) * def.weightPct;
			totalPageWeight += def.weightPct;
		}

		// Normalize to 0-75 since page-level dims don't sum to 100 and site-level dims are excluded
		let score = totalPageWeight > 0 ? Math.round((weightedSum / totalPageWeight) * PAGE_SCORE_MAX) : 0;

		// Duplication gate: 3+ duplicate blocks on a page caps the page score at 35% of max (= 26)
		const dupeCount = countDuplicateBlocks(page);
		if (dupeCount >= 3) {
			score = Math.min(score, Math.round(PAGE_SCORE_MAX * 0.35));
		}

		return {
			url: page.url,
			title: page.title || page.url,
			score,
			maxScore: PAGE_SCORE_MAX,
			grade: getGrade(Math.round(score * (100 / PAGE_SCORE_MAX))),
			dimensions: dims,
		};
	});
}
