import ora from "ora";
import type { Ora } from "ora";

interface Spinner {
	start(text?: string): Spinner;
	stop(): Spinner;
	succeed(text?: string): Spinner;
	fail(text?: string): Spinner;
	text: string;
}

/** No-op spinner for JSON mode — keeps stdout clean */
const noopSpinner: Spinner = {
	start() {
		return this;
	},
	stop() {
		return this;
	},
	succeed() {
		return this;
	},
	fail() {
		return this;
	},
	text: "",
};

/** Create a terminal spinner. Returns no-op in JSON mode to keep stdout clean. */
export function createSpinner(text: string, jsonMode = false): Spinner {
	if (jsonMode) {
		return noopSpinner;
	}

	const spinner = ora({ text, stream: process.stderr }) as unknown as Spinner;
	return spinner;
}
