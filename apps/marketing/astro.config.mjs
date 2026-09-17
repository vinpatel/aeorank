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
			description:
				"MIT CLI for crawler access and extractability. aeorank-cli@0.1.1 scores 12 dimensions and writes 8 files. No citation promises. Pro $29 vs closed monitoring SaaS.",
			organization: {
				name: "AEOrank",
				url: "https://aeorank.dev",
			},
			faq: [
				{
					question: "Can I use AEOrank to report AI visibility to clients?",
					answer:
						"You can scan public URLs and share the 0–100 technical-readiness score plus the 8 fix files. That is crawler access and extractability, not a report of who was cited in ChatGPT.",
				},
				{
					question: "My customers use ChatGPT and Perplexity. Why isn't my brand showing up?",
					answer:
						"If GPTBot or peers are blocked, or the HTML is hard to extract, crawlers have little to work with. AEOrank scores 12 dimensions and writes 8 files (llms.txt, schema.json, and six more). It does not generate or score ai.txt, and it does not promise citations.",
				},
				{
					question: "What is AEO and why should I care?",
					answer:
						"AI Engine Optimization here means crawler access plus extractability. Competitors sell mention monitoring. We score upstream readability and generate fix files. No citation guarantee.",
				},
				{
					question: "How is AEOrank different from SEO tools like Ahrefs or Semrush?",
					answer:
						"SEO tools check Google rankings. aeorank-cli@0.1.1 scores 12 dimensions (llms.txt, schema, crawler access, structure, and more) and writes 8 files you can deploy.",
				},
				{
					question: "How is AEOrank different from Profound, Otterly, or Scrunch?",
					answer:
						"They monitor brand mentions in model answers. AEOrank is MIT, CLI/CI-first: 12 dimensions, 8 fix files, Pro $29 vs typical monitoring SaaS at $89–$499/mo. Complements, not clones. We do not promise citations.",
				},
				{
					question: "Is it really free? What's the catch?",
					answer:
						"The CLI and 11 framework plugins are MIT. Hosted Free is 1 site and 3 scans/month. Pro is $29 for 5 sites and 50 scans. Agency is $99 for 50 sites and 500 scans. Same 12-dimension CLI and 8 files. No public REST API. No PDF generator as a plan feature.",
				},
				{
					question: "What AI engines does AEOrank optimize for?",
					answer:
						"We check crawler access for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended, plus extractability signals. That is technical readiness, not a claim about who will be cited.",
				},
				{
					question: "How long does a scan take?",
					answer:
						"Often under 30 seconds. Default crawl cap is 50 pages. Deterministic — no LLM calls.",
				},
				{
					question: "Does llms.txt actually work?",
					answer:
						"llms.txt is agent-docs hygiene, not a citation guarantee. AEOrank still writes it as one of 8 files and scores its presence as one of 12 dimensions.",
				},
				{
					question: "Can I use AEOrank in CI/CD?",
					answer:
						"The GitHub Action can fail the PR if GPTBot is blocked (fail-on-crawler-block). That flag is not on aeorank-cli@0.1.1. App fail-below is coming soon — Action-only today.",
				},
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
