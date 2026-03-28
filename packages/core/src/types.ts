/** A single parsed page from a scan */
export interface ScannedPage {
	url: string;
	title: string;
	metaDescription: string;
	headings: Heading[];
	bodyText: string;
	schemaOrg: object[];
	links: PageLink[];
	canonical: string | null;
	robotsMeta: string | null;
	language: string | null;
	wordCount: number;
	hasDatePublished: boolean;
	authorName: string | null;
	/** Paragraph text blocks extracted from main content */
	paragraphs: string[];
	/** Individual sentences extracted from paragraphs */
	sentences: string[];
	/** SHA-256-like hash of normalized paragraph text for cross-page dedup */
	contentHash: string;
	/** Headings that start with a question word or contain "?" */
	questionHeadings: { text: string; level: number }[];
	/** Count of <table> elements with at least one <th> or <thead> */
	tableCount: number;
	/** Count of <ol> and <ul> elements with at least 2 <li> children */
	listCount: number;
	/** Counts of semantic HTML5 elements found: main, article, nav, aside, section, header, footer */
	semanticElements: { main: number; article: number; nav: number; aside: number; section: number; header: number; footer: number };
	/** Number of ARIA role attributes found on any element */
	ariaRoleCount: number;
	/** Number of figure elements containing figcaption */
	figureCount: number;
	/** Total img elements on the page */
	imgCount: number;
	/** Number of img elements with non-empty alt attribute */
	imgsWithAlt: number;
	/** Average sentence length in words across all sentences */
	avgSentenceLength: number;
	/** RSS/Atom feed links found in <link> tags */
	rssFeeds: { href: string; type: string }[];
	/** Count of <time> elements with a datetime attribute */
	timeElementCount: number;
}

export interface Heading {
	level: number;
	text: string;
	id: string | null;
}

export interface PageLink {
	href: string;
	text: string;
	internal: boolean;
}

/** Metadata collected during scan (robots.txt, sitemap, etc.) */
export interface ScanMeta {
	url: string;
	robotsTxt: {
		raw: string | null;
		crawlerAccess: Record<string, "allowed" | "disallowed" | "unknown">;
		crawlDelay: number | null;
	};
	sitemapXml: string | null;
	existingLlmsTxt: string | null;
	platform: string | null;
	responseTimeMs: number;
	/** Contents of /ai.txt file (null if not found) */
	aiTxt: string | null;
	/** lastmod dates extracted from sitemap.xml entries (ISO strings) */
	sitemapLastmods: string[];
}

/** Complete scan result with score, dimensions, and generated files */
export interface ScanResult {
	url: string;
	siteName: string;
	siteDescription: string;
	score: number;
	grade: string;
	dimensions: DimensionScore[];
	pageScores: PageScore[];
	files: GeneratedFile[];
	pages: ScannedPage[];
	meta: ScanMeta;
	pagesScanned: number;
	duration: number;
	scannedAt: string;
}

/** Per-page score summary */
export interface PageScore {
	url: string;
	title: string;
	score: number;
	grade: string;
	dimensions: Pick<DimensionScore, "id" | "score" | "status">[];
}

/** Score for a single dimension (0-10) */
export interface DimensionScore {
	id: string;
	name: string;
	score: number;
	maxScore: number;
	weightPct: number;
	status: "pass" | "warn" | "fail";
	hint: string;
}

/** A generated file (name + content string) */
export interface GeneratedFile {
	name: string;
	content: string;
}

/** Progress callback — receives percentage (0-100) and human-readable message */
export type OnProgressFn = (percent: number, message: string) => void;

/** Scanner configuration */
export interface ScanConfig {
	maxPages: number;
	concurrency: number;
	timeout: number;
	userAgent: string;
	respectCrawlDelay: boolean;
	onProgress?: OnProgressFn;
	browser?: boolean; // Use Playwright for JS-rendered pages (SPAs)
}

/** Top-level AEOrank config */
export interface AeorankConfig {
	site: {
		url: string;
		name?: string;
		description?: string;
	};
	output: {
		dir: string;
	};
	scanner: Partial<ScanConfig>;
}

/** Definition of a scoring dimension */
export interface DimensionDef {
	id: string;
	name: string;
	weightPct: number;
	maxScore: number;
}
