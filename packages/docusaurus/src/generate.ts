import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AeorankDocusaurusConfig } from "./types.js";

function ensureDir(dir: string) {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

function generateLlmsTxt(config: AeorankDocusaurusConfig): string {
	return `# ${config.siteName}

> ${config.description}

## About

${config.siteName} — ${config.description}

Website: ${config.siteUrl}
${config.organization ? `Organization: ${config.organization.name}` : ""}

## Key Pages

- ${config.siteUrl}/ (Home)
- ${config.siteUrl}/sitemap-ai.xml (AI Sitemap)
- ${config.siteUrl}/schema.json (Structured Data)
`.trimEnd();
}

function generateLlmsFullTxt(config: AeorankDocusaurusConfig): string {
	const faqSection =
		config.faq && config.faq.length > 0
			? `\n\n## Frequently Asked Questions\n\n${config.faq.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}`
			: "";

	return `# ${config.siteName} — Full Context

> ${config.description}

## About

${config.siteName} is accessible at ${config.siteUrl}.
${config.organization ? `It is operated by ${config.organization.name}${config.organization.url ? ` (${config.organization.url})` : ""}.` : ""}

## Description

${config.description}

## Key Pages

- Home: ${config.siteUrl}/
- AI Sitemap: ${config.siteUrl}/sitemap-ai.xml
- Structured Data: ${config.siteUrl}/schema.json
- FAQ Blocks: ${config.siteUrl}/faq-blocks.html
- Citation Anchors: ${config.siteUrl}/citation-anchors.html${faqSection}
`.trimEnd();
}

function generateClaudeMd(config: AeorankDocusaurusConfig): string {
	return `# ${config.siteName}

${config.description}

Site URL: ${config.siteUrl}
${config.organization ? `Organization: ${config.organization.name}` : ""}

## Tech Stack

- **Framework:** Docusaurus

## AEO Files

This site publishes the following AEO (AI Engine Optimization) files:
- /llms.txt — Summary for LLM crawlers
- /llms-full.txt — Extended context for LLM crawlers
- /schema.json — JSON-LD structured data
- /robots-patch.txt — AI bot access rules
- /faq-blocks.html — FAQ with schema markup
- /citation-anchors.html — Citation anchor examples
- /sitemap-ai.xml — AI-optimized sitemap
`.trimEnd();
}

function generateSchemaJson(config: AeorankDocusaurusConfig): string {
	const schema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				name: config.siteName,
				url: config.siteUrl,
				description: config.description,
			},
			...(config.organization
				? [
						{
							"@type": "Organization",
							name: config.organization.name,
							url: config.organization.url ?? config.siteUrl,
							...(config.organization.logo ? { logo: config.organization.logo } : {}),
						},
					]
				: []),
		],
	};
	return JSON.stringify(schema, null, "\t");
}

function generateRobotsPatchTxt(): string {
	return `# AI Bot Access Rules — AEOrank
# Append these rules to your robots.txt

User-agent: GPTBot
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /schema.json
Allow: /sitemap-ai.xml
Allow: /faq-blocks.html
Allow: /citation-anchors.html

User-agent: ClaudeBot
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /CLAUDE.md
Allow: /schema.json
Allow: /sitemap-ai.xml

User-agent: PerplexityBot
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /schema.json
Allow: /sitemap-ai.xml

User-agent: Google-Extended
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /schema.json
Allow: /sitemap-ai.xml`;
}

function generateFaqBlocksHtml(config: AeorankDocusaurusConfig): string {
	const faqItems = config.faq ?? [];
	const faqMarkup =
		faqItems.length > 0
			? faqItems
					.map(
						(f) => `		<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
			<h3 itemprop="name">${escapeHtml(f.question)}</h3>
			<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
				<p itemprop="text">${escapeHtml(f.answer)}</p>
			</div>
		</div>`,
					)
					.join("\n")
			: "\t\t<!-- Add FAQ entries via the faq config option -->";

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>FAQ — ${escapeHtml(config.siteName)}</title>
</head>
<body>
	<div itemscope itemtype="https://schema.org/FAQPage">
		<h1>Frequently Asked Questions</h1>
${faqMarkup}
	</div>
</body>
</html>`;
}

function generateCitationAnchorsHtml(config: AeorankDocusaurusConfig): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Citation Anchors — ${escapeHtml(config.siteName)}</title>
</head>
<body>
	<section id="citations">
		<h1>Citation Anchors for ${escapeHtml(config.siteName)}</h1>
		<p>These anchors help AI engines cite specific sections of this site.</p>
		<ul>
			<li><a href="${config.siteUrl}/#about" id="about">About ${escapeHtml(config.siteName)}</a></li>
			<li><a href="${config.siteUrl}/#faq" id="faq">Frequently Asked Questions</a></li>
			<li><a href="${config.siteUrl}/#contact" id="contact">Contact</a></li>
		</ul>
	</section>
</body>
</html>`;
}

function generateSitemapAiXml(config: AeorankDocusaurusConfig): string {
	const now = new Date().toISOString().split("T")[0];
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${config.siteUrl}/</loc>
		<lastmod>${now}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc>${config.siteUrl}/llms.txt</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>${config.siteUrl}/llms-full.txt</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>${config.siteUrl}/schema.json</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.7</priority>
	</url>
	<url>
		<loc>${config.siteUrl}/faq-blocks.html</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>
	<url>
		<loc>${config.siteUrl}/sitemap-ai.xml</loc>
		<lastmod>${now}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>
</urlset>`;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

const generators: Record<string, (config: AeorankDocusaurusConfig) => string> = {
	"llms.txt": generateLlmsTxt,
	"llms-full.txt": generateLlmsFullTxt,
	"CLAUDE.md": generateClaudeMd,
	"schema.json": generateSchemaJson,
	"robots-patch.txt": generateRobotsPatchTxt,
	"faq-blocks.html": generateFaqBlocksHtml,
	"citation-anchors.html": generateCitationAnchorsHtml,
	"sitemap-ai.xml": generateSitemapAiXml,
};

/**
 * Generates all 8 AEO files into the output directory.
 *
 * @param config - AEOrank site configuration
 * @returns Array of file paths that were written
 */
export function generateAeoFiles(config: AeorankDocusaurusConfig): string[] {
	const outputDir = config.outputDir ?? "build";
	ensureDir(outputDir);

	const written: string[] = [];

	for (const [filename, generate] of Object.entries(generators)) {
		const filePath = join(outputDir, filename);
		const content = generate(config);
		writeFileSync(filePath, content, "utf-8");
		written.push(filePath);
	}

	return written;
}

/**
 * Generates a single AEO file content string without writing to disk.
 */
export function generateAeoFileContent(
	filename: string,
	config: AeorankDocusaurusConfig,
): string | null {
	const generator = generators[filename];
	if (!generator) return null;
	return generator(config);
}
