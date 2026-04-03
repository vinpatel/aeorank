import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/github-app";

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

	// Enqueue scan via QStash — implemented in S03
	// For now, just log that we would scan
	const scanPayload = {
		installationId: installation.id,
		owner: repo.owner.login,
		repo: repo.name,
		prNumber,
		headSha: pr.head.sha,
		defaultBranch: repo.default_branch,
	};

	console.log("GitHub App: would enqueue scan:", JSON.stringify(scanPayload));

	// TODO (S03): Enqueue QStash job to /api/github/scan
	// const qstash = getQStashClient();
	// await qstash.publishJSON({
	//   url: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/scan`,
	//   body: scanPayload,
	// });
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

	// Enqueue scan via QStash — implemented in S03
	const scanPayload = {
		installationId: installation.id,
		owner: repo.owner.login,
		repo: repo.name,
		headSha: after,
		defaultBranch: repo.default_branch,
	};

	console.log("GitHub App: would enqueue scan:", JSON.stringify(scanPayload));

	// TODO (S03): Enqueue QStash job to /api/github/scan
}
