import type { AeorankEleventyConfig } from "./types.js";
import { generateAeoFiles } from "./generate.js";

/**
 * Eleventy plugin that generates AEO files after build.
 *
 * Usage in .eleventy.js:
 * ```js
 * const aeorank = require("@aeorank/11ty");
 * module.exports = function(eleventyConfig) {
 *   eleventyConfig.addPlugin(aeorank, {
 *     siteName: "My Site",
 *     siteUrl: "https://example.com",
 *     description: "My site description",
 *   });
 * };
 * ```
 */
export function aeorank(eleventyConfig: any, options: AeorankEleventyConfig) {
	eleventyConfig.on("eleventy.after", () => {
		const outputDir = options.outputDir ?? eleventyConfig.dir?.output ?? "_site";
		generateAeoFiles({ ...options, outputDir });
		console.log(`@aeorank/11ty: Generated 8 AEO files in ${outputDir}/`);
	});
}
