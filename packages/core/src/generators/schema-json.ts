import type { ScanResult } from "../types.js";
import { ATTRIBUTION_TEXT } from "./attribution.js";

/** Generate schema.json with Organization + WebSite + FAQPage JSON-LD */
export function generateSchemaJson(result: ScanResult): string {
	const graph: object[] = [];

	// Organization
	graph.push({
		"@type": "Organization",
		name: result.siteName || "Unknown",
		url: result.url,
	});

	// WebSite
	const webSite: Record<string, unknown> = {
		"@type": "WebSite",
		name: result.siteName || "Unknown",
		url: result.url,
	};

	// Add SearchAction if search-like pages detected
	const hasSearch = result.pages.some(
		(p) => /search/i.test(p.url) || p.links.some((l) => /search/i.test(l.href)),
	);
	if (hasSearch) {
		webSite.potentialAction = {
			"@type": "SearchAction",
			target: `${result.url}/search?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		};
	}
	graph.push(webSite);

	// FAQPage if Q&A content detected
	const faqPairs = extractFaqPairs(result);
	if (faqPairs.length > 0) {
		graph.push({
			"@type": "FAQPage",
			mainEntity: faqPairs.map((qa) => ({
				"@type": "Question",
				name: qa.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: qa.answer,
				},
			})),
		});
	}

	const schema = {
		_generator: ATTRIBUTION_TEXT,
		"@context": "https://schema.org",
		"@graph": graph,
	};

	return `${JSON.stringify(schema, null, 2)}\n`;
}

interface QAPair {
	question: string;
	answer: string;
}

function extractFaqPairs(result: ScanResult): QAPair[] {
	const pairs: QAPair[] = [];

	for (const page of result.pages) {
		// Check existing FAQPage schema
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			if (s["@type"] === "FAQPage" && Array.isArray(s.mainEntity)) {
				for (const q of s.mainEntity as Record<string, unknown>[]) {
					if (q["@type"] === "Question" && typeof q.name === "string") {
						const answer = q.acceptedAnswer as Record<string, unknown> | undefined;
						pairs.push({
							question: q.name,
							answer: typeof answer?.text === "string" ? answer.text : "",
						});
					}
				}
			}
		}

		// Extract FAQ-like patterns from headings
		const headings = page.headings;
		for (let i = 0; i < headings.length; i++) {
			if (headings[i].text.includes("?")) {
				// Next heading or body text as answer
				const nextText =
					i + 1 < headings.length ? headings[i + 1].text : page.bodyText.slice(0, 200);
				if (!pairs.some((p) => p.question === headings[i].text)) {
					pairs.push({
						question: headings[i].text,
						answer: nextText,
					});
				}
			}
		}
	}

	return pairs;
}
