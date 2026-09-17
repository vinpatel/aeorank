# Messaging audit — CoS / Vin

Audit of **aeorank.dev**, **app.aeorank.dev**, and the repo README against the current honest product: MIT CLI/CI, 36 deterministic checks, **8 generated files**, crawler access + extractability. Competitors (Profound, Peec, Otterly, Scrunch, Athena) are closed monitoring SaaS. We do not invent features or citation outcomes.

**Source of truth:** `npx aeorank-cli@latest` (npm **0.1.1**) writes exactly these 8 files:

`llms.txt` · `schema.json` · `llms-full.txt` · `CLAUDE.md` · `robots-patch.txt` · `faq-blocks.html` · `citation-anchors.html` · `sitemap-ai.xml`

Not generated: `ai.txt`, `answers.json`, `report.html`, or a 9th file. `ai.txt` may still be *scored* if present. GitHub tag `v1.0.0` is not on npm — do not imply that version.

Mindtrades Audit offer stays compatible: **crawler-gate first → aeorank-cli → human-reviewed fixes.**

---

## Keep

| Line / idea | Where | Why |
|---|---|---|
| **Others monitor. We fix.** | Hero, Files, FAQ | True category split. They track mentions; we score readability and write fix files. |
| **36 deterministic checks / 5 pillars** | Hero, Anatomy, README, app | Matches `@aeorank/core` `DIMENSION_DEFS`. |
| **8 files the published CLI actually writes** | Hero, Files, README, docs | Matches `GENERATED_FILE_NAMES`. |
| **Crawler allowlists + CI** (`--fail-on-crawler-block`) | Hero, Install, FAQ, README | Evidenced lever. Fail the PR if GPTBot (or peer) is blocked. Missing robots = unknown, not blocked. |
| **`llms.txt` is agent-docs hygiene, not a citation guarantee** | FAQ, README, docs | Correct. Do not upgrade this to a ranking promise. |
| **MIT / self-host / CLI needs no account** | OSS, pricing, README | True. Hosted app is convenience. |
| **Pro $29 / Agency $99 / Free 1 site · 3 scans** | Pricing, upgrade | Matches Stripe plan config. |
| **CLI 0.1.1** | Hero LiveScan chrome, README | Published npm version. |
| **11 framework plugins** | Hero stats (was already 11) | Real packages: next, astro, nuxt, remix, sveltekit, gatsby, shopify, 11ty, vitepress, docusaurus, wordpress. |
| Dual-view inspector (human vs crawler extract) | Hero | Honest visual of extractability, not of “getting cited.” |

---

## Cut

| Line | Where | Why |
|---|---|---|
| **9 files / 9 generated / fix all 9** | Footer, LiveScan CTA, dashboard meta | CLI writes **8**. “9 failing checks” in a mock scan is OK if it clearly means checks, not files. |
| **`ai.txt` as a generated file** | Hero AI pane, LiveScan marquee, Anatomy AI Discovery, docs sidebar under “Generated Files” | Generator exists; **default `generateFiles()` does not include it.** |
| **`answers.json` / `report.html` as CLI output** | leftover claims | Never in the published CLI set. |
| **“Get you cited” / “highly cited” / “sometimes cited” / “need to be cited by ChatGPT”** | Anatomy grade labels, footer, scoreboard OG | No citation tracker. Prefer crawler access + extractability. |
| **7–14× cheaper than Profound, Scrunch, and Peec** | Pricing Pro note | Stale. Profound Starter is ~$99; Otterly Lite and Athena have cheaper/free on-ramps. |
| **$299/mo dashboard** | Pricing intro, Footer, README share line | No competitor is priced at $299. Use the category range **$89–$499/mo**. |
| **Per-competitor prices $399 / $250 / $189 / $129** | Pricing strip | Unsourced or stale. Do not invent a price for undisclosed vendors. Semrush is the wrong peer. |
| **Agency REST API, bulk endpoints, webhooks, priority support** | Pricing, `/upgrade` | No public REST API, customer webhooks, or support SLA shipped. |
| **PDF export as a Pro exclusive** | Pricing | App has a printable HTML report for signed-in users, not a PDF generator and not plan-gated. |
| **ZIP / score history / auto-rescan as Pro-only** | Pricing vs app | Download ZIP, 30-day charts, and auto-rescan are not plan-gated in code. Real gates: **sites + scans/mo**. |
| **“no signup” next to the signup CTA** | Hero | CLI has no signup. App signup **works** (DB connected). Don’t contradict the button. |
| **Fake plugin list** (hugo, rails, django, hono, fastify) | Install strip | Those packages do not exist. |
| **README “13 plugins”** | README table + `pnpm test` comment | 11 plugin packages, not 13. |
| **Tweet intent: “generate the 9 files ChatGPT actually reads”** | README share | False file count + citation promise. |
| **Homepage leaderboard scores that contradict `/scoreboard`** | Leaderboard vs Scoreboard | Anthropic 87 vs 31, etc. Use the scoreboard snapshot or don’t claim live weekly ranks. |
| **“updated hourly” / “every week” scoreboard** | Leaderboard, Scoreboard | Static snapshot in repo. Don’t claim a live cadence we don’t run. |
| **Signup: “Monitor and improve your AI visibility score”** | Auth shell, app metadata | Sounds like mention-monitoring. We score + generate files. |

---

## Rewrite

| Before | After | Surfaces |
|---|---|---|
| “Will this get me ranked in ChatGPT?” implied yes | Crawler access + extractability / technical readiness. No citation guarantee. | FAQ (keep current honest answer), Anatomy grades, footer |
| “Full monitoring + fix generation” (Pro) | More sites and scans. Same 36 checks and 8 files as Free. | Pricing |
| “$29 instead of $299” | Free CLI; Pro $29 vs typical monitoring SaaS **$89–$499/mo**. | Pricing, OSS, README |
| README vs Scrunch / Adobe / Semrush | vs Profound / Peec / Otterly / Scrunch / Athena: closed dashboards vs MIT CLI/CI + 8 files. | README |
| Hero CTA primary = Star; note = no signup | Primary **Get your score** → working `/sign-up`. Note: free account, or CLI with no signup. | Hero, Nav (already signup) |
| Agency as API platform | Agency = 50 sites / 500 scans. Same engine. | Pricing, upgrade |
| Grade bands 90/80/70/60/50 + “cited” labels | Match `GRADE_THRESHOLDS`: A+ 95, A 85, B 70, C 55, D 40. Labels = readiness, not citations. | Anatomy |
| Docs `ai.txt` under Generated Files | Scored if present; **not** in the 8-file CLI set. | Docs sidebar + `ai-txt.md` |
| Dashboard “9 files” | 8 files ZIP after a scan. Empty state: add a public URL → 36 checks + 8 files. | Dashboard, download button |

---

## Positioning (one paragraph)

Profound, Peec, Otterly, Scrunch, and Athena sell **closed monitoring dashboards** (prompt tracking, brand mentions) typically **$89–$499/mo**. AEOrank is **MIT, CLI/CI-first**: 36 deterministic checks, a crawler gate you can fail a PR on, and **8 generated fix files**. Pro is cheaper convenience (more sites/scans), not a different scorer. We do not promise citations. Agencies (Mindtrades audits included) still run **crawler-gate → CLI → human-reviewed fixes**.
