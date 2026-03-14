# Phase 1: Core Engine - Research

**Researched:** 2026-03-14
**Domain:** TypeScript monorepo, HTML parsing, AEO scoring, file generation
**Confidence:** HIGH

## Summary

Phase 1 establishes the pnpm + Turborepo monorepo and builds `@aeorank/core` — a pure TypeScript library with zero I/O side effects that provides URL scanning (via cheerio), 12-dimension AEO scoring, and 8 file generators. The stack is mature and well-documented: pnpm workspaces + Turborepo for build orchestration, cheerio 1.x for HTML parsing, tsup for dual ESM/CJS bundling, Vitest for testing, and Biome for linting/formatting.

The primary risk is scoring weight calibration (MEDIUM confidence on initial weights), but since weights are externalized into config objects, this is a tuning concern — not an architectural one. The llms.txt specification is simple and stable. All 8 file generators produce strings with no disk I/O.

**Primary recommendation:** Build a clean `packages/core` with scanner, scorer, and generators as separate internal modules. Use undici (Node.js built-in) for HTTP fetching to minimize dependencies. Bundle with tsup for dual ESM/CJS output.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- pnpm workspaces + Turborepo for build orchestration
- `packages/` for shared libraries: core, cli (stub), config
- `apps/` for deployable apps: web (dashboard stub), marketing (stub), docs (stub)
- TypeScript 5.7+ with strict mode, ES2022 target, NodeNext module resolution
- Biome for linting and formatting (replaces ESLint + Prettier)
- Vitest for testing
- cheerio as primary HTML parser (fast path, covers ~80% of pages)
- Playwright NOT included in Phase 1
- Rate limiting: 3 concurrent requests/sec default with exponential backoff on 429/503
- User-Agent: `AEOrank/1.0 (+https://aeorank.dev)`
- Respect `Crawl-delay` from robots.txt
- Cap at 50 pages per scan
- Score 0-100, weighted across 12 dimensions
- 80%+ weight on structural/deterministic signals
- Letter grades: A+ (>=95), A (>=85), B (>=70), C (>=55), D (>=40), F (<40)
- Thresholds: >=70 = pass, 40-69 = warn, <40 = fail
- Scoring must be deterministic
- Weights externalized in config object
- `core.generateFiles(scanResult)` returns all 8 files as strings (no disk I/O in core)

### Claude's Discretion
- Internal module structure within @aeorank/core
- Exact cheerio scraping patterns and DOM traversal
- Test fixture strategy (mock HTML pages vs real URL snapshots)
- Error handling patterns within the core library
- Package.json exports configuration
- HTTP client choice (undici or got)

