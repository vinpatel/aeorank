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
		weightPct: 5,
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
		weightPct: 4,
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
		weightPct: 3,
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
			5,
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
		5,
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
			4,
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
		4,
		score < 10
			? "Start pages with concise lead paragraphs (<300 chars) that directly answer the page topic"
			: "Good answer-first formatting",
	);
}

/** Dimension 6: FAQ & Speakable — absorbs speakable-schema scoring */
export function scoreFaqSpeakable(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	let hasFaqSchema = false;
	let faqQaPairs = 0;
	let hasFaqContent = false;
	let hasSpeakable = false;

	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	for (const page of sortedPages) {
		// Check for FAQPage schema
		const checkFaqSchema = (obj: Record<string, unknown>) => {
			if (obj["@type"] === "FAQPage") {
				hasFaqSchema = true;
				const mainEntity = obj.mainEntity;
				if (Array.isArray(mainEntity)) {
					faqQaPairs += mainEntity.length;
				}
			}
		};

		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			checkFaqSchema(s);

			// Detect SpeakableSpecification (absorbed from speakable-schema scorer)
			if (s["@type"] === "SpeakableSpecification") hasSpeakable = true;
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					checkFaqSchema(item);
					if (item["@type"] === "SpeakableSpecification") hasSpeakable = true;
				}
			}
			const speakable = s["speakable"] as Record<string, unknown> | undefined;
			if (speakable && speakable["@type"] === "SpeakableSpecification") hasSpeakable = true;
		}

		// Check for FAQ-like headings
		const faqHeadings = page.headings.filter((h) => h.text.includes("?") || /faq/i.test(h.text));
		if (faqHeadings.length > 0) hasFaqContent = true;
	}

	let score: number;
	if (hasFaqSchema && faqQaPairs >= 3 && hasSpeakable) score = 10;
	else if (hasFaqSchema && faqQaPairs >= 3) score = 8;
	else if (hasFaqSchema && hasSpeakable) score = 7;
	else if (hasFaqSchema) score = 6;
	else if (hasFaqContent && hasSpeakable) score = 5;
	else if (hasSpeakable) score = 4;
	else if (hasFaqContent) score = 3;
	else score = 0;

	return makeDimension(
		"faq-speakable",
		"FAQ & Speakable",
		score,
		5,
		score < 10
			? "Add FAQPage schema markup with 3+ Q&A pairs and SpeakableSpecification markup"
			: "Excellent FAQ & Speakable implementation",
	);
}

/** Dimension 7: E-E-A-T Signals (medium weight) */
export function scoreEeatSignals(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
	let hasAuthor = false;
	let hasDates = false;
	let hasAboutPage = false;
	// Absorbed from author-schema: Person schema with credentials/sameAs
	let hasPersonSchema = false;
	let hasCredentials = false;
	let hasSameAs = false;

	for (const page of sortedPages) {
		if (page.authorName) hasAuthor = true;
		if (page.hasDatePublished) hasDates = true;
		if (/\/about/i.test(page.url)) hasAboutPage = true;

		// Person schema detection (absorbed from scoreAuthorSchema)
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

	// Check if page has Article+author markup (article schema with author field)
	let hasArticleWithAuthor = false;
	for (const page of sortedPages) {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			const checkArticle = (obj: Record<string, unknown>) => {
				if (
					(obj["@type"] === "Article" ||
						obj["@type"] === "BlogPosting" ||
						obj["@type"] === "NewsArticle") &&
					obj["author"]
				) {
					hasArticleWithAuthor = true;
				}
			};
			checkArticle(s);
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					checkArticle(item);
				}
			}
		}
	}

	const contentSignals = [hasAuthor, hasDates, hasAboutPage].filter(Boolean).length;

	let score: number;
	if (hasArticleWithAuthor && hasPersonSchema && hasCredentials && hasSameAs) score = 10;
	else if (hasArticleWithAuthor && hasPersonSchema && hasCredentials) score = 9;
	else if (hasArticleWithAuthor && hasPersonSchema) score = 8;
	else if (contentSignals >= 3) score = 7;
	else if (contentSignals >= 2 || hasPersonSchema) score = 5;
	else if (contentSignals >= 1) score = 3;
	else score = 0;

	return makeDimension(
		"eeat-signals",
		"E-E-A-T Signals",
		score,
		6,
		score < 10
			? "Add author names, publication dates, About page, and Person schema with credentials and sameAs links"
			: "Strong E-E-A-T signals with Person schema and credentials",
	);
}

