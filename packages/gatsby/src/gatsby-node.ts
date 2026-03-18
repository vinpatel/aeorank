import { join } from "node:path";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import type { AeorankGatsbyConfig } from "./types.js";
import { generateAeoFileContent } from "./generate.js";
import { AEO_FILES } from "./types.js";

/**
 * Gatsby onPostBuild hook to write AEO files to the public directory.
 *
 * Usage in gatsby-config.ts:
 * ```ts
 * import type { GatsbyConfig } from "gatsby";
 * const config: GatsbyConfig = {
 *   plugins: [
 *     {
 *       resolve: "@aeorank/gatsby",
 *       options: {
 *         siteName: "My Site",
 *         siteUrl: "https://example.com",
 *         description: "My site description",
 *       },
 *     },
 *   ],
 * };
 * export default config;
 * ```
 */
export function onPostBuild(
	_: unknown,
	pluginOptions: AeorankGatsbyConfig & { plugins?: unknown },
): void {
	const { plugins: _p, ...config } = pluginOptions;
	const publicDir = join(process.cwd(), "public");

	if (!existsSync(publicDir)) {
		mkdirSync(publicDir, { recursive: true });
	}

	for (const filename of AEO_FILES) {
		const content = generateAeoFileContent(filename, config);
		if (content) {
			writeFileSync(join(publicDir, filename), content, "utf-8");
		}
	}

	console.log(`@aeorank/gatsby: Generated ${AEO_FILES.length} AEO files in public/`);
}
