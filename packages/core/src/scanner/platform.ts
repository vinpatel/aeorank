/**
 * Detect CMS / framework from raw HTML.
 *
 * Order matters: Webflow is checked before WordPress so a mention of
 * "WordPress" in page copy cannot mislabel a Webflow site.
 * Body text is never used — only markup, generator meta, and known asset URLs.
 */
export function detectPlatformFromHtml(html: string): string | null {
	if (
		/data-wf-(?:site|page|domain)=/i.test(html) ||
		/webflow\.js/i.test(html) ||
		/cdn\.prod\.website-files\.com/i.test(html) ||
		/uploads-ssl\.webflow\.com/i.test(html) ||
		/assets-global\.website-files\.com/i.test(html) ||
		/\bw-mod-(?:js|ix)\b/i.test(html)
	) {
		return "Webflow";
	}

	if (/__NEXT_DATA__|_next\/static/i.test(html)) return "Next.js";
	if (/__NUXT__|_nuxt\//i.test(html)) return "Nuxt";

	const generator = extractGeneratorMeta(html);
	if (generator) {
		const g = generator.toLowerCase();
		if (g.includes("webflow")) return "Webflow";
		if (g.includes("wordpress")) return "WordPress";
		if (g.includes("shopify")) return "Shopify";
		if (g.includes("squarespace")) return "Squarespace";
		if (g.includes("wix")) return "Wix";
		if (g.includes("gatsby")) return "Gatsby";
		if (g.includes("hugo")) return "Hugo";
		if (g.includes("jekyll")) return "Jekyll";
		if (g.includes("drupal")) return "Drupal";
	}

	if (/\/wp-content\/|\/wp-includes\//i.test(html)) return "WordPress";
	if (/cdn\.shopify\.com/i.test(html)) return "Shopify";
	if (/static1\.squarespace\.com/i.test(html)) return "Squarespace";
	if (/gatsby-chunk|___gatsby/i.test(html)) return "Gatsby";
	if (/astro-island|data-astro-/i.test(html)) return "Astro";

	return null;
}

/**
 * Linear scan for `<meta name="generator" content="…">` (either attribute order).
 * Avoids nested `[^>]+` regexes that CodeQL flags as polynomial ReDoS on raw HTML.
 */
function extractGeneratorMeta(html: string): string | undefined {
	const lower = html.toLowerCase();
	let from = 0;
	while (from < html.length) {
		const start = lower.indexOf("<meta", from);
		if (start === -1) break;
		const end = html.indexOf(">", start + 5);
		if (end === -1) break;
		const tag = html.slice(start, end + 1);
		from = end + 1;
		if (quotedAttr(tag, "name")?.toLowerCase() !== "generator") continue;
		const content = quotedAttr(tag, "content");
		if (content) return content;
	}
	return undefined;
}

function quotedAttr(tag: string, key: string): string | undefined {
	const lower = tag.toLowerCase();
	const needle = key.toLowerCase();
	let i = 0;
	while (i < tag.length) {
		const idx = lower.indexOf(needle, i);
		if (idx === -1) return undefined;
		const before = idx === 0 ? "" : tag[idx - 1];
		if (before && /[A-Za-z0-9_-]/.test(before)) {
			i = idx + needle.length;
			continue;
		}
		let j = idx + needle.length;
		while (j < tag.length && (tag[j] === " " || tag[j] === "\t")) j++;
		if (tag[j] !== "=") {
			i = idx + needle.length;
			continue;
		}
		j++;
		while (j < tag.length && (tag[j] === " " || tag[j] === "\t")) j++;
		const quote = tag[j];
		if (quote !== '"' && quote !== "'") return undefined;
		const close = tag.indexOf(quote, j + 1);
		if (close === -1) return undefined;
		return tag.slice(j + 1, close);
	}
	return undefined;
}