### Deferred Ideas (OUT OF SCOPE)
- Playwright lazy-loading for JS-heavy pages
- Local directory scanning (`aeorank scan ./`)
- Performance-based scoring dimensions (TTFB, load time)
- Async scan job queue for large sites
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | pnpm + Turborepo monorepo with packages/ and apps/ | Turborepo docs confirm standard structure; pnpm-workspace.yaml + turbo.json pattern well-documented |
| INFRA-02 | Shared TypeScript types and constants in @aeorank/core | tsup handles dual ESM/CJS bundling with .d.ts generation; package.json exports map well-documented |
| INFRA-03 | Biome for linting and formatting across all packages | Biome 1.x supports TypeScript, 97% Prettier compatibility, single biome.json at root |
| SCAN-01 | Scan a live URL with zero config | cheerio 1.2.0 + undici fetch for HTML extraction; sitemap.xml + internal link discovery |
| SCAN-02 | Crawl up to 50 pages with rate limiting | p-limit or custom semaphore for 3 req/sec; exponential backoff on 429/503 |
| SCAN-03 | Scan completes in under 30 seconds for 50 pages | cheerio parses HTML in <1ms per page; 50 pages at 3/sec = ~17s fetch + parsing overhead |
| SCAN-04 | Extract page content, schema, robots.txt, llms.txt, headings, E-E-A-T | cheerio selectors for meta, headings, JSON-LD scripts, author/date elements |
| SCORE-01 | AEO score 0-100 from 12 weighted dimensions | Pure function: dimensions -> weighted sum -> normalized 0-100 |
| SCORE-02 | Letter grade A+/A/B/C/D/F from score | Simple threshold lookup function |
| SCORE-03 | Each dimension: score, weight, status, fix hint | DimensionScore interface with status derived from thresholds |
| SCORE-04 | Thresholds: >=70 pass, 40-69 warn, <40 fail | Constants in config, applied per-dimension |
| SCORE-05 | Deterministic scoring across CLI and dashboard | Pure functions with no external state; same input = same output guaranteed |
| GEN-01 | llms.txt per llmstxt.org spec | H1 + blockquote + H2 sections with file lists; spec is simple markdown |
| GEN-02 | llms-full.txt with full crawled text | Concatenate all page body text with URL headers |
| GEN-03 | CLAUDE.md for repo context | Template-based: tech stack, directory structure, commands from scan data |
| GEN-04 | schema.json with Organization + WebSite + FAQPage JSON-LD | Standard schema.org types; well-documented JSON-LD patterns |
| GEN-05 | robots-patch.txt with AI crawler directives | Text template with User-agent/Allow lines for GPTBot, ClaudeBot, PerplexityBot, Google-Extended |
| GEN-06 | faq-blocks.html with speakable FAQ schema | Extract Q&A pairs from page content; wrap in FAQPage JSON-LD + speakable markup |
| GEN-07 | citation-anchors.html with heading anchor markup | Extract headings, generate anchor links with id attributes |
| GEN-08 | sitemap-ai.xml AI-optimized sitemap | XML sitemap with content summaries per URL |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | 9.x | Package manager | Best monorepo support, strict dependency isolation, fastest installs |
| turborepo | 2.x | Build orchestration | Incremental builds, remote caching, task graph with `^` dependencies |
| typescript | 5.7+ | Type system | Strict mode, ES2022 target, NodeNext module resolution |
| cheerio | 1.2.0 | HTML parsing | jQuery-like API, parse5 backend, 0ms overhead per page, dual CJS/ESM |
| tsup | 8.x | Package bundler | Zero-config dual ESM/CJS + .d.ts generation via esbuild |
| vitest | 3.2+ | Test framework | Native TypeScript, monorepo projects support, fast watch mode |
| biome | 1.x | Lint + format | Rust-based, 20-100x faster than ESLint+Prettier, single config |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| p-limit | 6.x | Concurrency control | Rate limiting scanner to 3 concurrent requests |
| robots-parser | 3.x | robots.txt parsing | Parse robots.txt for crawler directives and Crawl-delay |
| sitemapper | 3.x | Sitemap parsing | Parse sitemap.xml to discover URLs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| undici/fetch | got | got is higher-level with retries built-in, but undici is built into Node 20+ — zero install |
| cheerio | linkedom | linkedom provides full DOM API but heavier; cheerio's jQuery API is sufficient for extraction |
| tsup | unbuild | unbuild is more opinionated; tsup is simpler for library packages |

**HTTP Client Decision:** Use Node.js built-in `fetch()` (powered by undici) for HTTP requests. Zero additional dependencies, good performance (3x faster than got), sufficient API for our needs. Wrap in a thin `fetchPage()` utility that handles User-Agent, timeouts, and error mapping.

**Installation:**
```bash
pnpm add -D typescript tsup vitest @biomejs/biome
pnpm add cheerio p-limit robots-parser
```

## Architecture Patterns

