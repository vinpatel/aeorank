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

const STOPWORDS = new Set([
	"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for",
	"of", "and", "or", "but", "with", "from", "by", "as", "it", "this", "that",
	"not", "be", "has", "have", "had", "do", "does", "did", "will", "would",
	"can", "could", "should",
]);

/** Dimension 13: Topic Coherence (high weight) */
export function scoreTopicCoherence(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length < 2) {
		return makeDimension(
			"topic-coherence",
			"Topical Authority",
			5,
			"high",
			"Not enough pages to assess topical authority",
		);
	}

	// Build word frequency map from all heading texts
	const wordFreq = new Map<string, number>();
	for (const page of pages) {
		for (const heading of page.headings) {
			const words = heading.text.toLowerCase().split(/\s+/);
			for (const word of words) {
				const clean = word.replace(/[^a-z0-9]/g, "");
				if (clean.length > 2 && !STOPWORDS.has(clean)) {
					wordFreq.set(clean, (wordFreq.get(clean) ?? 0) + 1);
				}
			}
		}
	}

	// Find top 5 keywords by frequency
	const top5 = [...wordFreq.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([word]) => word);

	if (top5.length === 0) {
		return makeDimension(
			"topic-coherence",
			"Topical Authority",
			0,
			"high",
			"Focus content around consistent core topics across all pages",
		);
	}

	// Count pages containing at least 2 of the top-5 keywords in bodyText
	let matchingPages = 0;
	for (const page of pages) {
		const bodyLower = page.bodyText.toLowerCase();
		const matchCount = top5.filter((kw) => bodyLower.includes(kw)).length;
		if (matchCount >= 2) matchingPages++;
	}

	const pct = matchingPages / pages.length;
	let score: number;
	if (pct > 0.7) score = 10;
	else if (pct > 0.5) score = 7;
	else if (pct > 0.3) score = 4;
	else score = 0;

	return makeDimension(
		"topic-coherence",
		"Topical Authority",
		score,
		"high",
		score < 10
			? "Focus content around consistent core topics across all pages"
			: "Strong topical authority across pages",
	);
}

const ORIGINAL_DATA_PATTERNS = [
	/our (research|study|data|survey|analysis)/i,
	/case study/i,
	/\d+%\s+of\s+(our|surveyed|respondents)/i,
	/we (found|discovered|measured|analyzed)/i,
	/proprietary/i,
	/original (research|data)/i,
];

/** Dimension 14: Original Research & Data (medium weight) */
export function scoreOriginalData(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"original-data",
			"Original Research & Data",
			0,
			"medium",
			"Add original research, case studies, or proprietary data to establish authority",
		);
	}

	let pagesWithData = 0;
	for (const page of pages) {
		const allText = page.sentences.join(" ");
		const hasMatch = ORIGINAL_DATA_PATTERNS.some((pattern) => pattern.test(allText));
		if (hasMatch) pagesWithData++;
	}

	const pct = pagesWithData / pages.length;
	let score: number;
	if (pct > 0.5) score = 10;
	else if (pct > 0.3) score = 7;
	else if (pct > 0.15) score = 4;
	else if (pct > 0) score = 2;
	else score = 0;

	return makeDimension(
		"original-data",
		"Original Research & Data",
		score,
		"medium",
		score < 10
			? "Add original research, case studies, or proprietary data to establish authority"
			: "Strong original research and data presence",
	);
}

const FACT_PATTERNS = [
	/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*%/,
	/\b\d+(?:\.\d+)?\s*(million|billion|thousand|x|times|percent)/i,
	/\b(19|20)\d{2}\b/,
	/\$\d+/,
];

