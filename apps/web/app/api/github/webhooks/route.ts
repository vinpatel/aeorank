import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getInstallationToken, createCheckRun } from "@/lib/github-app";
import { detectSiteUrl } from "@/lib/detect-site-url";
import { getQStashClient } from "@/lib/qstash";

/**
 * GitHub App webhook handler — PUBLIC route (excluded from Clerk auth in proxy.ts).
 *
 * CRITICAL: Uses request.text() for raw body, NOT request.json().
 * request.json() would re-serialize the body, breaking HMAC signature verification.
 *
 * Handles:
 *   - pull_request.opened / pull_request.synchronize → enqueue AEO scan
 *   - push (to default branch) → enqueue AEO scan
 */
export async function POST(request: NextRequest) {
	const body = await request.text();
	const signature = request.headers.get("x-hub-signature-256");
	const event = request.headers.get("x-github-event");
	const deliveryId = request.headers.get("x-github-delivery");

	// Validate webhook signature
	const secret = process.env.GITHUB_APP_WEBHOOK_SECRET;
	if (!secret) {
		console.error("GitHub webhook: GITHUB_APP_WEBHOOK_SECRET not configured");
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}

	if (!verifyWebhookSignature(body, signature, secret)) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	const payload = JSON.parse(body);

	console.log(`GitHub webhook: event=${event} action=${payload.action ?? "—"} delivery=${deliveryId}`);

	try {
		switch (event) {
			case "pull_request": {
				const action = payload.action as string;
				if (action === "opened" || action === "synchronize") {
					await handlePullRequest(payload);
				}
				break;
			}

			case "push": {
				// Only scan pushes to the default branch
				const defaultBranch = payload.repository?.default_branch;
				const ref = payload.ref as string;
				if (ref === `refs/heads/${defaultBranch}`) {
					await handlePush(payload);
				}
				break;
			}

			case "ping": {
				// GitHub sends a ping event when the webhook is first configured
				console.log("GitHub webhook: ping received, zen:", payload.zen);
				break;
			}

			default:
				// Return 200 for unhandled events — GitHub retries on non-2xx
				console.log(`GitHub webhook: ignoring event=${event}`);
				break;
		}
	} catch (err) {
		console.error("GitHub webhook handler error:", err);
		// Return 200 to prevent GitHub from retrying — we'll catch errors in Sentry
		return NextResponse.json({ error: "Handler error" }, { status: 200 });
	}

	return NextResponse.json({ received: true });
}

// ─── Event Handlers ────────────────────────────────────────────────

interface PullRequestPayload {
	action: string;
	number: number;
	pull_request: {
		head: { sha: string; ref: string };
		base: { ref: string };
	};
	repository: {
		name: string;
		owner: { login: string };
		default_branch: string;
	};
	installation: { id: number };
}

async function handlePullRequest(payload: PullRequestPayload): Promise<void> {
	const { number: prNumber, pull_request: pr, repository: repo, installation } = payload;

	console.log(
		`GitHub App: PR #${prNumber} ${payload.action} on ${repo.owner.login}/${repo.name} (sha: ${pr.head.sha.slice(0, 7)})`,
	);

	await enqueueScan({
		installationId: installation.id,
		owner: repo.owner.login,
		repo: repo.name,
		prNumber,
		headSha: pr.head.sha,
	});
}

interface PushPayload {
	ref: string;
	after: string;
	repository: {
		name: string;
		owner: { login: string };
		default_branch: string;
	};
	installation: { id: number };
}

async function handlePush(payload: PushPayload): Promise<void> {
	const { ref, after, repository: repo, installation } = payload;

	console.log(
		`GitHub App: push to ${ref} on ${repo.owner.login}/${repo.name} (sha: ${after.slice(0, 7)})`,
	);

	await enqueueScan({
		installationId: installation.id,
		owner: repo.owner.login,
		repo: repo.name,
		headSha: after,
	});
}

// ─── Scan Enqueue ──────────────────────────────────────────────────

interface EnqueueParams {
	installationId: number;
	owner: string;
	repo: string;
	headSha: string;
	prNumber?: number;
}

async function enqueueScan(params: EnqueueParams): Promise<void> {
	const { installationId, owner, repo, headSha, prNumber } = params;

	// Rate limit: 10 scans per day per installation
	const rateLimitKey = `github-app:${installationId}`;
	const now = Date.now();
	const dayAgo = now - 24 * 60 * 60 * 1000;

	// Simple in-memory rate limiter (per-process — good enough for single Vercel instance)
	if (!rateLimitMap.has(rateLimitKey)) {
		rateLimitMap.set(rateLimitKey, []);
	}
	const timestamps = rateLimitMap.get(rateLimitKey)!;
	// Prune old entries
	const recent = timestamps.filter((t) => t > dayAgo);
	rateLimitMap.set(rateLimitKey, recent);

	if (recent.length >= RATE_LIMIT_PER_DAY) {
		console.log(`GitHub App: rate limit hit for installation ${installationId} (${recent.length}/${RATE_LIMIT_PER_DAY})`);
		// Post a neutral Check Run informing the user
		try {
			const token = await getInstallationToken(installationId);
			await createCheckRun({
				token,
				owner,
				repo,
				headSha,
				name: "AEOrank Score",
				conclusion: "neutral",
				title: "Rate Limit Reached",
				summary: `AEOrank free tier allows ${RATE_LIMIT_PER_DAY} scans per day. Try again tomorrow or upgrade at [app.aeorank.dev](https://app.aeorank.dev).`,
			});
		} catch (err) {
			console.error("Failed to post rate limit Check Run:", err);
		}
		return;
	}

	// Detect site URL
	let token: string;
	try {
		token = await getInstallationToken(installationId);
	} catch (err) {
		console.error("Failed to get installation token for URL detection:", err);
		return;
	}

	const url = await detectSiteUrl({ token, owner, repo });

	if (!url) {
		console.log(`GitHub App: no URL found for ${owner}/${repo}`);
		try {
			await createCheckRun({
				token,
				owner,
				repo,
				headSha,
				name: "AEOrank Score",
				conclusion: "neutral",
				title: "No Site URL Configured",
				summary: "AEOrank couldn't detect your site URL. Add a `.aeorank` file with `{\"url\": \"https://your-site.com\"}` to your repo root, or set `homepage` in package.json.",
			});
		} catch (err) {
			console.error("Failed to post no-URL Check Run:", err);
		}
		return;
	}

	// Record scan timestamp for rate limiting
	recent.push(now);

	// Enqueue via QStash
	const qstash = getQStashClient();
	await qstash.publishJSON({
		url: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/scan`,
		body: {
			installationId,
			owner,
			repo,
			headSha,
			url,
			prNumber,
		},
	});

	console.log(`GitHub App: enqueued scan for ${owner}/${repo} → ${url}`);
}

const RATE_LIMIT_PER_DAY = 10;
const rateLimitMap = new Map<string, number[]>();
