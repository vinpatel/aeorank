# Messaging audit — Operator sign-off

Canonical product in this repo: **`npx aeorank-cli@0.1.2`**. npm still serves `0.1.1` until the publish commands in the 0.1.2 PR are run. Copy matches the code on this branch, not the old registry tarball.

| Fact | This CLI |
|---|---|
| Package | `aeorank-cli@0.1.2` (depends on `@aeorank/core@0.1.2`, published first) |
| Binary `-V` | `0.1.2` from `packages/cli/package.json` |
| Dimensions | **36** (`dimensions.length` and `dimensionCount`) |
| Weights | `weightPct`, sum 100 |
| Generated files | **8** (`ai.txt` is not one of them) |
| Default `maxPages` | **200** with no config file (`init` writes 50) |
| `--fail-on-crawler-block` | **CLI flag** (exit 2) and GitHub Action input |
| `crawlerAccess` | **`allow` \| `block` \| `unknown`**. Internal parser status stays `allowed` \| `disallowed` \| `unknown` |
| `ai.txt` | **scored** by `content-licensing`, **not generated** |

8 files: `llms.txt`, `llms-full.txt`, `CLAUDE.md`, `schema.json`, `robots-patch.txt`, `faq-blocks.html`, `citation-anchors.html`, `sitemap-ai.xml`.

Mindtrades audits stay: **crawler-gate first → CLI → human-reviewed fixes.** The crawler gate is `--fail-on-crawler-block` on the CLI and the Action input. No citation promises.

---

## Keep

| Line | Why |
|---|---|
| **Others monitor. We fix.** | True split. |
| **8 files** the published CLI writes | Matches `files[].name`. |
| **36 dimensions** `aeorank-cli@0.1.2` scores | `dimensions.length`. |
| **MIT / CLI free / no account** | True. |
| **Primary marketing CTAs → `npx aeorank-cli@0.1.2 scan <url>` / docs** | Weekend sales do not depend on hosted signup. |
| **Pro $29 / Agency $99 / Free 1 site · 3 scans** | Plan gates. |
| **11 framework plugins** | Real packages. |
| **`llms.txt` is agent-docs hygiene, not a citation guarantee** | True. |
| **Action `fail-on-crawler-block`** | Exists on `vinpatel/aeorank-action`. Missing robots = unknown, not block. |
| **App `fail-below` coming soon** | Action-only today. |

---

## Cut

| Line | Why |
|---|---|
| **`ai.txt` generated** | Not in `GENERATED_FILE_NAMES`. It is scored. |
| **“Get you cited” / “highly cited” / “sometimes cited” / citation timelines** | No citation tracker. |
| **`crawlerAccess` values `allowed` / `disallowed`** | Public JSON emits `allow` / `block` / `unknown`. |
| **13 plugins, REST API, PDF exclusive, 7–14×, $299** | False or unsourced. |
| **App fail-below** | Coming soon only. |
| **Primary “Get AEO Score” / “Scan my site” → `app.aeorank.dev/sign-up` or `/scan`** | Hosted app is Clerk Development; `/scan` is 404. CLI is the honest free path. |

---

## Rewrite

| Before | After |
|---|---|
| 12 dimensions as the current CLI | 36 dimensions `aeorank-cli@0.1.2` scores |
| Fail the PR if GPTBot is blocked (Action only) | CLI flag and Action input |
| Docs 36-row catalog archived | Catalog matches `DIMENSION_DEFS` |
| Pro “Full monitoring…” | More hosted scans; same CLI + 8 fix files |
| Grade “cite / visible in ChatGPT” | Readiness / extractability only |

---

## Operator checklist

- [x] dimensionCount matches CLI (**36**)
- [x] exactly 8 files; `ai.txt` scored, not generated
- [x] no citation timeline / outcome grades
- [x] `--fail-on-crawler-block` is a CLI flag and an Action input
- [x] repo version **0.1.2** (publish `@aeorank/core` first; do not npm publish from CI here)
- [x] wedge = fix / crawler / CLI / CI / MIT
- [x] primary public CTAs go to CLI 0.1.2 / docs, not broken app signup
