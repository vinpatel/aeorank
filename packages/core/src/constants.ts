import type { DimensionDef, ScanConfig } from "./types.js";

export interface PillarGroup {
	id: string;
	name: string;
	dimensionIds: string[];
}

/**
 * All 36 AEO scoring dimensions with percentage-based weights.
 * Weights sum to exactly 100.
 * speakable-schema absorbed into faq-speakable (+1%).
 * author-schema absorbed into eeat-signals (+2%).
 */
export const DIMENSION_DEFS: DimensionDef[] = [
	// Original 12 (redistributed)
	{ id: "llms-txt", name: "llms.txt Presence", weightPct: 5, maxScore: 10 },
	{ id: "schema-markup", name: "Schema.org Markup", weightPct: 4, maxScore: 10 },
	{ id: "content-structure", name: "Content Structure", weightPct: 5, maxScore: 10 },
	{ id: "ai-crawler-access", name: "AI Crawler Access", weightPct: 3, maxScore: 10 },
	{ id: "answer-first", name: "Answer-First Formatting", weightPct: 4, maxScore: 10 },
	{ id: "faq-speakable", name: "FAQ & Speakable", weightPct: 5, maxScore: 10 },
	{ id: "eeat-signals", name: "E-E-A-T Signals", weightPct: 6, maxScore: 10 },
	{ id: "meta-descriptions", name: "Meta Descriptions", weightPct: 2, maxScore: 10 },
	{ id: "citation-anchors", name: "Citation Anchors", weightPct: 2, maxScore: 10 },
	{ id: "sitemap", name: "Sitemap Presence", weightPct: 1, maxScore: 10 },
	{ id: "https-redirects", name: "HTTPS & Redirects", weightPct: 2, maxScore: 10 },
	{ id: "page-freshness", name: "Page Freshness", weightPct: 2, maxScore: 10 },
	// Phase 8 — Answer Readiness (7)
	{ id: "topic-coherence", name: "Topical Authority", weightPct: 7, maxScore: 10 },
	{ id: "original-data", name: "Original Research & Data", weightPct: 5, maxScore: 10 },
	{ id: "fact-density", name: "Fact & Data Density", weightPct: 4, maxScore: 10 },
	{ id: "duplicate-content", name: "Duplicate Content", weightPct: 4, maxScore: 10 },
	{ id: "cross-page-duplication", name: "Cross-Page Duplication", weightPct: 2, maxScore: 10 },
	{ id: "evidence-packaging", name: "Evidence Packaging", weightPct: 2, maxScore: 10 },
	{ id: "citation-ready-writing", name: "Citation-Ready Writing", weightPct: 2, maxScore: 10 },
	// Phase 9 — Content Structure (6)
	{ id: "qa-format", name: "Q&A Content Format", weightPct: 4, maxScore: 10 },
	{ id: "direct-answer-density", name: "Direct Answer Density", weightPct: 4, maxScore: 10 },
	{ id: "query-answer-alignment", name: "Query-Answer Alignment", weightPct: 2, maxScore: 10 },
	{ id: "tables-lists", name: "Tables & Lists", weightPct: 2, maxScore: 10 },
	{ id: "definition-patterns", name: "Definition Patterns", weightPct: 2, maxScore: 10 },
	{ id: "entity-disambiguation", name: "Entity Disambiguation", weightPct: 2, maxScore: 10 },
	// Phase 10 — Trust & Authority (author-schema absorbed into eeat-signals)
	{ id: "internal-linking", name: "Internal Linking", weightPct: 4, maxScore: 10 },
	// Phase 11 — Technical Foundation (speakable-schema absorbed into faq-speakable)
	{ id: "semantic-html", name: "Semantic HTML", weightPct: 2, maxScore: 10 },
	{ id: "extraction-friction", name: "Extraction Friction", weightPct: 2, maxScore: 10 },
	{ id: "image-context", name: "Image Context for AI", weightPct: 1, maxScore: 10 },
	{ id: "schema-coverage", name: "Schema Coverage", weightPct: 1, maxScore: 10 },
	// Phase 12 — AI Discovery (canonical-urls and visible-dates kept as separate dimensions)
	{ id: "content-cannibalization", name: "Content Cannibalization", weightPct: 2, maxScore: 10 },
	{ id: "publishing-velocity", name: "Publishing Velocity", weightPct: 1, maxScore: 10 },
	{ id: "content-licensing", name: "Content Licensing", weightPct: 1, maxScore: 10 },
	{ id: "canonical-urls", name: "Canonical URLs", weightPct: 1, maxScore: 10 },
	{ id: "rss-feed", name: "RSS/Atom Feed", weightPct: 1, maxScore: 10 },
	{ id: "visible-dates", name: "Visible Date Signals", weightPct: 1, maxScore: 10 },
];
// Verify sum at runtime in development
// DIMENSION_DEFS.reduce((s, d) => s + d.weightPct, 0) === 100

/**
 * Five AEO scoring pillars, each grouping related dimension IDs.
 * Single source of truth for pillar membership — used by the dashboard
 * and any surface that needs to display grouped scores.
 */
export const PILLAR_GROUPS: PillarGroup[] = [
	{
		id: "answer-readiness",
		name: "Answer Readiness",
		dimensionIds: [
			"topic-coherence",
			"original-data",
			"fact-density",
			"duplicate-content",
			"cross-page-duplication",
			"evidence-packaging",
			"citation-ready-writing",
		],
	},
	{
		id: "content-structure",
		name: "Content Structure",
		dimensionIds: [
			"content-structure",
			"answer-first",
			"qa-format",
			"direct-answer-density",
			"query-answer-alignment",
			"tables-lists",
			"definition-patterns",
			"entity-disambiguation",
		],
	},
	{
		id: "trust-authority",
		name: "Trust & Authority",
		dimensionIds: [
			"eeat-signals",
			"citation-anchors",
			"internal-linking",
		],
	},
	{
		id: "technical-foundation",
		name: "Technical Foundation",
		dimensionIds: [
			"llms-txt",
			"schema-markup",
			"ai-crawler-access",
			"faq-speakable",
			"meta-descriptions",
			"semantic-html",
			"extraction-friction",
			"image-context",
			"schema-coverage",
		],
	},
	{
		id: "ai-discovery",
		name: "AI Discovery",
		dimensionIds: [
			"sitemap",
			"https-redirects",
			"page-freshness",
			"content-cannibalization",
			"publishing-velocity",
			"content-licensing",
			"canonical-urls",
			"rss-feed",
			"visible-dates",
		],
	},
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