/** Dimension 15: Fact & Data Density (medium weight) */
export function scoreFactDensity(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"fact-density",
			"Fact & Data Density",
			0,
			"medium",
			"Include specific numbers, statistics, and data points to increase credibility",
		);
	}

	let totalFacts = 0;
	for (const page of pages) {
		for (const sentence of page.sentences) {
			for (const pattern of FACT_PATTERNS) {
				const matches = sentence.match(new RegExp(pattern.source, `g${pattern.flags.replace("g", "")}`));
				if (matches) totalFacts += matches.length;
			}
		}
	}

	const avgFacts = totalFacts / pages.length;
	let score: number;
	if (avgFacts >= 5) score = 10;
	else if (avgFacts >= 3) score = 7;
	else if (avgFacts >= 1) score = 4;
	else if (avgFacts > 0) score = 2;
	else score = 0;

	return makeDimension(
		"fact-density",
		"Fact & Data Density",
		score,
		"medium",
		score < 10
			? "Include specific numbers, statistics, and data points to increase credibility"
			: "Strong fact and data density",
	);
}

/** Dimension 16: Duplicate Content (medium weight) */
export function scoreDuplicateContent(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"duplicate-content",
			"Duplicate Content",
			10,
			"medium",
			"Remove repeated content blocks within pages to improve content quality",
		);
	}

	let totalDuplicates = 0;
	for (const page of pages) {
		const seen = new Set<string>();
		let dupeCount = 0;
		for (const para of page.paragraphs) {
			const normalized = para.toLowerCase().replace(/\s+/g, " ").trim();
			if (seen.has(normalized)) {
				dupeCount++;
			} else {
				seen.add(normalized);
			}
		}
		totalDuplicates += dupeCount;
	}

	const avgDupes = totalDuplicates / pages.length;
	let score: number;
	if (avgDupes === 0) score = 10;
	else if (avgDupes < 1) score = 8;
	else if (avgDupes < 2) score = 5;
	else if (avgDupes < 3) score = 3;
	else score = 0;

	return makeDimension(
		"duplicate-content",
		"Duplicate Content",
		score,
		"medium",
		score < 10
			? "Remove repeated content blocks within pages to improve content quality"
			: "No duplicate content detected",
	);
}

/** Dimension 17: Cross-Page Duplication (low weight) */
export function scoreCrossPageDuplication(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length < 2) {
		return makeDimension(
			"cross-page-duplication",
			"Cross-Page Duplication",
			10,
			"low",
			"Single page — cross-page duplication not applicable",
		);
	}

	// Build a map from normalized paragraph text -> set of page URLs it appears on
	const paraToPages = new Map<string, Set<string>>();

	for (const page of pages) {
		for (const para of page.paragraphs) {
			const normalized = para.toLowerCase().replace(/\s+/g, " ").trim();
			if (!paraToPages.has(normalized)) {
				paraToPages.set(normalized, new Set());
			}
			paraToPages.get(normalized)!.add(page.url);
		}
	}

	const totalUnique = paraToPages.size;
	if (totalUnique === 0) {
		return makeDimension(
			"cross-page-duplication",
			"Cross-Page Duplication",
			10,
			"low",
			"Remove identical content blocks that appear across multiple pages",
		);
	}

	// Count paragraphs that appear on 2+ different pages
	let duplicatedCount = 0;
	for (const pageSet of paraToPages.values()) {
		if (pageSet.size >= 2) duplicatedCount++;
	}

	const ratio = duplicatedCount / totalUnique;
	let score: number;
	if (ratio === 0) score = 10;
	else if (ratio < 0.05) score = 8;
	else if (ratio < 0.1) score = 5;
	else if (ratio < 0.2) score = 3;
	else score = 0;

	return makeDimension(
		"cross-page-duplication",
		"Cross-Page Duplication",
		score,
		"low",
		score < 10
			? "Remove identical content blocks that appear across multiple pages"
			: "No cross-page content duplication detected",
	);
}

