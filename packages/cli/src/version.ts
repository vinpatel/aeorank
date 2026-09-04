import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * CLI version is always `packages/cli/package.json` — never a hardcoded string.
 * Works from source (vitest) and from the published `dist/index.js` bundle.
 */
export function getCliVersion(): string {
	try {
		const require = createRequire(import.meta.url);
		const pkg = require("../package.json") as { version?: string };
		if (pkg.version) return pkg.version;
	} catch {
		// fall through
	}
	try {
		const here = dirname(fileURLToPath(import.meta.url));
		const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")) as {
			version?: string;
		};
		if (pkg.version) return pkg.version;
	} catch {
		// fall through
	}
	throw new Error("aeorank-cli version could not be read from package.json");
}
