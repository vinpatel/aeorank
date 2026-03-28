import type { GeneratedFile, ScanResult } from "../types.js";
import { generateAiTxt } from "./ai-txt.js";
import { generateCitationAnchors } from "./citation-anchors.js";
import { generateClaudeMd } from "./claude-md.js";
import { generateFaqBlocks } from "./faq-blocks.js";
import { generateLlmsFullTxt } from "./llms-full.js";
import { generateLlmsTxt } from "./llms-txt.js";
import { generateRobotsPatch } from "./robots-patch.js";
import { generateSchemaJson } from "./schema-json.js";
import { generateSitemapAi } from "./sitemap-ai.js";

export {
	generateLlmsTxt,
	generateLlmsFullTxt,
	generateClaudeMd,
	generateSchemaJson,
	generateRobotsPatch,
	generateFaqBlocks,
	generateCitationAnchors,
	generateSitemapAi,
	generateAiTxt,
};

/** Generate all 9 AI readability files from scan result */
export function generateFiles(result: ScanResult): GeneratedFile[] {
	return [
		{ name: "llms.txt", content: generateLlmsTxt(result) },
		{ name: "llms-full.txt", content: generateLlmsFullTxt(result) },
		{ name: "CLAUDE.md", content: generateClaudeMd(result) },
		{ name: "schema.json", content: generateSchemaJson(result) },
		{ name: "robots-patch.txt", content: generateRobotsPatch(result) },
		{ name: "faq-blocks.html", content: generateFaqBlocks(result) },
		{ name: "citation-anchors.html", content: generateCitationAnchors(result) },
		{ name: "sitemap-ai.xml", content: generateSitemapAi(result) },
		{ name: "ai.txt", content: generateAiTxt(result) },
	];
}
