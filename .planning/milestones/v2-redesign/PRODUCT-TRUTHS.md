# Product Truths — v2-redesign

Ground-truth reference for marketing copy. Every numeric claim in `apps/marketing` must either be on the Verified list below, or fetched live at runtime.

## Verified — safe to state in copy

| Claim | Value | Source of truth |
|---|---|---|
| Scoring criteria | **36** | `packages/core/src/scorer/dimensions.ts` — 36 `export function score*` entries |
| Scoring pillars | **5** | Answer readiness, Content structure, AI discovery, Trust & authority, Technical foundation (`DESIGN-DIRECTION.md` and dimensions.ts grouping) |
| Generated files | **9** | `packages/core/src/generators/` — 9 generator modules (ai-txt, citation-anchors, claude-md, faq-blocks, llms-full, llms-txt, robots-patch, schema-json, sitemap-ai) |
| Framework plugins | **11** | `packages/` dirs minus `cli` / `config` / `core`: 11ty, astro, docusaurus, gatsby, next, nuxt, remix, shopify, sveltekit, vitepress, wordpress |
| Tests | **288** | `pnpm --filter @aeorank/core test` output, 2026-04-19 |
| CLI version | **0.1.1** | `packages/cli/package.json` |
| License | **MIT** | repo root LICENSE + `vinpatel/aeorank` GitHub metadata |
| Primary language | **TypeScript** | directory scan |
| Scan time | **< 30s** typical | unit scan benchmarks; expressed as "~30s" or "<30s", never a point estimate |
| Typical scan runtime in fixtures | **0.9s** | used as illustrative in the LiveScan mockup only; never as an external benchmark claim |

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

## Product-truth asks — claims we'd like but can't yet make

Ordered by potential marketing lift. Each becomes a product / tooling task before the claim can ship.

1. **"First/only open-source AEO toolkit."** Likely true but unverifiable exhaustively; softened to "unusual in the category." To claim hard: survey + dated blog post establishing the claim, with explicit competitor list.
2. **npm download counts for `aeorank-cli`.** Strong CLI-adoption signal but currently unshipped in copy. To claim: expose weekly npm download count via a small endpoint or a shields.io badge, wire into OSS metrics panel.
3. **"288 tests passing on `main`."** True at the time of the scan, but could regress silently. To claim: add a CI badge (shields.io/github/workflow-status) pointing at the test workflow, link next to the 288 number.
4. **"Deployed in production by N teams."** No proof. To claim: one named early-adopter with permission, or an opt-in `aeorank-cli scan --anonymous-telemetry` counter.
5. **"2–4 weeks to citation lift"** in the FAQ. Plausible but not measured. To soften or verify with a before/after case study on a real site.
6. **"8 vs 9 files" build-log discrepancy.** `@aeorank/astro` logs "Generated 8 AEO files in output directory" on build, but we claim 9 files across the site. Investigate — is `feed.xml` opt-in per framework? Reconcile either the log or the claim.

## Illustrative (not a claim)

Some elements are explicitly framed as mockups of product output. These are allowed to carry placeholder numbers *because the framing is illustrative*, not claimed:

- Hero dual-view "inspector" panel — the 31/100 score, 36 checks / 9 fail / 11 warn / 16 pass breakdown is an illustrative audit of a generic "your-site.com".
- Footer receipt card — #0000047, 0.93s runtime, 31/100 score — styled as a receipt mockup.
- LiveScan marquee lines (`title 64 chars · well-formed`, etc.) — plausible per-criterion output, shown as an example stream.

These stay illustrative as long as the surrounding copy makes clear they're a demo, not a live scan of the visitor's site.
