# Phase 2: CLI - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

CLI wrapper around @aeorank/core published to npm as @aeorank/cli (MIT). `npx aeorank scan <url>` with zero config, colored terminal output, JSON output mode, config init command. The GitHub Action, dashboard, and marketing site are separate phases.

</domain>

<decisions>
## Implementation Decisions

### CLI Framework
- Commander.js for argument parsing
- Subcommands: `scan <url>`, `init`, `generate` (on-demand file generation from existing scan)
- Short flags for common options: `-o` (output dir), `-f` (format), `-v` (verbose)
- Long flags for clarity: `--format json`, `--output ./out`, `--config path`, `--max-pages 50`

### Terminal Output
- chalk for colors, ora for spinner
- Default: colored human-readable output with spinner during scan, then score table + dimension breakdown + next steps
- `--format json`: machine-readable JSON to stdout (no colors, no spinner)
- Score displayed large and prominent with color: green (≥70), amber (40-69), red (<40)
- Dimension table: name, score, status icon (✓/⚠/✗), fix hint for failing dimensions
- "Next Steps" section: top 3 actionable fixes ranked by impact

### File Output
- Generated files written to `./aeorank-output/` by default
- `--output <dir>` to customize
- Never silently overwrite — warn if files exist, require `--overwrite` to replace
- Print summary of files written with paths

### Config Init
- `npx aeorank init` creates `aeorank.config.js` in current directory
- Sensible defaults: site URL, output dir, max pages, scoring thresholds
- Config file is optional — zero config works for everything

### Error Handling
- Every error message includes a specific next-action suggestion
- Network errors: "Could not reach {url}. Check the URL and your internet connection."
- Timeout: "Scan timed out after 30s. Try --max-pages 20 to scan fewer pages."
- Invalid URL: "'{input}' is not a valid URL. Did you mean https://{input}?"

### Build & Distribution
- esbuild to bundle CLI to single JS file for fast npx cold start
- Target: Node 20+
- Bin entry: `aeorank` in package.json
- Published as @aeorank/cli on npm

### Claude's Discretion
- Exact table formatting and spacing
- Progress indicator details during scan
- Whether to use tsx for dev or just esbuild watch
- Help text formatting and examples

</decisions>

<specifics>
## Specific Ideas

- CLI should feel snappy — npx cold start should be fast (minimize dependencies, esbuild bundle)
- Output should feel like a premium developer tool — clean, informative, not cluttered
- JSON output must be pipe-friendly for CI scripts
- Error messages should be helpful, not cryptic

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- @aeorank/core `scan()` function: full pipeline (fetch → score → generate files)
- @aeorank/core types: ScanResult, DimensionScore, GeneratedFile, ScanConfig
- @aeorank/core utils: getGrade, getStatus, getDimensionStatus

### Established Patterns
- Turborepo build pipeline: core builds first, cli depends on core
- ESM + CJS dual output via tsup
- Vitest for testing

### Integration Points
- CLI imports @aeorank/core as workspace dependency
- CLI reads aeorank.config.js for user configuration
- CLI writes generated files to disk (core returns strings, CLI handles I/O)
- Exit codes: 0 = success, 1 = scan error, 2 = score below threshold (for CI use)

</code_context>

<deferred>
## Deferred Ideas

- `aeorank scan ./` local directory scanning — v1.x / Phase 6
- `aeorank watch` for dev-loop continuous scanning — future
- `aeorank compare <url1> <url2>` competitive analysis — v2
- Optional cloud sync with `AEORANK_API_KEY` — Phase 5

</deferred>

---

*Phase: 02-cli*
*Context gathered: 2026-03-14*
