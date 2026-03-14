import type { ScanResult } from "../types.js";

/** Generate llms.txt per llmstxt.org spec */
export function generateLlmsTxt(result: ScanResult): string {
	const lines: string[] = [];

	// H1 - Site name
	lines.push(`# ${result.siteName || "Untitled Site"}`);
	lines.push("");

	// Blockquote - Site description
	if (result.siteDescription) {
		lines.push(`> ${result.siteDescription}`);
		lines.push("");
	}

	// Group pages by first path segment
	const sections = groupPagesBySection(result);

	// Sort sections alphabetically
	const sortedSections = [...sections.entries()].sort((a, b) =>
		a[0].localeCompare(b[0]),
	);

	for (const [sectionName, pages] of sortedSections) {
		lines.push(`## ${sectionName}`);
		lines.push("");
		// Sort pages by URL within section
		const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));
		for (const page of sortedPages) {
			const desc = page.metaDescription || page.bodyText.slice(0, 160).replace(/\n/g, " ");
			lines.push(`- [${page.title || page.url}](${page.url}): ${desc}`);
		}
		lines.push("");
	}

	return lines.join("\n").trim() + "\n";
}

function groupPagesBySection(result: ScanResult): Map<string, typeof result.pages> {
	const sections = new Map<string, typeof result.pages>();

	for (const page of result.pages) {
		try {
			const path = new URL(page.url).pathname;
			const segments = path.split("/").filter(Boolean);
			const sectionName = segments.length > 0 ? capitalize(segments[0]) : "Main";

			if (!sections.has(sectionName)) {
				sections.set(sectionName, []);
			}
			sections.get(sectionName)!.push(page);
		} catch {
			if (!sections.has("Main")) sections.set("Main", []);
			sections.get("Main")!.push(page);
		}
	}

	return sections;
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
