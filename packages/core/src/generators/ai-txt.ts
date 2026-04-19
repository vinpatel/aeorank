import type { ScanResult } from "../types.js";
import { ATTRIBUTION_HASH } from "./attribution.js";

/** Generate ai.txt with machine-readable AI content licensing directives */
export function generateAiTxt(result: ScanResult): string {
	const lines: string[] = [];

	lines.push(ATTRIBUTION_HASH);
	lines.push("#");

	// If site already has an ai.txt, prepend a note
	if (result.meta.aiTxt && result.meta.aiTxt.trim().length > 0) {
		lines.push(
			"# Note: Site already has ai.txt — this is a recommended template",
		);
		lines.push("#");
	}

	lines.push("# ai.txt - AI Content Licensing");
	lines.push("#");
	lines.push(`# Site: ${result.siteName}`);
	lines.push(`# URL: ${result.url}`);
	lines.push("");
	lines.push("User-Agent: *");
	lines.push("Allow-AI-Training: Yes");
	lines.push("Allow-AI-Inference: Yes");
	lines.push("Allow-AI-Summarization: Yes");
	lines.push("Allow-AI-Attribution: Required");
	lines.push("");
	lines.push("# Content License");
	lines.push("License: CC-BY-4.0");
	lines.push(`Attribution: ${result.siteName} (${result.url})`);
	lines.push(`Contact: See ${result.url} for contact information`);
	lines.push("");

	return lines.join("\n");
}
