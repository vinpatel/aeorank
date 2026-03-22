import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
	site: "https://docs.aeorank.dev",
	integrations: [
		starlight({
			title: "AEOrank",
			description:
				"Documentation for AEOrank — the open-source AEO scoring and file generation tool.",
			logo: {
				light: "./src/assets/logo-light.svg",
				dark: "./src/assets/logo-dark.svg",
				replacesTitle: false,
			},
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/vinpatel/aeorank",
				},
				{
					icon: "external",
					label: "aeorank.dev",
					href: "https://aeorank.dev",
				},
			],
			editLink: {
				baseUrl: "https://github.com/vinpatel/aeorank/edit/main/apps/docs/",
			},
			lastUpdated: true,
			customCss: ["./src/styles/custom.css"],
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
						{ label: "compare", slug: "cli/compare" },
						{ label: "init", slug: "cli/init" },
						{ label: "Configuration", slug: "cli/configuration" },
					],
				},
				{
					label: "Dashboard",
					items: [
						{ label: "Per-Page Scoring", slug: "dashboard/per-page-scoring" },
						{ label: "Auto-Rescan", slug: "dashboard/auto-rescan" },
						{ label: "Scan Comparison", slug: "dashboard/comparison" },
						{ label: "Export & Reports", slug: "dashboard/export" },
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
					label: "Framework Guides",
					items: [
						{ label: "Next.js", slug: "frameworks/next" },
						{ label: "Astro", slug: "frameworks/astro" },
						{ label: "Nuxt", slug: "frameworks/nuxt" },
						{ label: "Remix", slug: "frameworks/remix" },
						{ label: "SvelteKit", slug: "frameworks/sveltekit" },
						{ label: "Gatsby", slug: "frameworks/gatsby" },
						{ label: "Shopify Hydrogen", slug: "frameworks/shopify" },
						{ label: "11ty", slug: "frameworks/11ty" },
						{ label: "VitePress", slug: "frameworks/vitepress" },
						{ label: "Docusaurus", slug: "frameworks/docusaurus" },
						{ label: "WordPress", slug: "frameworks/wordpress" },
						{ label: "Webflow", slug: "frameworks/webflow" },
						{ label: "Squarespace", slug: "frameworks/squarespace" },
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
