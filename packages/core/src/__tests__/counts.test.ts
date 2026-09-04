import { describe, expect, it } from "vitest";
import {
	DIMENSION_COUNT,
	DIMENSION_DEFS,
	GENERATED_FILE_COUNT,
	GENERATED_FILE_NAMES,
} from "../constants.js";
import { generateFiles } from "../generators/index.js";
import { emptyCrawlerScanFields } from "../crawler-gate.js";
import type { ScanResult } from "../types.js";

describe("published counts", () => {
	it("scores 36 dimensions — the registry is the source of truth", () => {
		expect(DIMENSION_DEFS).toHaveLength(36);
		expect(DIMENSION_COUNT).toBe(36);
		expect(DIMENSION_DEFS.reduce((s, d) => s + d.weightPct, 0)).toBe(100);
	});

	it("generates exactly the 8 named files published CLI writes — no stubs", () => {
		expect(GENERATED_FILE_NAMES).toEqual([
			"llms.txt",
			"llms-full.txt",
			"CLAUDE.md",
			"schema.json",
			"robots-patch.txt",
			"faq-blocks.html",
			"citation-anchors.html",
			"sitemap-ai.xml",
		]);
		expect(GENERATED_FILE_COUNT).toBe(8);
		expect(GENERATED_FILE_NAMES).not.toContain("ai.txt");
		expect(GENERATED_FILE_NAMES).not.toContain("answers.json");
		expect(GENERATED_FILE_NAMES).not.toContain("report.html");
	});

	it("generateFiles() names match GENERATED_FILE_NAMES", () => {
		const stub = {
			url: "https://example.com",
			siteName: "Example",
			siteDescription: "",
			score: 0,
			grade: "F",
			dimensions: [],
			pageScores: [],
			files: [],
			pages: [],
			meta: {
				url: "https://example.com",
				robotsTxt: { raw: null, crawlerAccess: {}, crawlDelay: null },
				sitemapXml: null,
				existingLlmsTxt: null,
				platform: null,
				responseTimeMs: 0,
				aiTxt: null,
				sitemapLastmods: [],
			},
			pagesScanned: 0,
			duration: 0,
			scannedAt: "2026-09-03T00:00:00.000Z",
			...emptyCrawlerScanFields(),
		} satisfies ScanResult;
		expect(generateFiles(stub).map((f) => f.name)).toEqual([...GENERATED_FILE_NAMES]);
	});
});
