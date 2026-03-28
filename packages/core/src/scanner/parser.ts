import * as cheerio from "cheerio";
import type { Heading, PageLink, ScannedPage } from "../types.js";

const MAX_BODY_TEXT_LENGTH = 50_000;

/** Parse an HTML string into a ScannedPage */
export function parsePage(url: string, html: string, baseUrl: string): ScannedPage {
	const $ = cheerio.load(html);

	const title = $("title").first().text().trim();
	const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
	const canonical = $('link[rel="canonical"]').attr("href") ?? null;
	const robotsMeta = $('meta[name="robots"]').attr("content") ?? null;
	const language = $("html").attr("lang") ?? null;

	// Extract headings
	const headings: Heading[] = [];
	$("h1, h2, h3, h4, h5, h6").each((_, el) => {
		const $el = $(el);
		headings.push({
			level: Number.parseInt(el.tagName[1]),
			text: $el.text().trim(),
			id: $el.attr("id") ?? null,
		});
	});

	// Extract schema.org JSON-LD
	const schemaOrg: object[] = [];
	$('script[type="application/ld+json"]').each((_, el) => {
		try {
			const content = $(el).html();
			if (content) {
				schemaOrg.push(JSON.parse(content));
			}
		} catch {
			// Ignore malformed JSON-LD
		}
	});

	// Extract links
	const links: PageLink[] = [];
	const baseOrigin = new URL(baseUrl).origin;
	$("a[href]").each((_, el) => {
		const href = $(el).attr("href");
		if (!href) return;

		try {
			const resolved = new URL(href, baseUrl).toString();
			links.push({
				href: resolved,
				text: $(el).text().trim(),
				internal: resolved.startsWith(baseOrigin),
			});
		} catch {
			// Skip invalid URLs
		}
	});

	// Extract paragraphs BEFORE removing nav/footer/header (which mutates DOM)
	const paragraphs = extractParagraphs($);
	const sentences = extractSentences(paragraphs);
	const contentHash = hashText(paragraphs.join("\n"));

	// Extract body text
	// Remove script, style, nav, and footer for cleaner text
	$("script, style, nav, footer, header").remove();
	let bodyText = $("body").text().replace(/\s+/g, " ").trim();
	if (bodyText.length > MAX_BODY_TEXT_LENGTH) {
		bodyText = bodyText.slice(0, MAX_BODY_TEXT_LENGTH);
	}

	const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

	// Detect author
	const authorName = detectAuthor($, schemaOrg);

	// Detect date published
	const hasDatePublished = detectDatePublished($, schemaOrg);

	return {
		url,
		title,
		metaDescription,
		headings,
		bodyText,
		schemaOrg,
		links,
		canonical,
		robotsMeta,
		language,
		wordCount,
		hasDatePublished,
		authorName,
		paragraphs,
		sentences,
		contentHash,
	};
}

function extractParagraphs($: cheerio.CheerioAPI): string[] {
	const paras: string[] = [];
	$("p").each((_, el) => {
		const text = $(el).text().trim();
		if (text.length >= 20) paras.push(text);
	});
	return paras;
}

function extractSentences(paragraphs: string[]): string[] {
	const sentences: string[] = [];
	for (const para of paragraphs) {
		const parts = para.split(/(?<=[.!?])\s+/);
		for (const s of parts) {
			const trimmed = s.trim();
			if (trimmed.length >= 10) sentences.push(trimmed);
		}
	}
	return sentences;
}

function hashText(text: string): string {
	const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
	let hash = 5381;
	for (let i = 0; i < normalized.length; i++) {
		hash = ((hash << 5) + hash + normalized.charCodeAt(i)) & 0xffffffff;
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}

function detectAuthor($: cheerio.CheerioAPI, schemaOrg: object[]): string | null {
	// Check meta author
	const metaAuthor = $('meta[name="author"]').attr("content")?.trim();
	if (metaAuthor) return metaAuthor;

	// Check JSON-LD for Person/Author
	for (const schema of schemaOrg) {
		const s = schema as Record<string, unknown>;
		if (s["@type"] === "Person" && typeof s.name === "string") return s.name;
		if (typeof s.author === "object" && s.author !== null) {
			const author = s.author as Record<string, unknown>;
			if (typeof author.name === "string") return author.name;
		}
	}

	// Check common byline selectors
	const bylineSelectors = [".author", ".byline", '[rel="author"]', '[itemprop="author"]'];
	for (const selector of bylineSelectors) {
		const text = $(selector).first().text().trim();
		if (text) return text;
	}

	return null;
}

function detectDatePublished($: cheerio.CheerioAPI, schemaOrg: object[]): boolean {
	// Check meta tags
	if ($('meta[property="article:published_time"]').attr("content")) return true;
	if ($('meta[name="date"]').attr("content")) return true;

	// Check JSON-LD
	for (const schema of schemaOrg) {
		const s = schema as Record<string, unknown>;
		if (s.datePublished) return true;
	}

	// Check time elements
	if ($("time[datetime]").length > 0) return true;

	return false;
}