### Recommended Project Structure
```
packages/
├── core/
│   ├── src/
│   │   ├── index.ts              # Public API: scan(), score(), generateFiles()
│   │   ├── types.ts              # ScanResult, DimensionScore, GeneratedFile, AeorankConfig
│   │   ├── constants.ts          # DIMENSION_WEIGHTS, GRADE_THRESHOLDS, DEFAULT_CONFIG, AI_CRAWLERS
│   │   ├── scanner/
│   │   │   ├── index.ts          # scanUrl() orchestrator
│   │   │   ├── fetcher.ts        # fetchPage() with rate limiting, User-Agent, timeouts
│   │   │   ├── parser.ts         # parsePage() cheerio extraction
│   │   │   ├── discovery.ts      # discoverUrls() from sitemap + internal links
│   │   │   └── robots.ts         # parseRobots() for crawler directives
│   │   ├── scorer/
│   │   │   ├── index.ts          # calculateScore() weighted aggregator
│   │   │   ├── dimensions.ts     # All 12 dimension scorer functions
│   │   │   └── grades.ts         # getGrade() letter grade lookup
│   │   └── generators/
│   │       ├── index.ts          # generateFiles() orchestrator
│   │       ├── llms-txt.ts       # generateLlmsTxt()
│   │       ├── llms-full.ts      # generateLlmsFullTxt()
│   │       ├── claude-md.ts      # generateClaudeMd()
│   │       ├── schema-json.ts    # generateSchemaJson()
│   │       ├── robots-patch.ts   # generateRobotsPatch()
│   │       ├── faq-blocks.ts     # generateFaqBlocks()
│   │       ├── citation-anchors.ts # generateCitationAnchors()
│   │       └── sitemap-ai.ts     # generateSitemapAi()
│   ├── tsup.config.ts
│   ├── vitest.config.ts
│   └── package.json
├── cli/                          # Stub for Phase 2
│   └── package.json
└── config/                       # Shared config types
    └── package.json
apps/
├── web/                          # Dashboard stub
├── marketing/                    # Marketing site stub
└── docs/                         # Docs site stub
```

### Pattern 1: Pure Core Library (No I/O Side Effects)
**What:** Core functions accept data and return data. No disk writes, no console output.
**When to use:** Always in `@aeorank/core`. CLI/Action/Dashboard handle I/O.
**Example:**
```typescript
// Core: pure function
export function generateFiles(result: ScanResult): GeneratedFile[] {
  return [
    { name: 'llms.txt', content: generateLlmsTxt(result) },
    { name: 'llms-full.txt', content: generateLlmsFullTxt(result) },
    // ... all 8 files
  ];
}

// CLI (Phase 2): handles I/O
const result = await scan(url);
const files = generateFiles(result);
for (const file of files) {
  await fs.writeFile(path.join(outputDir, file.name), file.content);
}
```

### Pattern 2: Scanner with Pluggable Fetcher
**What:** Scanner accepts an optional fetcher function, defaults to built-in fetch.
**When to use:** Enables testing with mock HTML, dashboard with server-side fetch.
**Example:**
```typescript
export interface FetcherFn {
  (url: string): Promise<{ html: string; status: number; headers: Record<string, string> }>;
}

export async function scan(url: string, options?: { fetcher?: FetcherFn; maxPages?: number }): Promise<ScanResult> {
  const fetcher = options?.fetcher ?? defaultFetcher;
  // ...
}
```

### Pattern 3: Dimension Scorer Registry
**What:** Each dimension is a pure function registered in an array. Easy to add/remove/reweight.
**When to use:** Scoring engine.
**Example:**
```typescript
interface DimensionDef {
  id: string;
  name: string;
  weight: 'high' | 'medium' | 'low';
  score: (pages: ScannedPage[], meta: ScanMeta) => DimensionScore;
}

const DIMENSIONS: DimensionDef[] = [
  { id: 'llms-txt', name: 'llms.txt Presence', weight: 'high', score: scoreLlmsTxt },
  // ... 11 more
];
```

### Anti-Patterns to Avoid
- **God module:** Don't put scanner, scorer, and generators in one file. Split by domain.
- **Hardcoded weights:** Always reference config object, never inline magic numbers.
- **Side effects in core:** Never `console.log`, `fs.writeFile`, or `process.exit` in core package.
- **Cheerio in scorer:** Scorer works on extracted data (ScannedPage[]), not raw HTML. Parse once, score from structured data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| robots.txt parsing | Custom regex parser | robots-parser | Edge cases: wildcards, Crawl-delay, multiple User-agent blocks |
| Sitemap XML parsing | Custom XML parser | sitemapper or fast-xml-parser | Handles sitemap index files, gzip, lastmod, changefreq |
| Concurrency limiting | Custom queue/semaphore | p-limit | Handles edge cases, memory-safe, well-tested |
| HTML parsing | Custom regex/string matching | cheerio | DOM traversal, CSS selectors, handles malformed HTML |
| JSON-LD validation | Custom object checker | schema-dts (types only) | TypeScript types for schema.org, catches structural errors at compile time |

