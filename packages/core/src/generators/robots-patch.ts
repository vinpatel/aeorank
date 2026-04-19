import { AI_CRAWLERS } from "../constants.js";
import type { ScanResult } from "../types.js";
import { ATTRIBUTION_HASH } from "./attribution.js";

/** Generate robots-patch.txt with AI crawler directives */
export function generateRobotsPatch(result: ScanResult): string {
	const lines: string[] = [];

	lines.push(ATTRIBUTION_HASH);
	lines.push("# AEOrank Robots.txt Patch");
	lines.push("# Add these directives to your robots.txt to allow AI crawlers");
	lines.push("");

	for (const crawler of AI_CRAWLERS) {
		const access = result.meta.robotsTxt.crawlerAccess[crawler];
		if (access === "allowed") {
			lines.push(`# ${crawler}: Already allowed`);
		} else {
			lines.push(`User-agent: ${crawler}`);
			lines.push("Allow: /");
		}
		lines.push("");
	}

	return lines.join("\n");
}