/** Dimension 18: Evidence Packaging (low weight) */
export function scoreEvidencePackaging(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"evidence-packaging",
			"Evidence Packaging",
			0,
			"low",
			"Add inline citations, attribution phrases, and source references to support claims",
		);
	}

	const ATTRIBUTION_PATTERNS = [
		/according to/i,
		/\bsource[s]?:/i,
		/\bcited?\b/i,
		/\breference[s]?:/i,
	];
	const CITATION_PATTERNS = [/\[\d+\]/, /\(.*?\d{4}.*?\)/];

	let pagesWithEvidence = 0;

	for (const page of pages) {
		let markerCount = 0;

		// Check sentences for attribution and inline citation patterns
		const allText = page.sentences.join(" ");
		for (const pattern of ATTRIBUTION_PATTERNS) {
			if (pattern.test(allText)) markerCount++;
		}
		for (const pattern of CITATION_PATTERNS) {
			if (pattern.test(allText)) markerCount++;
		}

		// Check headings for sources/references section
		const hasSourcesHeading = page.headings.some((h) =>
			/source|reference|bibliograph|citation/i.test(h.text),
		);
		if (hasSourcesHeading) markerCount++;

		if (markerCount >= 2) pagesWithEvidence++;
	}

	const pct = pagesWithEvidence / pages.length;
	let score: number;
	if (pct > 0.5) score = 10;
	else if (pct > 0.3) score = 7;
	else if (pct > 0.15) score = 4;
	else if (pct > 0) score = 2;
	else score = 0;

	return makeDimension(
		"evidence-packaging",
		"Evidence Packaging",
		score,
		"low",
		score < 10
			? "Add inline citations, attribution phrases, and source references to support claims"
			: "Strong evidence packaging with citations and attribution",
	);
}

const DEFINITION_PATTERN = /^(?!What |How |Why |When |Where |Who |Is |Are |Do |Does |Did |Can |Could |Should )[A-Z][^.?!]+\s+(is|are|refers to|means|describes|defines)\s+/;

/** Dimension 19: Citation-Ready Writing (low weight) */
export function scoreCitationReadyWriting(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"citation-ready-writing",
			"Citation-Ready Writing",
			0,
			"low",
			"Write self-contained definition sentences and single-claim statements that AI can quote directly",
		);
	}

	let totalRatio = 0;
	let pageCount = 0;

	for (const page of pages) {
		const sentences = page.sentences;
		if (sentences.length === 0) continue;

		let citationReadyCount = 0;
		for (const sentence of sentences) {
			const isDefinition = DEFINITION_PATTERN.test(sentence);
			const isSelfContained =
				sentence.length >= 40 &&
				sentence.length <= 200 &&
				/^[A-Z]/.test(sentence) &&
				sentence.endsWith(".") &&
				!sentence.endsWith("?") &&
				!sentence.endsWith("!");
			const isSingleClaim = !(/, and /i.test(sentence) || /, but /i.test(sentence));

			if ((isDefinition || isSelfContained) && isSingleClaim) {
				citationReadyCount++;
			}
		}

		totalRatio += citationReadyCount / sentences.length;
		pageCount++;
	}

	if (pageCount === 0) {
		return makeDimension(
			"citation-ready-writing",
			"Citation-Ready Writing",
			0,
			"low",
			"Write self-contained definition sentences and single-claim statements that AI can quote directly",
		);
	}

	const avgRatio = totalRatio / pageCount;
	let score: number;
	if (avgRatio > 0.4) score = 10;
	else if (avgRatio > 0.25) score = 7;
	else if (avgRatio > 0.15) score = 4;
	else if (avgRatio > 0.05) score = 2;
	else score = 0;

	return makeDimension(
		"citation-ready-writing",
		"Citation-Ready Writing",
		score,
		"low",
		score < 10
			? "Write self-contained definition sentences and single-claim statements that AI can quote directly"
			: "Excellent citation-ready writing style",
	);
}

