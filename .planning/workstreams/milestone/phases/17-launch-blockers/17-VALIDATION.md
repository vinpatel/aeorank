---
phase: 17
slug: 17-launch-blockers
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-15
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `17-RESEARCH.md` § Validation Architecture, then corrected against the repo
> state measured 2026-08-15. Where research and measurement disagree, measurement wins.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 in all 13 testing packages (needs ≥3.2.6 for the last critical — raised by plan 17-05) |
| **Config file** | Per-package; root orchestration via `turbo.json`. The `test` task has `dependsOn: ["build"]`; `typecheck` has `dependsOn: ["^build"]` |
| **Quick run command** | `pnpm --filter <pkg> test` |
| **Full suite command** | `pnpm test` |
| **Authoritative count command** | `node scripts/measure-tests.mjs` (created by plan 17-03; wraps `vitest run --reporter=json --outputFile=…` per package and sums `numTotalTests`) |
| **Estimated runtime** | `pnpm test` measured at **5.8 s** with a warm turbo cache (30/30 tasks, 16 cached, 2026-08-15). Cold-cache runtime is longer and unmeasured. `pnpm typecheck` ~3 s warm. `pnpm build` ~13 s warm. |

**Caveat carried from research:** `packages/config` has a stub test script (`echo 'Phase 2 stub'`)
and passes trivially; `packages/wordpress`, `apps/docs`, and `apps/marketing` have no test script
at all. `pnpm test` succeeding does NOT mean all 17 packages ran a suite. `measure-tests.mjs`
therefore iterates an explicit 13-package list rather than globbing the workspace.

---

## Measured Gate Baseline (2026-08-15, before any plan executes)

This is the single most important table in this document. Three of the four repo-level gates
were assumed green during planning and only one of those assumptions held.

| Command | Exit | Detail |
|---|---|---|
| `pnpm build` | **0** | 30/30 turbo tasks |
| `pnpm test` | **0** | 30/30 turbo tasks |
| `pnpm typecheck` | **2 — FAILING** | 3 packages, 40 errors: `@aeorank/nuxt` (2 — undeclared `h3`), `@aeorank/next` (4 — test-side generic inference), `aeorank-cli` (34 — no `@types/node`, plus one real narrowing defect) |
| `pnpm lint` | **1 — FAILING** | 5685 errors; 5321 of them (93.6%) from `.astro`/`.next`/`.vercel`/`.planning` generated and planning trees that `biome.json` does not ignore. Residual after scoping: **364 real errors in real source** |

Consequences already absorbed into the plans:

- **Plan 17-01 Task 2** repairs the typecheck failures. Without it, the gate in 17-01, 17-02,
  17-05, and 17-08 — and the CI `verify` job — could never pass.
- **Plan 17-03 Task 1** scopes `biome.json` and records the decision that the CI `verify` job
  does **not** run `pnpm lint`. Lint runs in a separate `continue-on-error` job and is
  explicitly excluded from the required status checks in plan 17-10, because requiring a check
  with 364 known failures would make the repository permanently unmergeable.

---

## Sampling Rate

- **After every task commit:** `pnpm --filter <changed-pkg> test` (seconds)
- **After every plan wave:** `pnpm install --frozen-lockfile && pnpm build && pnpm typecheck && pnpm test`
  (lint deliberately excluded — see the baseline table above)
- **After each SEC-01 lever (plans 17-02, 17-05, 17-08):** `pnpm audit --json | jq '.metadata.vulnerabilities'`
  immediately. This is the **gating** dependency signal. Confirmed shape:
  `{info, low, moderate, high, critical}`.
- **Before `/gsd:verify-work`:** full suite green, `pnpm audit --audit-level=high` exits 0, and
  all four `checkpoint:human-verify` items signed off
- **Max feedback latency:** **90 seconds** for any task gate.

