import type { AeorankRemixConfig, AeoFileName } from "./types.js";
import { generateAeoFileContent } from "./generate.js";

const CONTENT_TYPES: Record<string, string> = {
	"llms.txt": "text/plain; charset=utf-8",
	"llms-full.txt": "text/plain; charset=utf-8",
	"CLAUDE.md": "text/plain; charset=utf-8",
	"schema.json": "application/ld+json; charset=utf-8",
	"robots-patch.txt": "text/plain; charset=utf-8",
	"faq-blocks.html": "text/html; charset=utf-8",
	"citation-anchors.html": "text/html; charset=utf-8",
	"sitemap-ai.xml": "application/xml; charset=utf-8",
};

/**
 * Creates a Remix loader that serves an AEO file.
 *
 * Usage in app/routes/llms[.]txt.ts:
 * ```ts
 * import { createAeoLoader } from "@aeorank/remix";
 * import { aeoConfig } from "~/aeo.config";
 * export const loader = createAeoLoader("llms.txt", aeoConfig);
 * ```
 */
export function createAeoLoader(filename: AeoFileName, config: AeorankRemixConfig) {
	return () => {
		const content = generateAeoFileContent(filename, config);
		if (!content) {
			return new Response("Not found", { status: 404 });
		}
		return new Response(content, {
			status: 200,
			headers: {
				"Content-Type": CONTENT_TYPES[filename] ?? "text/plain; charset=utf-8",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	};
}
