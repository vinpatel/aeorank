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
export { scanUrl, parsePage, parseRobotsTxt, createFetcher, discoverUrls } from "./scanner/index.js";
export type { RobotsInfo } from "./scanner/index.js";
export type { FetcherFn, FetchResult } from "./scanner/index.js";

// Scorer
export { calculateAeoScore } from "./scorer/index.js";
