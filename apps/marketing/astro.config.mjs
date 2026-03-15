import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";

export default defineConfig({
	site: "https://vinpatel.github.io",
	base: "/aeorank",
	integrations: [preact()],
	vite: {
		plugins: [tailwindcss()],
	},
});
