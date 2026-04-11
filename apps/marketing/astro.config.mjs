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
			description: "AI visibility scoring tool. Scores your site 0-100 across 36 criteria, then generates the 9 files that get you cited by ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews. Open source CLI. Dashboard plans from $29/mo.",
			organization: {
				name: "AEOrank",
				url: "https://aeorank.dev",
			},
			faq: [
				{
					question: "Can I use AEOrank to report AI visibility to clients?",
					answer: "Yes. The dashboard at app.aeorank.dev lets you scan multiple sites, compare scores across your client portfolio, and export reports. You can show clients exactly where they score against industry benchmarks and which competitors are outranking them in AI answers."
				},
				{
					question: "My customers use ChatGPT and Perplexity. Why isn't my brand showing up?",
					answer: "AI engines don't index sites the way Google does. They look for specific signals: structured files like llms.txt and ai.txt, AI-readable content formatting, proper schema markup, and correctly configured crawler access. Most sites fail at multiple points. AEOrank identifies exactly which signals you're missing and generates the files to fix them."
				},
				{
					question: "What is AEO and why should I care?",
					answer: "Answer Engine Optimization. AI search engines like ChatGPT, Perplexity, Claude, and Gemini now drive 40% of web discovery and convert visitors at 15.9% — higher than Google organic. AEO is how you get into those AI-generated answers. If you're not optimized for AI extraction, your competitors are getting cited instead of you."
				},
				{
					question: "How is AEOrank different from SEO tools like Ahrefs or Semrush?",
					answer: "SEO tools check Google rankings. AEOrank checks what AI engines look for: llms.txt, ai.txt, schema markup, AI crawler access, content structure for extraction, and 30 more criteria that SEO tools don't touch. Then it generates the 9 files AI engines need — no other tool does that."
				},
				{
					question: "How is AEOrank different from Profound, Otterly, or Scrunch?",
					answer: "Profound ($99-399/mo, backed by Sequoia) is an excellent monitoring platform — it tracks prompt volume, brand mentions, and generates content briefs. Otterly and Scrunch do similar monitoring. AEOrank does something none of them do: it scores your site's technical AI readiness across 36 criteria and generates the 9 actual files AI engines look for. Profound monitors what AI says about you. AEOrank fixes why AI can't read you. Both are useful — we're just 14x cheaper and open source."
				},
				{
					question: "Is it really free? What's the catch?",
					answer: "The CLI, GitHub App, GitHub Action, and all 13 framework plugins are MIT licensed and always free. The Starter plan gives you 1 site and 3 scans per month at no cost. Pro ($29/mo) adds 5 sites, 50 scans, score history, auto-rescan, and PDF exports. Agency ($99/mo) scales to 50 sites with API access. Every plan includes full 36-criteria scoring and all 9 generated files — we don't gate the features that matter."
				},
				{
					question: "What AI engines does AEOrank optimize for?",
					answer: "All major AI engines: ChatGPT (GPTBot), Claude (ClaudeBot), Perplexity (PerplexityBot), Gemini (Google-Extended), and Google AI Overviews. All 36 criteria are tuned for what these engines actually evaluate when deciding what to cite."
				},
				{
					question: "How long does a scan take?",
					answer: "Under 30 seconds for a typical site. AEOrank crawls up to 50 pages, analyzes structure across all 36 criteria, and generates your score and files. Fully deterministic — no LLM calls, same score every time."
				},
				{
					question: "Does llms.txt actually work?",
					answer: "Research shows llms.txt alone doesn't guarantee AI citations — which is exactly why AEOrank scores 36 criteria, not just one file. Your content structure, schema markup, AI crawler access, answer formatting, and entity disambiguation all matter. AEOrank checks every factor and generates all 9 files, not just llms.txt."
				},
				{
					question: "Can I use AEOrank in CI/CD?",
					answer: "Yes — two ways. Install the GitHub App for zero-config PR checks (one click, no YAML). Or use the GitHub Action (vinpatel/aeorank-action@v1) for full pipeline control with fail-below thresholds. Both post Check Runs and score breakdowns directly on your PRs."
				}
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
