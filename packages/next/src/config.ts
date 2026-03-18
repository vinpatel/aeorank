import type { AeorankNextConfig } from "./types.js";

/**
 * Wraps a Next.js config to serve AEO files with correct content types.
 *
 * Usage in next.config.mjs:
 * ```js
 * import { withAeorank } from "@aeorank/next";
 *
 * const aeorank = withAeorank({ siteName: "My Site", ... });
 * export default aeorank({ ... });
 * ```
 */
export function withAeorank(_config: AeorankNextConfig) {
	return <T extends Record<string, unknown>>(nextConfig: T): T => {
		const existingHeaders =
			typeof (nextConfig as Record<string, unknown>).headers === "function"
				? ((nextConfig as Record<string, unknown>).headers as () => Promise<unknown[]>)
				: undefined;

		return {
			...nextConfig,
			async headers() {
				const custom = existingHeaders ? await existingHeaders() : [];
				return [
					...custom,
					{
						source: "/:path(llms\\.txt|llms-full\\.txt|CLAUDE\\.md|robots-patch\\.txt)",
						headers: [
							{
								key: "Content-Type",
								value: "text/plain; charset=utf-8",
							},
						],
					},
					{
						source: "/schema.json",
						headers: [
							{
								key: "Content-Type",
								value: "application/ld+json; charset=utf-8",
							},
						],
					},
					{
						source: "/sitemap-ai.xml",
						headers: [
							{
								key: "Content-Type",
								value: "application/xml; charset=utf-8",
							},
						],
					},
					{
						source: "/:path(faq-blocks\\.html|citation-anchors\\.html)",
						headers: [
							{
								key: "Content-Type",
								value: "text/html; charset=utf-8",
							},
						],
					},
				];
			},
		};
	};
}
