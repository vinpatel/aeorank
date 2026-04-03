import * as Sentry from "@sentry/nextjs";
import { Receiver } from "@upstash/qstash";
import { NextResponse } from "next/server";
import { scan } from "@aeorank/core";
import {
	getInstallationToken,
	createCheckRun,
	upsertPrComment,
} from "@/lib/github-app";

// Public route — QStash callbacks are unauthenticated HTTP
export const maxDuration = 300;

interface GitHubScanPayload {
	installationId: number;
	owner: string;
	repo: string;
	headSha: string;
	url: string;
	prNumber?: number;
}

export async function POST(request: Request) {
	const body = await request.text();

	// Verify QStash signature
	const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
	const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

	if (currentKey && nextKey) {
		try {
			const receiver = new Receiver({
				currentSigningKey: currentKey,
				nextSigningKey: nextKey,
			});
			const signature = request.headers.get("upstash-signature") ?? "";
			const isValid = await receiver.verify({ signature, body });
			if (!isValid) {
				return NextResponse.json({ error: "Invalid QStash signature" }, { status: 401 });
			}
		} catch (verifyErr) {
			console.error("QStash signature verification error (continuing):", verifyErr);
			Sentry.captureException(verifyErr, { tags: { source: "github-scan-qstash-verify" } });
		}
	}

	let payload: GitHubScanPayload;
	try {
		payload = JSON.parse(body) as GitHubScanPayload;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const { installationId, owner, repo, headSha, url, prNumber } = payload;

	if (!installationId || !owner || !repo || !headSha || !url) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	let token: string;
	try {
		token = await getInstallationToken(installationId);
	} catch (err) {
		console.error("Failed to get installation token:", err);
		Sentry.captureException(err, {
			tags: { source: "github-scan", installationId: String(installationId) },
		});
		return NextResponse.json({ error: "Auth failed" }, { status: 500 });
	}

	// Post "in progress" Check Run
	try {
		await createInProgressCheckRun(token, owner, repo, headSha);
	} catch (err) {
		console.error("Failed to create in-progress Check Run:", err);
	}

	try {
		console.log(`GitHub App scan: ${owner}/${repo} (${headSha.slice(0, 7)}) → ${url}`);
		const startTime = Date.now();

		const result = await scan(url);

		const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log(
			`GitHub App scan complete: ${owner}/${repo} score=${result.score} grade=${result.grade} (${durationSec}s)`,
		);

		// Build dimension table (same format as the Action)
		const statusEmoji: Record<string, string> = { pass: "✅", warn: "⚠️", fail: "❌" };
		const rows = result.dimensions.map(
			(d) =>
				`| ${d.name} | ${d.score}/${d.maxScore} | ${statusEmoji[d.status] ?? "—"} ${d.status.toUpperCase()} | ${d.hint} |`,
		);
		const table = [
			"| Dimension | Score | Status | Recommendation |",
			"|-----------|-------|--------|----------------|",
			...rows,
		].join("\n");

		// Determine conclusion
		let conclusion: "success" | "neutral" | "failure";
		if (result.score >= 70) conclusion = "success";
		else if (result.score >= 40) conclusion = "neutral";
		else conclusion = "failure";

		// Post Check Run
		await createCheckRun({
			token,
			owner,
			repo,
			headSha,
			name: "AEOrank Score",
			conclusion,
			title: `AEO Score: ${result.score}/100 (${result.grade})`,
			summary: `Your site scored **${result.score}** — Grade **${result.grade}** | Scanned: ${url}`,
			text: table,
		});

		// Post PR comment if triggered by a PR
		if (prNumber) {
			const commentBody = `## AEOrank Score: ${result.score}/100 (${result.grade})\n\n${table}\n\n*Scanned ${url} · [What is AEOrank?](https://aeorank.dev)*`;
			await upsertPrComment({
				token,
				owner,
				repo,
				prNumber,
				body: commentBody,
				marker: "<!-- aeorank-score -->",
			});
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Scan failed";
		console.error(`GitHub App scan error for ${owner}/${repo}:`, err);
		Sentry.captureException(err, {
			tags: { source: "github-scan", repo: `${owner}/${repo}` },
		});

		// Post error Check Run
		try {
			await createCheckRun({
				token,
				owner,
				repo,
				headSha,
				name: "AEOrank Score",
				conclusion: "neutral",
				title: "AEO Scan Failed",
				summary: `Scan of ${url} failed: ${message}`,
			});
		} catch (checkErr) {
			console.error("Failed to post error Check Run:", checkErr);
		}
	}

	return NextResponse.json({ ok: true });
}

// ─── Helpers ───────────────────────────────────────────────────────

async function createInProgressCheckRun(
	token: string,
	owner: string,
	repo: string,
	headSha: string,
): Promise<void> {
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
				name: "AEOrank Score",
				status: "in_progress",
				output: {
					title: "Scanning...",
					summary: "AEOrank is scanning your site for AI visibility.",
				},
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to create in-progress Check Run (${response.status}): ${error}`);
	}
}
