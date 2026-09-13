import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

afterEach(() => {
	// biome-ignore lint/performance/noDelete: must remove the key; assigning undefined stringifies
	delete process.env.STRIPE_WEBHOOK_SECRET;
});

function post(body: string, headers: Record<string, string> = {}): Promise<Response> {
	return POST(
		new NextRequest("http://localhost/api/webhooks/stripe", {
			method: "POST",
			headers,
			body,
		}),
	);
}

describe("POST /api/webhooks/stripe", () => {
	it("fails closed when Stripe-Signature is missing", async () => {
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
		const res = await post("{}");
		expect(res.status).toBe(400);
		const json = (await res.json()) as { error: string };
		expect(json.error).toMatch(/Missing stripe-signature/i);
	});

	it("fails closed when STRIPE_WEBHOOK_SECRET is unset", async () => {
		const res = await post("{}", { "stripe-signature": "t=1,v1=abc" });
		expect(res.status).toBe(400);
		const json = (await res.json()) as { error: string };
		expect(json.error).toMatch(/STRIPE_WEBHOOK_SECRET/);
	});
});
