# Phase 17: Launch Blockers - Research

**Researched:** 2026-08-15
**Domain:** Supply-chain security remediation (pnpm monorepo), CI truth-sourcing, claim auditing, release engineering
**Confidence:** HIGH (nearly every finding is measured from this repo or the GitHub/npm APIs in-session)
**Status:** PARTIALLY SUPERSEDED by `17-CONTEXT.md` (2026-08-15) — see the notice below.

---

> ## Read `17-CONTEXT.md` before acting on anything in this document
>
> This research was written BEFORE the user's decisions were captured. Two of its
> recommendations were overruled, and the questions it left open have all been answered.
> Where this document and `17-CONTEXT.md` disagree, **CONTEXT wins** — it carries locked
> decisions D-01..D-11. Every superseded passage below is struck through and annotated inline.
>
> | Superseded recommendation | Where | Overruled by |
> |---|---|---|
> | "target Astro **6.4.8**, not 7" | Summary; "The Astro Upgrade"; Assumption A4; Open Question 1 | **D-03 — the target is Astro 7.2.2.** The user chose the two-major jump deliberately, for the longer runway. |
> | The 4 CodeQL SSRF findings "should be **dismissed** in the GitHub UI" | "The truthful post-remediation line"; Security Domain; Assumption A10; Open Question 6 | **D-08 — do NOT suppress or dismiss them.** They stay open and the copy tells the truth. Plan 17-09 asserts the dismissed-alert count is unchanged. |
>
> The `## Open Questions` section is fully RESOLVED — all seven map to decisions
> (Q1→D-03, Q2→D-01, Q3→D-02, Q4→CONTEXT specifics, Q5→D-04, Q6→D-08, Q7→D-10).
>
> Everything else stands as measured and is still authoritative: the alert data, the
> per-package remediation table, the claim audit with file:line, the compatibility matrix,
> the migration review, and the validation architecture.

---

## Summary

This is a cleanup phase and every hard number in it was measurable, so almost nothing here is
guesswork. The headline finding is that **242 open Dependabot alerts is a misleading number** —
it collapses to **57 unique packages**, and **108 of the 242 alerts (including 6 of the 7
criticals) come from framework `devDependencies` in the 11 plugin packages that the plugin
source code never imports.** `packages/gatsby` declares `gatsby@^5` but the only occurrence of
the string `gatsby` in its source is inside a doc comment. The same holds for `@11ty/eleventy`,
`@docusaurus/types`, `next`, `@remix-run/*`, `@sveltejs/kit`, `svelte`, `vitepress`, `vue`, and
`nuxt`. Deleting nine unused devDependency declarations — a change with no runtime, API, or type
surface — removes 108 alerts. Only `packages/astro` (`import type { AstroIntegration }`) and
`packages/nuxt` (`@nuxt/kit`, `h3`) have genuine framework imports.

