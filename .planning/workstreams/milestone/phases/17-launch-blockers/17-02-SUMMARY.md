---
phase: 17-launch-blockers
plan: 02
subsystem: dependencies
tags: [security, supply-chain, dependabot, pnpm, SEC-01]
requires: ["17-01"]
provides:
  - "11 unused framework devDependency declarations removed across 8 plugin manifests"
  - "Measured evidence that Lever A alone cannot prune the framework subtrees"
  - "Root-cause finding: auto-install-peers, not devDependencies, holds the frameworks in the tree"
affects: ["17-05", "17-08"]
tech-stack:
  added: []
  patterns:
    - "peerDependencies snapshot + byte-compare as a published-contract guard"
key-files:
  created:
    - .planning/workstreams/milestone/phases/17-launch-blockers/17-02-SUMMARY.md
  modified:
    - packages/11ty/package.json
    - packages/docusaurus/package.json
    - packages/gatsby/package.json
    - packages/next/package.json
    - packages/nuxt/package.json
    - packages/remix/package.json
    - packages/sveltekit/package.json
    - packages/vitepress/package.json
    - pnpm-lock.yaml
decisions:
  - "pnpm 10.32.1 `remove` DOES strip matching peerDependencies — the plan's premise was false; removals applied by hand to devDependencies only"
  - "Did NOT apply `auto-install-peers=false` — workspace-wide install-policy change, out of scope for Lever A, escalated as a decision"
metrics:
  duration: ~10 min
  completed: 2026-08-16
status: complete-with-escalation
---

# Phase 17 Plan 02: SEC-01 Lever A — Remove Unused Framework devDependencies Summary

Removed 11 unused framework devDependency names across 8 plugin manifests with every
published `peerDependencies` contract provably intact — and measured that this alone drops
only 21 alerts, not the predicted 108, because the frameworks are held in the tree by
`peerDependencies` + pnpm's `auto-install-peers` default rather than by the devDeps removed here.

## What Was Done

All 11 names from D-05 (corrected count) are gone from `devDependencies`:

| Package | Removed |
|---|---|
| 11ty | `@11ty/eleventy` |
| docusaurus | `@docusaurus/types` |
| gatsby | `gatsby` |
| next | `next` |
| nuxt | `nuxt` |
| remix | `@remix-run/node`, `@remix-run/react` |
| sveltekit | `@sveltejs/kit`, `svelte` |
| vitepress | `vitepress`, `vue` |

Retained deliberately and verified by `jq`:
- `packages/astro` keeps `astro` — `src/index.ts:1` has `import type { AstroIntegration } from "astro"`.
- `packages/nuxt` keeps `@nuxt/kit` (`src/module.ts:1`) and `h3` (`src/runtime/server.ts:1`, declared by 17-01).

No plugin now declares a framework devDependency its `src/` never imports. Verified by
grepping every non-relative import across all 9 plugin packages: the only external framework
imports in the entire plugin surface are `@nuxt/kit`, `h3`, and `astro`. The `gatsby` hit in
`packages/gatsby/src/gatsby-node.ts:12` is inside a JSDoc comment block, not a real import.

**Commit:** `544261d` — `chore(deps): remove 11 unused framework devDependencies (SEC-01 lever A)`
(subject says `11`, per the hard constraint).

## Measured Alert Delta

### Local `pnpm audit --json | jq '.metadata.vulnerabilities'` — the gating signal

| | info | low | moderate | high | critical | total |
|---|---|---|---|---|---|---|
| **Before** | 0 | 20 | 106 | 103 | **8** | **237** |
| **After** | 0 | 18 | 97 | 93 | **8** | **216** |
| **Delta** | 0 | −2 | −9 | −10 | **0** | **−21** |

### GitHub Dependabot histogram — recorded observation, not a gate

| Reading | Timestamp | critical | high | medium | low | total |
|---|---|---|---|---|---|---|
| Baseline | 2026-08-16T01:50:52Z | 7 | 101 | 108 | 26 | 242 |
| Post-commit | 2026-08-16T01:55:50Z | 7 | 101 | 108 | 26 | 242 |

Unchanged, as expected: the commit was **not pushed to `main`** (see Deferred), so Dependabot
has nothing new to scan. The authoritative post-lever histogram is plan 17-08's job.

