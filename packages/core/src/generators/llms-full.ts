import type { ScanResult, ScannedPage } from "../types.js";

/** Definition sentence patterns — same logic as Phase 9 scorer, duplicated here to keep generators dependency-free */
const DEFINITION_PATTERNS = [
	/^.{3,50}\s+is defined as\s+/i,
	/^.{3,50}\s+refers to\s+/i,
	/^.{3,50}\s+(?:means|describes)\s+(?:the|a|an)\s+/i,
];

/** Common English stopwords and generic web terms to exclude from entity extraction */
const ENTITY_STOPWORDS = new Set([
	"the",
	"and",
	"for",
	"with",
	"from",
	"this",
	"that",
	"your",
	"about",
	"more",
	"best",
	"guide",
	"how",
	"what",
	"why",
	"when",
	"where",
	"who",
	"have",
	"been",
	"will",
	"they",
	"their",
	"there",
	"these",
	"those",
	"into",
	"over",
	"also",
	"just",
	"some",
	"such",
	"than",
	"then",
	"them",
	"each",
	"very",
	"here",
	"were",
	"said",
	"only",
	"both",
	"like",
	"well",
	"home",
	"page",
	"site",
	"post",
	"blog",
	"read",
	"more",
	"view",
	"next",
	"prev",
	"back",
	"help",
	"info",
	"news",
	"full",
	"text",
	"data",
	"list",
]);

/**
 * Extract definition sentences from a page's sentences array.
 * Returns sentences that match definition patterns.
 */
function extractDefinitions(sentences: string[]): string[] {
	return sentences.filter((s) => DEFINITION_PATTERNS.some((pattern) => pattern.test(s)));
}

/**
 * Extract entity terms from a page title.
 * Words >= 4 chars, not stopwords, that appear 2+ times in bodyText.
 */
function extractEntities(title: string, bodyText: string): Array<{ term: string; count: number }> {
	const words = title
		.replace(/[^a-zA-Z0-9 ]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length >= 4 && !ENTITY_STOPWORDS.has(w.toLowerCase()));

	const uniqueTerms = [...new Set(words.map((w) => w.toLowerCase()))];
	const lowerBody = bodyText.toLowerCase();

	const results: Array<{ term: string; count: number }> = [];
	for (const term of uniqueTerms) {
		// Count occurrences (case-insensitive) using split/join to avoid assignment-in-expression
		const count = lowerBody.split(term).length - 1;
		if (count >= 2) {
			// Use the original casing from the title
			const originalTerm = words.find((w) => w.toLowerCase() === term) ?? term;
			results.push({ term: originalTerm, count });
		}
	}

	return results;
}

/**
 * Build Q&A section for a page.
 * Pairs each questionHeading with the first paragraph by index.
 */
function buildQaSection(page: ScannedPage): string {
	if (page.questionHeadings.length === 0) return "";

	const lines: string[] = ["## Q&A", ""];

	for (let i = 0; i < page.questionHeadings.length; i++) {
		const heading = page.questionHeadings[i];
		// Pair with paragraph at same index, or last paragraph if overflow
		const answer = page.paragraphs[i] ?? page.paragraphs[page.paragraphs.length - 1] ?? "";
		const truncated = answer.length > 500 ? `${answer.slice(0, 497)}...` : answer;

		lines.push(`**Q: ${heading.text}**`);
		if (truncated) {
			lines.push(`A: ${truncated}`);
		}
		lines.push("");
	}

	return lines.join("\n").trimEnd();
}

/**
 * Build Definitions section for a page.
 */
function buildDefinitionsSection(page: ScannedPage): string {
	const definitions = extractDefinitions(page.sentences);
	if (definitions.length === 0) return "";

	const lines: string[] = ["## Definitions", ""];
	for (const def of definitions) {
		lines.push(`- ${def}`);
	}

	return lines.join("\n");
}

/**
 * Build Key Entities section for a page.
 */
function buildEntitiesSection(page: ScannedPage): string {
	const entities = extractEntities(page.title, page.bodyText);
	if (entities.length === 0) return "";

	const lines: string[] = ["## Key Entities", ""];
	for (const { term, count } of entities) {
		lines.push(`- ${term}: Referenced ${count} times`);
	}

	return lines.join("\n");
}

/** Generate llms-full.txt with full text of all crawled pages, including Q&A, definitions, and entity disambiguation */
export function generateLlmsFullTxt(result: ScanResult): string {
	// Sort pages by URL for determinism
	const sortedPages = [...result.pages].sort((a, b) => a.url.localeCompare(b.url));

	const sections = sortedPages.map((page) => {
		const lines: string[] = [
			`# ${page.title || "Untitled"}`,
			`URL: ${page.url}`,
			"",
			page.bodyText,
		];

		const qa = buildQaSection(page);
		if (qa) {
			lines.push("");
			lines.push(qa);
		}

		const definitions = buildDefinitionsSection(page);
		if (definitions) {
			lines.push("");
			lines.push(definitions);
		}

		const entities = buildEntitiesSection(page);
		if (entities) {
			lines.push("");
			lines.push(entities);
		}

		return lines.join("\n");
	});

	return `${sections.join("\n\n---\n\n")}\n`;
}
