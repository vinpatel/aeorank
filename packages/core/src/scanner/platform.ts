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

	const generator =
		html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1] ??
		html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i)?.[1];
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
