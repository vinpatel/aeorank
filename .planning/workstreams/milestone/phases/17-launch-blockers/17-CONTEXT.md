# Phase 17: Launch Blockers - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning
**Source:** Decisions captured directly from the user after 17-RESEARCH.md returned

<domain>
## Phase Boundary

Phase 17 makes the repository survive inspection by a hostile technical evaluator on
launch day. It is a cleanup and hardening phase, not a feature phase.

**In scope:** dependency alert remediation, recurrence prevention, a real CI test gate,
correcting every false published claim, landing the outstanding branch, and confirming
deploy targets.

**Out of scope:** any Tier 1 parity feature (those are Phases 18-25). Do not build the
public API, MCP server, crawler analytics, alerts, exports, integrations, geo support, or
edge middleware here — even where marketing copy references them.
</domain>

<decisions>
## Implementation Decisions

### D-01 — Pricing: PROJECT.md is canonical
Three sources disagreed. The canonical tier set is **Free / Pro $29 / API $99 /
Agency $499**, as stated in PROJECT.md. Reconcile `apps/marketing` pricing copy and
`apps/web/lib/plan.ts` tier names to match this. Do not invent new tiers or prices.
The `admin` tier in code is internal and must not be presented as sellable.

### D-02 — Unbuilt features are labelled, not removed
`apps/marketing` currently sells PDF exports and API access. Both are unbuilt until
Phases 22 and 18. Mark both as roadmap / "coming soon" with a visible indicator. Keep
them on the page — do not delete them, and do not leave them looking purchasable today.

### D-03 — Astro target is 7.2.2
Bump to **Astro 7.2.2**, not 6.4.8. This is a two-major jump and is the highest-risk
item in the phase; the user chose it deliberately for the longer runway. It affects
`apps/marketing`, `apps/docs`, and `packages/astro`.
**Constraint:** the Astro migration MUST be its own separately-gated commit, isolated
from the other two alert levers, so it can be reverted alone if the peer matrix breaks.
Verify Starlight and every Astro integration peer range against 7.2.2 before starting.

### D-04 — Branch protection on main, with bot exemption
Protect `main` and require the new status checks (test suite, `pnpm audit`) to pass.
**Exempt the three existing bot workflows** that push directly to main (daily scan
update, badge refresh, readme social proof) so they keep working without conversion to
PRs.

### D-05 — Alert remediation is three separate mechanisms, never one task
Per research, plan SEC-01 as three independently-gated commits so the alert delta is
attributable and a bad lever is revertible in isolation:
  1. **Removal** — delete **11** unused framework `devDependency` names across **8**
     packages: `@11ty/eleventy`, `@docusaurus/types`, `gatsby`, `next`, `nuxt`,
     `@remix-run/node`, `@remix-run/react`, `@sveltejs/kit`, `svelte`, `vitepress`,
     `vue`. Expected: -108 alerts including 6 of 7 criticals.
     *(Corrected 2026-08-15: this decision originally said "9", inherited from
     RESEARCH.md. Verified against all 8 manifests — the count is 11 names.
     The plans and the commit message use 11.)*
     Do NOT remove `packages/astro` (`import type { AstroIntegration }`) or
     `packages/nuxt` (`@nuxt/kit`, `h3`) — those imports are real.
  2. **Overrides / patch bumps** — ~17 packages via `pnpm.overrides`.
  3. **Astro major migration** — see D-03.
Measure and report the alert count after each lever independently.

### D-06 — SEC-02 requires a CI audit gate, not just dependabot.yml
Dependabot **cannot update transitive dependencies for pnpm**, and 90% of alerts are on
the root lockfile. A `dependabot.yml` alone prevents nothing. SEC-02 must include a
`pnpm audit --audit-level=high` CI gate. Also enable `dependabot_security_updates` on
the repo, which is currently disabled.

### D-07 — Test count comes from the vitest JSON reporter, never grep
The authoritative measured number is **691 tests across 39 files, 0 failures**. Static
`grep` yields 614 and is how the drift started — do not use it. Build the CI workflow
that runs the suite (none currently exists) and emit the count from the vitest JSON
reporter. Feed every doc and badge from that single source, following the existing
`readme-social-proof.yml` marker pattern rather than inventing a second mechanism.

### D-08 — LAUNCH.md's "0 alerts" line is rewritten, not achieved
4 CodeQL SSRF alerts are intrinsic to a URL scanner and will not be driven to zero.
SEC-01 only requires zero *critical and high*. Rewrite the claim to state something
true and specific. Do not suppress or dismiss the CodeQL alerts to make a copy line
work.