**Explicitly non-gating (recorded, never blocking):** the GitHub Dependabot alert histogram
(`gh api …/dependabot/alerts`). It re-scans a pushed lockfile on GitHub's own schedule, up to
roughly 30 minutes — far outside the 90 s latency budget. Plans 17-02, 17-05, and 17-08 each fire
it twice (once after push, once when writing the SUMMARY) and record both readings with
timestamps, or record "not yet re-scanned at &lt;time&gt;". Final confirmation of ROADMAP criterion 1
lands in plan 17-10 Task 2, where a human reads the CI job conclusions before the checks become
required.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | SEC-05 | T-17-02 | Branch work committed without LAUNCH.md's false claims | smoke | `test "$(git status --porcelain \| grep -cvE '^\?\? LAUNCH\.md$')" -eq 0 && pnpm --filter @aeorank/web test` | ✅ | ⬜ pending |
| 17-01-02 | 01 | 1 | SEC-05 | T-17-04b | Undeclared `h3` made explicit and lockfile-pinned; no `@ts-ignore` escapes | unit+build | `pnpm install && pnpm build && pnpm typecheck && pnpm test` | ✅ | ⬜ pending |
| 17-01-03 | 01 | 1 | SEC-05 | T-17-02 / T-17-03 | Destructive migration gated on a human-taken snapshot | manual | — (human-check) | n/a | ⬜ pending |
| 17-01-04 | 01 | 1 | SEC-05 | — | Merge verified against a freshly fetched `origin/main` | smoke | `git fetch origin && git merge-base --is-ancestor fix/scan-callback-url origin/main && gh run list --workflow=deploy-web.yml --limit 1 --json conclusion -q '.[0].conclusion' \| grep -qx success` | ✅ | ⬜ pending |
| 17-02-01 | 02 | 2 | SEC-01 | T-17-05 / T-17-06 | 9 unused framework devDeps deleted; every `peerDependencies` block byte-unchanged | unit+build | `pnpm install --frozen-lockfile && pnpm build && pnpm typecheck && pnpm test` | ✅ | ⬜ pending |
| 17-02-02 | 02 | 2 | SEC-01 | T-17-05 | Lever A alert delta attributable to one commit | smoke | `pnpm audit --json \| jq -e '.metadata.vulnerabilities.critical <= 1'` | ✅ | ⬜ pending |
| 17-03-01 | 03 | 2 | SEC-04 | T-17-10b | Lint scoped to real source; no rule disabled to fake a green gate | smoke | `jq -e '.files.ignore \| index("**/.astro") and index("**/.next") and index("**/.vercel") and index(".planning")' biome.json && test "$(pnpm lint 2>&1 \| grep -cE '(\.astro\|\.next\|\.vercel\|\.planning)/')" -eq 0` | ❌ W0 | ⬜ pending |
| 17-03-02 | 03 | 2 | SEC-04 | T-17-09 | Test count derived at runtime, never by grep | unit | `pnpm build && node scripts/measure-tests.mjs && jq -e '.tests > 600 and .files > 30' .github/test-count.json && diff <(jq -S 'del(.measured)' .github/test-count.json) <(jq -S 'del(.measured)' apps/marketing/src/data/test-count.json)` | ❌ W0 | ⬜ pending |
| 17-03-03 | 03 | 2 | SEC-02, SEC-04 | T-17-07 / T-17-08 | Fork PRs cannot obtain `contents: write`; audit runs as its own job | integration | `gh workflow run ci.yml && … gh run view "$RID" --json jobs -q '.jobs[] \| select(.name=="verify") \| .conclusion' \| grep -qx success` | ❌ W0 | ⬜ pending |
| 17-04-01 | 04 | 2 | SEC-06 | T-17-11 | Public-surface liveness is re-runnable, not a one-off curl | smoke | `bash scripts/verify-deploys.sh` | ❌ W0 | ⬜ pending |
| 17-04-02 | 04 | 2 | SEC-06 | T-17-12 / T-17-13 | Credential-gated surfaces get a recorded verdict, never "assumed" | manual | — (human-check) | n/a | ⬜ pending |
| 17-05-01 | 05 | 3 | SEC-01 | T-17-14 / T-17-15 | Transitive floors raised without crossing a major | unit+build | `pnpm install && pnpm build && pnpm typecheck && pnpm test && pnpm audit --json \| jq -e '.metadata.vulnerabilities.critical == 0'` | ✅ | ⬜ pending |
| 17-05-02 | 05 | 3 | SEC-01 | T-17-14 | Lever B alert delta attributable to one commit | smoke | `pnpm audit --json \| jq -e '.metadata.vulnerabilities.critical == 0'` | ✅ | ⬜ pending |
| 17-06-01 | 06 | 3 | SEC-03 | T-17-17 / T-17-19 | No tier is sellable that `stripe.ts` cannot provision; `admin` never public | build | `cd apps/marketing && pnpm build` | ✅ | ⬜ pending |
| 17-06-02 | 06 | 3 | SEC-03 | T-17-18 | No competitor price survives without a measured source and date | build | `cd apps/marketing && pnpm build` | ✅ | ⬜ pending |
| 17-07-01 | 07 | 3 | SEC-03 | T-17-20 | Pillar weights computed from `PILLAR_GROUPS`, asserted to sum to 100, idempotent | unit | `pnpm build && node scripts/derive-pillars.mjs && node -e "…sum===100 && length===5" && git diff --exit-code apps/marketing/src/data/pillars.json` | ❌ W0 | ⬜ pending |
| 17-07-02 | 07 | 3 | SEC-03, SEC-04 | T-17-21 / T-17-22 / T-17-22b | No literal test count, no false cadence, sample output labelled illustrative | build | `cd apps/marketing && pnpm build` | ✅ | ⬜ pending |
| 17-08-01 | 08 | 4 | SEC-01 | T-17-SC | Every `@astrojs/*` peer range read from the registry before install | smoke | `npm view astro@7.2.2 version && npm view @astrojs/starlight@0.41.7 peerDependencies` | ✅ | ⬜ pending |
| 17-08-02 | 08 | 4 | SEC-01 | T-17-23 / T-17-25 / T-17-26 | Two-major jump lands as one revertible commit; no override crosses a major | unit+build | `pnpm install && pnpm build && pnpm typecheck && pnpm test && pnpm audit --audit-level=high` | ✅ | ⬜ pending |
| 17-08-03 | 08 | 4 | SEC-01 | T-17-24 | Visual regression from changed image defaults caught by a human | manual | — (human-check) | n/a | ⬜ pending |
| 17-09-01 | 09 | 5 | SEC-03 | T-17-27 | Every README weight matches the derived artifact | unit | `node -e "…every pillars.json weightPct appears in README.md…"` | ✅ | ⬜ pending |
| 17-09-02 | 09 | 5 | SEC-03 | T-17-28 / T-17-29 / T-17-30 | No "0 alerts" claim; no CodeQL alert dismissed; no uncited statistic | smoke | `test -n "$(git log --oneline -- LAUNCH.md)" && ! grep -qE '0 (Dependabot\|vulnerabilities)\|675 tests\|637 tests' LAUNCH.md .planning/PROJECT.md` | ✅ | ⬜ pending |
| 17-09-03 | 09 | 5 | SEC-03, SEC-04 | T-17-27 / T-17-27b | Claim drift fails the build; unsourced competitor prices caught recursively | unit | `pnpm build && node scripts/derive-pillars.mjs && node scripts/measure-tests.mjs && node scripts/check-claims.mjs` | ❌ W0 | ⬜ pending |
| 17-10-01 | 10 | 6 | SEC-02 | T-17-SC | Dependabot security updates enabled; one rooted npm entry, not per-workspace | smoke | `gh api repos/vinpatel/aeorank --jq '.security_and_analysis.dependabot_security_updates.status' \| grep -qx enabled && test -f .github/dependabot.yml` | ❌ W0 | ⬜ pending |
| 17-10-02 | 10 | 6 | SEC-02 | T-17-35 / T-17-36 | Required checks confirmed green, and the maintainer consents to PR-only `main`, BEFORE the ruleset exists | manual | — (human-check) | n/a | ⬜ pending |
| 17-10-03 | 10 | 6 | SEC-02 | T-17-31 / T-17-32 / T-17-33 | Audit gate is genuinely required; only the Actions integration bypasses | integration | `gh api …/rulesets --jq '…enforcement' \| grep -qx active && test "$(… '[.bypass_actors[] \| select(.actor_type=="RepositoryRole")] \| length')" -eq 0` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*File Exists: ✅ = the command runs against something that exists today · ❌ W0 = depends on a Wave 0 artifact created earlier in this phase*

