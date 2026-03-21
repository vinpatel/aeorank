import type { AeorankDocusaurusConfig } from "./types.js";
import { generateAeoFiles } from "./generate.js";

/**
 * Docusaurus plugin that generates AEO files after build.
 *
 * Usage in docusaurus.config.ts:
 * ```ts
 * plugins: [
 *   ["@aeorank/docusaurus", {
 *     siteName: "My Docs",
 *     siteUrl: "https://docs.example.com",
 *     description: "Documentation site",
 *   }],
 * ],
 * ```
 */
export default function pluginAeorank(
	_context: any,
	options: AeorankDocusaurusConfig,
) {
	return {
		name: "@aeorank/docusaurus",
		async postBuild({ outDir }: { outDir: string }) {
			generateAeoFiles({ ...options, outputDir: outDir });
			console.log(`@aeorank/docusaurus: Generated 8 AEO files in ${outDir}/`);
		},
	};
}