### D-09 — Correct the pillar weights everywhere
Published weights (30/21/16/14/19) do not match `packages/core/src/constants.ts`
(**26/25/12/25/12**). Both sum to 100, which is why this went unnoticed. Correct every
published location. Derive from `DIMENSION_DEFS` / `PILLAR_GROUPS`, do not hand-copy.

### D-10 — "11 framework plugins" must be qualified
11 plugins exist in the repo; only **10 are published to npm** — `@aeorank/wordpress`
returns 404. Any claim must be true of whichever surface it describes. Either publish
wordpress or word the claim to match reality.

### D-11 — SEC-06 is mostly already satisfied
All three domains, the Marketplace listing, and the GitHub App page return 200, and
`aeorank-action` has its `v1` tag. Verify rather than rebuild. Anything genuinely
credential-gated must be emitted as an explicit user-action checklist, not attempted.

### Claude's Discretion
- Exact `pnpm.overrides` version pins (research supplies minimum-safe versions)
- CI workflow file layout and job naming
- Wording of corrected marketing and README copy, provided every number is measured
- Whether to publish `@aeorank/wordpress` or reword the claim (D-10)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase inputs
- `.planning/workstreams/milestone/phases/17-launch-blockers/17-RESEARCH.md` — per-package
  remediation table, exact `pnpm --filter ... remove` commands, minimum-safe versions,
  full claim audit with file:line
- `.planning/workstreams/milestone/REQUIREMENTS.md` — SEC-01..SEC-06 definitions
- `.planning/workstreams/milestone/ROADMAP.md` — Phase 17 goal and success criteria

### Sources of truth for claims
- `packages/core/src/constants.ts` — `DIMENSION_DEFS`, `PILLAR_GROUPS`; the only
  authority on pillar weights and criteria count
- `apps/web/lib/plan.ts` — plan tier enforcement
- `.planning/PROJECT.md` — canonical pricing (D-01)
- `.planning/COMPETITIVE-PARITY.md` — competitor pricing claims, measured 2026-08-15

### Files carrying false claims
- `LAUNCH.md` — "675 tests, 0 Dependabot / CodeQL alerts"
- `README.md` — pillar weights, test count, plugin count; `<!-- STATS_START -->` markers
- `apps/marketing/` — pillar weights, unbuilt features, pricing, scoreboard claim
</canonical_refs>

<specifics>
## Specific Ideas

- Alert count must be measured and reported after each of the three levers separately
  (D-05), so the plan should include explicit measurement steps, not just fix steps.
- The marketing line claiming the scoreboard scans 100 funded startups "every week" is
  backed by a hardcoded array. Either make it true or make the copy true.
- `main` currently has no required checks at all; the test workflow being created in
  this phase is the first one that can be required.
</specifics>

<deferred>
## Deferred Ideas

- Publishing `@aeorank/wordpress` to npm — only if it is the chosen resolution to D-10
- Driving CodeQL SSRF alerts to zero — intrinsic to a URL scanner, see D-08
- Building the API, PDF export, or any other feature referenced by marketing copy —
  Phases 18 and 22
- Medium and low severity Dependabot alerts beyond what the three levers clear —
  SEC-01 requires zero critical and high only
- **Repo-wide biome cleanup** — after plan 17-03 Task 1 scopes `biome.json` to real source,
  roughly **MEASURE-IN-17-03** real lint errors remain in real source files (measured
  2026-08-15: 364 across ~251 files — 116 `noNonNullAssertion`, 98 `format`, 78
  `organizeImports`, 18 `noSvgWithoutTitle`, 11 `noUnusedTemplateLiteral`, 10 `useLiteralKeys`,
  9 `noExplicitAny`, 24 assorted; 176 of them safe-autofixable). Plan 17-03 Task 1 records the
  decision that the CI `verify` job does NOT run `pnpm lint` and that plan 17-10 does NOT make
  `lint` a required check, because a required check with hundreds of known failures would make
  the repository permanently unmergeable. This is quantified, de-gated debt — NOT a silent
  omission. It is also tracked outside this phase folder, in `ROADMAP.md` under
  `### Tracked Debt (v3.0)`, so it survives the phase closing. Plan 17-03 Task 1 must replace
  the `MEASURE-IN-17-03` placeholder in both places with the number it actually measures.
</deferred>

---

*Phase: 17-launch-blockers*
*Context gathered: 2026-08-15 — decisions captured directly from user post-research*