/** Dimension 20: Q&A Content Format (medium weight) */
export function scoreQaFormat(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"qa-format",
			"Q&A Content Format",
			0,
			"medium",
			"Use question-format headings (What, How, Why) to structure content for AI answer extraction",
		);
	}

	let totalHeadings = 0;
	let totalQuestionHeadings = 0;

	for (const page of pages) {
		totalHeadings += page.headings.length;
		totalQuestionHeadings += page.questionHeadings.length;
	}

	if (totalHeadings === 0) {
		return makeDimension(
			"qa-format",
			"Q&A Content Format",
			0,
			"medium",
			"Use question-format headings (What, How, Why) to structure content for AI answer extraction",
		);
	}

	const ratio = totalQuestionHeadings / totalHeadings;
	let score: number;
	if (ratio > 0.4) score = 10;
	else if (ratio > 0.25) score = 7;
	else if (ratio > 0.1) score = 4;
	else if (ratio > 0) score = 2;
	else score = 0;

	return makeDimension(
		"qa-format",
		"Q&A Content Format",
		score,
		"medium",
		score < 10
			? "Use question-format headings (What, How, Why) to structure content for AI answer extraction"
			: "Excellent Q&A content format with high question heading ratio",
	);
}

/** Dimension 21: Direct Answer Density (medium weight) */
export function scoreDirectAnswerDensity(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const pagesWithQuestions = pages.filter((p) => p.questionHeadings.length > 0);

	if (pagesWithQuestions.length === 0) {
		return makeDimension(
			"direct-answer-density",
			"Direct Answer Density",
			0,
			"medium",
			"Add concise answer paragraphs (40-300 chars) immediately after question headings",
		);
	}

	let totalRatio = 0;

	for (const page of pagesWithQuestions) {
		if (page.paragraphs.length === 0) continue;
		const directAnswerCount = page.paragraphs.filter(
			(p) => p.length >= 40 && p.length <= 300 && /^[A-Z]/.test(p) && !p.endsWith("?"),
		).length;
		totalRatio += directAnswerCount / page.paragraphs.length;
	}

	const avgRatio = totalRatio / pagesWithQuestions.length;
	let score: number;
	if (avgRatio > 0.5) score = 10;
	else if (avgRatio > 0.3) score = 7;
	else if (avgRatio > 0.15) score = 4;
	else if (avgRatio > 0) score = 2;
	else score = 0;

	return makeDimension(
		"direct-answer-density",
		"Direct Answer Density",
		score,
		"medium",
		score < 10
			? "Add concise answer paragraphs (40-300 chars) immediately after question headings"
			: "Strong direct answer density with concise answer paragraphs",
	);
}

/** Dimension 22: Query-Answer Alignment (low weight) */
export function scoreQueryAnswerAlignment(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const pagesWithQuestions = pages.filter((p) => p.questionHeadings.length > 0);

	if (pagesWithQuestions.length === 0) {
		return makeDimension(
			"query-answer-alignment",
			"Query-Answer Alignment",
			0,
			"low",
			"Ensure every question heading is followed by a direct answer paragraph",
		);
	}

	let alignedPages = 0;
	for (const page of pagesWithQuestions) {
		if (page.paragraphs.length >= page.questionHeadings.length) {
			alignedPages++;
		}
	}

	const ratio = alignedPages / pagesWithQuestions.length;
	let score: number;
	if (ratio > 0.7) score = 10;
	else if (ratio > 0.5) score = 7;
	else if (ratio > 0.3) score = 4;
	else if (ratio > 0) score = 2;
	else score = 0;

	return makeDimension(
		"query-answer-alignment",
		"Query-Answer Alignment",
		score,
		"low",
		score < 10
			? "Ensure every question heading is followed by a direct answer paragraph"
			: "Strong query-answer alignment across all pages",
	);
}

