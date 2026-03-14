import { describe, expect, it } from "vitest";
import {
	calculateWeightedScore,
	getDimensionStatus,
	getGrade,
	getStatus,
	normalizeUrl,
	slugify,
} from "../utils.js";
import type { DimensionScore } from "../types.js";

describe("normalizeUrl", () => {
	it("strips trailing slash", () => {
		expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
	});

	it("lowercases hostname", () => {
		expect(normalizeUrl("http://Example.COM/Path")).toBe("http://example.com/Path");
	});

	it("preserves path case", () => {
		expect(normalizeUrl("https://example.com/About")).toBe("https://example.com/About");
	});

	it("strips trailing slash from paths", () => {
		expect(normalizeUrl("https://example.com/blog/")).toBe("https://example.com/blog");
	});

	it("handles invalid URLs gracefully", () => {
		expect(normalizeUrl("not-a-url")).toBe("not-a-url");
	});
});

describe("getGrade", () => {
	it("returns A+ for score >= 95", () => {
		expect(getGrade(95)).toBe("A+");
		expect(getGrade(100)).toBe("A+");
	});

	it("returns A for score >= 85", () => {
		expect(getGrade(85)).toBe("A");
		expect(getGrade(94)).toBe("A");
	});

	it("returns B for score >= 70", () => {
		expect(getGrade(70)).toBe("B");
		expect(getGrade(84)).toBe("B");
	});

	it("returns C for score >= 55", () => {
		expect(getGrade(55)).toBe("C");
		expect(getGrade(69)).toBe("C");
	});

	it("returns D for score >= 40", () => {
		expect(getGrade(40)).toBe("D");
		expect(getGrade(54)).toBe("D");
	});

	it("returns F for score < 40", () => {
		expect(getGrade(39)).toBe("F");
		expect(getGrade(0)).toBe("F");
	});
});

describe("getStatus", () => {
	it("returns pass for score >= 70", () => {
		expect(getStatus(70)).toBe("pass");
		expect(getStatus(100)).toBe("pass");
	});

	it("returns warn for score 40-69", () => {
		expect(getStatus(40)).toBe("warn");
		expect(getStatus(69)).toBe("warn");
	});

	it("returns fail for score < 40", () => {
		expect(getStatus(39)).toBe("fail");
		expect(getStatus(0)).toBe("fail");
	});
});

describe("getDimensionStatus", () => {
	it("returns pass when ratio >= 70%", () => {
		expect(getDimensionStatus(7, 10)).toBe("pass");
		expect(getDimensionStatus(10, 10)).toBe("pass");
	});

	it("returns warn when ratio 40-69%", () => {
		expect(getDimensionStatus(4, 10)).toBe("warn");
		expect(getDimensionStatus(6, 10)).toBe("warn");
	});

	it("returns fail when ratio < 40%", () => {
		expect(getDimensionStatus(3, 10)).toBe("fail");
		expect(getDimensionStatus(0, 10)).toBe("fail");
	});
});

describe("calculateWeightedScore", () => {
	const makeDimension = (
		score: number,
		weight: "high" | "medium" | "low",
	): DimensionScore => ({
		id: "test",
		name: "Test",
		score,
		maxScore: 10,
		weight,
		status: "pass",
		hint: "",
	});

	it("returns 100 for all perfect scores", () => {
		const dims: DimensionScore[] = [
			makeDimension(10, "high"),
			makeDimension(10, "medium"),
			makeDimension(10, "low"),
		];
		expect(calculateWeightedScore(dims)).toBe(100);
	});

	it("returns 0 for all zero scores", () => {
		const dims: DimensionScore[] = [
			makeDimension(0, "high"),
			makeDimension(0, "medium"),
			makeDimension(0, "low"),
		];
		expect(calculateWeightedScore(dims)).toBe(0);
	});

	it("weights high dimensions more", () => {
		const highOnly: DimensionScore[] = [makeDimension(10, "high"), makeDimension(0, "low")];
		const lowOnly: DimensionScore[] = [makeDimension(0, "high"), makeDimension(10, "low")];
		expect(calculateWeightedScore(highOnly)).toBeGreaterThan(
			calculateWeightedScore(lowOnly),
		);
	});

	it("returns 0 for empty dimensions", () => {
		expect(calculateWeightedScore([])).toBe(0);
	});
});

describe("slugify", () => {
	it("converts to lowercase and replaces spaces", () => {
		expect(slugify("Hello World")).toBe("hello-world");
	});

	it("removes special characters", () => {
		expect(slugify("Hello World!")).toBe("hello-world");
	});

	it("collapses multiple hyphens", () => {
		expect(slugify("Hello   World")).toBe("hello-world");
	});

	it("trims leading/trailing hyphens", () => {
		expect(slugify("--Hello World--")).toBe("hello-world");
	});
});
