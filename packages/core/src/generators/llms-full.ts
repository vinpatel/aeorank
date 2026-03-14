import type { ScanResult } from "../types.js";

/** Generate llms-full.txt with full text of all crawled pages */
export function generateLlmsFullTxt(result: ScanResult): string {
	// Sort pages by URL for determinism
	const sortedPages = [...result.pages].sort((a, b) => a.url.localeCompare(b.url));

	const sections = sortedPages.map((page) => {
		const lines = [`# ${page.title || "Untitled"}`, `URL: ${page.url}`, "", page.bodyText];
		return lines.join("\n");
	});

	return sections.join("\n\n---\n\n") + "\n";
}