/** Dimension 8: Meta Descriptions (medium weight) */
export function scoreMetaDescriptions(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension(
			"meta-descriptions",
			"Meta Descriptions",
			0,
			2,
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
		2,
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
		1,
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
		2,
		score < 10
			? "Ensure HTTPS and add canonical URLs to all pages"
			: "HTTPS and canonical URLs configured",
	);
}

/** Dimension 11: Page Freshness (low weight) */
export function scorePageFreshness(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	if (pages.length === 0) {
		return makeDimension("page-freshness", "Page Freshness", 0, 2, "No pages to analyze");
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
		2,
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
			2,
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
		2,
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
			7,
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
			7,
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
		7,
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
			5,
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
		5,
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
			4,
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
		4,
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
			4,
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
		4,
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
			2,
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
			2,
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
		2,
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
			2,
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
		2,
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
			2,
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
			2,
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
		2,
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
			4,
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
			4,
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
		4,
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
			4,
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
		4,
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
			2,
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
		2,
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
			2,
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
		2,
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
			2,
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
		2,
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
			2,
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
		2,
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
			4,
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
		4,
		score < 10
			? "Add internal links between related content pages and implement breadcrumb navigation"
			: "Strong internal link structure with breadcrumb navigation",
	);
}

/** Dimension 28: Semantic HTML (low weight) */
export function scoreSemanticHtml(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Use semantic HTML5 elements (main, article, nav, aside) and add lang attribute to html tag";

	if (pages.length === 0) {
		return makeDimension("semantic-html", "Semantic HTML", 0, 2, hint);
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
		2,
		score < 10 ? hint : "Strong semantic HTML5 structure with proper landmark elements",
	);
}

/** Dimension 29: Extraction Friction (low weight — INVERTED: low friction = high score) */
export function scoreExtractionFriction(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Reduce average sentence length below 20 words and minimize passive voice for easier AI extraction";

	if (pages.length === 0) {
		return makeDimension("extraction-friction", "Extraction Friction", 0, 2, hint);
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
		2,
		score < 10 ? hint : "Excellent readability with short sentences and active voice",
	);
}

/** Dimension 30: Image Context for AI (low weight) */
export function scoreImageContext(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add descriptive alt text to all images and wrap important images in figure/figcaption elements";

	if (pages.length === 0) {
		return makeDimension("image-context", "Image Context for AI", 0, 1, hint);
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
		1,
		score < 10 ? hint : "All images have descriptive alt text and are wrapped in figure/figcaption",
	);
}

/** Dimension 31: Schema Coverage (low weight) */
export function scoreSchemaCoverage(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add structured data (schema.org) to inner pages, not just the homepage";

	if (pages.length === 0) {
		return makeDimension("schema-coverage", "Schema Coverage", 0, 1, hint);
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
		return makeDimension("schema-coverage", "Schema Coverage", score, 1, hint);
	}

	const ratio = pagesWithSchema / sorted.length;
	let score: number;
	if (ratio >= 0.8) score = 10;
	else if (ratio >= 0.6) score = 8;
	else if (ratio >= 0.4) score = 6;
	else if (ratio >= 0.2) score = 3;
	else if (ratio > 0) score = 1;
	else score = 0;

	return makeDimension("schema-coverage", "Schema Coverage", score, 1, hint);
}

