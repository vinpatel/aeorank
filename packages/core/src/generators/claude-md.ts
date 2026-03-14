import type { ScanResult } from "../types.js";

/** Generate CLAUDE.md repo context file */
export function generateClaudeMd(result: ScanResult): string {
	const lines: string[] = [];

	lines.push(`# ${result.siteName || "Website"}`);
	lines.push("");

	// Tech Stack
	lines.push("## Tech Stack");
	lines.push("");
	if (result.meta.platform) {
		lines.push(`- **Platform:** ${result.meta.platform}`);
	}
	lines.push(`- **Pages scanned:** ${result.pagesScanned}`);
	lines.push(`- **AEO Score:** ${result.score}/100 (${result.grade})`);
	lines.push("");

	// Site Structure
	lines.push("## Site Structure");
	lines.push("");

	const paths = new Set<string>();
	for (const page of result.pages) {
		try {
			const pathname = new URL(page.url).pathname;
			const topLevel = pathname.split("/").filter(Boolean)[0];
			if (topLevel) paths.add(`/${topLevel}/`);
		} catch {
			// skip
		}
	}
	if (paths.size > 0) {
		const sorted = [...paths].sort();
		for (const p of sorted) {
			lines.push(`- ${p}`);
		}
	} else {
		lines.push("- / (single page)");
	}
	lines.push("");

	// Content Summary
	lines.push("## Content Summary");
	lines.push("");
	const totalWords = result.pages.reduce((sum, p) => sum + p.wordCount, 0);
	const avgWords = result.pages.length > 0 ? Math.round(totalWords / result.pages.length) : 0;
	lines.push(`- **Total pages:** ${result.pagesScanned}`);
	lines.push(`- **Average word count:** ${avgWords}`);
	lines.push(`- **Total word count:** ${totalWords}`);

	const hasSchema = result.pages.some((p) => p.schemaOrg.length > 0);
	if (hasSchema) {
		lines.push("- **Schema.org markup:** Detected");
	}

	const languages = new Set(result.pages.map((p) => p.language).filter(Boolean));
	if (languages.size > 0) {
		lines.push(`- **Languages:** ${[...languages].join(", ")}`);
	}
	lines.push("");

	return lines.join("\n");
}
