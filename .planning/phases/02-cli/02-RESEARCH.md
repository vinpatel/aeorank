# Phase 2: CLI - Research

**Researched:** 2026-03-14
**Status:** Complete

## Core Package API Surface

The CLI wraps `@aeorank/core` which exports everything needed:

### Primary API
```typescript
scan(url: string, config?: Partial<ScanConfig>, customFetcher?: FetcherFn): Promise<ScanResult>
```

### Key Types
- **ScanResult**: `{ url, siteName, siteDescription, score, grade, dimensions, files, pages, meta, pagesScanned, duration, scannedAt }`
- **DimensionScore**: `{ id, name, score, maxScore, weight, status, hint }` — weight is `"high" | "medium" | "low"`, status is `"pass" | "warn" | "fail"`
- **GeneratedFile**: `{ name, content }` — name is the filename, content is the string to write
- **ScanConfig**: `{ maxPages, concurrency, timeout, userAgent, respectCrawlDelay }`
- **AeorankConfig**: `{ site: { url, name?, description? }, output: { dir }, scanner: Partial<ScanConfig> }`

### Utilities Available
- `getGrade(score)` — letter grade from 0-100
- `getStatus(score)` — pass/warn/fail from 0-100
- `getDimensionStatus(score, maxScore)` — pass/warn/fail for dimensions
- `DIMENSION_DEFS` — all 12 dimension definitions
- `DEFAULT_CONFIG` — default scanner config (50 pages, 3 concurrency, 30s timeout)
- `GRADE_THRESHOLDS` — A+: 95, A: 85, B: 70, C: 55, D: 40
- `STATUS_THRESHOLDS` — pass: 70, warn: 40

## Existing Packages

- `packages/core` — complete, 105 tests, dual ESM/CJS via tsup
- `packages/cli` — stub (`export {}`)
- `packages/config` — stub (`export {}`) — intended for shared config loading

## Build Infrastructure

- **Monorepo**: pnpm 10.32.1 + Turborepo 2.5 — `build` task has `dependsOn: ["^build"]`
- **TypeScript**: Shared `tsconfig.base.json`, packages extend it
- **Linting**: Biome (tabs, 100 width, recommended rules)
- **Testing**: Vitest 3.2
- **Node target**: >=20

## CLI Technology Decisions (from CONTEXT.md)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Arg parser | Commander.js | Standard, well-documented, subcommand support |
| Colors | chalk | De facto standard, tree-shakeable v5 |
| Spinner | ora | Terminal spinner during async scan |
| Bundler | esbuild | Fast npx cold start — single-file bundle |
| Output dir | `./aeorank-output/` | Default, `--output` to override |
| Config file | `aeorank.config.js` | Optional, zero-config works |

## CLI Architecture Plan

### Subcommands
1. **`scan <url>`** — main command, runs core.scan(), displays results, writes files
2. **`init`** — creates aeorank.config.js with defaults
3. **`generate`** — on-demand file generation from existing scan (deferred, not in requirements)

### Flag Mapping
| Flag | Short | Default | Effect |
|------|-------|---------|--------|
| `--format` | `-f` | `human` | Output format: `human` or `json` |
| `--output` | `-o` | `./aeorank-output` | Output directory for generated files |
| `--config` | `-c` | auto-detect | Config file path |
| `--max-pages` | | 50 | Override max pages to scan |
| `--verbose` | `-v` | false | Show detailed scan progress |
| `--overwrite` | | false | Overwrite existing output files |
| `--no-files` | | false | Skip writing files, output score only |

### Exit Codes
- `0` — success
- `1` — scan error (network, timeout, invalid URL)
- `2` — score below threshold (for CI use with future `--fail-below` flag)

## Error Handling Strategy

Every error must include a next-action suggestion (CLI-04):

| Error Type | Message Pattern |
|------------|----------------|
| Invalid URL | `'{input}' is not a valid URL. Did you mean https://{input}?` |
| Network error | `Could not reach {url}. Check the URL and your internet connection.` |
| Timeout | `Scan timed out after {N}s. Try --max-pages 20 to scan fewer pages.` |
| Config parse error | `Could not read config at {path}. Check the file for syntax errors.` |
| Permission denied | `Cannot write to {dir}. Check directory permissions or use --output <dir>.` |
| File exists | `Output files already exist in {dir}. Use --overwrite to replace them.` |

## Terminal Output Design

### Human Format (default)
1. **Spinner** — `ora` during scan: "Scanning {url}..."
2. **Score header** — Large, colored: green (>=70), amber (40-69), red (<40)
3. **Dimension table** — 12 rows: icon (✓/⚠/✗), name, score/max, weight badge, hint for failing
4. **Next Steps** — Top 3 actionable fixes ranked by impact (high-weight dimensions first, then by deficit)
5. **Files written** — Summary list of paths

### JSON Format (`--format json`)
- No colors, no spinner output to stdout
- Spinner/progress to stderr so stdout is clean JSON
- Output the full ScanResult as JSON
- Pipe-friendly: `npx aeorank scan url --format json | jq '.score'`

## Build & Distribution

### esbuild Bundle Strategy
- Bundle CLI to single JS file (`dist/cli.js`) for fast npx cold start
- Mark `@aeorank/core` as external (it's a workspace dep, resolved at install time)
- Target: `node20`
- Format: ESM (package.json `"type": "module"`)
- Add shebang `#!/usr/bin/env node` to output
- package.json `"bin": { "aeorank": "./dist/cli.js" }`

### Package.json for @aeorank/cli
```json
{
  "name": "@aeorank/cli",
  "version": "0.0.1",
  "type": "module",
  "bin": { "aeorank": "./dist/cli.js" },
  "dependencies": {
    "@aeorank/core": "workspace:*",
    "commander": "^13.0.0",
    "chalk": "^5.4.0",
    "ora": "^8.2.0"
  }
}
```

## Config Loading Strategy

The `@aeorank/config` package is a stub. For Phase 2, config loading can live in the CLI package directly:

1. Look for `aeorank.config.js` in CWD (or `--config` path)
2. Use dynamic `import()` to load ESM config file
3. Merge with `DEFAULT_CONFIG` from core (config overrides defaults)
4. `AeorankConfig` type already exists in core

## Testing Strategy

- **Unit tests**: Command parsing, error formatting, config loading, output formatting
- **Integration test**: Mock `core.scan()`, verify CLI output format
- **Snapshot tests**: Terminal output format stability
- Vitest with mocking for core.scan() — avoid real network calls in CLI tests

## Key Risks

1. **npx cold start time** — Mitigated by esbuild single-file bundle; minimize dependency count
2. **chalk/ora ESM compatibility** — Both are ESM-only in latest versions; project is ESM (`"type": "module"`) so no issue
3. **Config file loading** — Dynamic `import()` of user's JS config file; need to handle missing file gracefully
4. **File overwrite safety** — Must check existence before writing, respect `--overwrite` flag

## Requirement Coverage

| Requirement | Implementation |
|-------------|---------------|
| CLI-01 | Colored terminal output with spinner → chalk + ora + dimension table renderer |
| CLI-02 | JSON output via --format json → serialize ScanResult to stdout |
| CLI-03 | `npx aeorank init` → write template aeorank.config.js |
| CLI-04 | Actionable error messages → error handler with suggestion map |
| CLI-05 | Fix recommendations ranked High/Medium/Low → sort dimensions by weight then deficit |

## RESEARCH COMPLETE
