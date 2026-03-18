import type { AstroIntegration } from "astro";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { generateAllFiles } from "./generate.js";
import type { AeorankAstroConfig } from "./types.js";

export type { AeorankAstroConfig } from "./types.js";

const AEO_FILES = [
	"llms.txt",
	"llms-full.txt",
	"CLAUDE.md",
	"schema.json",
	"robots-patch.txt",
	"faq-blocks.html",
	"citation-anchors.html",
	"sitemap-ai.xml",
];

export default function aeorank(config: AeorankAstroConfig): AstroIntegration {
	const files = generateAllFiles(config);
	const fileMap = new Map(files.map((f) => [f.name, f.content]));

	return {
		name: "@aeorank/astro",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				// Serve AEO files during dev via a virtual Vite plugin
				updateConfig({
					vite: {
						plugins: [
							{
								name: "aeorank-dev-server",
								configureServer(server) {
									server.middlewares.use((req, res, next) => {
										const url = req.url?.replace(/^\//, "") || "";
										const content = fileMap.get(url);
										if (content !== undefined) {
											const contentType = getContentType(url);
											res.setHeader("Content-Type", contentType);
											res.statusCode = 200;
											res.end(content);
											return;
										}
										next();
									});
								},
							},
						],
					},
				});
			},

			"astro:build:done": async ({ dir }) => {
				const outDir = dir.pathname;
				await mkdir(outDir, { recursive: true });

				const writePromises = files.map(async (file) => {
					const filePath = join(outDir, file.name);
					await writeFile(filePath, file.content, "utf-8");
				});

				await Promise.all(writePromises);

				console.log(
					`@aeorank/astro: Generated ${AEO_FILES.length} AEO files in output directory`,
				);
			},
		},
	};
}

function getContentType(filename: string): string {
	if (filename.endsWith(".json")) return "application/json; charset=utf-8";
	if (filename.endsWith(".xml")) return "application/xml; charset=utf-8";
	if (filename.endsWith(".html")) return "text/html; charset=utf-8";
	return "text/plain; charset=utf-8";
}