**Key insight:** HTML parsing and robots.txt have decades of edge cases. Every custom parser will break on real-world sites within the first 100 scans.

## Common Pitfalls

### Pitfall 1: Non-Deterministic Scoring
**What goes wrong:** Same URL produces different scores on different runs.
**Why it happens:** Using timestamps, random ordering, race conditions in async crawling, or performance metrics.
**How to avoid:** Sort all arrays before scoring. Use only structural signals (headings, schema, content). Avoid any timing-based metrics. Test determinism explicitly.
**Warning signs:** Flaky tests, score diffs in CI.

### Pitfall 2: Cheerio Memory Leaks on Large Pages
**What goes wrong:** Memory spikes when parsing very large HTML documents (>5MB).
**Why it happens:** cheerio loads entire DOM into memory. Some pages (e.g., single-page apps with inline data) can be enormous.
**How to avoid:** Set a max HTML size limit (e.g., 5MB). Truncate or skip pages that exceed it. Release cheerio instances after parsing.
**Warning signs:** OOM errors in CI, increasing memory usage during crawls.

### Pitfall 3: Phantom Dependencies in Monorepo
**What goes wrong:** Package works locally but fails when published or in CI.
**Why it happens:** pnpm hoists some dependencies; code accidentally imports from a hoisted package not in its own package.json.
**How to avoid:** Use `pnpm --strict-peer-dependencies`. Ensure every import is in the package's own `dependencies`. Run `pnpm install --frozen-lockfile` in CI.
**Warning signs:** "Module not found" errors only in CI or after clean install.

### Pitfall 4: Circular Dependencies Between Packages
**What goes wrong:** Build fails or runtime errors from circular imports.
**Why it happens:** Core imports from CLI or vice versa.
**How to avoid:** Strict dependency graph: config -> core -> cli -> apps. Never import upstream. Use Turborepo's `dependsOn: ["^build"]` to enforce.
**Warning signs:** Turborepo build graph warnings, TypeScript "cannot find module" during build.

### Pitfall 5: Rate Limiting Not Respecting robots.txt Crawl-delay
**What goes wrong:** Scanner hammers sites, gets blocked or returns 429s.
**Why it happens:** Implementing request-per-second limit but ignoring Crawl-delay directive.
**How to avoid:** Parse robots.txt first, extract Crawl-delay, use MAX(configured_delay, crawl_delay) for throttling.
**Warning signs:** 429 responses, IP blocks during testing.

## Code Examples

### Cheerio Page Parsing
```typescript
import * as cheerio from 'cheerio';

interface ScannedPage {
  url: string;
  title: string;
  metaDescription: string;
  headings: { level: number; text: string; id: string | null }[];
  bodyText: string;
  schemaOrg: object[];
  links: { href: string; text: string; internal: boolean }[];
  canonical: string | null;
  robotsMeta: string | null;
}

function parsePage(url: string, html: string, baseUrl: string): ScannedPage {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') ?? '';
  const canonical = $('link[rel="canonical"]').attr('href') ?? null;
  const robotsMeta = $('meta[name="robots"]').attr('content') ?? null;

  const headings: ScannedPage['headings'] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const $el = $(el);
    headings.push({
      level: parseInt(el.tagName[1]),
      text: $el.text().trim(),
      id: $el.attr('id') ?? null,
    });
  });

  const schemaOrg: object[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try { schemaOrg.push(JSON.parse($(el).html() ?? '')); } catch {}
  });

  return { url, title, metaDescription, headings, bodyText: $('body').text().trim(), schemaOrg, links: [], canonical, robotsMeta };
}
```