/** Patterns used to detect definition sentences */
const DEFINITION_SENTENCE_PATTERNS = [
	/\b\w+(?:\s+\w+){0,3}\s+is\s+defined\s+as\b/i,
	/\b\w+(?:\s+\w+){0,3}\s+refers?\s+to\b/i,
	/\b\w+(?:\s+\w+){0,3}\s+means?\s+(?:the|a|an)\b/i,
	/\b\w+(?:\s+\w+){0,3}\s+describes?\s+(?:the|a|an)\b/i,
	/\bdefined\s+as\s+the\b/i,
];

/** Common English stopwords to exclude from entity term extraction */
const ENTITY_STOPWORDS = new Set([
	"this", "that", "with", "from", "have", "will", "been", "were",
	"they", "them", "their", "what", "when", "where", "which", "while",
	"your", "more", "also", "than", "then", "into", "over", "some",
	"such", "each", "very", "just", "about", "after", "before",
	"page", "site", "blog", "post", "guide", "help", "info",
]);

/** Dimension 23: Tables & Lists (low weight) */
export function scoreTablesLists(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"tables-lists",
			"Tables & Lists",
			0,
			"low",
			"Add HTML tables with headers and ordered/unordered lists to present structured data",
		);
	}

	let totalTables = 0;
	let totalLists = 0;
	for (const page of pages) {
		totalTables += page.tableCount;
		totalLists += page.listCount;
	}

	const avg = (totalTables + totalLists) / pages.length;
	let score: number;
	if (avg >= 3) score = 10;
	else if (avg >= 2) score = 7;
	else if (avg >= 1) score = 4;
	else if (avg > 0) score = 2;
	else score = 0;

	return makeDimension(
		"tables-lists",
		"Tables & Lists",
		score,
		"low",
		score < 10
			? "Add HTML tables with headers and ordered/unordered lists to present structured data"
			: "Strong use of tables and lists for structured content presentation",
	);
}

/** Dimension 24: Definition Patterns (low weight) */
export function scoreDefinitionPatterns(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"definition-patterns",
			"Definition Patterns",
			0,
			"low",
			"Use definition patterns like 'X is defined as...' and 'X refers to...' for AI-extractable definitions",
		);
	}

	let pagesWithDefinitions = 0;
	for (const page of pages) {
		const hasDefinition = page.sentences.some((sentence) =>
			DEFINITION_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence)),
		);
		if (hasDefinition) pagesWithDefinitions++;
	}

	const ratio = pagesWithDefinitions / pages.length;
	let score: number;
	if (ratio > 0.5) score = 10;
	else if (ratio > 0.3) score = 7;
	else if (ratio > 0.15) score = 4;
	else if (ratio > 0) score = 2;
	else score = 0;

	return makeDimension(
		"definition-patterns",
		"Definition Patterns",
		score,
		"low",
		score < 10
			? "Use definition patterns like 'X is defined as...' and 'X refers to...' for AI-extractable definitions"
			: "Strong use of definition patterns for AI-extractable content",
	);
}

/** Dimension 25: Entity Disambiguation (low weight) */
export function scoreEntityDisambiguation(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"entity-disambiguation",
			"Entity Disambiguation",
			0,
			"low",
			"Define the primary entity early in each page and use consistent terminology throughout",
		);
	}

	let wellDisambiguatedPages = 0;

	for (const page of pages) {
		const title = page.title || "";
		// Extract significant entity terms from title (>= 4 chars, not stopwords)
		const entityTerms = title
			.split(/\s+/)
			.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
			.filter((w) => w.length >= 4 && !ENTITY_STOPWORDS.has(w));

		if (entityTerms.length === 0) continue;

		const firstParagraph = (page.paragraphs[0] || "").toLowerCase();
		const bodyTextLower = page.bodyText.toLowerCase();

		// Check if first paragraph mentions at least one entity term
		const firstParaMentionsEntity = entityTerms.some((term) => firstParagraph.includes(term));

		// Count occurrences of entity terms in bodyText
		const totalOccurrences = entityTerms.reduce((count, term) => {
			const regex = new RegExp(`\\b${term}\\b`, "gi");
			const matches = bodyTextLower.match(regex);
			return count + (matches ? matches.length : 0);
		}, 0);

		if (firstParaMentionsEntity && totalOccurrences >= 3) {
			wellDisambiguatedPages++;
		}
	}

	const ratio = wellDisambiguatedPages / pages.length;
	let score: number;
	if (ratio > 0.6) score = 10;
	else if (ratio > 0.4) score = 7;
	else if (ratio > 0.2) score = 4;
	else if (ratio > 0) score = 2;
	else score = 0;

	return makeDimension(
		"entity-disambiguation",
		"Entity Disambiguation",
		score,
		"low",
		score < 10
			? "Define the primary entity early in each page and use consistent terminology throughout"
			: "Strong entity disambiguation with consistent terminology usage",
	);
}

