import type { ScanResult } from "../types.js";
import { slugify } from "../utils.js";
import { ATTRIBUTION_HTML } from "./attribution.js";

/** Generate citation-anchors.html with heading anchor markup */
export function generateCitationAnchors(result: ScanResult): string {
	const lines: string[] = [];

	lines.push(ATTRIBUTION_HTML);
	lines.push("<!-- AEOrank Citation Anchors -->");
	lines.push("<!-- Add id attributes to your headings for deep linking -->");
	lines.push("");

	const sortedPages = [...result.pages].sort((a, b) => a.url.localeCompare(b.url));

	let missingCount = 0;

	for (const page of sortedPages) {
		const headingsWithoutId = page.headings.filter(
			(h) => (h.level === 2 || h.level === 3) && !h.id,
		);

		if (headingsWithoutId.length === 0) continue;

		lines.push(`<!-- Page: ${page.url} -->`);
		for (const heading of headingsWithoutId) {
			const suggestedId = slugify(heading.text);
			const tag = `h${heading.level}`;
			lines.push(`<!-- Before: <${tag}>${escapeHtml(heading.text)}</${tag}> -->`);
			lines.push(`<${tag} id="${suggestedId}">${escapeHtml(heading.text)}</${tag}>`);
			lines.push("");
			missingCount++;
		}
	}

	if (missingCount === 0) {
		lines.push("<!-- All H2/H3 headings already have id attributes. No changes needed. -->");
	} else {
		lines.push(`<!-- ${missingCount} heading(s) need id attributes for deep linking -->`);
	}
	lines.push("");

	return lines.join("\n");
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
