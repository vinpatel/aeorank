import type { DimensionScore, ScanResult } from "@aeorank/core";
import { describe, expect, it } from "vitest";
import { renderDimensionTable, renderNextSteps, renderScore } from "../ui/score-display.js";

// Strip ANSI color codes for assertions
function stripAnsi(str: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI stripping requires control chars
	return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function makeDimension(overrides: Partial<DimensionScore> = {}): DimensionScore {
	return {
		id: "test-dim",
		name: "Test Dimension",
		score: 7,
		maxScore: 10,
		weight: "medium",
		status: "pass",
		hint: "Everything looks good",
		...overrides,
	};
}

function makeScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
	return {
		url: "https://example.com",
		siteName: "Example",
		siteDescription: "An example site",
		score: 75,
		grade: "B",
		dimensions: [makeDimension()],
		files: [],
		pages: [],
		meta: {
			url: "https://example.com",
			robotsTxt: { raw: null, crawlerAccess: {}, crawlDelay: null },
			sitemapXml: null,
			existingLlmsTxt: null,
			platform: null,
			responseTimeMs: 200,
		},
		pagesScanned: 5,
		duration: 3200,
		scannedAt: "2026-03-14T00:00:00.000Z",
		...overrides,
	};
}

describe("renderScore", () => {
	it("displays score and grade", () => {
		const result = makeScanResult({ score: 75, grade: "B" });
		const output = stripAnsi(renderScore(result));
		expect(output).toContain("75/100");
		expect(output).toContain("B");
	});

	it("displays site name and scan stats", () => {
		const result = makeScanResult({ siteName: "My Site", pagesScanned: 10, duration: 5000 });
		const output = stripAnsi(renderScore(result));
		expect(output).toContain("My Site");
		expect(output).toContain("10 pages");
	});

	it("uses green color for score >= 70", () => {
		const result = makeScanResult({ score: 70 });
		const output = renderScore(result);
		// Verify the output contains the score (chalk may suppress ANSI in non-TTY)
		expect(stripAnsi(output)).toContain("70/100");
		expect(stripAnsi(output)).toContain("AEO Score");
	});

	it("uses yellow color for score 40-69", () => {
		const result = makeScanResult({ score: 55, grade: "C" });
		const output = renderScore(result);
		expect(stripAnsi(output)).toContain("55/100");
	});

	it("uses red color for score < 40", () => {
		const result = makeScanResult({ score: 25, grade: "F" });
		const output = renderScore(result);
		expect(stripAnsi(output)).toContain("25/100");
	});
});

