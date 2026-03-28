import type { DimensionDef, ScanConfig } from "./types.js";

/** All 32 AEO scoring dimensions */
export const DIMENSION_DEFS: DimensionDef[] = [
	{ id: "llms-txt", name: "llms.txt Presence", weight: "high", maxScore: 10 },
	{ id: "schema-markup", name: "Schema.org Markup", weight: "high", maxScore: 10 },
	{ id: "ai-crawler-access", name: "AI Crawler Access", weight: "medium", maxScore: 10 },
	{ id: "content-structure", name: "Content Structure", weight: "high", maxScore: 10 },
	{ id: "answer-first", name: "Answer-First Formatting", weight: "medium", maxScore: 10 },
	{ id: "faq-speakable", name: "FAQ & Speakable", weight: "medium", maxScore: 10 },
	{ id: "eeat-signals", name: "E-E-A-T Signals", weight: "medium", maxScore: 10 },
	{ id: "meta-descriptions", name: "Meta Descriptions", weight: "medium", maxScore: 10 },
	{ id: "sitemap", name: "Sitemap Presence", weight: "low", maxScore: 10 },
	{ id: "https-redirects", name: "HTTPS & Redirects", weight: "low", maxScore: 10 },
	{ id: "page-freshness", name: "Page Freshness", weight: "low", maxScore: 10 },
	{ id: "citation-anchors", name: "Citation Anchors", weight: "medium", maxScore: 10 },
	{ id: "topic-coherence", name: "Topical Authority", weight: "high", maxScore: 10 },
	{ id: "original-data", name: "Original Research & Data", weight: "medium", maxScore: 10 },
	{ id: "fact-density", name: "Fact & Data Density", weight: "medium", maxScore: 10 },
	{ id: "duplicate-content", name: "Duplicate Content", weight: "medium", maxScore: 10 },
	{ id: "cross-page-duplication", name: "Cross-Page Duplication", weight: "low", maxScore: 10 },
	{ id: "evidence-packaging", name: "Evidence Packaging", weight: "low", maxScore: 10 },
	{ id: "citation-ready-writing", name: "Citation-Ready Writing", weight: "low", maxScore: 10 },
	{ id: "qa-format", name: "Q&A Content Format", weight: "medium", maxScore: 10 },
	{ id: "direct-answer-density", name: "Direct Answer Density", weight: "medium", maxScore: 10 },
	{ id: "query-answer-alignment", name: "Query-Answer Alignment", weight: "low", maxScore: 10 },
	{ id: "tables-lists", name: "Tables & Lists", weight: "low", maxScore: 10 },
	{ id: "definition-patterns", name: "Definition Patterns", weight: "low", maxScore: 10 },
	{ id: "entity-disambiguation", name: "Entity Disambiguation", weight: "low", maxScore: 10 },
	{ id: "internal-linking", name: "Internal Linking", weight: "medium", maxScore: 10 },
	{ id: "author-schema", name: "Author & Expert Schema", weight: "low", maxScore: 10 },
	{ id: "semantic-html", name: "Semantic HTML", weight: "low", maxScore: 10 },
	{ id: "extraction-friction", name: "Extraction Friction", weight: "low", maxScore: 10 },
	{ id: "image-context", name: "Image Context for AI", weight: "low", maxScore: 10 },
	{ id: "schema-coverage", name: "Schema Coverage", weight: "low", maxScore: 10 },
	{ id: "speakable-schema", name: "Speakable Schema", weight: "low", maxScore: 10 },
	{ id: "content-cannibalization", name: "Content Cannibalization", weight: "low", maxScore: 10 },
	{ id: "publishing-velocity", name: "Publishing Velocity", weight: "low", maxScore: 10 },
	{ id: "content-licensing", name: "Content Licensing", weight: "low", maxScore: 10 },
];

/** Grade thresholds (score >= threshold = that grade) */
export const GRADE_THRESHOLDS = {
	"A+": 95,
	A: 85,
	B: 70,
	C: 55,
	D: 40,
} as const;

/** Status thresholds for dimension scores (as percentage of maxScore) */
export const STATUS_THRESHOLDS = {
	pass: 70,
	warn: 40,
} as const;

/** Weight multipliers for weighted score calculation */
export const WEIGHT_MULTIPLIER = {
	high: 1.5,
	medium: 1.0,
	low: 0.5,
} as const;

/** Maximum crawl delay (in seconds) we'll respect — anything higher gets capped */
export const MAX_CRAWL_DELAY = 2;

/** Maximum total scan time budget in milliseconds (4 minutes, leaving buffer for 5-min serverless limit) */
export const SCAN_TIME_BUDGET_MS = 240_000;

/** Default scanner configuration */
export const DEFAULT_CONFIG: ScanConfig = {
	maxPages: 200,
	concurrency: 5,
	timeout: 30_000,
	userAgent: "AEOrank/1.0 (+https://aeorank.dev)",
	respectCrawlDelay: true,
};

/** AI crawlers to check in robots.txt */
export const AI_CRAWLERS = [
	"GPTBot",
	"ClaudeBot",
	"PerplexityBot",
	"Google-Extended",
	"anthropic-ai",
] as const;
