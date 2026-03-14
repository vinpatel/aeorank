import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
	site: "https://docs.aeorank.dev",
	integrations: [
		starlight({
			title: "AEOrank",
			description:
				"Documentation for AEOrank — the open-source AEO scoring and file generation tool.",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/aeorank/aeorank",
				},
			],
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "Quick Start", slug: "getting-started" },
						{ label: "What is AEO?", slug: "what-is-aeo" },
					],
				},
				{
					label: "CLI Reference",
					items: [
						{ label: "scan", slug: "cli/scan" },
						{ label: "init", slug: "cli/init" },
						{ label: "Configuration", slug: "cli/configuration" },
					],
				},
				{
					label: "Generated Files",
					items: [
						{ label: "llms.txt", slug: "files/llms-txt" },
						{ label: "llms-full.txt", slug: "files/llms-full-txt" },
						{ label: "CLAUDE.md", slug: "files/claude-md" },
						{ label: "schema.json", slug: "files/schema-json" },
						{ label: "robots-patch.txt", slug: "files/robots-patch-txt" },
						{ label: "faq-blocks.html", slug: "files/faq-blocks-html" },
						{
							label: "citation-anchors.html",
							slug: "files/citation-anchors-html",
						},
						{ label: "sitemap-ai.xml", slug: "files/sitemap-ai-xml" },
					],
				},
				{
					label: "Scoring",
					items: [
						{ label: "12 Dimensions", slug: "scoring/dimensions" },
						{ label: "How Scores Work", slug: "scoring/calculation" },
						{ label: "Grades", slug: "scoring/grades" },
					],
				},
			],
		}),
	],
});