**Sampling continuity check:** 26 tasks total, 22 `auto` and 4 `checkpoint:human-verify`. All 22
`auto` tasks carry an `<automated>` verify. The longest run of consecutive tasks without an
automated verify is **1** (each checkpoint is bracketed by automated tasks in its own plan, and no
plan has two adjacent checkpoints). No `MISSING` placeholders remain.

---

## Wave 0 Requirements

Nothing needs to exist before the phase starts that a plan does not itself create. The list below
is the set of artifacts the map above marks `❌ W0`, each with the task that creates it — this is
a build order, not a gap.

- [ ] `pnpm typecheck` exiting 0 — **plan 17-01 Task 2**. Blocks the gate in 17-01, 17-02, 17-05,
      17-08 and the CI `verify` job. Discovered during plan revision, not present in the research
      Wave 0 list.
- [ ] `biome.json` scoped to real source — **plan 17-03 Task 1**. Also discovered during revision.
- [ ] `.github/workflows/ci.yml` — **plan 17-03 Task 3**. Blocks SEC-02 and SEC-04; highest-value
      Wave 0 item, exactly as research called it.
- [ ] `scripts/measure-tests.mjs` + `.github/test-count.json` + `apps/marketing/src/data/test-count.json` — **plan 17-03 Task 2**. The SEC-04 single source.
- [ ] `<!-- TESTS_START -->` / `<!-- TESTS_END -->` markers in `README.md` — **plan 17-03 Task 2**
- [ ] `scripts/verify-deploys.sh` — **plan 17-04 Task 1**. The SEC-06 liveness harness.
- [ ] Vitest raised to ≥3.2.6 across root + 12 package devDeps — **plan 17-05 Task 1**. Clears the
      last critical outside the Astro tree.
