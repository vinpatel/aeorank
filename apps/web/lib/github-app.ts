import { createHmac, timingSafeEqual, sign as cryptoSign } from "node:crypto";

// ─── GitHub identifier validation (SSRF defense) ───────────────────

// GitHub restricts usernames/orgs to alphanumerics + hyphen and repo names to
// alphanumerics + hyphen/underscore/period. Enforcing this here means an owner
// or repo value can never carry path-traversal or host-override characters
// into the api.github.com URL template.
const GITHUB_SLUG_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,99})$/;

function assertGithubSlug(value: string, label: "owner" | "repo"): string {
	if (!GITHUB_SLUG_RE.test(value)) {
		throw new Error(`Invalid GitHub ${label}: ${JSON.stringify(value)}`);
	}
	return value;
}

function assertSafeInt(value: number, label: string): number {
	if (!Number.isInteger(value) || value <= 0 || value > Number.MAX_SAFE_INTEGER) {
		throw new Error(`Invalid ${label}: ${value}`);
	}
	return value;
}

// ─── Webhook Signature Verification ────────────────────────────────

/**
 * Verify GitHub webhook signature (X-Hub-Signature-256).
 * Uses HMAC-SHA256 with timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
	payload: string,
	signature: string | null,
	secret: string,
): boolean {
	if (!signature) return false;

	const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

	if (signature.length !== expected.length) return false;

	return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ─── App Authentication ────────────────────────────────────────────

/**
 * Generate a JWT for GitHub App authentication.
 * Uses Node.js crypto instead of jose to support both PKCS#1 (RSA) and PKCS#8 key formats.
 */
function createAppJwt(): string {
	const appId = process.env.GITHUB_APP_ID;
	const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

	if (!appId || !privateKey) {
		throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set");
	}

	// Handle private key that may be JSON-escaped (newlines as \n)
	const normalizedKey = privateKey.replace(/\\n/g, "\n");

	const now = Math.floor(Date.now() / 1000);
	const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
	const payload = Buffer.from(
		JSON.stringify({
			iss: appId,
			iat: now - 60,
			exp: now + 600,
		}),
	).toString("base64url");

	const signature = cryptoSign("RSA-SHA256", Buffer.from(`${header}.${payload}`), normalizedKey).toString("base64url");

	return `${header}.${payload}.${signature}`;
}

/**
 * Exchange App JWT for an installation access token.
 * This token can make API calls on behalf of the installed app.
 */
export async function getInstallationToken(installationId: number): Promise<string> {
	const safeId = assertSafeInt(installationId, "installationId");
	const jwt = createAppJwt();

	const response = await fetch(
		`https://api.github.com/app/installations/${safeId}/access_tokens`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${jwt}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to get installation token (${response.status}): ${error}`);
	}

	const data = (await response.json()) as { token: string };
	return data.token;
}

// ─── GitHub API Helpers ────────────────────────────────────────────

interface CheckRunParams {
	token: string;
	owner: string;
	repo: string;
	headSha: string;
	name: string;
	conclusion: "success" | "neutral" | "failure";
	title: string;
	summary: string;
	text?: string;
}

/** Create a Check Run on a commit. */
export async function createCheckRun(params: CheckRunParams): Promise<void> {
	const { token, owner, repo, headSha, name, conclusion, title, summary, text } = params;
	const safeOwner = assertGithubSlug(owner, "owner");
	const safeRepo = assertGithubSlug(repo, "repo");

	const response = await fetch(
		`https://api.github.com/repos/${safeOwner}/${safeRepo}/check-runs`,
		{
			method: "POST",
			headers: {
				Authorization: `token ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			body: JSON.stringify({
				head_sha: headSha,
				name,
				status: "completed",
				conclusion,
				output: { title, summary, text },
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to create Check Run (${response.status}): ${error}`);
	}
}

interface PrCommentParams {
	token: string;
	owner: string;
	repo: string;
	prNumber: number;
	body: string;
	marker: string;
}

/** Create or update a PR comment identified by a hidden HTML marker. */
export async function upsertPrComment(params: PrCommentParams): Promise<void> {
	const { token, owner, repo, prNumber, body, marker } = params;
	const safeOwner = assertGithubSlug(owner, "owner");
	const safeRepo = assertGithubSlug(repo, "repo");
	const safePr = assertSafeInt(prNumber, "prNumber");
	const headers = {
		Authorization: `token ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};

	// Find existing comment with marker
	const commentsResponse = await fetch(
		`https://api.github.com/repos/${safeOwner}/${safeRepo}/issues/${safePr}/comments?per_page=100`,
		{ headers },
	);

	if (!commentsResponse.ok) {
		throw new Error(`Failed to list PR comments (${commentsResponse.status})`);
	}

	const comments = (await commentsResponse.json()) as Array<{ id: number; body: string }>;
	const existing = comments.find((c) => c.body.includes(marker));

	const markedBody = `${marker}\n${body}`;

	if (existing) {
		const safeCommentId = assertSafeInt(existing.id, "commentId");
		// Update existing comment
		const response = await fetch(
			`https://api.github.com/repos/${safeOwner}/${safeRepo}/issues/comments/${safeCommentId}`,
			{
				method: "PATCH",
				headers,
				body: JSON.stringify({ body: markedBody }),
			},
		);
		if (!response.ok) {
			throw new Error(`Failed to update PR comment (${response.status})`);
		}
	} else {
		// Create new comment
		const response = await fetch(
			`https://api.github.com/repos/${safeOwner}/${safeRepo}/issues/${safePr}/comments`,
			{
				method: "POST",
				headers,
				body: JSON.stringify({ body: markedBody }),
			},
		);
		if (!response.ok) {
			throw new Error(`Failed to create PR comment (${response.status})`);
		}
	}
}
