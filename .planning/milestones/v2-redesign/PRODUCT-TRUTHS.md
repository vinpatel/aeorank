# Product Truths — v2-redesign

Ground-truth reference for marketing copy. Canonical product is **`npx aeorank-cli@0.1.1`** (npm). Every numeric claim in `apps/marketing` must either be on the Verified list below, or fetched live at runtime.

**Live product (npm 0.1.1):** **12 dimensions**, **8 files**. Weights are `high` / `medium` / `low`.

The in-repo `@aeorank/core` 36-row registry is **local / unpublished only**. Do not market 36 dimensions, 36 checks, or 36 criteria until a published CLI's `dimensions.length` matches. See `MESSAGING.md`.

## Verified — safe to state in copy

| Claim | Value | Source of truth |
|---|---|---|
| Scoring dimensions | **12** | `aeorank-cli@0.1.1` JSON `dimensions.length`. IDs: `llms-txt`, `schema-markup`, `ai-crawler-access`, `content-structure`, `answer-first`, `faq-speakable`, `eeat-signals`, `meta-descriptions`, `sitemap`, `https-redirects`, `page-freshness`, `citation-anchors`. |
| Dimension weights | **high / medium / low** | Published CLI. Not percentage pillars. |
| Generated files | **8** | CLI `files[].name` / `packages/core/src/constants.ts` `GENERATED_FILE_NAMES` — llms.txt, llms-full.txt, CLAUDE.md, schema.json, robots-patch.txt, faq-blocks.html, citation-anchors.html, sitemap-ai.xml. |
| `ai.txt` | **neither generated nor scored** | Not in 0.1.1 output or dimension list. |
| Framework plugins | **11** | `packages/` dirs minus `cli` / `config` / `core`: 11ty, astro, docusaurus, gatsby, next, nuxt, remix, shopify, sveltekit, vitepress, wordpress |
| Tests | **288** | `pnpm --filter @aeorank/core test` output, 2026-04-19 |
| CLI version | **0.1.1** | npm package `aeorank-cli` (`packages/cli/package.json`). Binary `-V` may still print `0.0.1`; npm version is canonical. |
| License | **MIT** | repo root LICENSE + `vinpatel/aeorank` GitHub metadata |
| Primary language | **TypeScript** | directory scan |
| Scan time | **< 30s** typical | unit scan benchmarks; expressed as "~30s" or "<30s", never a point estimate |
| Typical scan runtime in fixtures | **0.9s** | used as illustrative in the LiveScan mockup only; never as an external benchmark claim |
| Default crawl cap | **50** | `aeorank-cli@0.1.1` `maxPages` |

## Local / unpublished — DO NOT market as live product

These exist in repo source only. They are **not** `aeorank-cli@0.1.1`. Do not use as marketing ground-truth.

| Claim | Value | Status |
|---|---|---|
| Scoring criteria / checks / dimensions | **36** | Local `@aeorank/core` registry (`packages/core/src/scorer/dimensions.ts` — 36 `export function score*` entries). Future / unpublished until a shipped CLI emits that `dimensionCount` / `dimensions.length`. Archived at docs `scoring/dimensions-catalog`. |
| Scoring pillars | **5** (percentage weights summing to 100%) | Grouping for the unpublished 36-row catalog only (`DESIGN-DIRECTION.md`). Published CLI does not use these pillar weights. |

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

- **36 dimensions / checks / criteria** as current product (local registry only).
- A specific release version other than `0.1.1`.
- A specific stargazer count hardcoded anywhere.
- A weekly star growth rate (`+N/wk`).
- A contributor count as a specific integer.
- A release count, total commits count, open/closed issue trend.
- Named customer logos ("Trusted by X, Y, Z").
- Weekly / monthly active user counts for the hosted app.
- "Made in SF" or any specific origin claim.
- Any "first/only/leader" framing.
- Any testimonial or quote attribution.
- `ai.txt` generated or scored.
- Citation timelines / “get you cited” outcome claims.

## Product-truth asks — claims we'd like but can't yet make

Ordered by potential marketing lift. Each becomes a product / tooling task before the claim can ship.

1. **"First/only open-source AEO toolkit."** Likely true but unverifiable exhaustively; softened to "unusual in the category." To claim hard: survey + dated blog post establishing the claim, with explicit competitor list.
2. **npm download counts for `aeorank-cli`.** Strong CLI-adoption signal but currently unshipped in copy. To claim: expose weekly npm download count via a small endpoint or a shields.io badge, wire into OSS metrics panel.
3. **"288 tests passing on `main`."** True at the time of the scan, but could regress silently. To claim: add a CI badge (shields.io/github/workflow-status) pointing at the test workflow, link next to the 288 number.
4. **"Deployed in production by N teams."** No proof. To claim: one named early-adopter with permission, or an opt-in `aeorank-cli scan --anonymous-telemetry` counter.
5. **"2–4 weeks to citation lift"** in the FAQ. Plausible but not measured. To soften or verify with a before/after case study on a real site.
6. ~~**"8 vs 9 files" build-log discrepancy.**~~ Resolved: public claims match the 8-file `generateFiles()` list. `ai.txt` is **neither generated nor scored** on `aeorank-cli@0.1.1`.
7. **"36 dimensions."** Local registry only. To claim: ship a CLI whose published JSON `dimensions.length` is 36, then un-archive the catalog.

## Illustrative (not a claim)

Some elements are explicitly framed as mockups of product output. These are allowed to carry placeholder numbers *because the framing is illustrative*, not claimed:

- Hero dual-view "inspector" panel — the 31/100 score and 12-dimension demo is an illustrative audit of a generic "your-site.com" (`aeorank-cli@0.1.1` shape). Do not restore a 36-check / 9-file breakdown.
- Footer receipt card — #0000047, 0.93s runtime, 31/100 score — styled as a receipt mockup.
- LiveScan marquee lines (`title 64 chars · well-formed`, etc.) — plausible per-criterion output, shown as an example stream.

These stay illustrative as long as the surrounding copy makes clear they're a demo, not a live scan of the visitor's site.
