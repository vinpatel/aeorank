import { Client } from "@upstash/qstash";

/**
 * QStash client factory — creates a new client on each call.
 * This is intentionally NOT a singleton at module load time,
 * because Next.js tries to evaluate route modules during build
 * and QSTASH_TOKEN is not available at build time.
 */
export function getQStashClient(): Client {
	return new Client({
		token: process.env.QSTASH_TOKEN!,
		baseUrl: process.env.QSTASH_URL || "https://qstash.upstash.io",
	});
}
