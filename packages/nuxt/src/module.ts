import { defineNuxtModule, addServerHandler, createResolver } from "@nuxt/kit";
import type { AeorankNuxtConfig } from "./types.js";
import { generateAllFiles } from "./generate.js";

export default defineNuxtModule<AeorankNuxtConfig>({
	meta: {
		name: "@aeorank/nuxt",
		configKey: "aeorank",
	},
	defaults: {
		siteName: "",
		siteUrl: "",
		description: "",
	},
	setup(options, nuxt) {
		if (!options.siteName || !options.siteUrl) {
			console.warn("[aeorank] siteName and siteUrl are required in aeorank config.");
			return;
		}

		const files = generateAllFiles(options);

		// Register Nitro server routes for each AEO file
		for (const file of files) {
			const nitroOpts = (nuxt.options as Record<string, any>).nitro ??= {};
			const routeRules = nitroOpts.routeRules ??= {};

			routeRules[file.path] = {
				headers: {
					"Content-Type": file.contentType,
					"Cache-Control": "public, max-age=3600, s-maxage=86400",
					"X-AEOrank": "1",
				},
			};
		}

		// Use Nitro hooks to add virtual handlers
		nuxt.hook("nitro:config" as any, (nitroConfig: any) => {
			nitroConfig.virtual = nitroConfig.virtual || {};

			for (const file of files) {
				const handlerName = `aeorank${file.path.replace(/[^a-zA-Z0-9]/g, "_")}`;
				const virtualId = `#aeorank/${handlerName}`;

				nitroConfig.virtual[virtualId] = `
import { defineEventHandler, setResponseHeader } from "h3";

export default defineEventHandler((event) => {
	setResponseHeader(event, "Content-Type", ${JSON.stringify(file.contentType)});
	setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");
	setResponseHeader(event, "X-AEOrank", "1");
	return ${JSON.stringify(file.content)};
});
`;

				nitroConfig.handlers = nitroConfig.handlers || [];
				nitroConfig.handlers.push({
					route: file.path,
					handler: virtualId,
					method: "get",
				});
			}
		});

		console.log(`[aeorank] Registered ${files.length} AEO file routes for ${options.siteName}`);
	},
});