The second structural finding explains *why* the debt tripled and directly determines SEC-02:
**`dependabot_security_updates` is `disabled` on this repository** [VERIFIED: `gh api repos/vinpatel/aeorank`],
and **Dependabot cannot update transitive dependencies for pnpm at all** [CITED: dependabot-core#13177].
217 of the 242 alerts are attributed to the root `pnpm-lock.yaml`, i.e. transitive. So Dependabot
was never going to fix these even if it had been enabled. The repo already discovered this
empirically — root `package.json` carries 27 hand-written `pnpm.overrides`. Some are now stale
(`liquidjs: ">=10.25.6"` when the critical RCE needs `>=10.26.0`), and one is actively dangerous
(`vite: "^7.3.2"` forced onto Astro 5, which declares `vite@^6.4.1`). Any SEC-02 automation that
is only a `dependabot.yml` will not prevent recurrence in this repo.

Third: **there is no CI workflow that runs tests.** `.github/workflows/` contains seven files —
three deploy, three content-bot, one awesome-list — and zero test/lint/typecheck jobs. `main` is
unprotected with no required status checks. This means SEC-04 is not "wire a count into a badge";
it is "create the CI pipeline that produces the count in the first place." The measured
authoritative number, produced this session by running the suite: **691 tests across 39 test
files, 0 failures.** Every published figure is wrong (LAUNCH.md 675, PROJECT.md 637, DIAGNOSIS.md
and the live marketing site 288).

Fourth, and the finding that most changes the shape of the phase: **SEC-01 asks for zero critical
and zero high, not zero alerts.** After both remediation levers, the projected end state is
**4 alerts (0 critical, 0 high, 2 medium, 2 low)**. LAUNCH.md's "0 Dependabot / CodeQL alerts"
therefore cannot be made true by fixing things — there are also **4 open CodeQL alerts**, all
`js/request-forgery` in the scanner's fetcher and the GitHub App client, which are intrinsic to a
tool whose job is fetching user-supplied URLs. That claim must be *rewritten*, not *achieved*.

Finally, SEC-06 is in much better shape than PROJECT.md suggests: aeorank.dev, docs.aeorank.dev,
and app.aeorank.dev all return 200; the Marketplace listing and the GitHub App page both resolve;
`vinpatel/aeorank-action` exists with both `v1.0.0` and `v1` tags. What remains for SEC-06 is
strictly credential-gated and cannot be done by a coding agent.

**Primary recommendation:** Decompose SEC-01 into two sequenced levers — (A) delete nine unused
framework devDependencies, gated on `pnpm build && pnpm typecheck && pnpm test` staying green,
which removes 108 alerts and 6 of 7 criticals at near-zero risk; then (B) bump 18 remaining
packages, of which 17 are one-line `pnpm.overrides` or patch bumps and exactly one — Astro
5.18.1 → ~~6.4.8~~ **7.2.2 per D-03** — is a genuine major migration needing its own plan and a human checkpoint. Do not
plan SEC-01 as a single "fix the alerts" task.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | Zero open critical and zero open high Dependabot alerts | Full 242-alert decomposition below: 57 unique packages, 108 alerts removable by deleting unused devDeps, 63 crit+high remaining across 18 packages, projected end state 4 alerts. Exact per-package minimum safe versions given. |
| SEC-02 | Automated dependency-update cadence so alert debt cannot silently triple again | Root cause identified (security updates *disabled* + Dependabot cannot update pnpm transitives). Three-part mechanism proposed: enable security updates, grouped `dependabot.yml`, and a scheduled `pnpm audit` CI gate — the last is the only one that catches transitives. |
| SEC-03 | Every numeric claim traceable to a measured source | Complete claim inventory with file:line, verdict, and measured truth. 9 outright false claims found, incl. all five README pillar weights and a "we scan 100 startups every week" line backed by a hardcoded array. |
| SEC-04 | Single authoritative test count emitted by CI, consumed by every doc and badge | Measured truth = 691/39 files. No CI workflow exists — must be created. Mechanism proposed follows the existing `readme-social-proof.yml` marker-substitution pattern rather than inventing a second one. |
| SEC-05 | `fix/scan-callback-url` merged incl. migration and keep-alive cron | Branch is 6 ahead / 1 behind `origin/main`. Migration reviewed line by line: idempotent, dedupe-safe, re-points `scans` before deleting dupes, and `scans` is the only FK to `sites`. `schema.sql` and the migration are complementary, not conflicting. Vercel Hobby cron limits verified compatible. |
| SEC-06 | Marketing DNS, dashboard credentials, Marketplace publication verified live | All three domains return 200; Marketplace and GitHub App pages resolve; action repo has `v1` tag. Explicit split below of what CI can verify vs what only the user can. |
</phase_requirements>

---

## User Constraints

**No `CONTEXT.md` exists for this phase** (`.planning/workstreams/milestone/phases/17-launch-blockers/` was empty at research time). There are therefore no locked decisions from `/gsd:discuss-phase`.

Several decisions surfaced below genuinely need user input before planning — they are collected in **Open Questions**. The most important are the Astro major-version target and the canonical pricing/tier names.

## Project Constraints (from project docs)

No `CLAUDE.md` exists at the repository root. The following are standing directives extracted from `.planning/` docs and carry equivalent authority:

| Constraint | Source | Implication for this phase |
|---|---|---|
| **Zero fabricated numbers.** "Every metric is either a verified product fact or fetched live from GitHub API. Hardcoded '2,847 stars', '411 tests', '13 plugins' etc. eliminated." | `.planning/MILESTONES.md:14` | This is the governing policy for SEC-03/SEC-04. The policy already exists and was already violated — the phase is enforcement, not invention. |
| Scoring must remain deterministic; no model calls in the scoring path | `PROJECT.md` Key Decisions | Do not introduce anything that changes scoring behaviour while chasing alerts. Astro/Next bumps must not touch `@aeorank/core` scoring output. |
| `@aeorank/core` is a pure package with no I/O | `PROJECT.md` Key Decisions | Dependency changes to core must not add I/O-bearing deps. |
| Tech stack locked: pnpm workspaces + Turborepo, Biome, Vitest, Node 20+ | `PROJECT.md` Constraints | Do not migrate to npm/yarn or swap Vitest to solve alerts. Note the Node floor conflicts with Astro 6 — see Open Questions. |
| Design: 37signals aesthetic | `PROJECT.md` Constraints | Claim corrections in `apps/marketing/` are copy edits; do not restyle. |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dependency version resolution | Build tooling (pnpm workspace root) | — | `pnpm.overrides` is the only lever that reaches transitive deps; it is inherently root-scoped in a single-lockfile workspace. |
| Vulnerability detection | GitHub platform (Dependabot + CodeQL default setup) | CI (`pnpm audit`) | Platform detects; CI must gate, because the platform cannot *fix* pnpm transitives. |
| Test-count measurement | CI (GitHub Actions) | — | Must be measured at build time in a clean environment, never hand-edited. A local number is not authoritative. |
| Test-count distribution | CI (marker substitution into README) + build-time import (Astro sites) | — | README already uses `<!-- STATS_START -->` markers; Astro sites can import a JSON artifact at build time. Two different tiers, one source. |
| Claim correctness | Content/docs tier (`README.md`, `LAUNCH.md`, `apps/marketing/src`) | CI (drift check) | Claims live in copy; only a CI check prevents re-drift. |
| Database schema migration | Supabase (Postgres) | — | `sites` unique constraint is a DB-tier concern; the app's `onConflict` upsert depends on it existing. |
| Scheduled DB keep-alive | Vercel Cron → Next.js route handler | Supabase | Vercel Cron is the scheduler tier; the route is a thin adapter. |
| Deploy liveness verification | External (HTTP) for public surfaces; human for authenticated surfaces | — | An agent can curl a 200; it cannot log into Clerk or read the Stripe dashboard. |

---

## Standard Stack

No new runtime libraries are needed. This phase changes *versions*, *configuration*, and *copy*.

### Core tools (already present, versions verified in-session)

| Tool | Version in repo | Purpose | Why standard |
|---|---|---|---|
| pnpm | 10.32.1 (`packageManager`) | Workspace + `overrides` + `audit --fix` | `pnpm audit --fix` writes overrides directly; it is the only supported transitive-pin mechanism [VERIFIED: `pnpm audit --help`] |
| Vitest | 3.2.4 → needs ≥3.2.6 | Test runner, JSON reporter for the authoritative count | Already the project standard; `--reporter=json --outputFile` produces `numTotalTests` [VERIFIED: run in-session] |
| Turborepo | ^2.5.0 (latest 2.10.10) | Task orchestration | Already standard |
| Biome | ^1.9.0 | Lint/format | Already standard |
| GitHub Dependabot | — (config absent) | Version + security update PRs | Native, zero-cost; but see the pnpm transitive caveat |
| CodeQL default setup | configured, weekly, `remote` threat model | SAST | Already enabled — no workflow file needed [VERIFIED: `gh api .../code-scanning/default-setup`] |

### Supporting

| Tool | Version | Purpose | When to use |
|---|---|---|---|
| `dependabot/fetch-metadata` | pinned SHA | Read update-type in an auto-merge workflow | Only if auto-merge is adopted [CITED: docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions] |
| `pnpm dedupe` | built-in | Collapse duplicate resolutions | Marginal here — `--check` showed ~11 dupes, none security-relevant [VERIFIED: run in-session] |

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|---|---|---|
| Dependabot | Renovate | Renovate handles pnpm transitives and lockfile maintenance far better, and has first-class grouping + auto-merge. But it is a third-party App install, adds a config surface, and duplicates the alerting the repo already gets free. **Recommendation: keep Dependabot for alerting, add a scheduled `pnpm audit` CI gate for transitives.** Adopting Renovate is defensible but is scope creep for a launch-blocker phase. |
| `pnpm.overrides` | `pnpm patch` | Patching is for unpublished fixes; every package here has a published patched version except 7. Overrides are correct. |
| Deleting unused framework devDeps | Bumping each framework to latest | Bumping gatsby/docusaurus/nuxt/11ty to latest is a much larger, riskier change that buys nothing — the packages are unused. Deletion is strictly better. |
| Vitest 3.2.6 | Vitest 4.1.10 (latest) | 4.x is a major with its own migration. 3.2.6 clears the critical with a patch bump. **Use 3.2.6.** |

### Installation / remediation commands

> **CORRECTION (plan revision, 2026-08-15):** the count "9" below — and every other "nine"
> in this document, at lines 40, 74, 203, and 411 — is **wrong**. The eight `pnpm --filter`
> commands name **ELEVEN** package names: `gatsby`, `@docusaurus/types`, `@11ty/eleventy`,
> `next`, `@remix-run/node`, `@remix-run/react`, `@sveltejs/kit`, `svelte`, `vitepress`,
> `vue`, `nuxt` — all verified present in the eight manifests on 2026-08-15. The command
> list itself is correct and unchanged; only the count was wrong. Plan 17-02 says **11**
> throughout, including in its mandated commit message. Do not propagate "9".

```bash
# Lever A — remove provably-unused framework devDependency names (11 names, 8 commands)
pnpm --filter @aeorank/gatsby      remove gatsby
pnpm --filter @aeorank/docusaurus  remove @docusaurus/types
pnpm --filter @aeorank/11ty        remove @11ty/eleventy
pnpm --filter @aeorank/next        remove next
pnpm --filter @aeorank/remix       remove @remix-run/node @remix-run/react
pnpm --filter @aeorank/sveltekit   remove @sveltejs/kit svelte
pnpm --filter @aeorank/vitepress   remove vitepress vue
pnpm --filter @aeorank/nuxt        remove nuxt          # keep @nuxt/kit — it IS imported
# packages/astro: DO NOT remove astro — src/index.ts imports AstroIntegration

# Verification gate — must all pass before committing Lever A
pnpm install && pnpm build && pnpm typecheck && pnpm test

# Lever B — verify remaining state
pnpm audit --json | jq '.metadata.vulnerabilities'
```

**Version verification:** every version below was confirmed against the npm registry in-session on
2026-08-15 via `npm view <pkg> version`. [VERIFIED: npm registry]

| Package | Latest on npm | In this repo |
|---|---|---|
| astro | 7.2.2 | 5.18.1 |
| next | 16.3.1 | 16.2.4 (apps/web), 15.5.15 (packages/next) |
| @astrojs/starlight | 0.41.7 | ^0.34.0 |
| @clerk/nextjs | 7.7.6 | (transitively < 7.2.4) |
| vitest | 4.1.10 | 3.2.4 |
| turbo | 2.10.10 | ^2.5.0 |
| vite | 8.2.1 | 7.3.2 + 8.0.8 |
| sharp | 0.35.3 | 0.32.6 + 0.34.5 |

---

## Package Legitimacy Audit

**Not applicable in the usual sense — this phase installs no new packages.** It removes nine
declarations and raises version floors on packages already in the tree. No new package names are
introduced, so there is no slopsquatting surface.

`slopcheck` was not run because there are no candidate installs. Every package referenced in this
document is already present in `pnpm-lock.yaml` and was resolved via `pnpm why` against the
installed `node_modules` tree in-session — a stronger provenance signal than registry existence.

| Package | Registry | Disposition |
|---|---|---|
| (all 57 vulnerable packages) | npm | Already installed; versions raised only. No new names. |
| `dependabot/fetch-metadata` | GitHub Action | **Flagged** — if the auto-merge workflow is adopted, pin by full commit SHA, not tag. GitHub's own docs use a pinned SHA. |

**Packages removed due to slopcheck [SLOP] verdict:** none — protocol not applicable.
**Packages flagged as suspicious [SUS]:** none.

---

## The 242 Alerts, Decomposed

Everything in this section was measured in-session. Raw data:
`gh api "repos/vinpatel/aeorank/dependabot/alerts?state=open&per_page=100" --paginate` (242 records),
cross-referenced against `pnpm why <pkg> -r --depth 8` for all 57 packages. [VERIFIED: GitHub API + local pnpm tree]

### Headline shape

| Cut | Result |
|---|---|
| Total open alerts | 242 |
| By severity | 7 critical · 101 high · 108 medium · 26 low |
| **Unique vulnerable packages** | **57** |
| Alerts attributed to root `pnpm-lock.yaml` (i.e. transitive) | **217 of 242 (90%)** |
| Top 6 packages | `next` 42 · `astro` 32 · `undici` 19 · `axios` 18 · `react-router` 14 · `nuxt` 12 = **137 (57%)** |
| Alerts with **no patch available** | 7 (`liquidjs` ×4, `image-size` ×2, `react-router-dom` ×1) |
| Local `pnpm audit` cross-check | 8 crit · 103 high · 106 mod · 20 low, 58 unique modules — **corroborates the API within noise** |

The "242" figure is real but the *work* is 57 packages, and after Lever A it is 18.

### Real exposure vs. optics

Classifying each alert by whether its package is reachable from a workspace package that actually
ships or deploys (`@aeorank/web`, `/core`, `/cli`, `/marketing`, `/docs`, `/astro`) versus reachable
only through plugin framework devDependencies:

| Class | Alerts | Severity split |
|---|---|---|
| Reachable from shipped/deployed code | 134 | 1 critical · 62 high · 53 medium · 18 low |
| **Plugin devDependency only (never shipped)** | **108** | **6 critical · 39 high · 55 medium · 8 low** |

The single "critical" on the shipped side is `vitest` — a test runner, and the advisory only
applies when `vitest --ui` is listening, which this repo never does. **Effective critical exposure
in production or published code is zero.** Dependabot labels 225 of 242 as `scope: runtime`; that
label is derived from lockfile position and is wrong here. Do not repeat the "225 runtime
vulnerabilities" framing anywhere.

### Lever A — delete unused framework devDependencies

Verified by grepping every non-relative import across all ten plugin `src/` trees:

| Package | Framework devDep declared | Actually imported in `src/`? | Verdict |
|---|---|---|---|
| `packages/gatsby` | `gatsby@^5.0.0` | No — only inside a doc comment at `src/gatsby-node.ts:12` | **REMOVE** |
| `packages/docusaurus` | `@docusaurus/types@^3.0.0` | No — only in `tsup.config.ts` `external:` (a bundler directive, not an install requirement) | **REMOVE** |
| `packages/11ty` | `@11ty/eleventy@^2.0.0` | No | **REMOVE** |
| `packages/next` | `next@^15.5.15` | No — only `tsup` `external:` | **REMOVE** |
| `packages/remix` | `@remix-run/node`, `@remix-run/react` | No — only `tsup` `external:` | **REMOVE** |
| `packages/sveltekit` | `@sveltejs/kit`, `svelte` | No — only `tsup` `external:` | **REMOVE** |
| `packages/vitepress` | `vitepress`, `vue` | No | **REMOVE** |
| `packages/nuxt` | `nuxt@^3.16.0` | No — but `@nuxt/kit` and `h3` **are** imported and are separate declarations | **REMOVE `nuxt` only** |
| `packages/astro` | `astro@^5.18.1` | **Yes** — `import type { AstroIntegration } from "astro"` at `src/index.ts:1` | **KEEP** |
| `packages/shopify` | (none) | n/a | no change |

`peerDependencies` must be left untouched — they are the consumer contract and do not cause installs.

**Effect: 242 → 134 alerts. Criticals 7 → 1.** Confirmed by dependency-path analysis:

```
liquidjs   (CRITICAL RCE) ← @11ty/eleventy       ← @aeorank/11ty      [devDep]
seroval    (CRITICAL)     ← @nuxt/vite-builder   ← nuxt ← @aeorank/nuxt [devDep]
tar        (CRITICAL DoS) ← @mapbox/node-pre-gyp ← @vercel/nft ← nitropack ← nuxt [devDep]
shell-quote(CRITICAL)     ← launch-editor ← @nuxt/devtools / webpack-dev-server ← gatsby, docusaurus [devDep]
websocket-driver (CRIT)   ← faye-websocket ← sockjs ← webpack-dev-server ← gatsby, docusaurus [devDep]
@nuxt/devtools (CRITICAL) ← nuxt ← @aeorank/nuxt [devDep]
vitest     (CRITICAL)     ← root + every package devDep   ← REMAINS, fix by bump to 3.2.6
```

**Risk:** low but non-zero — `pnpm typecheck` could fail if any plugin relies on ambient framework
types not caught by the import grep. This is exactly why the gate
`pnpm install && pnpm build && pnpm typecheck && pnpm test` must be a hard task boundary. `packages/11ty/src/plugin.ts`
uses an untyped `eleventyConfig` parameter and is the most likely place for a surprise. [ASSUMED: typecheck will pass — verify, do not assume]

### Lever B — the 18 remaining crit+high packages

Minimum safe version **per major line** (a package present at two majors needs both floors):

| Package | Required floor | Mechanism | Risk |
|---|---|---|---|
| **astro** | **≥ 6.4.6** (latest 6.x is 6.4.8) | Direct dep in `apps/docs`, `apps/marketing`, `packages/astro` | **MAJOR — see dedicated section** |
| next | 16.x ≥ 16.2.11 | Direct bump in `apps/web` (16.2.4 → 16.3.1) | Low — patch/minor within 16.x |
| @clerk/nextjs | ≥ 7.2.4 | Direct bump in `apps/web` (latest 7.7.6) | Low — pulls `@clerk/backend`, `@clerk/react`, `@clerk/shared`, `js-cookie` with it |
| undici | 6.x ≥ 6.27.0; 7.x ≥ 7.29.0 | `pnpm.overrides` | Low |
| fast-uri | ≥ 3.1.5 | `pnpm.overrides` | Low |
| js-yaml | 3.x ≥ 3.15.1; 4.x ≥ 4.3.1 | `pnpm.overrides` | Low |
| brace-expansion | ≥ 5.0.9 | **override exists at `>=5.0.5` — raise it** | Low |
| postcss | ≥ 8.5.18 | `pnpm.overrides` | Low |
| sharp | ≥ 0.35.0 | Direct in `apps/docs`; override for transitive | Low — native binary, rebuild required |
| svgo | 3.x ≥ 3.3.4; 4.x ≥ 4.0.2 | `pnpm.overrides` | Low |
| ws | 7.x ≥ 7.5.11; 8.x ≥ 8.21.0 | `pnpm.overrides` | Low |
| vite | 7.x ≥ 7.3.5; 8.x ≥ 8.0.16 | **override exists at `^7.3.2` — raise it, and see warning below** | Medium |
| devalue | ≥ 5.8.1 | `pnpm.overrides` | Low |
| vitest | ≥ 3.2.6 | Root + per-package devDep bump | Low |

**Existing stale overrides that must be corrected** (root `package.json` `pnpm.overrides`):
`liquidjs: ">=10.25.6"` → needs `>=10.27.1`; `brace-expansion: ">=5.0.5"` → `>=5.0.9`;
`esbuild: ">=0.25.0"` → higher; `vite: "^7.3.2"` → `^7.3.5` **or** removed entirely if Astro 6 lands
(Astro 6 depends on `vite@^7.3.2` natively, so the override becomes unnecessary).

### Projected end state

Assuming Lever A + Lever B both land, computed by replaying the alert set:

| | critical | high | medium | low | total |
|---|---|---|---|---|---|
| Now | 7 | 101 | 108 | 26 | **242** |
| After Lever A | 1 | 62 | 53 | 18 | **134** |
| After Lever A + B | **0** | **0** | 2 | 2 | **4** |

Residual 4: `@babel/core` (low), `@opentelemetry/core` (medium), `esbuild` (low), `uuid` (medium) —
all trivially closable with additional overrides if the user wants a literal zero.

**This satisfies SEC-01 with margin.** Note SEC-01 requires zero *critical and high* only; a
literal zero-alert repo is achievable but is not the requirement.

---

## The Astro Upgrade — the only genuinely risky change

`astro@5.18.1` carries 8 high-severity alerts and the first patched version is `6.4.6`. There is no
5.x patch. The upgrade is unavoidable for SEC-01.

**Compatibility matrix** [VERIFIED: npm registry, `npm view <pkg>@<ver> peerDependencies`]:

| Astro | Requires vite | Compatible Starlight | Notes |
|---|---|---|---|
| 5.18.1 (current) | `^6.4.1` | 0.36.0 (`astro ^5.5.0`) | repo declares `@astrojs/starlight ^0.34.0` |
| **6.4.8** (min safe) | `^7.3.2` | **0.40.0** (`astro ^6.4.5`) | one major |
| 7.2.2 (latest) | `^8.0.13` | 0.41.7 (`astro ^7.0.2`) | two majors |

**Astro 6 breaking changes that touch this repo** [CITED: docs.astro.build/en/guides/upgrade-to/v6/]:

| Change | Impact here |
|---|---|
| **Node ≥ 22.12.0 required** | Root `engines.node: ">=20"` conflicts. Deploy workflows use `node-version: 22` (floating, resolves ≥22.12 — OK). The `engines` field needs raising, which is a **published-package-facing change** for the CLI. See Open Questions. |
| Vite 7 required | Already forced by the existing `vite: ^7.3.2` override. The upgrade *removes* an incompatibility rather than creating one. |
| Legacy content collections removed | **No impact.** `apps/docs` already uses `src/content.config.ts` (new Content Layer). `apps/marketing` has no content collections. |
| `.cjs`/`.cts` config files unsupported | **No impact.** Both apps use `astro.config.mjs`. |
| `routes` removed from `astro:build:done` hook | **`packages/astro` uses `astro:build:done` but destructures only `{ dir }`** — verified at `packages/astro/src/index.ts`. Should survive. |
| `<ViewTransitions />` → `<ClientRouter />` | Grep both apps; not observed but not exhaustively verified. |
| Zod 4 in content schemas | Only `apps/docs/src/content.config.ts`; Starlight's own schema does the heavy lifting. |
| Image cropping/upscaling defaults changed | `apps/docs` depends on `sharp` — visual regression possible on logos. |

**Coupled upgrade set (must move together):**
~~`astro ^6.4.8` + `@astrojs/starlight ^0.40.0`~~ — **SUPERSEDED BY D-03.** The locked target is
`astro ^7.2.2` + `@astrojs/starlight ^0.41.7` (peer `astro ^7.0.2`), per the 7.2.2 row of the
compatibility matrix above. Plan 17-08 Task 1 re-resolves every `@astrojs/*` peer range against
7.2.2 at execution time rather than trusting either version set recorded here. Also
`@astrojs/preact` (bump) + `@astrojs/sitemap ^3.7.3`
+ `packages/astro` devDep and **peerDependency range widened** so downstream consumers on Astro 6/7
don't hit peer errors.

> **SUPERSEDED BY D-03 — the decision was made and it went the other way.**
>
> ~~**Recommendation: target Astro 6.4.8, not 7.** It clears the alerts with one major migration
> instead of two, and `@astrojs/starlight@0.40.0` is the last release on the Astro 6 line so the
> pin is stable. Going to 7 is defensible (avoids repeating this in a quarter) but doubles the
> migration surface during a launch-blocker phase.~~
>
> **The locked target is Astro 7.2.2.** The user chose the two-major jump deliberately, for the
> longer runway, with the constraint that the migration be its own separately-gated, individually
> revertible commit. Do not silently downgrade to 6.4.8 mid-execution; if an integration turns out
> to have no 7-compatible version, plan 17-08 Task 1 requires stopping and returning the question
> to the user. The `checkpoint:human-verify` recommendation WAS adopted — it is plan 17-08
> Task 3 (visual verification of both Astro sites after the two-major jump).

---

## Runtime State Inventory

Phase 17 includes a schema migration and config changes, so runtime state matters.

| Category | Items found | Action required |
|---|---|---|
| **Stored data** | Supabase `sites` table may contain duplicate `(user_id, url)` rows — this is precisely what broke the scan upsert (SQLSTATE 42P10). Count is **unknown from here**; requires DB credentials. | Data migration — `supabase/migrations/0001_sites_unique_user_id_url.sql` handles it (see review below). Run the pre-flight count query first. |
| **Live service config** | Vercel project env vars: **`CRON_SECRET` must be set** or both `/api/cron/keep-alive` and `/api/cron/rescan` return 500 on every run and the DB pauses anyway. Also Clerk/Supabase/Stripe keys, `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`/`VERCEL_TOKEN`, `DOCS_DEPLOY_KEY`, `AWESOME_LIST_PAT` GitHub secrets. None of these are in git. | Human — user must verify in the Vercel and GitHub settings UIs. |
| **OS-registered state** | **None.** No launchd/systemd/Task Scheduler artifacts; all scheduling is Vercel Cron + GitHub Actions `schedule:`. Verified by inspecting all 7 workflow files and `apps/web/vercel.json`. | None. |
| **Secrets / env vars** | `CRON_SECRET` (existing name, unchanged), `STRIPE_PRO_PRICE_ID`, `STRIPE_API_PRICE_ID`. No renames in this phase, so no key-name churn. | None — code reads existing names. |
| **Build artifacts** | `packages/*/dist` exist and are current. `apps/marketing/dist/` and `apps/docs/.astro/`, `apps/marketing/.astro/` are checked in / modified in the working tree (`.astro/types.d.ts`, `.astro/content-modules.mjs` show as modified — these are generated files). **After the Astro major bump these regenerate and will produce noisy diffs.** | Regenerate via `pnpm build`; consider gitignoring `.astro/` (out of scope, note only). |
| **Repo-level GitHub settings (not in git)** | `dependabot_security_updates: disabled`; `allow_auto_merge: false`; `main` branch **unprotected**, no required status checks; CodeQL default setup configured (weekly). | Human/API — `gh api` can toggle some; the user must confirm intent. |

---

## Architecture Patterns

### Pattern 1: Two-lever alert remediation (removal before upgrade)

**What:** Eliminate dependencies before upgrading them. Removal is strictly safer than upgrade,
and it shrinks the upgrade surface.
**When to use:** Any monorepo where a large fraction of alerts trace to build-time-only deps.
**Applied here:** Lever A removes 108/242 alerts by deleting nine declarations; Lever B then only
has to reason about 18 packages instead of 57.

```
Lever A (remove)  ──►  gate: build + typecheck + test  ──►  commit  ──►  242 → 134
Lever B (override/bump, non-astro) ──► gate ──► commit  ──►  134 → ~72 (0 crit, 0 high except astro)
Lever B' (astro major, own plan)   ──► gate + human checkpoint  ──►  ~72 → 4
```

Each lever is a separate commit so the alert delta is attributable and a bad lever is revertible
in isolation. **Do not combine them.**

### Pattern 2: Single-source metrics via CI marker substitution

The repo already has this pattern in `readme-social-proof.yml`: fetch a value → substitute between
HTML-comment markers → commit. **Extend it; do not invent a second mechanism.**

```yaml
# Source of truth: vitest JSON reporter, run in CI, never hand-edited
- run: pnpm -r exec vitest run --reporter=json --outputFile=vitest-report.json
- run: |
    TOTAL=$(jq -s '[.[].numTotalTests] | add' **/vitest-report.json)
    FILES=$(jq -s '[.[].testResults | length] | add' **/vitest-report.json)
    echo "{\"tests\":$TOTAL,\"files\":$FILES,\"measured\":\"$(date -I)\"}" > .github/test-count.json
```

Consumers then read from one artifact:

| Consumer | Mechanism |
|---|---|
| `README.md` | Marker substitution, exactly like `<!-- STATS_START -->` — add `<!-- TESTS_START -->` / `<!-- TESTS_END -->` |
| `apps/marketing` (Astro) | `import counts from "../../../.github/test-count.json"` at build time — Astro inlines it, zero runtime cost |
| `apps/docs` (Starlight) | Same import pattern, or omit — docs currently makes no test-count claim |
| `LAUNCH.md`, `PROJECT.md` | Marker substitution or, better, **stop citing a raw count** and link to the CI badge |

**Anti-pattern to avoid:** having the workflow that measures also be the workflow that deploys.
Keep `ci.yml` (measure + gate) separate from `deploy-*.yml`.

### Pattern 3: CI as the recurrence gate (SEC-02's real mechanism)

Because Dependabot cannot fix pnpm transitives, the only thing that reliably stops silent
re-accumulation is a **failing build**:

```yaml
# in ci.yml — runs on PR and on a weekly schedule
- name: Audit
  run: pnpm audit --audit-level=high   # non-zero exit on any high/critical
```

This is the load-bearing piece of SEC-02. `dependabot.yml` alone would have prevented none of the
242, because 217 were transitive.

### Anti-Patterns to Avoid

- **`pnpm.overrides` across major boundaries.** The repo currently forces `vite: "^7.3.2"` while
  `astro@5.18.1` declares `vite@^6.4.1`. Overrides bypass peer/range checks silently, so this
  produces a tree that installs cleanly and may fail subtly at build time. Whenever an override
  crosses a major, the correct fix is upgrading the parent.
- **Treating "fix 242 alerts" as one task.** It is 57 packages, three distinct mechanisms
  (removal, override, direct upgrade), and one major migration. A single task cannot be verified.
- **Making LAUNCH.md's "0 alerts" claim true.** 4 open CodeQL alerts are intrinsic SSRF findings in
  a URL scanner. Rewrite the claim.
- **Hand-editing a test count anywhere.** That is what produced 288/637/675/691 disagreement.
- **Running the Supabase migration without a backup.** It issues `DELETE FROM sites`.

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Pinning vulnerable transitive versions | A postinstall script rewriting `node_modules` | `pnpm.overrides` / `pnpm audit --fix` | `--fix` writes correct override entries automatically and is lockfile-aware |
| Counting tests | A `grep -c "it("` script | `vitest --reporter=json` → `numTotalTests` | Static grep gave **614**; the real runtime count is **691** — `it.each` and dynamic tests are invisible to grep. Measured in-session; this discrepancy is exactly how the docs drifted. |
| Detecting vulnerable deps in CI | Custom advisory-DB fetch | `pnpm audit --audit-level=high` | Same registry advisory data GitHub uses; local run matched the API within noise (237 vs 242) |
| Auto-merging dependency PRs | Custom GitHub App | `dependabot/fetch-metadata` + `gh pr merge --auto` | GitHub's documented pattern; needs `contents: write` + `pull-requests: write` |
| Deduping `(user_id, url)` rows | Ad-hoc DELETE in the dashboard | The window-function migration already written | It re-points `scans.site_id` *before* deleting, avoiding `ON DELETE CASCADE` data loss |
| Verifying site liveness | A bespoke uptime service | `curl -sf -o /dev/null -w "%{http_code}"` in CI | Three URLs, one job |

**Key insight:** every mechanism this phase needs already exists either in the repo
(`readme-social-proof.yml` marker pattern, `pnpm.overrides`) or in the platform. The phase's job is
to *use* them correctly and consistently, not to add machinery.

---

## SEC-03: Complete Claim Audit

Every numeric and comparative claim found across `LAUNCH.md`, `README.md`, and `apps/marketing/`.
Verdicts are measured against this repo's code and the GitHub/npm APIs as of 2026-08-15.

### FALSE — must be corrected

| # | File:line | Claim | Measured truth |
|---|---|---|---|
| 1 | `README.md:129-133` | Pillar weights **30 / 21 / 16 / 14 / 19 %** | **26 / 25 / 12 / 25 / 12 %** — computed from `PILLAR_GROUPS` × `DIMENSION_DEFS[].weightPct` in `@aeorank/core`. **All five values are wrong.** Sum is 100 in both, which is why it went unnoticed. |
| 2 | `LAUNCH.md:45` | "675 tests, 0 Dependabot / CodeQL alerts" | **691 tests**; **242 open Dependabot** + **4 open CodeQL** alerts. Both halves false. |
| 3 | `LAUNCH.md:214` | "11 framework integrations. 675 tests. 0 vulnerabilities." | 691 tests; 242 alerts. "11 integrations" — only **10 framework plugins are published to npm**; `@aeorank/wordpress` is **not published** [VERIFIED: `npm view` returns nothing]. |
| 4 | `apps/marketing/src/components/Files.astro:287` | "288 tests pin output to byte-level stability" | **691 tests**. This is live on aeorank.dev. |
| 5 | `apps/marketing/src/components/Leaderboard.astro:32` and `src/pages/scoreboard.astro:192` | "We scan the public sites of 100 funded startups **every week**" | **No such job exists.** The data is a hardcoded array literal in `scoreboard.astro`. The only scheduled scan is `demo-scan.yml`, which scans **one** site (`sumhealth.org`) daily. |
| 6 | `apps/marketing/src/components/Pricing.astro:36` | "Roughly **7–14× cheaper** than Profound, Scrunch, and Peec" | Profound's entry tier is now **$99/mo** → **3.4×** at $29. Stale since the April research. `COMPETITIVE-PARITY.md` flags this explicitly. |
| 7 | `apps/marketing/src/components/Pricing.astro:75-78` | Competitor prices: Profound **$399**, Scrunch **$250**, Otterly **$189**, Semrush **$129** | Per `COMPETITIVE-PARITY.md` (live-fetched 2026-08-15): Profound **$99** entry, Scrunch **undisclosed**, Otterly **$29** Lite. Three of four are wrong. |
| 8 | `apps/marketing/astro.config.mjs:39` | "we're just **14x cheaper** and open source" | Same as #6 — 3.4×. |
| 9 | `apps/marketing/astro.config.mjs:43` | "Pro ($29/mo) adds ... **PDF exports**. **Agency ($99/mo)** scales to 50 sites with **API access**." | **PDF export is RPT-03, not built** (Phase 22). **The public API is API-01..07, not built** (Phase 18). `apps/web/lib/stripe.ts` defines `free / pro / api / admin` — there is **no `agency` plan in code**, and `PROJECT.md` states Agency = **$499**, API = **$99**. Selling two unbuilt features under a tier name that does not exist in code. |

### MISLEADING / STALE — should be corrected

| # | File:line | Claim | Note |
|---|---|---|---|
| 10 | `README.md:56` and `apps/marketing/astro.config.mjs` | "Crawls up to **50 pages**" | `DEFAULT_CONFIG.maxPages` is **200**. 50 is only the value in the `aeorank init` **template** (`packages/cli/src/commands/init.ts:16`). Understates the product; still not traceable. |
| 11 | `README.md:78` | "**11 packages** + 2 manual guides" | 10 published framework plugins + unpublished WordPress. 12 npm packages total incl. `aeorank-cli` and `@aeorank/core`. |
| 12 | `LAUNCH.md:161` | "13 npm packages" | **12** published. |
| 13 | `README.md:22` | Badge: "monthly downloads **61**" | Live npm API returns **49** for the last month. Auto-updated weekly by `readme-social-proof.yml`, so it drifts by design — acceptable if the cadence is documented, but the number is currently stale. |
| 14 | `README.md:74` | Scrunch "$499+/mo", Semrush AI "$129+/mo" | Scrunch pricing is **undisclosed** as of the August research. |
| 15 | `README.md:50, 256`; `apps/marketing/src/components/Footer.astro:24`; `Pricing.astro:92` | "$299/mo monitoring subscription" / "$299 dashboard" | **No competitor is priced at $299.** AthenaHQ was $295 in April and now has a **free** tier. Unattributed round number. |
| 16 | `apps/marketing/src/components/FAQ.astro:26` | "Floor prices there run **$89–$295/mo**" | AthenaHQ now **free**; Otterly Lite **$29**. Floor is no longer $89. |
| 17 | `LAUNCH.md:169` | "the ChatGPT conversion stat (**15.9%** vs Google organic)" | Third-party statistic with **no citation anywhere in the repo**. Either cite the source inline or drop it — it is the kind of number an HN commenter will demand a source for. |
| 18 | `apps/marketing/src/components/Install.astro:14-15`, `LiveScan.astro:89` | Sample terminal output "`36 checks in 0.9s` / `score: 31/100`" | Illustrative, not a real scan of a named site. Fine if labelled as an example; currently presented as literal output. |

### VERIFIED — no action

| Claim | Evidence |
|---|---|
| "36 criteria across 5 pillars" | `DIMENSION_DEFS.length === 36`, `PILLAR_GROUPS.length === 5`, weights sum to exactly 100 [VERIFIED: executed against `packages/core/dist`] |
| "9 generated files" | Consistent across README, docs (14 occurrences), LAUNCH.md |
| "Free tier: 1 site, 3 scans/month" | `apps/web/lib/stripe.ts` → `free: { scansPerMonth: 3, maxSites: 1 }` |
| "Pro $29 — 5 sites, 50 scans" | `pro: { scansPerMonth: 50, maxSites: 5 }` |
| "Deterministic scoring, no model calls" | No LLM dependency in `@aeorank/core`; determinism tests exist |
| GitHub Action on Marketplace | `github.com/marketplace/actions/aeorank-aeo-scanner` → **200** |
| `vinpatel/aeorank-action@v1` | Repo exists, tags `v1.0.0` and `v1` present |
| GitHub App exists | `github.com/apps/aeorank` → **200**; backing code at `apps/web/lib/github-app.ts` (215 lines) + `app/api/github/webhooks` |
| "MIT licensed" | `LICENSE` present |

### The honest replacement for LAUNCH.md:45

The truthful post-remediation line, assuming the projected end state:

> `691 tests. Zero critical or high severity Dependabot alerts. Test count and alert status are emitted by CI — see the badges on the repo.`

Do **not** write "0 alerts" or "0 vulnerabilities". 4 CodeQL SSRF findings will remain open (they
are inherent to a scanner that fetches user-supplied URLs, and are mitigated by
`apps/web/lib/validate-url.ts::validateScanUrl`). ~~Those should be **dismissed in the GitHub UI with
a written justification** rather than left silently open — a dismissed-with-reason alert reads as
diligence to a hostile evaluator; an ignored one reads as neglect.~~

> **SUPERSEDED BY D-08 — do NOT dismiss them.** D-08 is explicit: "Do not suppress or dismiss
> the CodeQL alerts to make a copy line work." The 4 findings stay OPEN and the copy describes
> them honestly. Plan 17-09 Task 2 carries an acceptance criterion asserting the dismissed-alert
> count is unchanged before and after this phase.

---

## SEC-05: Landing the branch safely

### Branch state [VERIFIED: `git rev-list --left-right --count origin/main...HEAD`]

`fix/scan-callback-url` is **6 commits ahead, 1 commit behind** `origin/main`. The single behind
commit is `2ece4e6 chore: update social proof stats [skip ci]` — a bot commit touching `README.md`
only. Rebase or merge first; expect a trivial conflict in the `<!-- STATS_START -->` block if
SEC-04 also edits README.

Uncommitted working tree:

| Path | State | Note |
|---|---|---|
| `apps/web/vercel.json` | modified | Adds `keep-alive` cron |
| `supabase/schema.sql` | modified | Adds inline unique constraint (for **fresh** installs) |
| `supabase/migrations/0001_sites_unique_user_id_url.sql` | untracked | Fixes **existing** databases |
| `apps/web/app/api/cron/keep-alive/` | untracked | Route + 4 tests |
| `LAUNCH.md` | untracked | Contains the false claims |
| `aeorank-social-preview.png` | untracked | Duplicate of `.github/social-preview.png` (identical size, 77807 bytes) — probably should not be committed at repo root |
| `apps/docs/.astro/content-modules.mjs`, `apps/marketing/.astro/types.d.ts` | modified | Astro-generated; will churn again after the Astro bump |

### Migration review — it is correct

`schema.sql` and `migrations/0001` are **complementary, not conflicting**: `schema.sql` is the
fresh-install DDL and now declares the constraint inline; the migration retrofits an existing
database. Both converge on constraint name `sites_user_id_url_key`, and the migration is guarded by
`if not exists (select 1 from pg_constraint where conname = 'sites_user_id_url_key')`, so applying
`schema.sql` then the migration is safe in either order on a fresh DB.

**Dedupe safety is sound.** `scans.site_id` is the **only** foreign key referencing `sites`
(`references sites(id) on delete cascade`) — confirmed by grepping the full schema. The migration
`UPDATE`s `scans.site_id` to the surviving `keep_id` **before** the `DELETE`, so the cascade never
fires on live scan data. The `first_value(...) OVER (PARTITION BY user_id, url ORDER BY created_at ASC, id ASC)`
tiebreak is deterministic.

**Residual risks the plan must handle:**

1. **It deletes rows.** Take a Supabase backup / point-in-time snapshot first. Non-negotiable.
2. **Pre-flight count is unknown.** Run this first so the blast radius is known before the DELETE:
   ```sql
   select user_id, url, count(*) from sites group by 1,2 having count(*) > 1;
   ```
3. **RLS.** `sites` and `scans` have RLS enabled. Run the migration as the Supabase SQL Editor's
   privileged role (bypasses RLS), not through the anon/authenticated client.
4. **Near-duplicates are not duplicates.** `https://x.com` and `https://x.com/` are distinct `url`
   values and will both survive; the constraint will hold but the underlying UX bug persists.
   Out of scope for SEC-05 — note only.
5. **Ordering.** Apply the migration **before** deploying, or concurrently. The keep-alive route
   only issues `select ... head: true` on `sites`, so it is safe at any point; but the scan upsert
   stays broken until the constraint exists.

### Vercel cron — no blocker

`apps/web/vercel.json` will have two crons: `keep-alive` at `0 5 * * *` and `rescan` at `0 6 * * *`.
Vercel **Hobby** allows **100 cron jobs per project** with a **once-per-day** minimum interval and
±59 min scheduling precision [CITED: vercel.com/docs/cron-jobs/usage-and-pricing]. Both are daily.
**Compatible with Hobby.** The ±59 min jitter is irrelevant for a keep-alive.

**`CRON_SECRET` must be set on the Vercel project** or both routes return 500 on every invocation
and Supabase pauses anyway — which is the exact failure the keep-alive exists to prevent. The route
itself documents this. This is a user action, not a code action.

---

## SEC-06: What can and cannot be verified by an agent

### Verified in this research session (agent-checkable, re-runnable in CI)

| Target | Result |
|---|---|
| `https://aeorank.dev` | **200** |
| `https://docs.aeorank.dev` | **200** |
| `https://app.aeorank.dev` | **200** |
| `https://github.com/marketplace/actions/aeorank-aeo-scanner` | **200** |
| `https://github.com/apps/aeorank` | **200** |
| `vinpatel/aeorank-action` tags | `v1.0.0`, `v1` both present |
| `vinpatel/aeorank-docs` | exists, last pushed 2026-04-20 |
| npm packages | 12 published; `@aeorank/wordpress` **not published** |

PROJECT.md's "Deploy Status: DNS configuration pending / credentials needed / Marketplace
publication pending" is **out of date** — the public surfaces are live. PROJECT.md should be
corrected as part of SEC-03.

### CANNOT be verified by a coding agent — hand to the user

| Item | Why | What the user must do |
|---|---|---|
| Dashboard **actually works** end-to-end | Requires signing in through Clerk; a 200 on `/` only proves the Next.js app boots | Sign in, add a site, run a scan, confirm a score renders and the ZIP downloads |
| Clerk / Supabase / Stripe credentials valid in production | Server-side env vars, never exposed | Check Vercel project env vars; run one real scan |
| **`CRON_SECRET` is set** | Not readable externally | Set it in Vercel, then confirm the keep-alive cron shows a 200 in Vercel logs after its next run |
| Stripe checkout completes | Requires a real/test card and a logged-in session | Run one test-mode checkout |
| Marketplace listing renders correctly (screenshots, description, categories) | 200 ≠ well-formed listing | Visually inspect the listing page |
| **GitHub App is installable and posts a Check Run** | Requires installing the App on a test repo and opening a PR | Install on a scratch repo, open a PR, confirm the Check Run appears. **This backs a prominent README + marketing claim and is currently unproven.** |
| Supabase duplicate-row count | Requires DB credentials | Run the pre-flight `group by ... having count(*) > 1` query |
| Whether Supabase has already auto-paused | Dashboard-only signal | Check the Supabase project status |

The plan must model these as `checkpoint:human-verify` tasks. Marking SEC-06 complete on the
strength of three HTTP 200s would be exactly the kind of unverified claim this phase exists to
eliminate.

---

## Common Pitfalls

### Pitfall 1: Assuming Dependabot will fix the transitives
**What goes wrong:** A `dependabot.yml` is added, SEC-02 is marked done, and the debt re-accumulates.
**Why:** Dependabot **does not support transitive dependency updates for pnpm** [CITED: dependabot-core#13177, #23]. 217 of 242 alerts here are transitive. Additionally `dependabot_security_updates` is currently **`disabled`** on the repo, so even direct-dep security PRs were never opening.
**How to avoid:** Three separate actions — (a) `gh api -X PUT repos/vinpatel/aeorank/automated-security-fixes` to enable security updates, (b) a grouped `dependabot.yml` for direct deps, (c) **`pnpm audit --audit-level=high` as a required CI check**, which is the only one that catches transitives.
**Warning sign:** An alert count that rises while the Dependabot PR queue stays empty.

### Pitfall 2: `pnpm.overrides` that cross a major boundary
**What goes wrong:** The tree installs cleanly but breaks at build or runtime.
**Why:** Overrides bypass semver range checks entirely. This repo already does it — `vite: "^7.3.2"` is forced onto `astro@5.18.1`, which declares `vite@^6.4.1`.
**How to avoid:** When a fix requires crossing a major, upgrade the parent instead. After Astro 6 lands (which natively wants `vite@^7.3.2`), the `vite` override should be re-examined or removed.
**Warning sign:** An override whose floor exceeds the declaring package's stated range.

### Pitfall 3: Counting tests statically
**What goes wrong:** The count is wrong and drifts silently.
**Why:** Measured in-session: `grep -c` over `it(`/`test(` gives **614**; the actual runtime count is **691**. `it.each` and dynamically generated tests are invisible to grep.
**How to avoid:** `vitest --reporter=json` → `numTotalTests`, summed across packages, in CI only.
**Warning sign:** Any test count that appears in a diff authored by a human.

### Pitfall 4: Deleting a framework devDep that is load-bearing after all
**What goes wrong:** `pnpm typecheck` or `pnpm build` fails after Lever A.
**Why:** Ambient types, `tsconfig.types`, or an untyped-parameter API can depend on a package no import grep will find. `packages/11ty/src/plugin.ts` uses an untyped `eleventyConfig` and is the most likely surprise. `packages/astro` genuinely needs `astro` and must **not** be touched.
**How to avoid:** Make `pnpm install && pnpm build && pnpm typecheck && pnpm test` a hard gate on the Lever A commit. If one package fails, restore that one devDep rather than abandoning the lever.
**Warning sign:** `tsup external:` entries being mistaken for real dependencies — they are bundler directives and do not require installation.

### Pitfall 5: Running the migration without a backup
**What goes wrong:** Irrecoverable row loss.
**Why:** The migration contains `delete from sites`. It is dedupe-safe with respect to `scans` (only FK, re-pointed first), but a logic error in production data is unrecoverable without a snapshot.
**How to avoid:** Snapshot first; run the pre-flight duplicate count; then apply.

### Pitfall 6: Adding a CI workflow that gates nothing
**What goes wrong:** `ci.yml` exists, passes, and a broken PR still merges.
**Why:** `main` has **no branch protection** and **no required status checks** [VERIFIED: `gh api .../branches/main/protection` → 404 "Branch not protected"].
**How to avoid:** Enable branch protection with the CI job as a required check — otherwise SEC-02's audit gate is decorative. Note the daily bot workflows (`daily-freshness`, `demo-scan`, `readme-social-proof`) push directly to `main`; protection rules must allow them or use `[skip ci]` semantics carefully.

### Pitfall 7: Astro `.astro/` generated files churning the diff
**What goes wrong:** Review noise obscures real changes.
**Why:** `apps/docs/.astro/content-modules.mjs` and `apps/marketing/.astro/types.d.ts` are generated and currently tracked/modified. An Astro major bump regenerates them wholesale.
**How to avoid:** Regenerate and commit them in the same commit as the Astro bump, isolated from copy changes.

---

## Code Examples

### Enable Dependabot security updates (currently disabled)

```bash
# Verify current state
gh api repos/vinpatel/aeorank --jq '.security_and_analysis.dependabot_security_updates'
# -> {"status":"disabled"}

gh api -X PUT repos/vinpatel/aeorank/automated-security-fixes
gh api -X PUT repos/vinpatel/aeorank/vulnerability-alerts
```

### `dependabot.yml` — grouped, solo-maintainer-friendly

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"        # pnpm uses the "npm" ecosystem value
    directory: "/"                  # single root lockfile — do NOT split by workspace directory
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5     # security updates do NOT count toward this limit
    groups:
      production-patch-minor:
        dependency-type: "production"
        update-types: ["patch", "minor"]
      development-all:
        dependency-type: "development"
        update-types: ["patch", "minor", "major"]
    # Majors on production deps stay ungrouped so each gets its own reviewable PR

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    groups:
      actions:
        patterns: ["*"]
```

[CITED: docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference]

**Critical detail:** use a **single `directory: "/"`** entry. Splitting by workspace directory is a
documented failure mode for pnpm workspaces — Dependabot updates the per-directory `package.json`
but leaves the shared root `pnpm-lock.yaml` untouched, leaving the workspace inconsistent and
breaking CI installs [CITED: dependabot-core#11135].

### Optional auto-merge (requires `allow_auto_merge` — currently `false`)

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot auto-merge
on: pull_request
permissions:
  contents: write
  pull-requests: write
jobs:
  automerge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: dependabot/fetch-metadata@d7267f607e9d3fb96fc2fbe83e0af444713e90b7
        id: meta
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - if: steps.meta.outputs.update-type != 'version-update:semver-major'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Requires `gh api -X PATCH repos/vinpatel/aeorank -f allow_auto_merge=true` first, and branch
protection with the CI check required — otherwise auto-merge lands unverified changes.

### The missing `ci.yml`

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '0 9 * * 1'   # weekly audit sweep — catches transitive drift

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with: { version: 10.32.1 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm typecheck
      - run: pnpm test
      - name: Security audit gate
        run: pnpm audit --audit-level=high
```

### Measuring the authoritative test count (the exact method used in this research)

```bash
for d in packages/11ty packages/astro packages/cli packages/core packages/docusaurus \
         packages/gatsby packages/next packages/nuxt packages/remix packages/shopify \
         packages/sveltekit packages/vitepress apps/web; do
  (cd "$d" && npx vitest run --reporter=json --outputFile="/tmp/vt-$(basename $d).json")
done
jq -s '{tests: ([.[].numTotalTests] | add), files: ([.[].testResults | length] | add)}' /tmp/vt-*.json
# => { "tests": 691, "files": 39 }
```

Note `packages/config` has a stub test script (`echo 'Phase 2 stub'`) and `packages/wordpress`,
`apps/docs`, `apps/marketing` have none — a naive `pnpm -r exec vitest` fails on `packages/config`.

---

## Measured Baseline (the numbers the plan should assert against)

Every value measured 2026-08-15 in this session.

| Metric | Value | How measured |
|---|---|---|
| **Tests** | **691**, 0 failing | vitest JSON reporter across 13 packages |
| **Test files** | **39** | `testResults` length, summed |
| Static `it(`/`test(` count | 614 | `grep -c` — **do not use**, undercounts by 77 |
| Open Dependabot alerts | 242 (7C / 101H / 108M / 26L) | `gh api .../dependabot/alerts?state=open --paginate` |
| Unique vulnerable packages | 57 | `jq unique` on package names |
| Alerts on root lockfile (transitive) | 217 (90%) | `manifest_path` grouping |
| Alerts with no patch available | 7 | `first_patched_version == null` |
| Open CodeQL alerts | 4, all `js/request-forgery`, severity `error` | `gh api .../code-scanning/alerts?state=open` |
| Local `pnpm audit` | 8C / 103H / 106M / 20L, 58 modules | `pnpm audit --json` |
| Published npm packages | 12 (`@aeorank/wordpress` absent) | `npm view` per package |
| npm downloads, last month | 49 | `api.npmjs.org/downloads/point/last-month/aeorank-cli` |
| Repo stars / forks / open issues | 12 / 2 / 6 | `gh api repos/vinpatel/aeorank` |
| Dimensions / pillars / weight sum | 36 / 5 / exactly 100% | executed against `packages/core/dist` |
| Actual pillar weights | 26 / 25 / 12 / 25 / 12 | `PILLAR_GROUPS` × `weightPct` |
| `DEFAULT_CONFIG.maxPages` | 200 | `packages/core/src/constants.ts:191` |
| Branch divergence | 6 ahead / 1 behind `origin/main` | `git rev-list --left-right --count` |
| Workflows present | 7 (0 run tests) | `ls .github/workflows/` |
| `main` branch protection | **none** | `gh api .../branches/main/protection` → 404 |
| `dependabot_security_updates` | **disabled** | `gh api repos/vinpatel/aeorank` |
| `allow_auto_merge` | **false** | `gh api repos/vinpatel/aeorank` |
| CodeQL default setup | configured, weekly, `remote` threat model | `gh api .../code-scanning/default-setup` |

---

## State of the Art

| Old approach | Current approach | When changed | Impact here |
|---|---|---|---|
| Dependabot handles all dep updates | Dependabot cannot update pnpm transitives; `pnpm.overrides` is the supported workaround | ongoing, open issue dependabot-core#13177 | SEC-02 must include a CI audit gate, not just `dependabot.yml` |
| Dependabot per-directory config for monorepos | Single root `directory: "/"` for pnpm workspaces; `group-by: dependency-name` for multi-directory | 2025 pnpm workspace catalog GA | Prevents the "root lockfile not updated" failure |
| CodeQL via a committed workflow file | CodeQL **default setup** (no workflow file) | GA 2023 | Already enabled here — do not add a `codeql.yml`, it would duplicate |
| Astro 5 + `astro:build:done({ routes })` | Astro 6 removes `routes` from that hook; `astro:routes:resolved` replaces it | Astro 6 | `packages/astro` only uses `{ dir }` — unaffected |
| Astro legacy content collections | Content Layer API mandatory in Astro 6 | Astro 6 | Already migrated (`content.config.ts`) — no work |

**Deprecated / outdated in this repo:**
- `pnpm.overrides` entries for `liquidjs`, `brace-expansion`, `esbuild` — floors are below the currently-required patched versions.
- `vite: "^7.3.2"` override — conflicts with Astro 5's declared `vite@^6.4.1`; becomes redundant once Astro 6 lands.
- `PROJECT.md` "Deploy Status" block — all three targets are live; text says pending.
- `PROJECT.md:43` "637 tests", `PROJECT.md:37-38` "288 core tests / 77 CLI tests" — core is now 292, CLI 77 (CLI correct), total 691.

---

## Validation Architecture

`workflow.nyquist_validation` is absent from `.planning/config.json` → treated as **enabled**.

### Test Framework

| Property | Value |
|---|---|
| Framework | Vitest 3.2.4 (needs ≥3.2.6 for the critical) |
| Config file | Per-package; root orchestration via `turbo.json` `test` task (`dependsOn: ["build"]`) |
| Quick run command | `pnpm --filter <pkg> test` |
| Full suite command | `pnpm test` (turbo) — **note `packages/config` has a stub script and will pass trivially** |
| Authoritative count command | `vitest run --reporter=json --outputFile=...` per package, summed |

### Phase Requirements → Test Map

| Req | Behavior | Test type | Automated command | Exists? |
|---|---|---|---|---|
| SEC-01 | Zero critical + high Dependabot alerts | integration (API) | `gh api "repos/vinpatel/aeorank/dependabot/alerts?state=open" --paginate --jq '[.[].security_advisory.severity]\|map(select(.=="critical" or .=="high"))\|length'` → `0` | ❌ Wave 0 |
| SEC-01 | Local audit clean at high | smoke | `pnpm audit --audit-level=high` (exit 0) | ❌ Wave 0 |
| SEC-01 | Removing devDeps breaks nothing | unit+build | `pnpm install && pnpm build && pnpm typecheck && pnpm test` | ✅ (tests exist; no CI runs them) |
| SEC-02 | Audit gate fails CI on a high alert | integration | CI job `pnpm audit --audit-level=high` present and required | ❌ Wave 0 |
| SEC-02 | `dependabot.yml` is valid | smoke | file exists + `gh api repos/.../dependabot/alerts` reachable; validate YAML schema | ❌ Wave 0 |
| SEC-03 | No stale numeric claims | integration | drift check: grep README/LAUNCH/marketing for a test-count literal not equal to `.github/test-count.json` | ❌ Wave 0 |
| SEC-03 | Pillar weights in README match code | unit | assert README table values against `PILLAR_GROUPS` × `weightPct` | ❌ Wave 0 |
| SEC-04 | CI emits one count | integration | `.github/test-count.json` exists and `.tests` matches a fresh vitest run | ❌ Wave 0 |
| SEC-04 | Every doc reads from that source | integration | grep for hardcoded 3-digit `\d+ tests` outside the generated block → 0 hits | ❌ Wave 0 |
| SEC-05 | keep-alive route behaves | unit | `pnpm --filter @aeorank/web test` — **4 tests already written** at `apps/web/app/api/cron/keep-alive/route.test.ts` | ✅ |
| SEC-05 | Migration is idempotent | manual-only | Re-running must not error (guarded by `pg_constraint` check). Requires a DB. | manual |
| SEC-05 | Branch merged | smoke | `git merge-base --is-ancestor HEAD origin/main` | ❌ Wave 0 |
| SEC-06 | Public surfaces live | smoke | `for u in https://aeorank.dev https://docs.aeorank.dev https://app.aeorank.dev; do curl -sf -o /dev/null -w "%{http_code}" "$u"; done` | ❌ Wave 0 |
| SEC-06 | Dashboard auth + scan works | manual-only | Requires Clerk login — **cannot be automated** | manual |
| SEC-06 | GitHub App posts a Check Run | manual-only | Requires installing the App on a test repo | manual |

### Sampling Rate

- **Per task commit:** `pnpm --filter <changed-pkg> test` (seconds)
- **Per wave merge:** `pnpm install --frozen-lockfile && pnpm lint && pnpm build && pnpm typecheck && pnpm test && pnpm audit --audit-level=high`
- **Phase gate:** full suite green **and** `gh api` alert query returns 0 crit + 0 high **and** all `checkpoint:human-verify` items signed off

### Wave 0 Gaps

- [ ] `.github/workflows/ci.yml` — **does not exist**; blocks SEC-02 and SEC-04. Highest-priority Wave 0 item.
- [ ] `.github/dependabot.yml` — does not exist (SEC-02)
- [ ] `.github/test-count.json` (or equivalent artifact) — the SEC-04 single source
- [ ] `<!-- TESTS_START -->` / `<!-- TESTS_END -->` markers in `README.md`
- [ ] Claim-drift check script (SEC-03/SEC-04 regression guard)
- [ ] Branch protection on `main` with CI as a required check — without it the audit gate is decorative
- [ ] Vitest bump to ≥3.2.6 (root + 12 package devDeps) — clears the last critical

*Framework install: not needed — Vitest is present in all 13 testing packages.*

---

## Security Domain

`security_enforcement` is absent from `.planning/config.json` → treated as **enabled**.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard control in this phase |
|---|---|---|
| V1 Architecture / SDLC | **yes** | This phase *is* the control: dependency management cadence, CI gating, SAST already on |
| V2 Authentication | no (unchanged) | Clerk; not modified here |
| V3 Session Management | no | Clerk; not modified |
| V4 Access Control | **yes** | The cron routes authenticate via `Authorization: Bearer $CRON_SECRET` — constant-string compare. Supabase RLS unchanged by the migration. |
| V5 Input Validation | **yes** | `apps/web/lib/validate-url.ts::validateScanUrl` is the existing SSRF control and is the mitigation cited when ~~dismissing~~ **describing** the 4 CodeQL alerts (D-08: they are not dismissed) |
| V6 Cryptography | no | No crypto changes |
| V14 Configuration | **yes** | `dependabot_security_updates` disabled, `main` unprotected, `allow_auto_merge` false — all configuration-tier defects |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation | State here |
|---|---|---|---|
| Vulnerable dependency (supply chain) | Tampering / EoP | Version pinning + CI audit gate | **The subject of SEC-01/02** |
| SSRF via user-supplied scan URL | Information Disclosure | Allowlist / block private IP ranges | `validateScanUrl()` exists, 12 tests; **CodeQL still flags 4 sites** — ~~dismiss with justification, or~~ add an explicit sanitizer annotation, or leave open and describe honestly. **D-08 forbids dismissal.** |
| Unauthenticated cron invocation | Spoofing | Shared secret in `Authorization` | Implemented; **fails closed** (500) when `CRON_SECRET` is unset — good design |
| Unauthenticated QStash callback | Spoofing | Signature verification | Pre-existing (`/api/scan/process` uses service-role client); **not in scope**, note only |
| Malicious dependency via auto-merge | Tampering | Never auto-merge majors; require CI | Addressed by the proposed auto-merge conditional |
| Secret exposure in bot workflows | Information Disclosure | Least-privilege `permissions:` | `daily-freshness.yml` and `demo-scan.yml` use `contents: write` and push to `main` — acceptable but they would bypass branch protection; plan accordingly |

**Note on the 4 CodeQL alerts:** `packages/core/src/scanner/fetcher.ts:82` and
`apps/web/lib/github-app.ts:{85,173,203}`. The core one is *inherent* — a URL scanner fetches
user-supplied URLs by definition. The three in `github-app.ts` construct GitHub API URLs from
installation/repo identifiers and are lower risk but should be reviewed for path-traversal in the
repo/owner segments. ~~Recommended disposition: **fix or annotate `github-app.ts`; dismiss
`fetcher.ts` as "used in tests"/"false positive" with a written justification pointing at
`validateScanUrl`.**~~ **SUPERSEDED BY D-08:** nothing is dismissed. The alerts stay open;
annotating or fixing `github-app.ts` remains available but is out of Phase 17 scope, and
LAUNCH.md describes the residual findings truthfully (plan 17-09 Task 2).

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| `pnpm` | All dependency work | ✓ | 10.32.1 (via corepack) | — |
| `node` | Build/test | ✓ | v25.3.0 local; CI uses 22 | — |
| `gh` CLI, authenticated | SEC-01 verification, SEC-02 settings, SEC-06 | ✓ | authenticated; Dependabot + code-scanning + repo-admin scopes all working | — |
| `jq` | Alert/JSON analysis | ✓ | — | — |
| `curl` | SEC-06 liveness | ✓ | — | — |
| `npm` registry access | Version verification | ✓ | — | — |
| Installed `node_modules` | `pnpm why` reachability analysis | ✓ | 2864 packages | must `pnpm install` after any manifest edit |
| `timeout` (GNU) | — | ✗ | macOS lacks it | use `gtimeout` or omit |
| Supabase DB credentials | Migration pre-flight + apply | ✗ | — | **No fallback — user must run it** |
| Vercel dashboard access | `CRON_SECRET`, deploy verification | ✗ | — | **No fallback — user only** |
| Clerk/Stripe test accounts | Dashboard end-to-end verification | ✗ | — | **No fallback — user only** |
| `slopcheck` | Package legitimacy | not installed | — | N/A — no new packages installed this phase |

**Missing dependencies with no fallback (must be user tasks):** Supabase credentials, Vercel
project access, Clerk/Stripe accounts, a scratch repo for GitHub App verification.

**Missing with fallback:** `timeout` → omit or use `gtimeout`.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | Removing the 9 framework devDeps will not break `pnpm typecheck` / `pnpm build` | Lever A | Medium. Import grep found no framework imports and `tsup external:` entries do not require installation — but ambient types could exist. **Mitigated by making build+typecheck+test a hard gate on that commit.** Recovery is restoring one devDep. |
| A2 | Removing `nuxt` while keeping `@nuxt/kit` clears the `seroval`/`tar`/`@nuxt/devtools` alerts | Lever A | Low-Medium. `pnpm why` shows all three route through `nuxt` (via `@nuxt/vite-builder`, `nitropack`, directly), and `@nuxt/kit` is a far smaller tree — but `@nuxt/kit`'s own tree was not exhaustively walked. Verify with a post-removal `pnpm audit`. |
| A3 | Bumping a package to its patched floor closes *all* that package's alerts, incl. medium/low | Projected end state | Low. Used to derive the "4 residual alerts" projection. If some alerts have higher floors than the crit/high ones, the residual is larger. Does not affect SEC-01 (crit+high only). |
| A4 | ~~Astro 6.4.8 + Starlight 0.40.0~~ **Astro 7.2.2 + Starlight 0.41.7 (D-03)** build cleanly for `apps/docs` and `apps/marketing` | Astro upgrade | **High.** Peer ranges verified; actual migration not attempted. Needs its own plan and a human checkpoint. |
| A5 | `apps/marketing`/`apps/docs` contain no `<ViewTransitions />`, `Astro.glob()`, or other Astro-6-removed APIs | Astro upgrade | Medium. Content collections and config format were verified clean; the full removed-API surface was not grepped exhaustively. |
| A6 | Raising `engines.node` for Astro 6 is acceptable | Astro upgrade | Medium. `PROJECT.md` states "CLI runtime: Node.js 20+". Astro 6 needs 22.12+. The CLI does not depend on Astro, so the floors can diverge per-package — but the root `engines` field currently says `>=20`. **User decision.** |
| A7 | Vercel project is on the Hobby plan | Cron limits | Low. Both crons are daily, which is valid on every plan. Only matters if sub-daily scheduling is ever wanted. |
| A8 | The Supabase `sites` table contains duplicate `(user_id,url)` rows | Migration | Low impact. The migration is a no-op on the dedupe step if none exist. The pre-flight query resolves it. |
| A9 | Competitor pricing in `COMPETITIVE-PARITY.md` (2026-08-15) is accurate | Claim audit #6, #7, #16 | Medium. That doc claims live-fetched pricing but I did not re-verify competitor sites this session. The safest correction is to **remove specific competitor price numbers** rather than replace them with new ones that will also go stale. |
| A10 | The 4 CodeQL SSRF alerts are acceptable ~~and-dismissible~~ rather than real bugs | Security domain | Medium. `fetcher.ts` is inherent; the three in `github-app.ts` were not code-reviewed line by line. **D-08 overrules the "dismissible" half: they are NOT to be dismissed.** They stay open and are described honestly in LAUNCH.md. |
| A11 | `@aeorank/wordpress` is intentionally unpublished | Claim audit #3, #11 | Low. It has no `package.json` scripts or deps. Could be intentional (manual-guide-only) or an oversight. **User confirmation needed** before rewording "11 plugins". |

---

## Open Questions - ALL RESOLVED

> **RESOLVED 2026-08-15 by `17-CONTEXT.md`.** All seven questions below were answered by the
> user after this research returned. Each is annotated with the decision that closes it. Nothing
> in this section is still open; do not treat any recommendation here as live guidance.

1. **Astro 6 or Astro 7?** -> **RESOLVED by D-03: Astro 7.2.2.**
   - Known: 5.18.1 has 8 high alerts with no 5.x patch. 6.4.8 clears them (Starlight 0.40.0). 7.2.2 is current (Starlight 0.41.7). Both are majors.
   - ~~Recommendation: **Astro 6.4.8**~~ - overruled. The user chose **7.2.2** for the longer
     runway, with the constraint that the migration be its own separately-gated, individually
     revertible commit. Executed by plan 17-08.

2. **What is the canonical pricing and tier naming?** -> **RESOLVED by D-01: PROJECT.md is canonical.**
   - The canonical tier set is **Free / Pro $29 / API $99 / Agency $499**. The `admin` tier in
     code is internal and must never be presented as sellable. Executed by plan 17-06 (marketing)
     and plan 17-09 (README / LAUNCH.md / PROJECT.md).

3. **Do Pro and Agency currently advertise unbuilt features?** -> **RESOLVED by D-02: label, do not remove.**
   - PDF export (Phase 22) and REST API (Phase 18) stay on the page but are marked as roadmap /
     "coming soon" with a visible indicator. They must not look purchasable today. Executed by
     plan 17-06 Task 1.

4. **Should the scoreboard claim be fixed or the scoreboard be automated?** -> **RESOLVED: fix the copy.**
   - CONTEXT `<specifics>` says "either make it true or make the copy true"; automating the board
     is DEF-03 in Phase 25, out of scope here. Option (a) adopted: replace "every week" with a
     rendered "last measured DATE" backed by a constant beside the data. Executed by plan
     17-07 Task 2.

5. **Should `main` get branch protection this phase?** -> **RESOLVED by D-04: yes, with bot exemption.**
   - Protect `main`, require the new status checks, and exempt the three existing bot workflows
     that push directly. D-04 exempts BOTS only - not the maintainer. Executed by plan 17-10,
     which gates ruleset creation behind a blocking human checkpoint.

6. **Literal zero alerts, or zero critical+high?** -> **RESOLVED by D-08: zero critical+high, and nothing is dismissed.**
   - ~~Recommendation: go to literal zero if it is cheap... the 7 no-patch advisories **must be
     dismissed with reasons** instead.~~ Overruled. SEC-01 requires zero critical and high only.
     Residual medium and low alerts are explicitly acceptable and are a Deferred Idea in CONTEXT.
     The 4 CodeQL SSRF findings stay OPEN - D-08 forbids suppressing or dismissing anything to
     make a copy line work. LAUNCH.md is rewritten to state something true instead (plan 17-09).

7. **Is `@aeorank/wordpress` meant to be published?** -> **RESOLVED by D-10 + Claude's discretion: reword, do not publish.**
   - Publishing is listed as a Deferred Idea in CONTEXT. Plan 17-04 Task 1 records the decision to
     REWORD: every plugin/package count must name the surface it describes - 11 plugin packages in
     the repo, 10 published to npm - using the count that `scripts/verify-deploys.sh` measures.
     Consumed by plans 17-06 and 17-09.

---

## Sources

### Primary (HIGH confidence — measured in-session)
- `gh api repos/vinpatel/aeorank/dependabot/alerts?state=open --paginate` — 242 records, full severity/package/manifest/patched-version analysis
- `gh api repos/vinpatel/aeorank/code-scanning/alerts?state=open` — 4 records
- `gh api repos/vinpatel/aeorank/code-scanning/default-setup` — configured, weekly, `remote`
- `gh api repos/vinpatel/aeorank` — `dependabot_security_updates: disabled`, `allow_auto_merge: false`
- `gh api repos/vinpatel/aeorank/branches/main/protection` — 404, not protected
- `pnpm why <pkg> -r --depth 8` across all 57 vulnerable packages — dependency-path attribution
- `vitest run --reporter=json` across 13 packages — **691 tests / 39 files / 0 failures**
- `pnpm audit --json` — 8C/103H/106M/20L, 58 modules
- `node -e` against `packages/core/dist` — 36 dimensions, 5 pillars, weights 26/25/12/25/12, `maxPages: 200`
- `npm view <pkg> version` / `peerDependencies` — Astro/Starlight/Next/Clerk/vite compatibility matrix
- `curl -o /dev/null -w "%{http_code}"` — aeorank.dev, docs., app., Marketplace, GitHub App all 200
- Source reads: all 7 workflow files, all 17 workspace `package.json`, `supabase/schema.sql`, the migration, `apps/web/lib/{stripe,plan}.ts`, `packages/astro/src/index.ts`, all plugin `src/` import surfaces

### Secondary (MEDIUM-HIGH — official documentation)
- https://docs.astro.build/en/guides/upgrade-to/v6/ — Astro 6 breaking changes
- https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference — `groups`, `open-pull-requests-limit`, `cooldown`, schedule intervals
- https://docs.github.com/en/code-security/dependabot/ecosystems-supported-by-dependabot/supported-ecosystems-and-repositories — pnpm v7–v10 supported under `package-ecosystem: "npm"`
- https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions — auto-merge pattern
- https://vercel.com/docs/cron-jobs/usage-and-pricing — Hobby: 100 crons, once-per-day, ±59 min

### Tertiary (MEDIUM — corroborated community/issue sources)
- https://github.com/dependabot/dependabot-core/issues/13177 — pnpm transitive dependency updates unsupported
- https://github.com/dependabot/dependabot-core/issues/11135 — root `pnpm-lock.yaml` not updated when splitting by `directory`
- https://github.blog/changelog/2025-02-04-dependabot-now-supports-pnpm-workspace-catalogs-ga/ — pnpm workspace catalog GA
- https://blog.logto.io/pnpm-upgrade-transitive-dependencies — `pnpm.overrides` as the standard transitive-pin workaround
- https://www.thecandidstartup.org/2026/04/13/pnpm-update-transitive-dependency.html — same pattern

### Repo documents consulted
`.planning/COMPETITIVE-PARITY.md` §4, `.planning/PROJECT.md`, `.planning/MILESTONES.md`,
`.planning/workstreams/milestone/{REQUIREMENTS,ROADMAP,STATE}.md`, `.planning/growth/DIAGNOSIS.md`,
`LAUNCH.md`, `README.md`, `CONTRIBUTING.md`

---

## Metadata

**Confidence breakdown:**
- Alert decomposition & remediation path — **HIGH**. Every number measured; dependency paths traced with `pnpm why`; the devDep-removal finding verified by exhaustive import grep across all plugin sources.
- Test count & CI gap — **HIGH**. Suite executed; workflow directory enumerated; branch protection queried.
- Claim audit — **HIGH** for code-verifiable claims (pillar weights, plan limits, package counts, test counts — all executed against source). **MEDIUM** for competitor-pricing claims, which inherit `COMPETITIVE-PARITY.md`'s freshness rather than being independently re-verified.
- SEC-05 migration safety — **HIGH** on the SQL logic (reviewed line by line against the full schema; `scans` confirmed as the only FK). **UNKNOWN** on production data shape — no DB access.
- SEC-06 — **HIGH** for public surfaces (all curled). **N/A** for credential-gated surfaces, which are explicitly enumerated as user tasks.
- Astro 6 migration — **MEDIUM**. Peer-dependency matrix verified against npm; breaking-change list from official docs; actual migration not attempted. This is the phase's main residual risk.

**Research date:** 2026-08-15
**Valid until:** 2026-08-29 (14 days). Dependabot alert counts drift daily as new advisories publish; re-run the `gh api` alert query at plan time and treat the 242 baseline as a snapshot, not a constant.
