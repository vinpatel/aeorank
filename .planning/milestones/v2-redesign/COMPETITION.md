# Competitor landscape — early April 2026

Research produced by a dedicated competition-research agent on 2026-04-19, used to sharpen V2 marketing messaging.

## The five

| # | Competitor | URL | H1 / core promise | Cheapest paid tier | Positioning verb |
|---|---|---|---|---|---|
| 1 | **Profound** | tryprofound.com | "Marketing agents to win in AI search." | $99 on-ramp → $399–$499/mo + enterprise | *agents* |
| 2 | **Scrunch AI** | scrunch.com | "Monitor and improve your brand's visibility in AI search." | $250/mo Core → $500 Agency → custom | *monitor* |
| 3 | **Otterly.AI** | otterly.ai | "We otter know where your brand shows up on AI Search." | $29 Lite → $189 Standard → $489 Premium | *track* |
| 4 | **Peec AI** | peec.ai | "AI search analytics for marketing teams." | $89 → $199 → $499/mo (add-ons per engine) | *analyze* |
| 5 | **AthenaHQ** | athenahq.ai | "Become the Brand AI Trusts." | $295 self-serve → enterprise (credit-based) | *trust* |

## Common patterns

- **Closed-source SaaS.** None are open source. None expose scoring logic. None publish their criteria.
- **LLM-based evaluation.** All monitor by prompting models (GPT-4, Claude, Perplexity) and aggregating what they say about a brand. Non-reproducible by construction — the same prompt gives different scores on different days.
- **No fix files.** All of them report on visibility. None *generate* the files that AI crawlers actually want. This is the widest moat in the category.
- **No CI integration.** None have a GitHub App or GitHub Action. AEO isn't treated as a testable artifact; it's a marketing dashboard.
- **Unverifiable percentage claims.** "6× Share of Voice lift in 60 days" (AthenaHQ), "25,000+ marketing professionals" (Otterly), "500+ customers" (Scrunch) — the category culture tolerates inflated puffery.
- **Starting prices in the $89–$295/mo range** for a real monitoring plan. Otterly's $29 "Lite" is a token gesture (15 prompts, monitor-only).

## Gaps AEOrank owns

These were pushed into V2 copy in commit `66f33e0`:

1. **Generation.** AEOrank is the only toolkit that hands you the 9 files (llms.txt, ai.txt, schema.json, robots.patch, sitemap.xml, answers.json, citations.json, humans.txt, feed.xml). Others monitor; AEOrank fixes. Landed in: Hero sub, Files intro, Footer capstone, Pricing hook + footer, FAQ competitor answer.
2. **Determinism.** Every check is a pure function of HTML / headers / files — no LLM calls. Same input → same score. This is the bedrock of CI integration; LLM-eval tools fundamentally cannot be used to block a PR. Landed in: LiveScan callout 01 + 02, FAQ "deterministic" answer, Leaderboard intro.
3. **MIT + self-hostable vs closed-SaaS.** AEOrank's core scanner, all 11 framework plugins, GitHub App, GitHub Action, and file generators are MIT-licensed and can be stood up inside your own infra. Profound / Scrunch / Otterly / Peec / AthenaHQ cannot. Landed in: Hero meta pill, OSS manifesto, Pricing section hook, FAQ "Is it really MIT" answer, Footer pills.
4. **Price.** $29/mo Pro vs $89–$500 closed dashboards. This is real arithmetic, not rhetoric. Pricing competitor strip now shows Profound $399, Scrunch $250, Otterly $189 (not their $29 Lite), Semrush $129.
5. **Transparency of scoring.** Every criterion is readable source — `packages/core/src/scorer/dimensions.ts`. A reviewer can fork, audit, and contribute to the scoring logic. No competitor exposes scoring.

## Softer framings we walked away from

- **"Profound raised $58M"** — removed from Pricing footer. Profound is now at ~$155M total funding (Fortune, 2026-02-24). Funding-number warfare is a frame we don't win and numbers stale quickly. Replaced with a position claim about closed SaaS vs MIT.
- **"14× cheaper"** — was correct against Profound's $399 but reads like a sales line. Softened to "roughly 7–14× cheaper than Profound, Scrunch, and Peec" which is arithmetically defensible across the landscape.
- **Hard claims about "only" or "first"** — likely true for open-source-AEO-toolkit but unverifiable. Softened to "unusual in the category."

## Competitive risks to monitor

- **Otterly's $29 Lite tier.** Makes the $29 comparison weaker to a casual reader. Pricing copy still emphasizes what each $29 buys (AEOrank Pro = 5 sites + unlimited CLI + 9 fix files; Otterly Lite = 15 prompts, monitor-only), but this needs to stay sharp as others copy the pattern.
- **Profound's "agents."** They're positioning as agentic AI that drives action, not just monitoring. If they ship auto-generated fixes, our "others monitor, AEOrank fixes" frame weakens. Worth quarterly check on their product page.
- **Peec's rapid iteration.** New entrant, cheaper than Profound at the mid-tier, same closed-SaaS model. Worth swapping Semrush for Peec in the pricing competitor strip once Peec has clearer brand recognition.

## Research method

- Live browser-visible URLs via WebFetch (not archive.org, not cached).
- Homepage + pricing page per competitor.
- Corroborated with Fortune article on Profound's Feb 2026 round and recent category roundups.
- Prices and headlines transcribed verbatim; dates of claims noted inline in the raw agent output.

**Recommend refresh:** every 60 days — this category is moving fast.
