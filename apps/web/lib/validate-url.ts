import { z } from "zod";

/**
 * Hostnames that are always blocked regardless of IP range matching.
 */
const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

/**
 * Private IP ranges to block (SSRF prevention).
 * Covers RFC-1918 private ranges, loopback, link-local (AWS metadata), and IPv6 private/link-local.
 */
const PRIVATE_IP_RANGES = [
	/^10\./,
	/^172\.(1[6-9]|2\d|3[01])\./,
	/^192\.168\./,
	/^169\.254\./, // AWS metadata / link-local
	/^fc00:/i, // IPv6 unique local
	/^fe80:/i, // IPv6 link-local
];

/**
 * Validates a user-submitted URL for safe server-side fetching.
 *
 * Blocks:
 * - Non-HTTP/HTTPS schemes (ftp://, file://, etc.)
 * - Loopback addresses (localhost, 127.0.0.1, ::1)
 * - RFC-1918 private IP ranges (10.x, 172.16-31.x, 192.168.x)
 * - Link-local / AWS metadata endpoint (169.254.x.x)
 * - Malformed URLs
 *
 * @param raw - The raw URL string submitted by the user
 * @returns Normalized URL string on success
 * @throws {Error} with a descriptive message on failure
 */
export function validateScanUrl(raw: string): string {
	const parsed = z.string().url().safeParse(raw);
	if (!parsed.success) {
		throw new Error("Invalid URL format");
	}

	const url = new URL(raw);

	if (!["http:", "https:"].includes(url.protocol)) {
		throw new Error("Only HTTP/HTTPS URLs are allowed");
	}

	const hostname = url.hostname.toLowerCase();

	// Strip IPv6 brackets for range matching
	const hostnameForRangeCheck = hostname.replace(/^\[|\]$/g, "");

	if (BLOCKED_HOSTS.has(hostnameForRangeCheck)) {
		throw new Error("Private/loopback hosts are not allowed");
	}

	for (const range of PRIVATE_IP_RANGES) {
		if (range.test(hostnameForRangeCheck)) {
			throw new Error("Private IP ranges are not allowed");
		}
	}

	return url.toString();
}
