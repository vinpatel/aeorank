import { GENERATED_FILE_NAMES } from "../constants.js";
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

const FILE_GENERATORS: Record<
	(typeof GENERATED_FILE_NAMES)[number],
	(result: ScanResult) => string
> = {
	"llms.txt": generateLlmsTxt,
	"llms-full.txt": generateLlmsFullTxt,
	"CLAUDE.md": generateClaudeMd,
	"schema.json": generateSchemaJson,
	"robots-patch.txt": generateRobotsPatch,
	"faq-blocks.html": generateFaqBlocks,
	"citation-anchors.html": generateCitationAnchors,
	"sitemap-ai.xml": generateSitemapAi,
};

/** Generate the files listed in GENERATED_FILE_NAMES from a scan result */
export function generateFiles(result: ScanResult): GeneratedFile[] {
	return GENERATED_FILE_NAMES.map((name) => ({
		name,
		content: FILE_GENERATORS[name](result),
	}));
}