- [ ] `scripts/derive-pillars.mjs` + `apps/marketing/src/data/pillars.json` — **plan 17-07 Task 1**
- [ ] `scripts/check-claims.mjs` — **plan 17-09 Task 3**. The SEC-03/SEC-04 regression guard.
- [ ] `.github/dependabot.yml` — **plan 17-10 Task 1**
- [ ] Branch protection ruleset on `main` with CI required — **plan 17-10 Task 3**. Without it the
      audit gate is decorative.

*Framework install: not needed — Vitest is already present in all 13 testing packages.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase migration applies idempotently and the unique constraint exists | SEC-05 | The migration contains `DELETE FROM sites` and needs a privileged SQL Editor session plus a pre-flight snapshot. No agent holds DB credentials. | 17-01 Task 3: take a backup, run the duplicate-count query, apply the migration, confirm `pg_constraint` has `sites_user_id_url_key`, re-run to prove idempotency, confirm `CRON_SECRET` is set and the project is Active |
| Dashboard end to end: sign in, add a site, run a scan, download the ZIP | SEC-06 | Requires a Clerk session. A 200 on `/` only proves the Next.js app boots. | 17-04 Task 2 items 1–2 |
| Stripe checkout completes and applies the plan | SEC-06 | Requires a test card and a logged-in session | 17-04 Task 2 item 3 |
| GitHub App posts a Check Run on a PR | SEC-06 | Requires installing the App on a scratch repo. Currently an unproven README/marketing claim; if it fails, plan 17-09 must soften the claim rather than leave it false. | 17-04 Task 2 item 4 |
| Marketplace listing renders correctly (screenshots, description, categories) | SEC-06 | A 200 is not a well-formed listing | 17-04 Task 2 item 5 |
| Keep-alive cron returns 200 on its scheduled run | SEC-05 | Execution results are only visible in Vercel project logs, and the route needs the server-side bearer token | 17-04 Task 2 item 6 |
| Both Astro sites still LOOK right after the two-major jump | SEC-01 | Astro 7 changed image cropping and upscaling defaults; `apps/docs` renders logos through `sharp`. A passing build proves nothing about layout or missing images. | 17-08 Task 3 |
| Consent to `main` becoming PR-only for human pushes | SEC-02 | A branch ruleset is outward-facing repository state that changes how the maintainer works with their own repo. Also the last chance to confirm both required checks are green before requiring them. | 17-10 Task 2 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or a Wave 0 dependency that a named task creates
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (longest run is 1)
- [x] Wave 0 covers all `MISSING` references — there are none; every `❌ W0` maps to a creating task
- [x] No watch-mode flags anywhere (`vitest run`, never `vitest --watch`)
- [x] Feedback latency < 90 s for every gate; the >30-minute Dependabot API reading is explicitly
      recorded rather than gated
- [x] Every gating assertion was re-read against the POST-execution state, not the pre-execution
      state — the `peerDependencies` greps in 17-02 were rescoped to `jq` on `.devDependencies`
      because the peer entries survive by design
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-15
