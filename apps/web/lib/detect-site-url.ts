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

// Match GitHub's own rules: users/orgs [A-Za-z0-9-], repos [A-Za-z0-9._-].
// Enforced here so owner/repo can't smuggle traversal or host-override chars
// into the api.github.com URL.
const GITHUB_SLUG_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,99})$/;
// Path segments within the repo — alphanumerics, dashes, dots, underscores,
// forward slashes for nested paths. No leading slash, no ".." segments.
const GITHUB_REPO_PATH_RE = /^(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._-][A-Za-z0-9._/-]{0,199}$/;

function assertGithubSlug(value: string, label: "owner" | "repo"): string {
	if (!GITHUB_SLUG_RE.test(value)) {
		throw new Error(`Invalid GitHub ${label}: ${JSON.stringify(value)}`);
	}
	return value;
}

function assertRepoPath(value: string): string {
	if (!GITHUB_REPO_PATH_RE.test(value)) {
		throw new Error(`Invalid repo path: ${JSON.stringify(value)}`);
	}
	return value;
}

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
		const safeOwner = assertGithubSlug(owner, "owner");
		const safeRepo = assertGithubSlug(repo, "repo");
		const safePath = assertRepoPath(path);
		const response = await fetch(
			`${GITHUB_API}/repos/${safeOwner}/${safeRepo}/contents/${safePath}`,
			{
				headers: {
					Authorization: `token ${token}`,
					Accept: "application/vnd.github.raw+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			},
		);

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
