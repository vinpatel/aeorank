// Types
export type {
	ScannedPage,
	Heading,
	PageLink,
	ScanMeta,
	ScanResult,
	DimensionScore,
	GeneratedFile,
	ScanConfig,
	AeorankConfig,
	DimensionDef,
} from "./types.js";

// Constants
export {
	DIMENSION_DEFS,
	GRADE_THRESHOLDS,
	STATUS_THRESHOLDS,
	WEIGHT_MULTIPLIER,
	DEFAULT_CONFIG,
	AI_CRAWLERS,
} from "./constants.js";

// Utilities
export {
	normalizeUrl,
	getGrade,
	getStatus,
	getDimensionStatus,
	calculateWeightedScore,
	slugify,
} from "./utils.js";

// Scanner
export {
	scanUrl,
	parsePage,
	parseRobotsTxt,
	createFetcher,
	discoverUrls,
} from "./scanner/index.js";
export type { RobotsInfo } from "./scanner/index.js";
export type { FetcherFn, FetchResult } from "./scanner/index.js";

// Scorer
export { calculateAeoScore } from "./scorer/index.js";

// Generators
export { generateFiles } from "./generators/index.js";

import { generateFiles as _generateFiles } from "./generators/index.js";
// Convenience API
import type { FetcherFn } from "./scanner/index.js";
import { scanUrl } from "./scanner/index.js";
import { calculateAeoScore } from "./scorer/index.js";
import type { ScanConfig, ScanResult } from "./types.js";

/** Full scan pipeline: fetch pages -> score -> generate files */
export async function scan(
	url: string,
	config?: Partial<ScanConfig>,
	customFetcher?: FetcherFn,
): Promise<ScanResult> {
	const startTime = performance.now();

	// Step 1: Scan URL
	const { pages, meta } = await scanUrl(url, config, customFetcher);

	// Step 2: Score
	const { score, grade, dimensions } = calculateAeoScore(pages, meta);

	// Step 3: Build partial result for generators
	const siteName = extractSiteName(pages, url);
	const siteDescription = extractSiteDescription(pages);

	const partialResult: ScanResult = {
		url,
		siteName,
		siteDescription,
		score,
		grade,
		dimensions,
		files: [],
		pages,
		meta,
		pagesScanned: pages.length,
		duration: Math.round(performance.now() - startTime),
		scannedAt: new Date().toISOString(),
	};

	// Step 4: Generate files
	const files = _generateFiles(partialResult);

	return { ...partialResult, files };
}

function extractSiteName(pages: import("./types.js").ScannedPage[], url: string): string {
	// Try to get from Organization schema
	for (const page of pages) {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			if (s["@type"] === "Organization" && typeof s.name === "string") return s.name;
			if (s["@type"] === "WebSite" && typeof s.name === "string") return s.name;
		}
	}
	// Fallback to title of first page or hostname
	if (pages.length > 0 && pages[0].title) {
		return pages[0].title.split(/[|\-–—]/)[0].trim();
	}
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

function extractSiteDescription(pages: import("./types.js").ScannedPage[]): string {
	// Use meta description of first page
	if (pages.length > 0 && pages[0].metaDescription) {
		return pages[0].metaDescription;
	}
	return "";
}
