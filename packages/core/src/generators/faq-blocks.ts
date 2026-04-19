import type { ScanResult } from "../types.js";
import { ATTRIBUTION_HTML } from "./attribution.js";

/** Generate faq-blocks.html with FAQPage schema + speakable markup */
export function generateFaqBlocks(result: ScanResult): string {
	const pairs = extractQaPairs(result);

	if (pairs.length === 0) {
		return `${ATTRIBUTION_HTML}
<!-- AEOrank: No FAQ content detected. Add Q&A sections to your pages. -->
<div itemscope itemtype="https://schema.org/FAQPage">
  <!-- Example:
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is your product?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Our product helps you...</p>
    </div>
  </div>
  -->
</div>
`;
	}

	const lines: string[] = [];

	lines.push(ATTRIBUTION_HTML);

	// JSON-LD script
	const schemaObj = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: pairs.map((qa) => ({
			"@type": "Question",
			name: qa.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: qa.answer,
			},
		})),
	};

	lines.push('<script type="application/ld+json">');
	lines.push(JSON.stringify(schemaObj, null, 2));
	lines.push("</script>");
	lines.push("");

	// Visible HTML with microdata
	lines.push('<div itemscope itemtype="https://schema.org/FAQPage">');

	for (const qa of pairs) {
		lines.push('  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">');
		lines.push(`    <h3 itemprop="name">${escapeHtml(qa.question)}</h3>`);
		lines.push(
			'    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">',
		);
		lines.push(`      <p itemprop="text">${escapeHtml(qa.answer)}</p>`);
		lines.push("    </div>");
		lines.push("  </div>");
	}

	lines.push("</div>");
	lines.push("");

	return lines.join("\n");
}

interface QAPair {
	question: string;
	answer: string;
}

function extractQaPairs(result: ScanResult): QAPair[] {
	const pairs: QAPair[] = [];
	const seen = new Set<string>();

	const sortedPages = [...result.pages].sort((a, b) => a.url.localeCompare(b.url));

	for (const page of sortedPages) {
		// Check existing FAQPage schema
		for (const schema of page.schemaOrg) {
			const s = schema as Record<string, unknown>;
			if (s["@type"] === "FAQPage" && Array.isArray(s.mainEntity)) {
				for (const q of s.mainEntity as Record<string, unknown>[]) {
					const name = typeof q.name === "string" ? q.name : "";
					if (name && !seen.has(name)) {
						seen.add(name);
						const answer = q.acceptedAnswer as Record<string, unknown> | undefined;
						pairs.push({
							question: name,
							answer: typeof answer?.text === "string" ? answer.text : "",
						});
					}
				}
			}
		}

		// Heading-based Q&A extraction
		for (let i = 0; i < page.headings.length; i++) {
			const h = page.headings[i];
			if (h.text.includes("?") && !seen.has(h.text)) {
				seen.add(h.text);
				pairs.push({
					question: h.text,
					answer: page.bodyText.slice(0, 200).replace(/\n/g, " "),
				});
			}
		}
	}

	return pairs;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