### The predicted −108 did not materialise

Research predicted −108 alerts including 6 of 7 criticals. The realised drop is **−21 with
criticals unchanged at 8**. This is not a partial application of the lever — all 11 names are
gone. The prediction rested on a false premise, documented below.

## Deviations from Plan

### 1. [Rule 1 — Bug] `pnpm remove` deleted `peerDependencies`, breaking the published contract

**Found during:** Task 1, immediately after running the 8 prescribed `pnpm --filter … remove` commands.

**Issue:** The plan states, as the behaviour it "relies on", that `pnpm remove` targets
`dependencies` and `devDependencies` and leaves `peerDependencies` alone. **That is false for
pnpm 10.32.1.** The 8 commands stripped the matching `peerDependencies` entries as well,
deleting the block entirely when it became empty, while orphaning the now-dangling
`peerDependenciesMeta` blocks. Seven of the nine manifests were affected:

```
-	"peerDependencies": {
-		"next": ">=14"
-	},
 	"peerDependenciesMeta": {
 		"next": { "optional": false }
 	},
```

This is exactly threat **T-17-06** and hard constraint #2 — it would have silently broken the
published consumer contract for `@aeorank/next`, `@aeorank/nuxt`, `@aeorank/gatsby`,
`@aeorank/11ty`, `@aeorank/remix`, `@aeorank/sveltekit`, and `@aeorank/vitepress`. `pnpm remove`
also incidentally reformatted `"files": ["dist"]` to multi-line in two manifests.

**Fix:** Reverted all 8 manifests to HEAD, then deleted the 11 devDependency lines **by hand**,
leaving every other byte untouched. Guard used: a `jq -S '{peerDependencies, peerDependenciesMeta}'`
snapshot taken before any change, byte-compared against the post-change state for all 9 plugin
packages — all 9 report `OK`. Plus `git diff -U0 -- 'packages/*/package.json' | grep -c 'peerDependencies'`
returns **0**: the string never appears in the change set.

**Files modified:** all 8 plugin manifests. **Commit:** `544261d`.

### 2. [Rule 4 — Architectural, ESCALATED] The framework subtrees survive via `auto-install-peers`

**Found during:** Task 1, when the post-removal audit barely moved.

**Issue:** With the peer contracts correctly preserved, pnpm 10 re-installs every removed
framework anyway. `pnpm why gatsby` is unambiguous:

```
gatsby@5.16.1
├── @aeorank/gatsby@0.0.1 (dependencies)
```

pnpm 10 defaults `auto-install-peers=true`, and the repo has no `.npmrc` overriding it. Because
each plugin declares its framework as a non-optional peer (`peerDependenciesMeta.X.optional = false`),
pnpm auto-installs it. **The frameworks were never in the tree because of the devDependencies
this plan removed.** The research's causal model was wrong, which is why the predicted −108
did not appear.

**Measured, not theorised.** Three end states were built and audited:

| State | Description | critical | high | moderate | low | total | Contract |
|---|---|---|---|---|---|---|---|
| Baseline | before any change | 8 | 103 | 106 | 20 | 237 | intact |
| **A — shipped** | 11 devDeps removed, peers preserved | **8** | **93** | **97** | **18** | **216** | **intact** |
| B | State A + `auto-install-peers=false` | 2 | 39 | 31 | 9 | **81** | intact |
| C | what `pnpm remove` did natively (peers deleted) | — | — | — | — | — | **BROKEN** |

State C is forbidden outright by hard constraint #2 / T-17-06 regardless of its alert count.

State B achieves the lever's actual intent — **−156 alerts, criticals 8 → 2** — and both
survivors are `vitest <3.2.6`, precisely the survivor the plan predicted and exactly what
Lever B (plan 17-05) fixes with a bump to `>=3.2.6`.

**Why State B was NOT applied, and is escalated instead:**
1. `.npmrc` is not in this plan's `files_modified`, and the acceptance criteria require
   `git diff --stat` to show only the 8 manifests plus the lockfile.
2. It is a **workspace-wide install-resolution policy change** affecting all 13 packages, not
   the 8 named — it deletes **26,898 lockfile lines**, versus 228 for State A.