/** Dimension 26: Internal Linking (medium weight) */
export function scoreInternalLinking(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"internal-linking",
			"Internal Linking",
			0,
			"medium",
			"Add internal links between related content pages and implement breadcrumb navigation",
		);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	// Calculate average internal links per page
	const totalInternal = sorted.reduce(
		(sum, page) => sum + page.links.filter((l) => l.internal).length,
		0,
	);
	const avgInternal = totalInternal / sorted.length;

	// Check for BreadcrumbList schema on any page
	let hasBreadcrumbs = false;
	for (const page of sorted) {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			if (s["@type"] === "BreadcrumbList") {
				hasBreadcrumbs = true;
				break;
			}
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					if (item["@type"] === "BreadcrumbList") {
						hasBreadcrumbs = true;
						break;
					}
				}
			}
			if (hasBreadcrumbs) break;
		}
		if (hasBreadcrumbs) break;
	}

	let score: number;
	if (avgInternal >= 5 && hasBreadcrumbs) score = 10;
	else if (avgInternal >= 5) score = 8;
	else if (avgInternal >= 3) score = 6;
	else if (avgInternal >= 1) score = 3;
	else score = 0;

	return makeDimension(
		"internal-linking",
		"Internal Linking",
		score,
		"medium",
		score < 10
			? "Add internal links between related content pages and implement breadcrumb navigation"
			: "Strong internal link structure with breadcrumb navigation",
	);
}

/** Dimension 27: Author & Expert Schema (low weight) */
export function scoreAuthorSchema(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"author-schema",
			"Author & Expert Schema",
			0,
			"low",
			"Add Person schema with jobTitle/credentials and sameAs links to author profiles",
		);
	}

	let hasPersonSchema = false;
	let hasCredentials = false;
	let hasSameAs = false;

	for (const page of pages) {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;

			const checkPerson = (obj: Record<string, unknown>) => {
				if (obj["@type"] !== "Person") return;
				hasPersonSchema = true;
				if (obj["jobTitle"] || obj["hasCredential"]) hasCredentials = true;
				if (Array.isArray(obj["sameAs"]) && (obj["sameAs"] as unknown[]).length > 0)
					hasSameAs = true;
			};

			checkPerson(s);
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					checkPerson(item);
				}
			}
		}
	}

	let score: number;
	if (hasPersonSchema && hasCredentials && hasSameAs) score = 10;
	else if (hasPersonSchema && hasCredentials) score = 6;
	else if (hasPersonSchema) score = 3;
	else score = 0;

	return makeDimension(
		"author-schema",
		"Author & Expert Schema",
		score,
		"low",
		score < 10
			? "Add Person schema with jobTitle/credentials and sameAs links to author profiles"
			: "Strong author schema with credentials and authority links",
	);
}

