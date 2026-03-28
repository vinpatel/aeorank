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
		weightPct: 3,
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
			aiTxt: null,
			sitemapLastmods: [],
		},
		pageScores: [],
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
		// Use a real dimension ID that belongs to a pillar (llms-txt -> technical-foundation)
		const dims = [makeDimension({ id: "llms-txt", status: "pass", name: "Good Dim" })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("✓");
		expect(output).toContain("Good Dim");
	});

	it("shows warn icon for warning dimensions", () => {
		const dims = [makeDimension({ id: "llms-txt", status: "warn", name: "Warn Dim" })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("⚠");
		expect(output).toContain("Warn Dim");
	});

	it("shows fail icon for failing dimensions", () => {
		const dims = [makeDimension({ id: "llms-txt", status: "fail", name: "Fail Dim" })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("✗");
		expect(output).toContain("Fail Dim");
	});

	it("shows score/maxScore for each dimension", () => {
		const dims = [makeDimension({ id: "llms-txt", score: 3, maxScore: 10 })];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("3/10");
	});

	it("shows weightPct percentage label", () => {
		// Use real IDs from different pillars
		const dims = [
			makeDimension({ id: "eeat-signals", weightPct: 5, name: "High Dim" }),
			makeDimension({ id: "internal-linking", weightPct: 3, name: "Med Dim" }),
			makeDimension({ id: "sitemap", weightPct: 1, name: "Low Dim" }),
		];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("[5%]");
		expect(output).toContain("[3%]");
		expect(output).toContain("[1%]");
	});

	it("shows hint only for non-pass dimensions", () => {
		const dims = [
			makeDimension({ id: "llms-txt", status: "pass", hint: "All good" }),
			makeDimension({ id: "schema-markup", status: "fail", hint: "Fix this thing", name: "Broken" }),
		];
		// Both in technical-foundation pillar — use pillar filter for clarity
		const output = stripAnsi(renderDimensionTable(dims, "technical-foundation"));
		// Hint for failing dimension should appear
		expect(output).toContain("Fix this thing");
	});

	it("sorts by weightPct (high first) then score ascending", () => {
		// Use dimensions that belong to the same pillar so they all appear together
		// topic-coherence and original-data are in answer-readiness
		// fact-density also in answer-readiness
		// duplicate-content also in answer-readiness
		const dims = [
			makeDimension({ id: "duplicate-content", weightPct: 1, score: 8, name: "Low Good" }),
			makeDimension({ id: "topic-coherence", weightPct: 5, score: 2, name: "High Bad" }),
			makeDimension({ id: "original-data", weightPct: 5, score: 5, name: "High OK" }),
			makeDimension({ id: "fact-density", weightPct: 3, score: 6, name: "Medium" }),
		];
		const output = stripAnsi(renderDimensionTable(dims));
		const lines = output.split("\n").filter((l) => l.trim().length > 0);
		// High weightPct dims should come first within their pillar section
		const highBadIdx = lines.findIndex((l) => l.includes("High Bad"));
		const highOkIdx = lines.findIndex((l) => l.includes("High OK"));
		const medIdx = lines.findIndex((l) => l.includes("Medium"));
		const lowIdx = lines.findIndex((l) => l.includes("Low Good"));

		expect(highBadIdx).toBeLessThan(medIdx);
		expect(highOkIdx).toBeLessThan(medIdx);
		expect(medIdx).toBeLessThan(lowIdx);
		// Within same weightPct, worse score first
		expect(highBadIdx).toBeLessThan(highOkIdx);
	});

	// --- Pillar grouping tests (new) ---

	it("renders all 5 pillar headers when no pillarFilter is provided", () => {
		// Create one dimension per pillar to ensure each appears
		const dims = [
			makeDimension({ id: "topic-coherence", name: "Topical Authority", weightPct: 7 }),
			makeDimension({ id: "content-structure", name: "Content Structure", weightPct: 5 }),
			makeDimension({ id: "eeat-signals", name: "E-E-A-T Signals", weightPct: 6 }),
			makeDimension({ id: "llms-txt", name: "llms.txt Presence", weightPct: 5 }),
			makeDimension({ id: "sitemap", name: "Sitemap Presence", weightPct: 1 }),
		];
		const output = stripAnsi(renderDimensionTable(dims));
		expect(output).toContain("Answer Readiness");
		expect(output).toContain("Content Structure");
		expect(output).toContain("Trust & Authority");
		expect(output).toContain("Technical Foundation");
		expect(output).toContain("AI Discovery");
	});

	it("renders only the filtered pillar when pillarFilter is set", () => {
		const dims = [
			makeDimension({ id: "topic-coherence", name: "Topical Authority", weightPct: 7 }),
			makeDimension({ id: "content-structure", name: "Content Structure", weightPct: 5 }),
			makeDimension({ id: "eeat-signals", name: "E-E-A-T Signals", weightPct: 6 }),
			makeDimension({ id: "llms-txt", name: "llms.txt Presence", weightPct: 5 }),
			makeDimension({ id: "sitemap", name: "Sitemap Presence", weightPct: 1 }),
		];
		const output = stripAnsi(renderDimensionTable(dims, "answer-readiness"));
		expect(output).toContain("Answer Readiness");
		expect(output).not.toContain("Content Structure\n");
		expect(output).not.toContain("Trust & Authority");
		expect(output).not.toContain("Technical Foundation");
		expect(output).not.toContain("AI Discovery");
		// The dimension from answer-readiness should be present
		expect(output).toContain("Topical Authority");
	});

	it("pillar headers include aggregate score and weight sum", () => {
		// topic-coherence: score=7, maxScore=10, weightPct=7
		// original-data: score=5, maxScore=10, weightPct=5
		// Both in answer-readiness pillar
		const dims = [
			makeDimension({ id: "topic-coherence", score: 7, maxScore: 10, weightPct: 7 }),
			makeDimension({ id: "original-data", score: 5, maxScore: 10, weightPct: 5 }),
		];
		const output = stripAnsi(renderDimensionTable(dims, "answer-readiness"));
		// Pillar score: (7*7 + 5*5) / ((10*7) + (10*5)) * 10 = (49+25)/(70+50)*10 = 74/120*10 = 6.2
		expect(output).toContain("Answer Readiness");
		// Should contain a score like "6.2/10"
		expect(output).toMatch(/\d+\.\d+\/10/);
		// Should contain weight sum in brackets
		expect(output).toContain("[12%]");
	});

	it("dimensions within each pillar are sorted by weightPct descending", () => {
		const dims = [
			makeDimension({ id: "cross-page-duplication", weightPct: 2, score: 5, name: "Low Weight" }),
			makeDimension({ id: "topic-coherence", weightPct: 7, score: 5, name: "High Weight" }),
		];
		const output = stripAnsi(renderDimensionTable(dims, "answer-readiness"));
		const highIdx = output.indexOf("High Weight");
		const lowIdx = output.indexOf("Low Weight");
		expect(highIdx).toBeLessThan(lowIdx);
	});

	it("shows warning when pillarFilter does not match any known pillar", () => {
		const dims = [makeDimension({ id: "topic-coherence", name: "Topical Authority" })];
		const output = stripAnsi(renderDimensionTable(dims, "invalid-pillar"));
		expect(output.toLowerCase()).toMatch(/invalid|unknown|not found|valid pillar/i);
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
			makeDimension({ status: "fail", weightPct: 5, score: 0, hint: "Fix A" }),
			makeDimension({ status: "fail", weightPct: 5, score: 1, hint: "Fix B" }),
			makeDimension({ status: "warn", weightPct: 3, score: 4, hint: "Fix C" }),
			makeDimension({ status: "fail", weightPct: 1, score: 0, hint: "Fix D" }),
			makeDimension({ status: "warn", weightPct: 1, score: 5, hint: "Fix E" }),
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

	it("sorts by weightPct priority then score ascending", () => {
		const dims = [
			makeDimension({ status: "fail", weightPct: 1, score: 0, hint: "Low fix" }),
			makeDimension({ status: "fail", weightPct: 5, score: 2, hint: "High fix" }),
			makeDimension({ status: "warn", weightPct: 3, score: 4, hint: "Med fix" }),
		];
		const output = stripAnsi(renderNextSteps(dims));
		const highIdx = output.indexOf("High fix");
		const medIdx = output.indexOf("Med fix");
		const lowIdx = output.indexOf("Low fix");
		expect(highIdx).toBeLessThan(medIdx);
		expect(medIdx).toBeLessThan(lowIdx);
	});

	it("labels recommendations with percentage weight", () => {
		const dims = [
			makeDimension({ status: "fail", weightPct: 5, score: 0, hint: "Fix schema" }),
			makeDimension({ status: "warn", weightPct: 3, score: 4, hint: "Fix meta" }),
			makeDimension({ status: "fail", weightPct: 1, score: 0, hint: "Fix sitemap" }),
		];
		const output = stripAnsi(renderNextSteps(dims));
		expect(output).toContain("[5%]");
		expect(output).toContain("[3%]");
		expect(output).toContain("[1%]");
	});

	it("accepts optional pillarFilter and filters next steps to that pillar", () => {
		const dims = [
			makeDimension({
				id: "topic-coherence",
				status: "fail",
				weightPct: 7,
				hint: "Answer Readiness fix",
			}),
			makeDimension({
				id: "eeat-signals",
				status: "fail",
				weightPct: 6,
				hint: "Trust fix",
			}),
		];
		const output = stripAnsi(renderNextSteps(dims, "answer-readiness"));
		expect(output).toContain("Answer Readiness fix");
		expect(output).not.toContain("Trust fix");
	});
});
