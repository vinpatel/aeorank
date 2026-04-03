import { createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, importPKCS8 } from "jose";

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
 * JWTs expire after 10 minutes (GitHub maximum).
 */
async function createAppJwt(): Promise<string> {
	const appId = process.env.GITHUB_APP_ID;
	const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

	if (!appId || !privateKey) {
		throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set");
	}

	// Handle private key that may be JSON-escaped (newlines as \n)
	const normalizedKey = privateKey.replace(/\\n/g, "\n");
	const key = await importPKCS8(normalizedKey, "RS256");

	const now = Math.floor(Date.now() / 1000);

	return new SignJWT({})
		.setProtectedHeader({ alg: "RS256" })
		.setIssuer(appId)
		.setIssuedAt(now - 60) // 60s clock drift allowance
		.setExpirationTime(now + 600) // 10 minute maximum
		.sign(key);
}

/**
 * Exchange App JWT for an installation access token.
 * This token can make API calls on behalf of the installed app.
 */
export async function getInstallationToken(installationId: number): Promise<string> {
	const jwt = await createAppJwt();

	const response = await fetch(
		`https://api.github.com/app/installations/${installationId}/access_tokens`,
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

	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/check-runs`,
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
	const headers = {
		Authorization: `token ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};

	// Find existing comment with marker
	const commentsResponse = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
		{ headers },
	);

	if (!commentsResponse.ok) {
		throw new Error(`Failed to list PR comments (${commentsResponse.status})`);
	}

	const comments = (await commentsResponse.json()) as Array<{ id: number; body: string }>;
	const existing = comments.find((c) => c.body.includes(marker));

	const markedBody = `${marker}\n${body}`;

	if (existing) {
		// Update existing comment
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`,
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
			`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
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
