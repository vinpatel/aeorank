import { AI_CRAWLERS } from "../constants.js";
import type { DimensionScore, ScanMeta, ScannedPage } from "../types.js";
import { getDimensionStatus } from "./grades.js";

type DimensionScorer = (pages: ScannedPage[], meta: ScanMeta) => DimensionScore;

/** Dimension 1: llms.txt Presence (high weight) */
export function scoreLlmsTxt(pages: ScannedPage[], meta: ScanMeta): DimensionScore {
	let score = 0;
	const txt = meta.existingLlmsTxt;

	if (txt) {
		const hasH1 = /^#\s+\S/m.test(txt);
		const hasBlockquote = /^>\s+\S/m.test(txt);
		const h2Sections = (txt.match(/^##\s+\S/gm) || []).length;
		const hasLinks = /\[.*?\]\(.*?\)/.test(txt);

		if (hasH1 && hasBlockquote && h2Sections >= 3 && hasLinks) {
			score = 10;
		} else if (hasH1 && hasBlockquote && h2Sections >= 1) {
			score = 6;
		} else if (txt.trim().length > 0) {
			score = 3;
		}
	}

	return {
		id: "llms-txt",
		name: "llms.txt Presence",
		score,
		maxScore: 10,
		weight: "high",
		status: getDimensionStatus(score, 10),
		hint:
			score < 10
				? "Create /llms.txt with H1 title, blockquote summary, and H2 sections linking to key pages"
				: "llms.txt is well-structured",
	};
}

/** Dimension 2: Schema.org Markup (high weight) */
export function scoreSchemaMarkup(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const targetTypes = new Set([
		"Organization",
		"WebSite",
		"FAQPage",
		"Article",
		"BreadcrumbList",
		"Person",
		"Product",
	]);
	const foundTypes = new Set<string>();

	for (const page of pages) {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			const type = s["@type"];
			if (typeof type === "string" && targetTypes.has(type)) {
				foundTypes.add(type);
			}
			// Check @graph arrays
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					if (typeof item["@type"] === "string" && targetTypes.has(item["@type"])) {
						foundTypes.add(item["@type"]);
					}
				}
			}
		}
	}

	let score: number;
	if (foundTypes.size >= 5) score = 10;
	else if (foundTypes.size >= 3) score = 7;
	else if (foundTypes.size >= 1) score = 4;
	else score = 0;

	return {
		id: "schema-markup",
		name: "Schema.org Markup",
		score,
		maxScore: 10,
		weight: "high",
		status: getDimensionStatus(score, 10),
		hint:
			score < 10
				? `Add schema.org types: ${[...targetTypes]
						.filter((t) => !foundTypes.has(t))
						.slice(0, 3)
						.join(", ")}`
				: "Comprehensive schema.org markup present",
	};
}

/** Dimension 3: AI Crawler Access (medium weight) */
export function scoreAiCrawlerAccess(_pages: ScannedPage[], meta: ScanMeta): DimensionScore {
	let allowedCount = 0;
	for (const crawler of AI_CRAWLERS) {
		if (meta.robotsTxt.crawlerAccess[crawler] === "allowed") {
			allowedCount++;
		}
	}

	let score: number;
	if (allowedCount >= 5) score = 10;
	else if (allowedCount >= 3) score = 7;
	else if (allowedCount >= 1) score = 4;
	else score = 0;

	return {
		id: "ai-crawler-access",
		name: "AI Crawler Access",
		score,
		maxScore: 10,
		weight: "medium",
		status: getDimensionStatus(score, 10),
		hint:
			score < 10
				? "Allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) in robots.txt"
				: "All AI crawlers allowed",
	};
}

/** Dimension 4: Content Structure (high weight) */
export function scoreContentStructure(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"content-structure",
			"Content Structure",
			0,
			"high",
			"No pages to analyze",
		);
	}

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let pagesWithH1 = 0;
	let pagesWithHierarchy = 0;

	for (const page of sortedPages) {
		const hasH1 = page.headings.some((h) => h.level === 1);
		if (hasH1) pagesWithH1++;

		// Check for proper hierarchy (h1 -> h2 -> h3)
		const levels = page.headings.map((h) => h.level);
		let hasGoodHierarchy = hasH1;
		for (let i = 1; i < levels.length; i++) {
			if (levels[i] - levels[i - 1] > 1) {
				hasGoodHierarchy = false;
				break;
			}
		}
		if (hasGoodHierarchy && levels.length >= 2) pagesWithHierarchy++;
	}

	const h1Pct = pagesWithH1 / sortedPages.length;
	const hierPct = pagesWithHierarchy / sortedPages.length;

	let score: number;
	if (h1Pct > 0.8 && hierPct > 0.5) score = 10;
	else if (h1Pct > 0.5 && hierPct > 0.3) score = 6;
	else if (h1Pct > 0.3) score = 3;
	else score = 0;

	return makeDimension(
		"content-structure",
		"Content Structure",
		score,
		"high",
		score < 10
			? "Add H1 to every page and maintain proper heading hierarchy (H1->H2->H3)"
			: "Strong content structure",
	);
}