/** Dimension 28: Semantic HTML (low weight) */
export function scoreSemanticHtml(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Use semantic HTML5 elements (main, article, nav, aside) and add lang attribute to html tag";

	if (pages.length === 0) {
		return makeDimension("semantic-html", "Semantic HTML", 0, "low", hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	let totalSignal = 0;
	for (const page of sorted) {
		const el = page.semanticElements;
		let signal = 0;
		if (el.main > 0) signal += 1;
		if (el.article > 0) signal += 1;
		if (el.nav > 0) signal += 1;
		if (el.aside > 0) signal += 0.5;
		if (page.language !== null) signal += 1;
		if (page.ariaRoleCount > 0) signal += 0.5;
		if (el.header > 0) signal += 0.5;
		if (el.footer > 0) signal += 0.5;
		totalSignal += signal;
	}

	const avg = totalSignal / sorted.length;

	let score: number;
	if (avg >= 4.5) score = 10;
	else if (avg >= 3.5) score = 8;
	else if (avg >= 2.5) score = 6;
	else if (avg >= 1.5) score = 4;
	else if (avg >= 0.5) score = 2;
	else score = 0;

	return makeDimension(
		"semantic-html",
		"Semantic HTML",
		score,
		"low",
		score < 10 ? hint : "Strong semantic HTML5 structure with proper landmark elements",
	);
}

/** Dimension 29: Extraction Friction (low weight — INVERTED: low friction = high score) */
export function scoreExtractionFriction(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Reduce average sentence length below 20 words and minimize passive voice for easier AI extraction";

	if (pages.length === 0) {
		return makeDimension("extraction-friction", "Extraction Friction", 0, "low", hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	let totalScore = 0;
	for (const page of sorted) {
		const avg = page.avgSentenceLength;

		let sentenceLengthScore: number;
		if (avg <= 18) sentenceLengthScore = 10;
		else if (avg <= 22) sentenceLengthScore = 7;
		else if (avg <= 26) sentenceLengthScore = 4;
		else if (avg <= 30) sentenceLengthScore = 2;
		else sentenceLengthScore = 0;

		// Passive voice penalty
		const totalSentences = page.sentences.length;
		let passiveVoicePenalty = 0;
		if (totalSentences > 0) {
			const passivePattern = /\b(is|are|was|were|been|being)\s+\w+ed\b/i;
			const passiveCount = page.sentences.filter((s) => passivePattern.test(s)).length;
			const ratio = passiveCount / totalSentences;
			if (ratio > 0.3) passiveVoicePenalty = -2;
			else if (ratio > 0.2) passiveVoicePenalty = -1;
		}

		totalScore += Math.max(0, sentenceLengthScore + passiveVoicePenalty);
	}

	const score = Math.min(10, Math.round(totalScore / sorted.length));

	return makeDimension(
		"extraction-friction",
		"Extraction Friction",
		score,
		"low",
		score < 10 ? hint : "Excellent readability with short sentences and active voice",
	);
}

/** Dimension 30: Image Context for AI (low weight) */
export function scoreImageContext(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add descriptive alt text to all images and wrap important images in figure/figcaption elements";

	if (pages.length === 0) {
		return makeDimension("image-context", "Image Context for AI", 0, "low", hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	let totalPageScore = 0;
	for (const page of sorted) {
		let pageScore: number;
		if (page.imgCount === 0) {
			pageScore = 10;
		} else {
			const altRatio = page.imgsWithAlt / page.imgCount;
			const hasFigures = page.figureCount > 0;
			if (altRatio >= 0.9 && hasFigures) pageScore = 10;
			else if (altRatio >= 0.9) pageScore = 7;
			else if (altRatio >= 0.7) pageScore = 5;
			else if (altRatio >= 0.5) pageScore = 3;
			else pageScore = 1;
		}
		totalPageScore += pageScore;
	}

	const avgPageScore = totalPageScore / sorted.length;

	let score: number;
	if (avgPageScore >= 8.5) score = 10;
	else if (avgPageScore >= 6.5) score = 8;
	else if (avgPageScore >= 4.5) score = 6;
	else if (avgPageScore >= 2.5) score = 4;
	else if (avgPageScore >= 1) score = 2;
	else score = 0;

	return makeDimension(
		"image-context",
		"Image Context for AI",
		score,
		"low",
		score < 10 ? hint : "All images have descriptive alt text and are wrapped in figure/figcaption",
	);
}

/** Dimension 31: Schema Coverage (low weight) */
export function scoreSchemaCoverage(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add structured data (schema.org) to inner pages, not just the homepage";

	if (pages.length === 0) {
		return makeDimension("schema-coverage", "Schema Coverage", 0, "low", hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	/**
	 * A page "has schema" if at least one schema object has a meaningful @type.
	 */
	function pageHasSchema(page: ScannedPage): boolean {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			// Direct @type
			if (typeof s["@type"] === "string" && s["@type"].trim().length > 0) {
				return true;
			}
			// @graph items
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					if (typeof item["@type"] === "string" && item["@type"].trim().length > 0) {
						return true;
					}
				}
			}
		}
		return false;
	}

	const pagesWithSchema = sorted.filter(pageHasSchema).length;

	// Special case: single page
	if (sorted.length === 1) {
		const score = pagesWithSchema > 0 ? 5 : 0;
		return makeDimension("schema-coverage", "Schema Coverage", score, "low", hint);
	}

	const ratio = pagesWithSchema / sorted.length;
	let score: number;
	if (ratio >= 0.8) score = 10;
	else if (ratio >= 0.6) score = 8;
	else if (ratio >= 0.4) score = 6;
	else if (ratio >= 0.2) score = 3;
	else if (ratio > 0) score = 1;
	else score = 0;

	return makeDimension("schema-coverage", "Schema Coverage", score, "low", hint);
}

/** Dimension 32: Speakable Schema (low weight) */
export function scoreSpeakableSchema(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint =
		"Add SpeakableSpecification markup to indicate content suitable for text-to-speech and voice assistants";

	if (pages.length === 0) {
		return makeDimension("speakable-schema", "Speakable Schema", 0, "low", hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	function pageHasSpeakable(page: ScannedPage): boolean {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;

			// Direct @type === "SpeakableSpecification"
			if (s["@type"] === "SpeakableSpecification") return true;

			// In @graph array
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					if (item["@type"] === "SpeakableSpecification") return true;
				}
			}

			// As nested speakable property
			const speakable = s["speakable"] as Record<string, unknown> | undefined;
			if (speakable && speakable["@type"] === "SpeakableSpecification") return true;
		}
		return false;
	}

	const pagesWithSpeakable = sorted.filter(pageHasSpeakable).length;
	const ratio = pagesWithSpeakable / sorted.length;

	let score: number;
	if (ratio >= 0.5) score = 10;
	else if (ratio >= 0.3) score = 7;
	else if (ratio >= 0.1) score = 4;
	else if (ratio > 0) score = 2;
	else score = 0;

	return makeDimension("speakable-schema", "Speakable Schema", score, "low", hint);
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
	"topic-coherence": scoreTopicCoherence,
	"original-data": scoreOriginalData,
	"fact-density": scoreFactDensity,
	"duplicate-content": scoreDuplicateContent,
	"cross-page-duplication": scoreCrossPageDuplication,
	"evidence-packaging": scoreEvidencePackaging,
	"citation-ready-writing": scoreCitationReadyWriting,
	"qa-format": scoreQaFormat,
	"direct-answer-density": scoreDirectAnswerDensity,
	"query-answer-alignment": scoreQueryAnswerAlignment,
	"tables-lists": scoreTablesLists,
	"definition-patterns": scoreDefinitionPatterns,
	"entity-disambiguation": scoreEntityDisambiguation,
	"internal-linking": scoreInternalLinking,
	"author-schema": scoreAuthorSchema,
	"semantic-html": scoreSemanticHtml,
	"extraction-friction": scoreExtractionFriction,
	"image-context": scoreImageContext,
	"schema-coverage": scoreSchemaCoverage,
	"speakable-schema": scoreSpeakableSchema,
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
