import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import aeorank from "@aeorank/astro";

export default defineConfig({
	site: "https://aeorank.dev",
	integrations: [
		preact(),
		sitemap(),
		aeorank({
			siteName: "AEOrank",
			siteUrl: "https://aeorank.dev",
			description: "Open-source AI visibility scoring tool. Scores your site 0-100 across 36 criteria, then generates the 9 files that get you cited by ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews. Free, MIT licensed, developer-native.",
			organization: {
				name: "AEOrank",
				url: "https://aeorank.dev",
			},
			faq: [
				{
					question: "What is AEO?",
					answer: "Answer Engine Optimization. It's how you make your site visible to ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews. AI search engines now drive 40% of web discovery and convert visitors at 15.9% — higher than Google organic."
				},
				{
					question: "How is AEOrank different from SEO tools?",
					answer: "SEO tools check Google rankings. AEOrank checks what AI engines look for: llms.txt, ai.txt, schema markup, AI crawler access, content structure for extraction, and 30 more criteria. Then it generates the 9 files AI engines need — no other tool does that."
				},
				{
					question: "Is AEOrank free?",
					answer: "Yes. The CLI, core engine, GitHub App, GitHub Action, and all 13 framework plugins are MIT licensed and free forever. The GitHub App gives you 10 free scans per day."
				},
				{
					question: "What AI engines does AEOrank optimize for?",
					answer: "AEOrank optimizes for ChatGPT (GPTBot), Claude (ClaudeBot), Perplexity (PerplexityBot), Gemini (Google-Extended), and Google AI Overviews. All 36 criteria are tuned for what these engines evaluate when deciding what to cite."
				},
				{
					question: "How long does an AEOrank scan take?",
					answer: "Under 30 seconds for a typical site. AEOrank crawls up to 50 pages, analyzes structure across all 36 criteria, and generates your score and files. Fully deterministic — no LLM calls, same score every time."
				},
				{
					question: "What files does AEOrank generate?",
					answer: "AEOrank generates 9 files: llms.txt, llms-full.txt, ai.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, and sitemap-ai.xml. Each file serves a specific purpose for AI engine discovery and citation."
				},
				{
					question: "Can I use AEOrank in CI/CD?",
					answer: "Yes. Install the GitHub App for zero-config PR checks, or use the GitHub Action with fail-below thresholds. Both post Check Runs and score breakdowns directly on your PRs."
				},
				{
					question: "What frameworks does AEOrank support?",
					answer: "AEOrank has plugins for 13 frameworks: Next.js, Astro, Nuxt, Remix, SvelteKit, Gatsby, Shopify Hydrogen, 11ty, VitePress, Docusaurus, and WordPress. Three lines of config, 9 files generated."
				}
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
