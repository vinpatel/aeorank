import { GRADE_THRESHOLDS, STATUS_THRESHOLDS } from "../constants.js";

/** Get letter grade from a 0-100 score */
export function getGrade(score: number): string {
	if (score >= GRADE_THRESHOLDS["A+"]) return "A+";
	if (score >= GRADE_THRESHOLDS.A) return "A";
	if (score >= GRADE_THRESHOLDS.B) return "B";
	if (score >= GRADE_THRESHOLDS.C) return "C";
	if (score >= GRADE_THRESHOLDS.D) return "D";
	return "F";
}

/** Get status from a percentage (0-100) */
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
