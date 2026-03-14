import { GRADE_THRESHOLDS, STATUS_THRESHOLDS, WEIGHT_MULTIPLIER } from "./constants.js";
import type { DimensionScore } from "./types.js";

/** Normalize a URL: lowercase hostname, strip trailing slash */
export function normalizeUrl(url: string): string {
	try {
		const parsed = new URL(url);
		parsed.hostname = parsed.hostname.toLowerCase();
		// Remove trailing slash from pathname (but keep "/" for root)
		if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
			parsed.pathname = parsed.pathname.slice(0, -1);
		}
		// Reconstruct without trailing slash on bare origin
		let result = parsed.toString();
		if (result.endsWith("/") && parsed.pathname === "/") {
			result = result.slice(0, -1);
		}
		return result;
	} catch {
		return url;
	}
}

/** Get letter grade from a 0-100 score */
export function getGrade(score: number): string {
	if (score >= GRADE_THRESHOLDS["A+"]) return "A+";
	if (score >= GRADE_THRESHOLDS.A) return "A";
	if (score >= GRADE_THRESHOLDS.B) return "B";
	if (score >= GRADE_THRESHOLDS.C) return "C";
	if (score >= GRADE_THRESHOLDS.D) return "D";
	return "F";
}

/** Get status (pass/warn/fail) from a percentage score (0-100) */
export function getStatus(score: number): "pass" | "warn" | "fail" {
	if (score >= STATUS_THRESHOLDS.pass) return "pass";
	if (score >= STATUS_THRESHOLDS.warn) return "warn";
	return "fail";
}

/** Get dimension status based on score/maxScore ratio */
export function getDimensionStatus(score: number, maxScore: number): "pass" | "warn" | "fail" {
	const pct = (score / maxScore) * 100;
	return getStatus(pct);
}

/** Calculate weighted AEO score from dimension scores */
export function calculateWeightedScore(dimensions: DimensionScore[]): number {
	if (dimensions.length === 0) return 0;

	let weightedSum = 0;
	let totalWeight = 0;

	for (const dim of dimensions) {
		const multiplier = WEIGHT_MULTIPLIER[dim.weight];
		weightedSum += (dim.score / dim.maxScore) * multiplier;
		totalWeight += multiplier;
	}

	if (totalWeight === 0) return 0;
	return Math.round((weightedSum / totalWeight) * 100);
}

/** Convert text to URL-friendly slug */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