### Weighted Score Calculation
```typescript
const WEIGHT_MULTIPLIER = { high: 1.5, medium: 1.0, low: 0.5 } as const;

function calculateScore(dimensions: DimensionScore[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const dim of dimensions) {
    const multiplier = WEIGHT_MULTIPLIER[dim.weight];
    weightedSum += (dim.score / dim.maxScore) * multiplier;
    totalWeight += multiplier;
  }

  return Math.round((weightedSum / totalWeight) * 100);
}

function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}
```

### llms.txt Generation
```typescript
function generateLlmsTxt(result: ScanResult): string {
  const lines: string[] = [];
  lines.push(`# ${result.siteName}`);
  lines.push('');
  lines.push(`> ${result.siteDescription}`);
  lines.push('');

  // Group pages by section
  const sections = groupPagesBySection(result.pages);
  for (const [sectionName, pages] of Object.entries(sections)) {
    lines.push(`## ${sectionName}`);
    lines.push('');
    for (const page of pages) {
      lines.push(`- [${page.title}](${page.url}): ${page.metaDescription}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint + Prettier | Biome | 2024+ | Single tool, 20-100x faster, simpler config |
| Jest | Vitest | 2023+ | Native ESM/TypeScript, faster, compatible API |
| Webpack/Rollup for libs | tsup (esbuild) | 2023+ | Zero-config, 100x faster builds |
| node-fetch / axios | Built-in fetch (undici) | Node 18+ | Zero dependencies, better performance |
| Vitest workspace file | Vitest projects in root config | Vitest 3.2 | Simplified configuration, single entry point |

**Deprecated/outdated:**
- Jest for TypeScript projects: Vitest is the standard now (native TS, faster, ESM support)
- ESLint + Prettier: Biome replaces both with better performance
- got/axios for simple HTTP: Node.js built-in fetch covers most use cases

## Open Questions

1. **Scoring dimension weights — initial calibration**
   - What we know: 12 dimensions defined, weight categories (high/medium/low) assigned
   - What's unclear: Optimal weight distribution for real-world sites; no ground truth data yet
   - Recommendation: Ship with sensible defaults from CONTEXT.md, externalize to config, plan recalibration after collecting data from 100+ scans

2. **E-E-A-T signal detection accuracy**
   - What we know: Can detect author names, About pages, dates via cheerio
   - What's unclear: How reliably cheerio extracts E-E-A-T signals across diverse site structures
   - Recommendation: Start with common patterns (byline classes, schema.org Person/Author, meta author), accept false negatives, iterate

3. **FAQ extraction from unstructured content**
   - What we know: Can detect FAQPage schema markup reliably
   - What's unclear: How to extract Q&A pairs from pages without explicit FAQ markup
   - Recommendation: Phase 1 focuses on detecting existing FAQ schema; generating FAQ from unstructured content is a stretch goal

## Sources

### Primary (HIGH confidence)
- [Turborepo docs](https://turborepo.dev/docs) — repository structuring, task configuration
- [Cheerio docs](https://cheerio.js.org/) — v1.2.0 API, parsing configuration
- [llmstxt.org](https://llmstxt.org/) — llms.txt specification format
- [Biome docs](https://biomejs.dev/) — linter/formatter configuration
- [Vitest docs](https://vitest.dev/) — v3.2 projects configuration for monorepos
- [tsup docs](https://tsup.egoist.dev/) — dual ESM/CJS bundling

### Secondary (MEDIUM confidence)
- [Schema.org](https://schema.org/) — Organization, WebSite, FAQPage type definitions
- [Google structured data docs](https://developers.google.com/search/docs/appearance/structured-data/faqpage) — FAQPage implementation requirements
- Various blog posts on pnpm + Turborepo monorepo patterns (2024-2026)

### Tertiary (LOW confidence)
- Scoring dimension weight recommendations — based on general SEO/AEO best practices, no empirical validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are mature, well-documented, actively maintained
- Architecture: HIGH — pure library pattern is straightforward, well-understood
- Pitfalls: HIGH — common monorepo and scraping pitfalls are well-documented
- Scoring weights: MEDIUM — initial calibration is educated guess, needs real-world validation

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain, 30-day validity)