/** Dimension 5: Answer-First Formatting (medium weight) */
export function scoreAnswerFirst(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"answer-first",
			"Answer-First Formatting",
			0,
			"medium",
			"No pages to analyze",
		);
	}

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let conciseLeadCount = 0;

	for (const page of sortedPages) {
		const firstParagraph = page.bodyText.split(/\n\n/)[0] || "";
		if (firstParagraph.length > 0 && firstParagraph.length < 300) {
			conciseLeadCount++;
		}
	}

	const pct = conciseLeadCount / sortedPages.length;
	let score: number;
	if (pct > 0.6) score = 10;
	else if (pct > 0.3) score = 6;
	else if (pct > 0.1) score = 3;
	else score = 0;

	return makeDimension(
		"answer-first",
		"Answer-First Formatting",
		score,
		"medium",
		score < 10
			? "Start pages with concise lead paragraphs (<300 chars) that directly answer the page topic"
			: "Good answer-first formatting",
	);
}

/** Dimension 6: FAQ & Speakable (medium weight) */
export function scoreFaqSpeakable(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	let hasFaqSchema = false;
	let faqQaPairs = 0;
	let hasFaqContent = false;

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	for (const page of sortedPages) {
		// Check for FAQPage schema
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			if (s["@type"] === "FAQPage") {
				hasFaqSchema = true;
				const mainEntity = s.mainEntity;
				if (Array.isArray(mainEntity)) {
					faqQaPairs += mainEntity.length;
				}
			}
		}

		// Check for FAQ-like headings
		const faqHeadings = page.headings.filter((h) => h.text.includes("?") || /faq/i.test(h.text));
		if (faqHeadings.length > 0) hasFaqContent = true;
	}

	let score: number;
	if (hasFaqSchema && faqQaPairs >= 3) score = 10;
	else if (hasFaqSchema) score = 6;
	else if (hasFaqContent) score = 3;
	else score = 0;

	return makeDimension(
		"faq-speakable",
		"FAQ & Speakable",
		score,
		"medium",
		score < 10
			? "Add FAQPage schema markup with 3+ question-answer pairs"
			: "FAQ schema is well-implemented",
	);
}

/** Dimension 7: E-E-A-T Signals (medium weight) */
export function scoreEeatSignals(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let hasAuthor = false;
	let hasDates = false;
	let hasAboutPage = false;

	for (const page of sortedPages) {
		if (page.authorName) hasAuthor = true;
		if (page.hasDatePublished) hasDates = true;
		if (/\/about/i.test(page.url)) hasAboutPage = true;
	}

	let score: number;
	const signals = [hasAuthor, hasDates, hasAboutPage].filter(Boolean).length;
	if (signals >= 3) score = 10;
	else if (signals >= 2) score = 7;
	else if (signals >= 1) score = 4;
	else score = 0;

	return makeDimension(
		"eeat-signals",
		"E-E-A-T Signals",
		score,
		"medium",
		score < 10
			? "Add author names, publication dates, and an About page with credentials"
			: "Strong E-E-A-T signals",
	);
}

/** Dimension 8: Meta Descriptions (medium weight) */
export function scoreMetaDescriptions(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"meta-descriptions",
			"Meta Descriptions",
			0,
			"medium",
			"No pages to analyze",
		);
	}

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let withMeta = 0;
	let optimalLength = 0;

	for (const page of sortedPages) {
		if (page.metaDescription) {
			withMeta++;
			if (page.metaDescription.length >= 50 && page.metaDescription.length <= 160) {
				optimalLength++;
			}
		}
	}

	const metaPct = withMeta / sortedPages.length;
	const optPct = withMeta > 0 ? optimalLength / withMeta : 0;

	let score: number;
	if (metaPct > 0.8 && optPct > 0.8) score = 10;
	else if (metaPct > 0.5) score = 7;
	else if (metaPct > 0.3) score = 4;
	else score = 0;

	return makeDimension(
		"meta-descriptions",
		"Meta Descriptions",
		score,
		"medium",
		score < 10
			? "Add meta descriptions (50-160 chars) to all pages"
			: "Meta descriptions are optimal",
	);
}

