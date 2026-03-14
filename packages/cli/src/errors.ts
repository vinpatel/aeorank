/** Custom error class with actionable suggestion */
export class AeorankError extends Error {
	suggestion: string;

	constructor(message: string, suggestion: string) {
		super(message);
		this.name = "AeorankError";
		this.suggestion = suggestion;
	}
}

/** Map any error to a user-friendly message with actionable suggestion */
export function handleError(error: unknown): { message: string; suggestion: string } {
	if (error instanceof AeorankError) {
		return { message: error.message, suggestion: error.suggestion };
	}

	if (error instanceof TypeError) {
		const msg = error.message;
		// URL validation errors
		if (msg.includes("Invalid URL") || msg.includes("invalid URL")) {
			const urlAttempt = extractUrlAttempt(msg);
			return {
				message: `'${urlAttempt}' is not a valid URL.`,
				suggestion: `Did you mean https://${urlAttempt}?`,
			};
		}
	}

	if (error instanceof Error) {
		const msg = error.message;
		const code = (error as NodeJS.ErrnoException).code;

		// Network errors
		if (
			code === "ECONNREFUSED" ||
			code === "ENOTFOUND" ||
			msg.includes("fetch failed") ||
			msg.includes("ECONNREFUSED") ||
			msg.includes("ENOTFOUND") ||
			msg.includes("network") ||
			msg.includes("Could not reach")
		) {
			return {
				message: `Could not reach the URL.`,
				suggestion: "Check the URL and your internet connection.",
			};
		}

		// Timeout errors
		if (
			code === "ETIMEDOUT" ||
			msg.includes("timeout") ||
			msg.includes("timed out") ||
			msg.includes("ETIMEDOUT") ||
			msg.includes("AbortError")
		) {
			return {
				message: "Scan timed out.",
				suggestion: "Try --max-pages 20 to scan fewer pages.",
			};
		}

		// Permission errors
		if (code === "EACCES" || code === "EPERM" || msg.includes("permission denied")) {
			return {
				message: `Permission denied.`,
				suggestion: "Check directory permissions or use --output <dir>.",
			};
		}

		// Config file errors
		if (msg.includes("config") || msg.includes("Config")) {
			return {
				message: msg,
				suggestion: "Check the config file for syntax errors.",
			};
		}

		// File exists errors
		if (code === "EEXIST" || msg.includes("already exist")) {
			return {
				message: msg,
				suggestion: "Use --overwrite to replace existing files.",
			};
		}

		return {
			message: msg,
			suggestion: "An unexpected error occurred. Run with --verbose for details.",
		};
	}

	return {
		message: String(error),
		suggestion: "An unexpected error occurred. Run with --verbose for details.",
	};
}

function extractUrlAttempt(message: string): string {
	// Try to extract the URL from error messages like "Invalid URL: example.com"
	const match = message.match(/Invalid URL[:\s]*['"]?([^'")\s]+)/i);
	return match ? match[1] : "unknown";
}
