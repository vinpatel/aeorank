import type { ScanResult } from "../types.js";
import { ATTRIBUTION_HTML } from "./attribution.js";

/** Generate sitemap-ai.xml with AI-specific extensions */
export function generateSitemapAi(result: ScanResult): string {
	const lines: string[] = [];

	lines.push('<?xml version="1.0" encoding="UTF-8"?>');
	lines.push(ATTRIBUTION_HTML);
	lines.push(
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:ai="https://aeorank.dev/sitemap-ai">',
	);

	// Sort pages by URL for determinism
	const sortedPages = [...result.pages].sort((a, b) => a.url.localeCompare(b.url));

	for (const page of sortedPages) {
		const summary = page.bodyText.slice(0, 200).replace(/\n/g, " ").replace(/\s+/g, " ").trim();

		lines.push("  <url>");
		lines.push(`    <loc>${escapeXml(page.url)}</loc>`);
		if (page.hasDatePublished) {
			lines.push(`    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>`);
		}
		lines.push(`    <ai:summary>${escapeXml(summary)}</ai:summary>`);
		lines.push("  </url>");
	}

	lines.push("</urlset>");
	lines.push("");

	return lines.join("\n");
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