/** Dimension 9: Sitemap Presence (low weight) */
export function scoreSitemap(pages: ScannedPage[], meta: ScanMeta): DimensionScore {
	const hasSitemap = meta.sitemapXml !== null;

	let score: number;
	if (hasSitemap) {
		score = 8; // Sitemap exists (we don't parse lastmod in detail here)
	} else {
		score = 0;
	}

	return makeDimension(
		"sitemap",
		"Sitemap Presence",
		score,
		"low",
		score < 10 ? "Create and maintain an XML sitemap with lastmod dates" : "Sitemap is up to date",
	);
}

/** Dimension 10: HTTPS & Redirects (low weight) */
export function scoreHttpsRedirects(pages: ScannedPage[], meta: ScanMeta): DimensionScore {
	const isHttps = meta.url.startsWith("https://");

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let hasCanonical = 0;
	for (const page of sortedPages) {
		if (page.canonical) hasCanonical++;
	}
	const canonicalPct = pages.length > 0 ? hasCanonical / pages.length : 0;

	let score: number;
	if (isHttps && canonicalPct > 0.5) score = 10;
	else if (isHttps) score = 5;
	else score = 0;

	return makeDimension(
		"https-redirects",
		"HTTPS & Redirects",
		score,
		"low",
		score < 10
			? "Ensure HTTPS and add canonical URLs to all pages"
			: "HTTPS and canonical URLs configured",
	);
}

/** Dimension 11: Page Freshness (low weight) */
export function scorePageFreshness(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension("page-freshness", "Page Freshness", 0, "low", "No pages to analyze");
	}

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let pagesWithDates = 0;

	for (const page of sortedPages) {
		if (page.hasDatePublished) pagesWithDates++;
	}

	const pct = pagesWithDates / sortedPages.length;
	let score: number;
	if (pct > 0.5) score = 10;
	else if (pct > 0.2) score = 6;
	else if (pct > 0) score = 3;
	else score = 0;

	return makeDimension(
		"page-freshness",
		"Page Freshness",
		score,
		"low",
		score < 10
			? "Add publication and last-modified dates to content pages"
			: "Date signals present",
	);
}

/** Dimension 12: Citation Anchors (medium weight) */
export function scoreCitationAnchors(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"citation-anchors",
			"Citation Anchors",
			0,
			"medium",
			"No pages to analyze",
		);
	}

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let totalH2H3 = 0;
	let withId = 0;

	for (const page of sortedPages) {
		for (const heading of page.headings) {
			if (heading.level === 2 || heading.level === 3) {
				totalH2H3++;
				if (heading.id) withId++;
			}
		}
	}

	const pct = totalH2H3 > 0 ? withId / totalH2H3 : 0;
	let score: number;
	if (pct > 0.6) score = 10;
	else if (pct > 0.3) score = 6;
	else if (pct > 0.1) score = 3;
	else score = 0;

	return makeDimension(
		"citation-anchors",
		"Citation Anchors",
		score,
		"medium",
		score < 10
			? "Add id attributes to H2 and H3 headings for deep linking"
			: "Headings are deep-linkable",
	);
}

/** Registry mapping dimension IDs to scorer functions */
export const DIMENSION_SCORERS: Record<string, DimensionScorer> = {
	"llms-txt": scoreLlmsTxt,
	"schema-markup": scoreSchemaMarkup,
	"ai-crawler-access": scoreAiCrawlerAccess,
	"content-structure": scoreContentStructure,
	"answer-first": scoreAnswerFirst,
	"faq-speakable": scoreFaqSpeakable,
	"eeat-signals": scoreEeatSignals,
	"meta-descriptions": scoreMetaDescriptions,
	sitemap: scoreSitemap,
	"https-redirects": scoreHttpsRedirects,
	"page-freshness": scorePageFreshness,
	"citation-anchors": scoreCitationAnchors,
};

function makeDimension(
	id: string,
	name: string,
	score: number,
	weight: "high" | "medium" | "low",
	hint: string,
): DimensionScore {
	return {
		id,
		name,
		score,
		maxScore: 10,
		weight,
		status: getDimensionStatus(score, 10),
		hint,
	};
}
