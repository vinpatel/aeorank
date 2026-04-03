/**
 * Auto-detect a site URL from a GitHub repository's contents.
 *
 * Priority order:
 *   1. .aeorank (JSON file with "url" field)
 *   2. aeorank.config.js / aeorank.config.ts (regex extract of siteUrl)
 *   3. CNAME (GitHub Pages custom domain)
 *   4. package.json "homepage" field
 *
 * Uses the GitHub Contents API with an installation token.
 */

const GITHUB_API = "https://api.github.com";

interface DetectOptions {
	token: string;
	owner: string;
	repo: string;
}

/**
 * Try to detect the site URL from repo contents. Returns null if no URL found.
 */
export async function detectSiteUrl(options: DetectOptions): Promise<string | null> {
	const { token, owner, repo } = options;

	// 1. .aeorank config file
	const aeorank = await fetchFileContent(token, owner, repo, ".aeorank");
	if (aeorank) {
		const url = parseAeorankConfig(aeorank);
		if (url) return url;
	}

	// 2. aeorank.config.js or aeorank.config.ts
	for (const filename of ["aeorank.config.js", "aeorank.config.ts", "aeorank.config.mjs"]) {
		const config = await fetchFileContent(token, owner, repo, filename);
		if (config) {
			const url = parseSiteUrlFromConfig(config);
			if (url) return url;
		}
	}

	// 3. CNAME file (GitHub Pages)
	const cname = await fetchFileContent(token, owner, repo, "CNAME");
	if (cname) {
		const domain = cname.trim();
		if (domain && !domain.includes(" ") && domain.includes(".")) {
			return `https://${domain}`;
		}
	}

	// 4. package.json homepage
	const pkgJson = await fetchFileContent(token, owner, repo, "package.json");
	if (pkgJson) {
		const url = parseHomepageFromPackageJson(pkgJson);
		if (url) return url;
	}

	return null;
}

// ─── File fetching ─────────────────────────────────────────────────

async function fetchFileContent(
	token: string,
	owner: string,
	repo: string,
	path: string,
): Promise<string | null> {
	try {
		const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
			headers: {
				Authorization: `token ${token}`,
				Accept: "application/vnd.github.raw+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!response.ok) return null;

		return await response.text();
	} catch {
		return null;
	}
}

// ─── Parsers ───────────────────────────────────────────────────────

/** Parse .aeorank JSON config: { "url": "https://..." } */
function parseAeorankConfig(content: string): string | null {
	try {
		const parsed = JSON.parse(content) as Record<string, unknown>;
		if (typeof parsed.url === "string" && parsed.url.startsWith("http")) {
			return parsed.url;
		}
	} catch {
		// Malformed JSON — skip
	}
	return null;
}

/** Extract siteUrl from aeorank.config.js/ts content via regex */
function parseSiteUrlFromConfig(content: string): string | null {
	// Match patterns like: siteUrl: "https://..." or siteUrl: 'https://...'
	const patterns = [
		/siteUrl\s*:\s*["']([^"']+)["']/,
		/site_url\s*:\s*["']([^"']+)["']/,
		/url\s*:\s*["'](https?:\/\/[^"']+)["']/,
	];

	for (const pattern of patterns) {
		const match = content.match(pattern);
		if (match?.[1]?.startsWith("http")) {
			return match[1];
		}
	}
	return null;
}

/** Extract homepage from package.json */
function parseHomepageFromPackageJson(content: string): string | null {
	try {
		const parsed = JSON.parse(content) as Record<string, unknown>;
		if (typeof parsed.homepage === "string" && parsed.homepage.startsWith("http")) {
			return parsed.homepage;
		}
	} catch {
		// Malformed JSON — skip
	}
	return null;
}

// ─── Exports for testing ───────────────────────────────────────────

export { parseAeorankConfig, parseSiteUrlFromConfig, parseHomepageFromPackageJson };
