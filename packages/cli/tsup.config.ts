import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "node20",
	outDir: "dist",
	clean: true,
	splitting: false,
	banner: {
		js: "#!/usr/bin/env node",
	},
	// Keep @aeorank/core external — resolved at install time as workspace dep
	external: ["@aeorank/core"],
});
