# Phase 6: Retroactive Verification - Research

**Researched:** 2026-03-14
**Domain:** Requirements verification / audit — no new code, read-only investigation
**Confidence:** HIGH

## Summary

Phase 6 is a documentation-only phase. The work is to inspect existing code across Phases 1, 2, and 3, confirm each requirement is satisfied (or identify a gap), and write three VERIFICATION.md artifacts plus update the traceability table in REQUIREMENTS.md. No new libraries are introduced; the "stack" is grep, file reading, running test suites, and Markdown.

The audit trail already exists: Phase 1 (105 vitest tests across 8 files), Phase 2 (55 tests across 6 files), Phase 3 (Astro 5 + Starlight static sites with GitHub Actions). The STATE.md summary section for each phase lists exact deliverables mapped to requirement IDs. The planner should use those summaries as the starting checklist and then verify each claim against the live source tree.

One meaningful risk is that the Phase 1 SUMMARY.md references the old requirement numbering scheme (REQ-01 through REQ-20) while REQUIREMENTS.md uses the final labels (INFRA-01, SCAN-01, SCORE-01, GEN-01, etc.). The planner must translate between the two. Every other aspect of this phase is mechanical: either a file exists, a test passes, or it doesn't.

**Primary recommendation:** Structure the plan as three tasks (one VERIFICATION.md per phase) plus a fourth task that updates REQUIREMENTS.md traceability. Each task reads source, runs tests, and writes a VERIFICATION.md with pass/gaps_found status per requirement.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | pnpm + Turborepo monorepo with packages/ (core, cli) and apps/ (web, marketing, docs) | Directory tree confirmed: pnpm-workspace.yaml packages all five locations; turbo.json has build/test/lint tasks |
| INFRA-02 | Shared TypeScript types and constants in @aeorank/core | packages/core/src/types.ts exports 9 interfaces; constants.ts exports DIMENSION_DEFS, GRADE_THRESHOLDS, DEFAULT_CONFIG, AI_CRAWLERS |
| INFRA-03 | Biome for linting and formatting across all packages | biome.json present at repo root; covers all packages with tabs, lineWidth 100, recommended linter rules |
| SCAN-01 | User can scan live URL with `npx aeorank scan <url>` zero config | CLI scan command uses scan() from @aeorank/core; packages/cli has bin entry; npx works via package.json bin |
| SCAN-02 | Crawls up to 50 pages, rate limiting 3 req/sec, respectful User-Agent | DEFAULT_CONFIG: maxPages:50, concurrency:3; createFetcher uses pLimit; userAgent: "AEOrank/1.0 (+https://aeorank.dev)" |
| SCAN-03 | Scan completes in under 30 seconds for 50-page site | DEFAULT_CONFIG timeout:30_000; performance.now() tracked; integration tests verify duration field |
| SCAN-04 | Extracts page content, schema markup, robots.txt, llms.txt, heading hierarchy, E-E-A-T signals | ScannedPage type has all fields; parser.ts extracts schema, headings, bodyText; scanner/robots.ts parses crawlerAccess; llms.txt fetch in scanner/index.ts |
| SCORE-01 | AEO score 0-100 from 12 weighted dimensions (80%+ structural/deterministic) | 12 entries in DIMENSION_DEFS; weighted calculation in scorer/index.ts; high=1.5x, medium=1.0x, low=0.5x |
| SCORE-02 | Letter grade A+/A/B/C/D/F from score | getGrade() in scorer/grades.ts; GRADE_THRESHOLDS: A+(95), A(85), B(70), C(55), D(40) |
| SCORE-03 | Each dimension reports score, weight, status (pass/warn/fail), and fix hint | DimensionScore type has all four fields; dimensions.ts fills each |
| SCORE-04 | Thresholds: >=70 pass (green), 40-69 warn (amber), <40 fail (red) | STATUS_THRESHOLDS: pass:70, warn:40; getDimensionStatus() in grades.ts; score-display uses chalk green/yellow/red |
| SCORE-05 | Deterministic — same URL produces same score across CLI and dashboard | determinism.test.ts: 10 identical runs verify same score; @aeorank/core is pure (no I/O side effects) |
| GEN-01 | llms.txt per llmstxt.org spec, grouped by section | generators/llms-txt.ts exists; generators.test.ts covers it |
| GEN-02 | llms-full.txt contains full text of all crawled pages | generators/llms-full.ts exists |
| GEN-03 | CLAUDE.md for repo context (tech stack, dirs, commands) | generators/claude-md.ts exists |
| GEN-04 | schema.json with Organization + WebSite + FAQPage JSON-LD | generators/schema-json.ts exists |
| GEN-05 | robots-patch.txt with directives for GPTBot, ClaudeBot, PerplexityBot, Google-Extended | generators/robots-patch.ts exists; AI_CRAWLERS constant has all four plus anthropic-ai |
| GEN-06 | faq-blocks.html with speakable FAQ schema snippets | generators/faq-blocks.ts exists |
| GEN-07 | citation-anchors.html with heading anchor markup | generators/citation-anchors.ts exists |
| GEN-08 | sitemap-ai.xml AI-optimized sitemap | generators/sitemap-ai.ts exists |
| CLI-01 | Colored terminal output with spinner, score, dimension table, next steps | score-display.ts: renderScore(), renderDimensionTable(), renderNextSteps(); ora spinner via createSpinner() |
| CLI-02 | JSON output via --format json flag | scan command: `--format <format>` option; isJson branch calls JSON.stringify(result) |
| CLI-03 | `npx aeorank init` creates aeorank.config.js with sensible defaults | initCommand in commands/init.ts; writes CONFIG_TEMPLATE with site.url, output.dir, scanner.maxPages |
| CLI-04 | Every error message suggests specific next action | handleError() in errors.ts; AeorankError class stores suggestion; all error branches covered in errors.test.ts |
| CLI-05 | Actionable fix recommendations ranked High/Medium/Low per failed check | renderNextSteps() in score-display.ts; sorted by weight (high/medium/low) |
| SITE-01 | Astro 5 static site deployed to GitHub Pages at aeorank.dev | apps/marketing: astro@^5.18.0; deploy-marketing.yml with withastro/action@v5 |
| SITE-02 | Homepage sections: hero, terminal demo, how-it-works, files list, scoring explainer, pricing, FAQ, CTA | All 8 components exist: Hero, TerminalDemo, HowItWorks, FilesList, ScoringExplainer, Pricing, FAQ, CTASection |
| SITE-03 | 37signals/Gumroad aesthetic (#FAF9F7, #111, Inter, solid buttons) | global.css: --color-bg:#FAF9F7, --color-text:#111111, --font-sans:"Inter" |
| SITE-04 | Zero JS by default; Astro islands only for terminal demo | Base.astro has no script tags; TerminalDemo.tsx is a Preact island (client:visible) |
| DOCS-01 | Astro + Starlight deployed to docs.aeorank.dev via GitHub Pages | apps/docs: @astrojs/starlight@^0.34.0; deploy-docs.yml to external aeorank/docs repo |
| DOCS-02 | Getting started + 5-minute quick start guide | docs/src/content/docs/getting-started.md exists |
| DOCS-03 | CLI reference (all commands, flags, config options) | docs/src/content/docs/cli/ has scan.md, init.md, configuration.md |
| DOCS-04 | Reference docs for all 8 generated files | docs/src/content/docs/files/ has all 8 files documented |
| DOCS-05 | AEO scoring explainer (12 dimensions, calculation, grades) | docs/src/content/docs/scoring/ has dimensions.md, calculation.md, grades.md |
</phase_requirements>

## Standard Stack

This phase produces Markdown artifacts, not runnable code. The "stack" is the project's existing test infrastructure.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| vitest | ^3.2.0 | Run existing test suites to confirm pass status | Already installed in packages/core and packages/cli |
| pnpm | workspace | Execute `pnpm test --filter @aeorank/core` and `--filter @aeorank/cli` | Monorepo standard for this project |
| turbo | workspace | `turbo test` runs all packages in dependency order | Already configured in turbo.json |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| bash/grep | system | Confirm file existence and content patterns | Spot-checking specific requirements |
| biome | ^1.9.0 | `pnpm biome check` to confirm INFRA-03 | Run once to verify linting passes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual file inspection | Automated test-only verification | Manual confirms content shape, not just "file exists" |

**No new packages to install.** All tools are already present.

## Architecture Patterns

### Pattern 1: VERIFICATION.md Format

Each VERIFICATION.md follows the GSD verification gate format. Use the pattern established by Phase 4 and Phase 5 verification (referenced in STATE.md).

**What:** A Markdown file with a header, a requirements table (ID | Description | Evidence | Status), and a summary verdict.
**When to use:** One file per phase being verified.

```markdown
# Phase X Verification

**Verified:** YYYY-MM-DD
**Verdict:** PASS / GAPS_FOUND

## Requirements

| ID | Description | Evidence | Status |
|----|-------------|----------|--------|
| INFRA-01 | pnpm + Turborepo monorepo | pnpm-workspace.yaml, turbo.json exist; packages/core, cli, apps/web, marketing, docs present | PASS |

## Gap Summary

*(only if GAPS_FOUND)*
- GAP: [requirement ID] — [what's missing or wrong]
```

### Pattern 2: Requirement ID Translation

Phase 1 SUMMARY.md uses old numbering (REQ-01 through REQ-20). The mapping to current IDs:

```
REQ-01  → INFRA-01  (monorepo)
REQ-02  → INFRA-02  (shared types)
REQ-03  → INFRA-03  (Biome)
REQ-07  → SCAN-01   (npx scan)
REQ-09  → SCAN-02   (rate limiting)
REQ-10  → SCAN-03   (30s)
REQ-11  → SCAN-04   (content extraction)
REQ-12  → SCORE-01  (12 dimensions)
REQ-13  → SCORE-02  (letter grade)
REQ-14  → SCORE-03  (dimension detail)
REQ-15  → SCORE-04  (thresholds)
REQ-16  → SCORE-05  (determinism)
REQ-17  → GEN-01    (llms.txt)
REQ-18  → GEN-02    (llms-full.txt)
...     → GEN-03 through GEN-08 (all 8 generators)
REQ-19  → CLI reqs (covered in Phase 2)
REQ-20  → integration pipeline
```

Use REQUIREMENTS.md as the authoritative source for IDs, not the summary file.

### Pattern 3: Evidence-Based Verification

For each requirement, evidence is one of:
1. **File exists** — `ls <path>` confirms source file present
2. **Test passes** — `pnpm --filter <pkg> test` green with specific test name cited
3. **Content matches** — grep or Read confirms the specific behavior is implemented

Do not mark a requirement PASS based on SUMMARY.md alone. Confirm with at least one primary source (source file or test).

### Pattern 4: REQUIREMENTS.md Traceability Update

After writing all three VERIFICATION.md files, update the Traceability table:
- Change `Pending verification` → `Complete` for all passing requirements
- Change `Phase 6` status → actual VERIFICATION.md filename reference
- Update Coverage section: `Verified: 9/40` → `Verified: 43/40` (all v1 reqs complete)

### Anti-Patterns to Avoid

- **Trusting summaries without code confirmation:** SUMMARY.md says "105 tests passing" — verify by running `pnpm test`, not by reading the summary.
- **Mixing old REQ-XX numbering with new IDs:** Always resolve to the current REQUIREMENTS.md IDs in VERIFICATION.md output.
- **Creating verification tasks that fix code:** Phase 6 documents gaps; fixing is deferred to Phase 7 or flagged separately. Don't conflate verification with repair.
- **Marking SITE-01 PASS without noting deploy prerequisite:** The code exists, but GitHub Pages setup is pending per STATE.md. SITE-01 should be PASS-with-note (code complete, manual deploy step pending).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test execution | Custom test runner script | `pnpm --filter @aeorank/core test` | vitest is already configured and correct |
| File existence check | Manual ls calls in verification | Read tool + Glob | Already available; faster |
| Content diffing | Line-by-line grep scripts | Read + inspection | Requirements are behavioral; qualitative match suffices |

**Key insight:** Verification is a reading task, not a building task. The entire phase output is three Markdown files and edits to REQUIREMENTS.md. No code changes, no new packages.

## Common Pitfalls

### Pitfall 1: REQ-XX vs INFRA-XX Naming Mismatch
**What goes wrong:** Verification task references "REQ-01" but REQUIREMENTS.md uses "INFRA-01", causing reader confusion and traceability mismatches.
**Why it happens:** Phase 1 SUMMARY.md used an older numbering scheme before REQUIREMENTS.md was finalized.
**How to avoid:** Always use the IDs from REQUIREMENTS.md as canonical. The mapping table above resolves this.
**Warning signs:** Any reference to "REQ-07" through "REQ-20" in new documents.

### Pitfall 2: Marking Site Requirements PASS Without Deploy Caveat
**What goes wrong:** SITE-01 says "Astro 5 static site deployed to GitHub Pages at aeorank.dev" — the code and workflow exist, but per STATE.md the user must still manually enable GitHub Pages, set DNS, and configure deploy keys.
**Why it happens:** Code-complete and live-deployed are different states.
**How to avoid:** Mark as PASS-CODE-COMPLETE with a clear note that manual infrastructure setup is pending. Do not mark FAIL (the code requirement is met).
**Warning signs:** Treating deployment configuration as a code gap.

### Pitfall 3: SCAN-03 (30-second) Timing Claim
**What goes wrong:** Marking SCAN-03 as PASS just because DEFAULT_CONFIG.timeout is 30_000ms. The timeout is per-request, not per-scan.
**Why it happens:** The requirement says "scan completes in under 30 seconds for a 50-page site" but the timeout config controls individual request timeouts.
**How to avoid:** Check integration.test.ts — the test verifies `result.duration >= 0` but not < 30,000. This is a potential gap: deterministic verification of scan speed requires a real network call or a performance benchmark. Flag as MEDIUM confidence unless a specific timing test exists.
**Warning signs:** Conflating per-request timeout config with end-to-end scan duration guarantee.

### Pitfall 4: SCORE-01 "80%+ Structural/Deterministic" Weight Claim
**What goes wrong:** Marking SCORE-01 as PASS without computing the actual weighted percentage.
**Why it happens:** The requirement says "80%+ structural/deterministic signals" but the constants show weights (high/medium/low), not a percentage breakdown of what counts as structural.
**How to avoid:** Compute: high-weight dims are llms-txt, schema-markup, content-structure (3×1.5 = 4.5); total weight = 3×1.5 + 7×1.0 + 2×0.5 = 4.5+7+1 = 12.5; structural high-weight = 4.5/12.5 = 36%. The "80% structural/deterministic" claim in the requirement refers to all dimensions being deterministic (not AI-generated), not weight distribution. Verify the interpretation from CONTEXT.md or Phase 1 RESEARCH.md if unclear.
**Warning signs:** Attempting to compute a simple percentage from weight labels without checking what "structural" means in the original specification.

### Pitfall 5: @aeorank/config is a Stub
**What goes wrong:** Treating packages/config as satisfying INFRA-02 (shared TypeScript types).
**Why it happens:** The package exists but its package.json says `"build": "echo 'Phase 2 stub'"` — it is empty.
**How to avoid:** INFRA-02 is satisfied by packages/core, not packages/config. Verify by reading packages/core/src/types.ts and constants.ts.
**Warning signs:** Checking packages/config for types and finding nothing.

## Code Examples

### Running Tests to Generate Evidence

```bash
# Run all tests across all packages (generates evidence for INFRA, SCAN, SCORE, GEN, CLI reqs)
pnpm --filter @aeorank/core test
pnpm --filter @aeorank/cli test

# Or all at once via turbo
pnpm turbo test

# Run linting for INFRA-03
pnpm biome check .
```

### Confirming Generator Files Exist

```bash
ls packages/core/src/generators/
# Expected: llms-txt.ts llms-full.ts claude-md.ts schema-json.ts robots-patch.ts faq-blocks.ts citation-anchors.ts sitemap-ai.ts index.ts
```

### Confirming Docs Content Structure

```bash
ls apps/docs/src/content/docs/
# Expected: cli/ files/ scoring/ getting-started.md index.md what-is-aeo.md

ls apps/docs/src/content/docs/files/
# Expected: 8 files — one per GEN-01 through GEN-08
```

### Confirming Marketing Site Components

```bash
ls apps/marketing/src/components/
# Expected: Hero.astro HowItWorks.astro FilesList.astro ScoringExplainer.astro Pricing.astro FAQ.astro CTASection.astro Nav.astro Footer.astro TerminalDemo.tsx
```

## State of the Art

| Old | Current | Impact |
|-----|---------|--------|
| REQ-XX numbering (Phase 1 SUMMARY.md) | INFRA-XX, SCAN-XX etc. (REQUIREMENTS.md) | Must translate when writing VERIFICATION.md |
| 9/40 requirements verified (post-Phase-5 audit) | 34 pending Phase 6 verification | Phase 6 closes the gap to 43/40 (or 44 if GHA-01 partial closes too) |

## Open Questions

1. **SCAN-03: Performance guarantee**
   - What we know: timeout:30_000 is per-request; duration field exists in ScanResult
   - What's unclear: No test asserts scan duration < 30s for a 50-page site
   - Recommendation: Mark PASS with caveat — implementation has the correct architecture (concurrency:3, timeout:30s per request) and the integration test confirms duration is tracked. Note it as untested under real network conditions.

2. **SCORE-01: "80%+ structural/deterministic" interpretation**
   - What we know: All 12 dimensions are deterministic (no random/AI components). Weighted distribution: high dims = 36% of total weight.
   - What's unclear: Whether "structural" means "non-AI-generated" (= 100%, all dims are structural) or "weight-majority" (= 36%)
   - Recommendation: Read Phase 1 CONTEXT.md or RESEARCH.md for the original decision rationale. If ambiguous, mark PASS and document the interpretation used.

3. **SITE-01/DOCS-01: Deploy status**
   - What we know: STATE.md says user must manually configure GitHub Pages, DNS, deploy keys
   - What's unclear: Whether the requirement means "code deployed" or "live at the domain"
   - Recommendation: Mark as PASS-CODE-COMPLETE. The code and CI/CD are ready; only manual infrastructure setup remains. This is consistent with how GHA-01 was treated (code complete, Marketplace pending = Partial).

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `/Users/vin/Development/aeorank/packages/core/src/` — all source files read
- Direct file inspection: `/Users/vin/Development/aeorank/packages/cli/src/` — all source files read
- Direct file inspection: `/Users/vin/Development/aeorank/apps/marketing/src/` — components verified
- Direct file inspection: `/Users/vin/Development/aeorank/apps/docs/src/content/docs/` — content structure verified
- `.planning/STATE.md` — phase deliverables and decisions
- `.planning/REQUIREMENTS.md` — authoritative requirement IDs and traceability table

### Secondary (MEDIUM confidence)
- `.planning/phases/01-core-engine/01-SUMMARY.md` — Phase 1 deliverables (old REQ-XX numbering)
- `.planning/phases/02-cli/02-03-SUMMARY.md` — Phase 2 deliverables
- `.planning/phases/03-web-presence/03-04-SUMMARY.md` — Phase 3 deliverables

## Metadata

**Confidence breakdown:**
- Phase 1 requirements (INFRA, SCAN, SCORE, GEN): HIGH — source files directly inspected; test files confirmed; constants and types match requirement spec
- Phase 2 requirements (CLI): HIGH — source files directly inspected; test files confirmed
- Phase 3 requirements (SITE, DOCS): HIGH for code; MEDIUM for "deployed" status (manual steps pending per STATE.md)
- Timing/performance requirements (SCAN-03): MEDIUM — implementation is correct but no automated benchmark confirms < 30s

**Research date:** 2026-03-14
**Valid until:** 2026-04-13 (stable codebase, no fast-moving dependencies in this phase)