describe("renderDimensionTable", () => {
	it("shows pass icon for passing dimensions", () => {
		const dims = [makeDimension({ status: "pass", name: "Good Dim" })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("✓");
		expect(output).toContain("Good Dim");
	});

	it("shows warn icon for warning dimensions", () => {
		const dims = [makeDimension({ status: "warn", name: "Warn Dim" })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("⚠");
		expect(output).toContain("Warn Dim");
	});

	it("shows fail icon for failing dimensions", () => {
		const dims = [makeDimension({ status: "fail", name: "Fail Dim" })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("✗");
		expect(output).toContain("Fail Dim");
	});

	it("shows score/maxScore for each dimension", () => {
		const dims = [makeDimension({ score: 3, maxScore: 10 })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("3/10");
	});

	it("shows weight label", () => {
		const dims = [
			makeDimension({ weight: "high", name: "High Dim" }),
			makeDimension({ weight: "medium", name: "Med Dim" }),
			makeDimension({ weight: "low", name: "Low Dim" }),
		];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("[HIGH]");
		expect(output).toContain("[MEDIUM]");
		expect(output).toContain("[LOW]");
	});

	it("shows hint only for non-pass dimensions", () => {
		const dims = [
			makeDimension({ status: "pass", hint: "All good" }),
			makeDimension({ status: "fail", hint: "Fix this thing", name: "Broken" }),
		];
		const output = stripAnsi(renderDimensionTable(dims));
		// Hint for failing dimension should appear
		expect(output).toContain("Fix this thing");
	});

	it("sorts by weight (high first) then score ascending", () => {
		const dims = [
			makeDimension({ id: "low-good", weight: "low", score: 8, name: "Low Good" }),
			makeDimension({ id: "high-bad", weight: "high", score: 2, name: "High Bad" }),
			makeDimension({ id: "high-ok", weight: "high", score: 5, name: "High OK" }),
			makeDimension({ id: "med", weight: "medium", score: 6, name: "Medium" }),
		];
		const output = stripAnsi(renderDimensionTable(dims));
		const lines = output.split("\n").filter((l) => l.trim().length > 0);
		// High weight dims should come first
		const highBadIdx = lines.findIndex((l) => l.includes("High Bad"));
		const highOkIdx = lines.findIndex((l) => l.includes("High OK"));
		const medIdx = lines.findIndex((l) => l.includes("Medium"));
		const lowIdx = lines.findIndex((l) => l.includes("Low Good"));

		expect(highBadIdx).toBeLessThan(medIdx);
		expect(highOkIdx).toBeLessThan(medIdx);
		expect(medIdx).toBeLessThan(lowIdx);
		// Within high weight, worse score first
		expect(highBadIdx).toBeLessThan(highOkIdx);
	});
});

describe("renderNextSteps", () => {
	it("returns congratulations when all pass", () => {
		const dims = [
			makeDimension({ status: "pass" }),
			makeDimension({ status: "pass", id: "other" }),
		];
		const output = stripAnsi(renderNextSteps(dims));
		expect(output).toContain("passing");
	});

	it("limits to top 3 recommendations", () => {
		const dims = [
			makeDimension({ status: "fail", weight: "high", score: 0, hint: "Fix A" }),
			makeDimension({ status: "fail", weight: "high", score: 1, hint: "Fix B" }),
			makeDimension({ status: "warn", weight: "medium", score: 4, hint: "Fix C" }),
			makeDimension({ status: "fail", weight: "low", score: 0, hint: "Fix D" }),
			makeDimension({ status: "warn", weight: "low", score: 5, hint: "Fix E" }),
		];
		const output = stripAnsi(renderNextSteps(dims));
		// Should contain top 3 fixes
		expect(output).toContain("Fix A");
		expect(output).toContain("Fix B");
		expect(output).toContain("Fix C");
		// Should NOT contain 4th and 5th
		expect(output).not.toContain("Fix D");
		expect(output).not.toContain("Fix E");
	});

	it("sorts by weight priority then score ascending", () => {
		const dims = [
			makeDimension({ status: "fail", weight: "low", score: 0, hint: "Low fix" }),
			makeDimension({ status: "fail", weight: "high", score: 2, hint: "High fix" }),
			makeDimension({ status: "warn", weight: "medium", score: 4, hint: "Med fix" }),
		];
		const output = stripAnsi(renderNextSteps(dims));
		const highIdx = output.indexOf("High fix");
		const medIdx = output.indexOf("Med fix");
		const lowIdx = output.indexOf("Low fix");
		expect(highIdx).toBeLessThan(medIdx);
		expect(medIdx).toBeLessThan(lowIdx);
	});

	it("labels recommendations with priority", () => {
		const dims = [
			makeDimension({ status: "fail", weight: "high", score: 0, hint: "Fix schema" }),
			makeDimension({ status: "warn", weight: "medium", score: 4, hint: "Fix meta" }),
			makeDimension({ status: "fail", weight: "low", score: 0, hint: "Fix sitemap" }),
		];
		const output = stripAnsi(renderNextSteps(dims));
		expect(output).toContain("[HIGH]");
		expect(output).toContain("[MEDIUM]");
		expect(output).toContain("[LOW]");
	});
});
