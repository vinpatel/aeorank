# Messaging audit — Operator sign-off

Canonical product: **`npx aeorank-cli@0.1.1`** (npm). Measured 2026-09-17 against `https://example.com --format json --no-files`:

| Fact | Live CLI |
|---|---|
| Package | `aeorank-cli@0.1.1` |
| Binary `-V` | `0.0.1` (ignore; npm version is canonical) |
| Dimensions | **12** (`dimensions.length`; no `dimensionCount` field) |
| Weights | `high` / `medium` / `low` — not 36% pillars |
| Generated files | **8** (no `ai.txt`) |
| Default `maxPages` | **50** |
| `--fail-on-crawler-block` | **not in 0.1.1** (GitHub Action input exists) |
| `ai.txt` | **not generated, not scored** |

The 12 dimensions: `llms-txt`, `schema-markup`, `ai-crawler-access`, `content-structure`, `answer-first`, `faq-speakable`, `eeat-signals`, `meta-descriptions`, `sitemap`, `https-redirects`, `page-freshness`, `citation-anchors`.

8 files: `llms.txt`, `schema.json`, `llms-full.txt`, `CLAUDE.md`, `robots-patch.txt`, `faq-blocks.html`, `citation-anchors.html`, `sitemap-ai.xml`.

Local `@aeorank/core` still has a 36-row registry. **Do not market it** until a published CLI emits that `dimensionCount`.

Mindtrades audits stay: **crawler-gate first → CLI → human-reviewed fixes.** The crawler gate you can fail a PR on today is the **GitHub Action** `fail-on-crawler-block` input, not `aeorank-cli@0.1.1`.

---

## Keep

| Line | Why |
|---|---|
| **Others monitor. We fix.** | True split. |
| **8 files** the published CLI writes | Matches `files[].name`. |
| **12 dimensions** `aeorank-cli@0.1.1` scores | Live `dimensions.length`. |
| **MIT / CLI free / no account** | True. |
| **Primary marketing CTAs → `npx aeorank-cli@0.1.1 scan <url>` / docs** | Weekend sales do not depend on hosted signup. |
| **Pro $29 / Agency $99 / Free 1 site · 3 scans** | Plan gates. |
| **11 framework plugins** | Real packages. |
| **`llms.txt` is agent-docs hygiene, not a citation guarantee** | True. |
| **Action `fail-on-crawler-block`** | Exists on `vinpatel/aeorank-action`. Missing robots = unknown, not block. |
| **App `fail-below` coming soon** | Action-only today. |

---

## Cut

| Line | Why |
|---|---|
| **36 checks / criteria / dimensions** on marketing, docs getting-started, README | Published CLI scores **12**. |
| **`ai.txt` generated or scored** | Not in 0.1.1 output or dimension list. |
| **`--fail-on-crawler-block` on `npx aeorank-cli@0.1.1`** | Flag is not in 0.1.1 help. |
| **“Get you cited” / “highly cited” / “sometimes cited” / citation timelines** | No citation tracker. |
| **JSON `dimensionCount` / `crawlerAccess` as 0.1.1 fields** | Not present on published JSON. |
| **13 plugins, REST API, PDF exclusive, 7–14×, $299** | False or unsourced. |
| **App fail-below** | Coming soon only. |
| **Primary “Get AEO Score” / “Scan my site” → `app.aeorank.dev/sign-up` or `/scan`** | Hosted app is Clerk Development; `/scan` is 404. CLI is the honest free path. |

---

## Rewrite

| Before | After |
|---|---|
| 36 deterministic checks | 12 dimensions the published CLI scores |
| Fail the PR if GPTBot is blocked (as CLI 0.1.1) | GitHub Action can fail the PR if GPTBot is blocked |
| Docs 36-row catalog as current product | Archived until a published CLI matches |
| Pro “Full monitoring…” | More hosted scans; same CLI + 8 fix files |
| Grade “cite / visible in ChatGPT” | Readiness / extractability only |

---

## Operator checklist

- [x] dimensionCount matches CLI (**12**)
- [x] exactly 8 files, no `ai.txt`
- [x] no citation timeline / outcome grades
- [x] fail-on-crawler-block attributed to **Action**, not npm 0.1.1 CLI
- [x] npm **0.1.1** canonical
- [x] wedge = fix / crawler / CLI / CI / MIT
- [x] primary public CTAs go to CLI 0.1.1 / docs, not broken app signup