/** Dimension 33: Content Cannibalization (low weight) */
export function scoreContentCannibalization(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Consolidate pages with overlapping topics to avoid content cannibalization";

	if (pages.length <= 1) {
		return makeDimension("content-cannibalization", "Content Cannibalization", 10, 2, hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	// Normalize titles: lowercase, strip common suffixes
	function normalizeTitle(title: string): string {
		return title
			.toLowerCase()
			.replace(/\s*[|\-–—]\s*\S+.*$/, "")
			.trim();
	}

	// Compute Jaccard similarity of word sets
	function jaccard(a: string, b: string): number {
		const wordsA = new Set(a.split(/\s+/).filter(Boolean));
		const wordsB = new Set(b.split(/\s+/).filter(Boolean));
		const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
		const union = new Set([...wordsA, ...wordsB]);
		if (union.size === 0) return 0;
		return intersection.size / union.size;
	}

	// Compute heading overlap (h2 headings by normalized text)
	function h2Overlap(pageA: ScannedPage, pageB: ScannedPage): number {
		const h2A = new Set(pageA.headings.filter((h) => h.level === 2).map((h) => h.text.toLowerCase().trim()));
		const h2B = new Set(pageB.headings.filter((h) => h.level === 2).map((h) => h.text.toLowerCase().trim()));
		if (h2A.size === 0 || h2B.size === 0) return 0;
		const intersection = new Set([...h2A].filter((h) => h2B.has(h)));
		const union = new Set([...h2A, ...h2B]);
		return intersection.size / union.size;
	}

	let cannibalPairs = 0;
	let totalPairs = 0;

	for (let i = 0; i < sorted.length; i++) {
		for (let j = i + 1; j < sorted.length; j++) {
			totalPairs++;
			const titleA = normalizeTitle(sorted[i].title);
			const titleB = normalizeTitle(sorted[j].title);
			const titleSimilarity = jaccard(titleA, titleB);
			const headingSimilarity = h2Overlap(sorted[i], sorted[j]);

			if (titleSimilarity > 0.7 || headingSimilarity > 0.5) {
				cannibalPairs++;
			}
		}
	}

	const ratio = cannibalPairs / totalPairs;
	let score: number;
	if (ratio === 0) score = 10;
	else if (ratio < 0.1) score = 8;
	else if (ratio < 0.2) score = 6;
	else if (ratio < 0.4) score = 4;
	else if (ratio < 0.6) score = 2;
	else score = 0;

	return makeDimension(
		"content-cannibalization",
		"Content Cannibalization",
		score,
		2,
		score < 10 ? hint : "No content cannibalization detected — all pages target distinct topics",
	);
}

/** Dimension 34: Publishing Velocity (low weight) */
export function scorePublishingVelocity(_pages: ScannedPage[], meta: ScanMeta): DimensionScore {
	const hint = "Maintain a regular publishing cadence — update sitemap lastmod dates to reflect content freshness";

	const lastmods = meta.sitemapLastmods ?? [];

	if (lastmods.length < 2) {
		return makeDimension("publishing-velocity", "Publishing Velocity", 0, 1, "Add lastmod dates to sitemap.xml entries");
	}

	// Parse and sort valid dates chronologically
	const parsed = lastmods
		.map((d) => new Date(d).getTime())
		.filter((t) => !Number.isNaN(t))
		.sort((a, b) => a - b);

	if (parsed.length < 2) {
		return makeDimension("publishing-velocity", "Publishing Velocity", 0, 1, "Add lastmod dates to sitemap.xml entries");
	}

	const now = Date.now();
	const mostRecent = parsed[parsed.length - 1];
	const oldest = parsed[0];
	const spanMs = mostRecent - oldest;
	const dayMs = 86_400_000;

	// Recency score (0-4): if completely stale (> 2 years), cap total score
	const daysSinceRecent = (now - mostRecent) / dayMs;
	let recencyScore: number;
	if (daysSinceRecent <= 30) recencyScore = 4;
	else if (daysSinceRecent <= 90) recencyScore = 3;
	else if (daysSinceRecent <= 180) recencyScore = 2;
	else if (daysSinceRecent <= 365) recencyScore = 1;
	else recencyScore = 0;

	// If completely stale (> 2 years), cap score at 3 regardless of regularity/span
	if (daysSinceRecent > 730) {
		return makeDimension(
			"publishing-velocity",
			"Publishing Velocity",
			Math.min(3, parsed.length > 6 ? 2 : 1),
			1,
			hint,
		);
	}

	// Regularity score (0-3): compute stddev of gaps
	const gaps: number[] = [];
	for (let i = 1; i < parsed.length; i++) {
		gaps.push(parsed[i] - parsed[i - 1]);
	}
	const medianGap = gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
	const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
	const variance = gaps.reduce((sum, g) => sum + (g - meanGap) ** 2, 0) / gaps.length;
	const stddev = Math.sqrt(variance);

	let regularityScore: number;
	if (stddev < medianGap) regularityScore = 3;
	else if (stddev < 2 * medianGap) regularityScore = 2;
	else regularityScore = 1;

	// Span score (0-3)
	const spanDays = spanMs / dayMs;
	let spanScore: number;
	if (spanDays > 180) spanScore = 3;
	else if (spanDays > 90) spanScore = 2;
	else if (spanDays > 30) spanScore = 1;
	else spanScore = 0;

	const score = Math.min(10, recencyScore + regularityScore + spanScore);

	return makeDimension(
		"publishing-velocity",
		"Publishing Velocity",
		score,
		1,
		score < 10 ? hint : "Excellent publishing cadence with regular, recent content updates",
	);
}

/** Dimension 35: Content Licensing (low weight) */
export function scoreContentLicensing(pages: ScannedPage[], meta: ScanMeta): DimensionScore {
	const hint = "Add /ai.txt with content licensing directives and CreativeWork schema with license property";

	// ai.txt score
	const aiTxt = meta.aiTxt ?? null;
	let aiTxtScore: number;
	if (!aiTxt) aiTxtScore = 0;
	else if (aiTxt.trim().length < 50) aiTxtScore = 3;
	else aiTxtScore = 7;

	// License schema score: any page with license or usageInfo in schema
	let licenseSchemaScore = 0;
	for (const page of pages) {
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			if (s["license"] || s["usageInfo"]) {
				licenseSchemaScore = 4;
				break;
			}
			// Check @graph
			if (Array.isArray(s["@graph"])) {
				for (const item of s["@graph"] as Record<string, unknown>[]) {
					if (item["license"] || item["usageInfo"]) {
						licenseSchemaScore = 4;
						break;
					}
				}
			}
		}
		if (licenseSchemaScore > 0) break;
	}

	const score = Math.min(10, aiTxtScore + licenseSchemaScore);

	return makeDimension(
		"content-licensing",
		"Content Licensing",
		score,
		1,
		score < 10 ? hint : "Strong content licensing with /ai.txt and CreativeWork license schema",
	);
}

/** Dimension 36: Canonical URLs (low weight) */
export function scoreCanonicalUrls(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add self-referencing <link rel='canonical'> tags to all pages to prevent duplicate content issues";

	if (pages.length === 0) {
		return makeDimension("canonical-urls", "Canonical URLs", 0, 1, hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	function normalize(url: string): string {
		return url.toLowerCase().replace(/\/+$/, "");
	}

	let selfRefCount = 0;
	let hasCanonicalCount = 0;

	for (const page of sorted) {
		if (page.canonical && page.canonical.trim().length > 0) {
			hasCanonicalCount++;
			if (normalize(page.url) === normalize(page.canonical)) {
				selfRefCount++;
			}
		}
	}

	const selfRefRatio = selfRefCount / sorted.length;
	const canonicalRatio = hasCanonicalCount / sorted.length;

	let score: number;
	if (selfRefRatio >= 0.9) score = 10;
	else if (selfRefRatio >= 0.7) score = 8;
	else if (selfRefRatio >= 0.5) score = 6;
	else if (canonicalRatio >= 0.5) score = 4;
	else if (canonicalRatio >= 0.3) score = 2;
	else score = 0;

	return makeDimension(
		"canonical-urls",
		"Canonical URLs",
		score,
		1,
		score < 10 ? hint : "All pages have self-referencing canonical tags",
	);
}

/** Dimension 37: RSS/Atom Feed (low weight) */
export function scoreRssFeed(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add RSS/Atom feed and link it from the homepage with <link rel='alternate' type='application/rss+xml'>";

	if (pages.length === 0) {
		return makeDimension("rss-feed", "RSS/Atom Feed", 0, 1, hint);
	}

	// Sort pages by URL for determinism; identify homepage as shortest path
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	function getPathLength(url: string): number {
		try {
			return new URL(url).pathname.length;
		} catch {
			return url.length;
		}
	}

	// Homepage: shortest path (usually "/" or the root)
	const homepage = sorted.reduce((min, page) =>
		getPathLength(page.url) < getPathLength(min.url) ? page : min,
	);

	const homepageHasFeed = homepage.rssFeeds.length > 0;
	const anyPageHasFeed = sorted.some((p) => p.rssFeeds.length > 0);

	let score: number;
	if (homepageHasFeed) score = 10;
	else if (anyPageHasFeed) score = 4;
	else score = 0;

	return makeDimension(
		"rss-feed",
		"RSS/Atom Feed",
		score,
		1,
		score < 10 ? hint : "RSS/Atom feed linked from homepage",
	);
}

/** Dimension 38: Visible Date Signals (low weight) */
export function scoreVisibleDates(pages: ScannedPage[], _meta: ScanMeta): DimensionScore {
	const hint = "Add <time datetime='...'> elements to show publication and update dates visibly on content pages";

	if (pages.length === 0) {
		return makeDimension("visible-dates", "Visible Date Signals", 0, 1, hint);
	}

	// Sort pages by URL for determinism
	const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	const pagesWithDates = sorted.filter((p) => p.timeElementCount > 0).length;
	const dateRatio = pagesWithDates / sorted.length;

	let baseDateScore: number;
	if (dateRatio >= 1.0) baseDateScore = 9;
	else if (dateRatio >= 0.8) baseDateScore = 7;
	else if (dateRatio >= 0.6) baseDateScore = 6;
	else if (dateRatio >= 0.4) baseDateScore = 4;
	else if (dateRatio >= 0.2) baseDateScore = 2;
	else if (dateRatio > 0) baseDateScore = 1;
	else baseDateScore = 0;

	// Bonus: pages with hasDatePublished (meta/schema dates)
	const pagesWithMetaDate = sorted.filter((p) => p.hasDatePublished).length;
	const metaBonus = pagesWithMetaDate / sorted.length >= 0.5 ? 2 : 0;

	const score = Math.min(10, baseDateScore + metaBonus);

	return makeDimension(
		"visible-dates",
		"Visible Date Signals",
		score,
		1,
		score < 10 ? hint : "Excellent visible date signals with time elements on all pages",
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
	"semantic-html": scoreSemanticHtml,
	"extraction-friction": scoreExtractionFriction,
	"image-context": scoreImageContext,
	"schema-coverage": scoreSchemaCoverage,
	"content-cannibalization": scoreContentCannibalization,
	"publishing-velocity": scorePublishingVelocity,
	"content-licensing": scoreContentLicensing,
	"canonical-urls": scoreCanonicalUrls,
	"rss-feed": scoreRssFeed,
	"visible-dates": scoreVisibleDates,
};

function makeDimension(
	id: string,
	name: string,
	score: number,
	weightPct: number,
	hint: string,
): DimensionScore {
	return {
		id,
		name,
		score,
		maxScore: 10,
		weightPct,
		status: getDimensionStatus(score, 10),
		hint,
	};
}
