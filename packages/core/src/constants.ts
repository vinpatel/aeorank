import type { DimensionDef, ScanConfig } from "./types.js";

/** All 12 AEO scoring dimensions with weights */
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

/** Default scanner configuration */
export const DEFAULT_CONFIG: ScanConfig = {
	maxPages: 50,
	concurrency: 3,
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
