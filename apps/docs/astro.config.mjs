import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
	site: "https://docs.aeorank.dev",
	integrations: [
		starlight({
			title: "AEOrank",
			description:
				"Documentation for AEOrank — MIT CLI that scores 12 dimensions and writes 8 files (aeorank-cli@0.1.1).",
			favicon: "/favicon.svg",
			logo: {
				light: "./src/assets/logo-light.svg",
				dark: "./src/assets/logo-dark.svg",
				replacesTitle: false,
			},
			head: [
				{
					tag: "link",
					attrs: {
						rel: "apple-touch-icon",
						sizes: "180x180",
						href: "/apple-touch-icon.png",
					},
				},
				{
					tag: "link",
					attrs: {
						rel: "icon",
						type: "image/png",
						sizes: "32x32",
						href: "/favicon-32.png",
					},
				},
			],
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
					label: "GitHub Integration",
					items: [
						{ label: "GitHub App", slug: "github-app" },
						{ label: "GitHub Action", slug: "github-action" },
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
					label: "Generated Files (8)",
					items: [
						{ label: "llms.txt", slug: "files/llms-txt" },
						{ label: "schema.json", slug: "files/schema-json" },
						{ label: "llms-full.txt", slug: "files/llms-full-txt" },
						{ label: "CLAUDE.md", slug: "files/claude-md" },
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
					label: "Not in 0.1.1",
					items: [
						{ label: "ai.txt (not generated, not scored)", slug: "files/ai-txt" },
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
						{ label: "12 dimensions (CLI 0.1.1)", slug: "scoring/dimensions" },
						{ label: "How Scores Work", slug: "scoring/calculation" },
						{ label: "Grades", slug: "scoring/grades" },
						{ label: "Catalog (unshipped)", slug: "scoring/dimensions-catalog" },
					],
				},
			],
		}),
	],
});
