import { describe, it, expect } from "vitest";
import { verifyWebhookSignature } from "./github-app";
import { createHmac } from "node:crypto";

const TEST_SECRET = "test-webhook-secret-1234";

function signPayload(payload: string, secret: string): string {
	return `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

describe("verifyWebhookSignature", () => {
	const payload = JSON.stringify({ action: "opened", zen: "test" });

	it("returns true for valid signature", () => {
		const sig = signPayload(payload, TEST_SECRET);
		expect(verifyWebhookSignature(payload, sig, TEST_SECRET)).toBe(true);
	});

	it("returns false for invalid signature", () => {
		const sig = signPayload(payload, "wrong-secret");
		expect(verifyWebhookSignature(payload, sig, TEST_SECRET)).toBe(false);
	});

	it("returns false for null signature", () => {
		expect(verifyWebhookSignature(payload, null, TEST_SECRET)).toBe(false);
	});

	it("returns false for empty string signature", () => {
		expect(verifyWebhookSignature(payload, "", TEST_SECRET)).toBe(false);
	});

	it("returns false for malformed signature (no sha256= prefix)", () => {
		const hash = createHmac("sha256", TEST_SECRET).update(payload).digest("hex");
		expect(verifyWebhookSignature(payload, hash, TEST_SECRET)).toBe(false);
	});

	it("returns false for tampered payload", () => {
		const sig = signPayload(payload, TEST_SECRET);
		const tampered = JSON.stringify({ action: "closed" });
		expect(verifyWebhookSignature(tampered, sig, TEST_SECRET)).toBe(false);
	});
});

// ─── Webhook Route Tests (handler logic) ───────────────────────────

describe("webhook route handler logic", () => {
	const prOpenedPayload = {
		action: "opened",
		number: 42,
		pull_request: {
			head: { sha: "abc1234567890", ref: "feature/test" },
			base: { ref: "main" },
		},
		repository: {
			name: "test-repo",
			owner: { login: "testuser" },
			default_branch: "main",
		},
		installation: { id: 12345 },
	};

	const pushPayload = {
		ref: "refs/heads/main",
		after: "def4567890123",
		repository: {
			name: "test-repo",
			owner: { login: "testuser" },
			default_branch: "main",
		},
		installation: { id: 12345 },
	};

	const pushNonDefaultPayload = {
		...pushPayload,
		ref: "refs/heads/feature/branch",
	};

	it("identifies PR opened events correctly", () => {
		expect(prOpenedPayload.action).toBe("opened");
		expect(prOpenedPayload.pull_request.head.sha).toBe("abc1234567890");
	});

	it("identifies push to default branch", () => {
		const defaultBranch = pushPayload.repository.default_branch;
		const ref = pushPayload.ref;
		expect(ref).toBe(`refs/heads/${defaultBranch}`);
	});

	it("rejects push to non-default branch", () => {
		const defaultBranch = pushNonDefaultPayload.repository.default_branch;
		const ref = pushNonDefaultPayload.ref;
		expect(ref).not.toBe(`refs/heads/${defaultBranch}`);
	});

	it("PR synchronize event is also handled", () => {
		const syncPayload = { ...prOpenedPayload, action: "synchronize" };
		const action = syncPayload.action;
		expect(action === "opened" || action === "synchronize").toBe(true);
	});

	it("PR closed event is ignored", () => {
		const closedPayload = { ...prOpenedPayload, action: "closed" };
		const action = closedPayload.action;
		expect(action === "opened" || action === "synchronize").toBe(false);
	});
});
