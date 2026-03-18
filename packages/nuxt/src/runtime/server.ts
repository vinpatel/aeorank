import { defineEventHandler, setResponseHeader } from "h3";
import type { AeoFile } from "../generate.js";

/**
 * Creates a Nitro event handler that serves a single AEO file.
 */
export function createAeoFileHandler(file: AeoFile) {
	return defineEventHandler((event) => {
		setResponseHeader(event, "Content-Type", file.contentType);
		setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");
		setResponseHeader(event, "X-AEOrank", "1");
		return file.content;
	});
}
