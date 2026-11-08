# Product Truths — v2-redesign

Ground-truth reference for marketing copy. Canonical product in this repo is **`npx aeorank-cli@0.1.2`**. npm still serves `0.1.1` until `@aeorank/core@0.1.2` and `aeorank-cli@0.1.2` are published, in that order. Every numeric claim in `apps/marketing` must either be on the Verified list below, or fetched live at runtime. Do not promise citations.

**This CLI:** **36 dimensions**, **8 files**. Weights are `weightPct` and sum to 100.

## Verified — safe to state in copy

| Claim | Value | Source of truth |
|---|---|---|
| Scoring dimensions | **36** | `calculateAeoScore()` / `DIMENSION_DEFS` / `DIMENSION_SCORERS`. JSON `dimensions.length` and `dimensionCount`. |
| Dimension weights | **`weightPct` summing to 100** | `packages/core/src/constants.ts`. Five pillars: Answer Readiness 26, Content Structure 25, Trust & Authority 12, Technical Foundation 25, AI Discovery 12. |
| Generated files | **8** | `GENERATED_FILE_NAMES`: llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml. |
| `ai.txt` | **scored, not generated** | Fetched by the scanner. Scored inside `content-licensing`. Not in `generateFiles()`. |
| Crawler status | **`allow` \| `block` \| `unknown`** | `CrawlerPublicStatus` on `crawlerAccess`. Internal `meta.robotsTxt.crawlerAccess` is `allowed` \| `disallowed` \| `unknown`. The Action maps the internal words onto the public ones. |
| `--fail-on-crawler-block` | **CLI flag and Action input** | CLI exits 2. Action reads `crawlerGate` and does not pass the flag. |
| Framework plugins | **11** | `packages/` dirs minus `cli` / `config` / `core`: 11ty, astro, docusaurus, gatsby, next, nuxt, remix, shopify, sveltekit, vitepress, wordpress |
| CLI version | **0.1.2** | `packages/cli/package.json`. `-V` reads that file. Core is `0.1.2`. |
| License | **MIT** | repo root LICENSE + `vinpatel/aeorank` GitHub metadata |
| Primary language | **TypeScript** | directory scan |
| Scan time | **< 30s** typical | unit scan benchmarks; expressed as "~30s" or "<30s", never a point estimate |
| Typical scan runtime in fixtures | **0.9s** | used as illustrative in the LiveScan mockup only; never as an external benchmark claim |
| Default crawl cap | **200** | `DEFAULT_CONFIG.maxPages`. `aeorank-cli init` writes `maxPages: 50`. |

## Live — fetched at runtime, never hardcoded

| Element | Endpoint | Display |
|---|---|---|
| GitHub stars | `GET /repos/vinpatel/aeorank` → `stargazers_count` | `[data-gh-stars]` slots, nav + hero + footer + OSS |
| Forks | same → `forks_count` | OSS metrics panel |
| Open issues | same → `open_issues_count` | OSS metrics panel |
| Watchers | same → `watchers_count` | OSS metrics panel |
| License ID | same → `license.spdx_id` | OSS metrics panel |
| Last push | same → `pushed_at` | `last push · Nd ago` line |
| Recent commits | `GET /repos/:repo/commits?per_page=4` | OSS "recent commits" list |
| Contributors | `GET /repos/:repo/contributors?per_page=24` | OSS contributor grid (real avatars) |

**Rule:** if the fetch fails, the slot stays empty (`—`). No fallback number. No "loaded with a placeholder that looks plausible." Empty is honest.

## Unverifiable — DO NOT claim in copy

These were caught by the fake-numbers audit and must not return without a ground-truth source:

- A specific release version other than `0.1.2` for the current CLI. Historical snapshots may still say they were scored with `0.1.1`.
- A specific stargazer count hardcoded anywhere.
- A weekly star growth rate (`+N/wk`).
- A contributor count as a specific integer.
- A release count, total commits count, open/closed issue trend.
- Named customer logos ("Trusted by X, Y, Z").
- Weekly / monthly active user counts for the hosted app.
- "Made in SF" or any specific origin claim.
- Any "first/only/leader" framing.
- Any testimonial or quote attribution.
- `ai.txt` generated (it is scored, not written).
- Citation timelines / “get you cited” outcome claims.

## Product-truth asks — claims we'd like but can't yet make

Ordered by potential marketing lift. Each becomes a product / tooling task before the claim can ship.

1. **"First/only open-source AEO toolkit."** Likely true but unverifiable exhaustively; softened to "unusual in the category." To claim hard: survey + dated blog post establishing the claim, with explicit competitor list.
2. **npm download counts for `aeorank-cli`.** Strong CLI-adoption signal but currently unshipped in copy. To claim: expose weekly npm download count via a small endpoint or a shields.io badge, wire into OSS metrics panel.
3. **"288 tests passing on `main`."** True at the time of the scan, but could regress silently. To claim: add a CI badge (shields.io/github/workflow-status) pointing at the test workflow, link next to the 288 number.
4. **"Deployed in production by N teams."** No proof. To claim: one named early-adopter with permission, or an opt-in `aeorank-cli scan --anonymous-telemetry` counter.
5. **"2–4 weeks to citation lift"** in the FAQ. Plausible but not measured. To soften or verify with a before/after case study on a real site.
6. ~~**"8 vs 9 files" build-log discrepancy.**~~ Resolved: public claims match the 8-file `generateFiles()` list. `ai.txt` is scored by `content-licensing` and is not generated.
7. ~~**"36 dimensions."**~~ The CLI on this branch scores 36. npm still has `0.1.1` until the publish plan runs.

## Illustrative (not a claim)

Some elements are explicitly framed as mockups of product output. These are allowed to carry placeholder numbers *because the framing is illustrative*, not claimed:

- Hero dual-view "inspector" panel — the 31/100 score is an illustrative audit of a generic "your-site.com". The caption says 36 dimensions (`aeorank-cli@0.1.2`). Do not restore a 9-file or `ai.txt` file count.
- Footer receipt card — #0000047, 0.93s runtime, 31/100 score — styled as a receipt mockup.
- LiveScan marquee lines (`title 64 chars · well-formed`, etc.) — plausible per-criterion output, shown as an example stream.

These stay illustrative as long as the surrounding copy makes clear they're a demo, not a live scan of the visitor's site.