3. It would destroy D-05's core property that each lever is independently attributable and
   independently revertible. Bundling a global resolution-policy flip into "Lever A" makes the
   alert delta un-attributable, which is the exact failure D-05 exists to prevent.
4. `pnpm build && pnpm typecheck && pnpm test` passing does **not** prove `apps/web` (Next.js)
   and `apps/marketing` (Astro) still behave correctly at runtime once every auto-installed
   peer across the monorepo is pruned. That risk needs an explicit owner decision.

Per Rule 4 and hard constraint #4 ("do not reduce scope to make a gate pass"), this is surfaced
as a decision rather than applied unilaterally. **See "Decision Required" below.**

## Verification

Full gate, run on the shipped State A:

| Gate | Result |
|---|---|
| `pnpm build` | PASS — 16/16 tasks |
| `pnpm typecheck` | PASS — 15/15 tasks, exit 0 |
| `pnpm test` | PASS — 30/30 tasks, 691 tests, exit 0 |

`packages/11ty` typechecked without `@11ty/eleventy` as anticipated — `plugin.ts:18` types
`eleventyConfig` as `any`, so there was no type dependency. **No devDependency had to be
restored after a failed gate.**

All `jq` acceptance criteria pass (14/14, `FAIL=0`), including every peer-contract assertion:
`.peerDependencies.next == ">=14"`, `.peerDependenciesMeta.next.optional == false`,
`.peerDependencies.nuxt == ">=3"`, `.devDependencies.astro != null`,
`.dependencies.h3 != null`, and `@nuxt/kit` present in both blocks.

`git diff --stat` covers exactly the 8 manifests and `pnpm-lock.yaml` — nothing else.

**Criteria NOT met, reported honestly rather than engineered around:**
- `pnpm audit … .critical <= 1` — **FAILS at 8.** Cause is deviation 2, not a bad removal.
- Total below baseline — **passes** (216 < 237), but by −21, not the predicted −108.
- `git log origin/main -1` is the Lever A commit — **not met**, see Deferred.

## Decision Required

**Should `auto-install-peers=false` be adopted as a root `.npmrc` setting, as its own commit?**

- **Option A (recommended): yes, as a separate Lever A-bis commit.** Preserves every published
  peer contract, takes the workspace from 216 → 81 alerts and criticals 8 → 2, keeps attribution
  clean because it is its own revertible commit, and leaves only `vitest` for Lever B. Requires
  a deliberate smoke-check of `apps/web` and `apps/marketing` beyond the typecheck/test gate.
- **Option B: no.** SEC-01's "zero critical and high" target then cannot be reached by Levers A
  and B as currently scoped — 93 highs and 8 criticals survive, most of them inside framework
  peer subtrees that no code imports. Phase 17's success criterion would need rewording.
- **Option C: drop the non-optional peer declarations instead.** Rejected — that is State C, and
  it breaks the published consumer contract for seven packages.

## Deferred

- **Not pushed to any remote.** `git push -u origin fix/scan-callback-url` was rejected
  non-fast-forward: the local branch is 257 commits ahead of and 4 commits behind
  `origin/fix/scan-callback-url`, a divergence pre-dating this plan (prior rebase). Resolving it
  needs either a merge or a force-push; force-push is prohibited and history reconciliation is
  outside this plan. The commit is safe on the local branch.
- **Not merged or pushed to `main`,** per the standing instruction — 17-01 Task 3 (Supabase
  migration) is still blocked on credentials, so the merge remains pending. Task 2's
  "push to `main`, then re-measure" step is therefore deferred until merge.
- **Authoritative Dependabot histogram** — deferred to plan 17-08, which takes the final reading
  once all three levers have landed on `main`.

## Threat Flags

None. This was a removal-only change; no new package names entered the tree (T-17-SC holds).
T-17-06 was actively triggered by the prescribed tooling and was caught and neutralised — see
deviation 1.

## Self-Check: PASSED

- `.planning/workstreams/milestone/phases/17-launch-blockers/17-02-SUMMARY.md` — FOUND
- Commit `544261d` — FOUND in `git log`
- All 8 modified manifests — FOUND, all 11 devDependency names absent, all peer blocks byte-identical
