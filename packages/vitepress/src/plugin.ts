import type { AeorankVitePressConfig } from "./types.js";
import { generateAeoFileContent } from "./generate.js";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const AEO_FILES = [
	"llms.txt", "llms-full.txt", "CLAUDE.md", "schema.json",
	"robots-patch.txt", "faq-blocks.html", "citation-anchors.html", "sitemap-ai.xml",
];

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
 * VitePress plugin that serves AEO files in dev and writes them on build.
 *
 * Usage in .vitepress/config.ts:
 * ```ts
 * import { aeorank } from "@aeorank/vitepress";
 * export default defineConfig({
 *   vite: {
 *     plugins: [aeorank({
 *       siteName: "My Docs",
 *       siteUrl: "https://docs.example.com",
 *       description: "Documentation site",
 *     })],
 *   },
 * });
 * ```
 */
export function aeorank(config: AeorankVitePressConfig) {
	return {
		name: "aeorank-vitepress",
		configureServer(server: any) {
			server.middlewares.use((req: any, res: any, next: any) => {
				const url = req.url?.replace(/^\//, "") || "";
				const content = generateAeoFileContent(url, config);
				if (content !== null) {
					const contentType = CONTENT_TYPES[url] ?? "text/plain; charset=utf-8";
					res.setHeader("Content-Type", contentType);
					res.statusCode = 200;
					res.end(content);
					return;
				}
				next();
			});
		},
		closeBundle() {
			const outDir = config.outputDir ?? ".vitepress/dist";
			if (!existsSync(outDir)) {
				mkdirSync(outDir, { recursive: true });
			}
			for (const filename of AEO_FILES) {
				const content = generateAeoFileContent(filename, config);
				if (content) {
					writeFileSync(join(outDir, filename), content, "utf-8");
				}
			}
			console.log(`@aeorank/vitepress: Generated 8 AEO files in ${outDir}/`);
		},
	};
}
