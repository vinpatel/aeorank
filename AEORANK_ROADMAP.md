# Roadmap — Milestone 1: Ship It

## Phase 1 — Monorepo foundation + CLI core scanner
REQ: REQ-01, REQ-02, REQ-07, REQ-08

Set up the pnpm/Turborepo monorepo, build the URL scanner and local directory scanner, establish the core TypeScript types shared across packages.

```xml
<task type="auto">
  <n>Init monorepo</n>
  <files>package.json, pnpm-workspace.yaml, turbo.json, .gitignore, tsconfig.base.json</files>
  <action>
    Create pnpm workspace with packages/: cli, core, action. Apps/: marketing, dashboard, docs.
    Turborepo pipeline: build depends on ^build. Lint and test are independent.
    Root package.json scripts: dev, build, test, lint, typecheck.
    tsconfig.base.json: strict mode, ES2022, NodeNext module resolution.
    .gitignore: node_modules, dist, .turbo, .env*, aeorank-output.
  </action>
  <verify>pnpm install succeeds. turbo build runs without error on empty packages.</verify>
  <done>All workspace packages resolve. turbo graph shows correct dependencies.</done>
</task>

<task type="auto">
  <n>Build @aeorank/core types and utilities</n>
  <files>packages/core/src/types.ts, packages/core/src/constants.ts, packages/core/src/utils.ts, packages/core/package.json</files>
  <action>
    types.ts: ScanResult, DimensionScore, GeneratedFile, ScanConfig, AeorankConfig interfaces.
    ScanResult: { url, score, grade, dimensions: DimensionScore[], files: GeneratedFile[], pagesScanned, duration, scannedAt }
    DimensionScore: { id, name, score, maxScore, weight, status: 'pass'|'warn'|'fail', hint }
    AeorankConfig: { site, organization, output, scanner, schema, github } — full config shape.
    constants.ts: DIMENSION_WEIGHTS, GRADE_THRESHOLDS, DEFAULT_CONFIG, AI_CRAWLERS list.
    utils.ts: normalizeUrl, getGrade, calculateWeightedScore, slugify.
    Package: @aeorank/core, private: false, exports ./src/index.ts via tsup.
  </action>
  <verify>tsc --noEmit passes on core package. Types import cleanly in cli package.</verify>
  <done>@aeorank/core exports all types. No TypeScript errors.</done>
</task>

<task type="auto">
  <n>Build URL scanner</n>
  <files>packages/cli/src/scanners/urlScanner.ts, packages/cli/src/scanners/pageParser.ts</files>
  <action>
    urlScanner.ts: given a URL, fetches homepage, discovers pages via sitemap.xml and internal links.
    Respects maxPages config (default 50). Uses got for HTTP. Follows redirects. 30s timeout.
    Returns: { pages: { url, title, metaDescription, bodyText, headings, links, statusCode }[] }
    pageParser.ts: uses cheerio to extract title, meta description, h1-h6 with IDs, body text,
    internal links, external links, canonical URL, schema.org scripts, robots meta.
    Detects platform: looks for wp-content (WordPress), _next (Next.js), __nuxt (Nuxt), etc.
    Fetches robots.txt, sitemap.xml, llms.txt separately and returns their presence/content.
  </action>
  <verify>urlScanner scans https://example.com and returns at least 1 page with parsed content.</verify>
  <done>Scanner returns valid ScanPages array. Platform detection works on test URLs.</done>
</task>

<task type="auto">
  <n>Build local directory scanner</n>
  <files>packages/cli/src/scanners/repoScanner.ts</files>
  <action>
    repoScanner.ts: scans a local directory (HTML files, markdown files, config files).
    Reads package.json for name, description, homepage, scripts.
    Reads README.md for project description.
    Reads existing robots.txt, llms.txt, CLAUDE.md, public/*.json for schema.
    Reads .env.example (never .env) for tech hints.
    Detects framework from package.json dependencies.
    Returns same shape as urlScanner output so generators work identically.
  </action>
  <verify>repoScanner on aeorank repo itself returns correct project name and framework detection.</verify>
  <done>Local scan returns equivalent ScanPages shape. Framework detected correctly for test fixtures.</done>
</task>
```

---

## Phase 2 — AEO scoring engine
REQ: REQ-09, REQ-10, REQ-11, REQ-12

Build the 12-dimension scoring engine that takes scan results and produces a weighted score.

```xml
<task type="auto">
  <n>Build 12-dimension scorers</n>
  <files>packages/cli/src/scorer/dimensions.ts, packages/cli/src/scorer/calculate.ts</files>
  <action>
    dimensions.ts: one scorer function per dimension. Each takes ScanPages + metadata, returns DimensionScore.
    
    dim01_llmsTxt: checks if llms.txt exists, has correct sections (title, description, ## sections with links). Score: 0 missing / 5 present but empty / 10 valid with ≥3 sections.
    dim02_schemMarkup: counts schema.org types found (Organization, WebSite, Product, FAQPage, Article, BreadcrumbList). Score: 0 if none, 2 per type found, cap at 10. Deduct if JSON-LD is malformed.
    dim03_aiCrawlerAccess: parse robots.txt for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai Allow rules. Score: 2 points per crawler allowed, cap at 10.
    dim04_contentStructure: check semantic HTML (h1 present on >80% pages, h2/h3 hierarchy, paragraph text not just divs). Score based on % of pages with good structure.
    dim05_faqSpeakable: check for FAQPage schema or speakable markup. Score: 0 none / 5 FAQPage present / 10 FAQPage with ≥3 complete Q&A pairs.
    dim06_pageSpeed: fetch Crux data or estimate from response time. Score: ≤1s=10, ≤2.5s=8, ≤4s=5, else 2.
    dim07_https: check if URL uses HTTPS. Score: 10 yes / 0 no.
    dim08_canonicalUrls: check % of pages with canonical tag. Score: 10 if >90%, 7 if >70%, 4 if >50%, 0 below.
    dim09_sitemapFreshness: parse lastmod in sitemap.xml. Score: 10 if ≤7 days, 8 if ≤30d, 5 if ≤90d, 2 if older, 0 if none.
    dim10_entityMarkup: check for Person, Organization, Product, SoftwareApplication schema. Score: 2.5 per type, cap 10.
    dim11_citationAnchors: check % of h2/h3 headings with id attributes. Score: 10 if >80%, 7 if >60%, 4 if >40%, 0 below.
    dim12_contentQuality: avg word count per page, presence of dates/timestamps, list usage ratio. Score: composite 0-10.
    
    calculate.ts: calculateScore(dimensions) applies weights (high=1.5x, medium=1x, low=0.5x), returns 0-100 integer.
    getGrade(score): A+(95+) A(85+) B(70+) C(55+) D(40+) F(below 40).
  </action>
  <verify>
    Test with fixtures: site with no llms.txt scores 0 on dim01.
    Site with all 5 AI crawlers allowed scores 10 on dim03.
    calculateScore returns integer 0-100.
    getGrade returns correct letter for boundary values.
  </verify>
  <done>All 12 scorers return valid DimensionScore. calculateScore tested against 3 fixture sites.</done>
</task>

<task type="auto">
  <n>Build score report formatter</n>
  <files>packages/cli/src/scorer/report.ts</files>
  <action>
    report.ts: formats ScanResult into terminal output, JSON, GitHub markdown.
    terminalReport(result): uses chalk for colors. Header with URL and scan time. Score line with grade, colored by threshold (green/amber/red). Table of all 12 dimensions with name, score bar (e.g., [████░░░░░░]), status icon (✓ ~ ✗), and hint. Footer with next steps and dashboard link.
    jsonReport(result): clean JSON serialization.
    githubMarkdownReport(result, baseScan?): markdown table for PR comments. If baseScan provided, shows diff column.
    badgeJson(score, grade): shields.io endpoint JSON { schemaVersion: 1, label: 'AEO Score', message: '78/100 B', color }.
  </action>
  <verify>terminalReport renders without chalk errors. githubMarkdownReport produces valid markdown table.</verify>
  <done>All three formats render correctly for a mock ScanResult fixture.</done>
</task>
```

---

## Phase 3 — File generation engine
REQ: REQ-13 through REQ-20

Build all 8 file generators that take scan results and produce AI visibility files.

```xml
<task type="auto">
  <n>Build llms.txt and llms-full.txt generators</n>
  <files>packages/cli/src/generators/llmsTxt.ts</files>
  <action>
    generateLlmsTxt(pages, config): follows llmstxt.org spec.
    Output format:
      # {site.name}
      > {site.description}
      ## {section}
      - [{title}]({url}): {metaDescription}
    Group pages into sections by URL pattern (/blog → Blog, /docs → Documentation, /product → Products, etc.).
    Sort sections: main pages first, then blog, docs, api, about.
    Keep lines under 120 chars. Truncate descriptions at 100 chars.
    
    generateLlmsFullTxt(pages, config): full text dump.
    Each page: ## {title} | {url} then full bodyText. Separated by ---. 
    Prepend header: # Full Content Export — {name}\n# Generated: {date}\n# URL: {siteUrl}
  </action>
  <verify>Generated llms.txt for example.com has correct # header, > description, and ## sections. File is valid per llmstxt.org validator logic.</verify>
  <done>Both files generated. llms.txt under 100KB for 50-page site. llms-full.txt contains all page text.</done>
</task>

<task type="auto">
  <n>Build CLAUDE.md generator</n>
  <files>packages/cli/src/generators/claudeMd.ts</files>
  <action>
    generateClaudeMd(pages, config, repoMeta): creates CLAUDE.md for Claude Code.
    Sections: # {name}, ## What this is (2-3 sentences), ## Tech stack (detected framework + deps),
    ## Key directories (inferred from file structure), ## How to run (from package.json scripts),
    ## Important conventions (if found in README), ## Files generated by AEOrank.
    If no repo meta available (URL scan), generate minimal version with site description and URL.
    Include: "This file was auto-generated by AEOrank. Run npx aeorank scan to regenerate."
  </action>
  <verify>CLAUDE.md generated for a Next.js project correctly lists framework, build command, and src/ directory.</verify>
  <done>CLAUDE.md renders as valid markdown. Tech stack detection correct for Next.js, Astro, Hugo, WordPress fixtures.</done>
</task>

<task type="auto">
  <n>Build schema.org JSON-LD generator</n>
  <files>packages/cli/src/generators/schemaOrg.ts</files>
  <action>
    generateSchema(pages, config): returns array of JSON-LD objects.
    Always generates: Organization (name, url, logo, sameAs), WebSite (with SearchAction).
    If pages have Q&A content: FAQPage with extracted questions from headings + following paragraphs.
    If software/SaaS detected: SoftwareApplication (applicationCategory, operatingSystem: Web).
    If blog posts found: Article schema for top 5 posts (headline, datePublished, author).
    Output is array: [{@context, @type, ...}, ...] — paste into <script type="application/ld+json">.
    Validates output: no empty strings, no null values, all URLs are absolute.
  </action>
  <verify>schema.json validates against schema.org spec. Organization type always present. FAQPage generated when FAQ headings detected.</verify>
  <done>Generated JSON-LD passes JSON.parse without error. Minimum 2 types (Organization + WebSite) always present.</done>
</task>

<task type="auto">
  <n>Build remaining 5 file generators</n>
  <files>packages/cli/src/generators/robotsTxt.ts, packages/cli/src/generators/faqBlocks.ts, packages/cli/src/generators/citationAnchors.ts, packages/cli/src/generators/sitemapAi.ts, packages/cli/src/generators/index.ts</files>
  <action>
    robotsTxt.ts: generateRobotsPatch(existingRobots?) — outputs patch to add to robots.txt.
    Lists: GPTBot Allow /, ClaudeBot Allow /, PerplexityBot Allow /, Google-Extended Allow /,
    anthropic-ai Allow /, cohere-ai Allow /. Plus Sitemap: directives for llms.txt and sitemap-ai.xml.
    If existingRobots provided, shows diff (what to add). If not, shows full block to append.
    
    faqBlocks.ts: generateFaqBlocks(pages) — extract Q&A pairs from pages.
    Look for: elements with FAQ/question/answer classes, h3 followed by p, definition lists, accordion patterns.
    Output: JSON-LD FAQPage script + microdata HTML for copy-paste. Include installation instructions comment.
    
    citationAnchors.ts: generateCitationAnchors(pages) — list of headings missing IDs.
    For each h2/h3 without id: output the original HTML + suggested fixed version with slug id.
    Group by page URL. Include comment: "Add id attributes to headings for AI citation linking."
    
    sitemapAi.ts: generateSitemapAi(pages) — XML sitemap optimized for AI crawlers.
    Standard sitemap schema. Include <lastmod>, <changefreq> (weekly for blog, monthly for pages).
    Add xhtml:link alternates if multiple languages detected. Cap at 50K URLs.
    
    index.ts: generateAll(scanResult, config) — runs all generators, writes to outputDir.
    Returns GeneratedFile[] with { filename, content, path } for each.
    Creates outputDir if not exists. Writes all files. Returns summary.
  </action>
  <verify>All 5 files generated for a test URL. robots-patch.txt contains all 6 AI crawler entries. faq-blocks.html contains valid JSON-LD.</verify>
  <done>generateAll() writes 8 files to ./aeorank-output/. Total generation time under 2 seconds.</done>
</task>
```

---

## Phase 4 — CLI interface and npm publish
REQ: REQ-01 through REQ-08

Build the full CLI experience — all commands, terminal output, config loading, and npm package setup.

```xml
<task type="auto">
  <n>Build CLI commands and entry point</n>
  <files>packages/cli/src/commands/scan.ts, packages/cli/src/commands/generate.ts, packages/cli/src/commands/init.ts, packages/cli/src/commands/score.ts, packages/cli/src/index.ts, packages/cli/bin/aeorank.js</files>
  <action>
    Use commander.js for CLI parsing. Entry: bin/aeorank.js (#!/usr/bin/env node, import from dist).
    
    scan command: aeorank scan <url-or-path> [options]
      --output <dir>    Output directory (default: ./aeorank-output)
      --format <type>   Output format: table|json|minimal (default: table)
      --deep            Deep scan (all pages, slower)
      --quiet           Score only, no table
      --open            Open HTML report in browser after scan
      --config <path>   Path to aeorank.config.js
    Runs: urlScanner or repoScanner → scorer → generators → terminalReport.
    Shows ora spinner during scan. Clears spinner before table output.
    
    generate command: aeorank generate <url> [options] — skip scoring, generate files only.
    init command: aeorank init — writes aeorank.config.js with prompts (use @inquirer/prompts).
    score command: aeorank score <url> — show score only, no files.
    
    index.ts: cosmiconfig loader for aeorank.config.js/.aeorank.js/package.json#aeorank.
    Merges file config with CLI flags. CLI flags win.
  </action>
  <verify>
    npx aeorank scan https://example.com completes and shows score table.
    npx aeorank init creates valid aeorank.config.js.
    npx aeorank --help shows all commands.
  </verify>
  <done>All 4 commands work. --format json outputs valid JSON. Spinner shows and clears correctly.</done>
</task>

<task type="auto">
  <n>CLI package setup and npm publish workflow</n>
  <files>packages/cli/package.json, packages/cli/tsup.config.ts, packages/cli/README.md, .github/workflows/publish-cli.yml</files>
  <action>
    package.json: name @aeorank/cli, version 1.0.0, bin: { aeorank: ./bin/aeorank.js },
    engines: { node: >=18.0.0 }, files: [dist, bin], license: MIT.
    keywords: [aeo, llms.txt, ai-visibility, schema, aeorank, answer-engine-optimization].
    
    tsup.config.ts: entry [src/index.ts], format [cjs, esm], dts true, clean true.
    
    README.md: install badge, one-liner description, quick start (3 commands), full command reference table, link to docs.aeorank.com.
    
    publish-cli.yml: trigger on tags matching cli-v*. Steps: checkout, pnpm install, build, test, publish to npm with NODE_AUTH_TOKEN.
  </action>
  <verify>pnpm build on cli package produces dist/ with .js and .d.ts files. bin/aeorank.js is executable.</verify>
  <done>Package builds cleanly. npx aeorank from a temp directory outside the repo resolves and runs.</done>
</task>
```

---

## Phase 5 — GitHub Actions native integration
REQ: REQ-21 through REQ-30

Build the GitHub Action, reusable workflow, PR comment bot, and Check run integration — all using GITHUB_TOKEN only.

```xml
<task type="auto">
  <n>Build GitHub Action core</n>
  <files>packages/action/action.yml, packages/action/src/index.ts, packages/action/src/checks.ts, packages/action/src/prComment.ts, packages/action/src/urlDetect.ts, packages/action/package.json</files>
  <action>
    action.yml:
      name: AEOrank, description: Scan your site for AEO Score and generate AI visibility files.
      branding: { icon: search, color: black }
      inputs:
        site-url: { required: false, description: URL to scan. Auto-detected if not provided. }
        fail-below: { required: false, default: '0', description: Fail workflow if score below this. }
        generate-files: { required: false, default: 'true' }
        output-dir: { required: false, default: './public' }
        format: { required: false, default: 'table' }
        comment-on-pr: { required: false, default: 'true' }
        post-check: { required: false, default: 'true' }
      outputs:
        score: { description: Numeric AEO score 0-100 }
        grade: { description: Letter grade }
        files-dir: { description: Path to generated files }
      runs: { using: node20, main: dist/index.js }
    
    urlDetect.ts: reads workspace files (aeorank.config.js, CNAME, package.json, .github/workflows/*.yml)
    to find SITE_URL or homepage. Falls back to github.event.deployment_status.environment_url.
    Also checks Actions variables via process.env.AEORANK_SITE_URL.
    
    index.ts: main entry. Gets inputs. Detect URL. Run scan (import @aeorank/cli scan function).
    Set outputs. If post-check=true: call createOrUpdateCheck(). If comment-on-pr=true and PR context: call upsertPrComment(). If generate-files=true: write files to output-dir, upload as artifact.
    Write badge JSON to {output-dir}/aeorank-badge.json for shields.io.
    Annotate workspace files via core.warning() for each fixable issue.
    
    checks.ts: createOrUpdateCheck(octokit, context, result) using @actions/github.
    Check name: AEO Score. Summary shows score + grade. Text shows full dimension table in markdown.
    Conclusion: success if ≥70, neutral if ≥failBelow, failure if below failBelow.
    Uses context.repo + context.sha from @actions/github.
    
    prComment.ts: upsertPrComment(octokit, context, result, baseResult?).
    Hidden marker: <!-- aeorank:score-comment -->. List all comments, find existing by marker + bot user type.
    Update if exists, create if not. Markdown report with diff table if baseResult provided.
    Include collapsible sections: generated files download links + remaining issues list.
  </action>
  <verify>
    Action runs in a test repo on push. Check appears in commit status.
    PR comment posted on open PR. Comment updates (not duplicated) on second push.
    Generated files appear as workflow artifact.
  </verify>
  <done>
    Check run visible in GitHub UI with correct score and grade.
    PR comment has correct markdown table. Badge JSON written to output-dir.
    All using GITHUB_TOKEN only — no external credentials needed.
  </done>
</task>

<task type="auto">
  <n>Build reusable workflow and example workflows</n>
  <files>.github/workflows/aeorank-scan.yml, docs/examples/basic.yml, docs/examples/on-deploy.yml, docs/examples/auto-commit-files.yml, docs/examples/branch-protection.yml</files>
  <action>
    aeorank-scan.yml: reusable workflow (workflow_call trigger).
    Inputs: site-url, fail-below, generate-files, output-dir.
    Jobs: scan (ubuntu-latest, steps: checkout, run action, upload artifact).
    Callable via: uses: aeorank/aeorank/.github/workflows/aeorank-scan.yml@main
    
    basic.yml: minimal example — 6 lines total. On push to main, scan with site URL from vars.
    on-deploy.yml: triggers on deployment_status success, uses environment_url automatically.
    auto-commit-files.yml: scans, generates files, commits them back to repo (with git config bot email).
    branch-protection.yml: full example with fail-below: 50 and required status check setup instructions in comments.
    
    Each example file has a header comment block: # What this does, # Prerequisites, # Required setup.
  </action>
  <verify>Reusable workflow callable from a separate test repo via uses: syntax. Basic example runs in under 45 seconds.</verify>
  <done>All 5 workflow files valid YAML. Reusable workflow triggers correctly. Example files have accurate setup comments.</done>
</task>

<task type="auto">
  <n>Build Action dist bundle and publish workflow</n>
  <files>packages/action/tsup.config.ts, packages/action/README.md, .github/workflows/publish-action.yml</files>
  <action>
    tsup.config.ts: bundle to single dist/index.js (ncc-style, all deps inlined). No external deps.
    The dist/index.js MUST be committed to the repo — GitHub Actions requires this.
    Add to .gitignore exception: !packages/action/dist/
    
    README.md: Marketplace-ready. Inputs table, outputs table, 3 usage examples (basic, on deploy, with fail threshold), badge for shields.io using the badge JSON output, link to full docs.
    
    publish-action.yml: on push to main affecting packages/action/**, rebuild dist and commit back.
    This ensures dist is always in sync. Uses: checkout, pnpm install, build, git add dist, git commit if changed, git push.
  </action>
  <verify>dist/index.js exists and is committed. Action runs without node_modules installation step on GitHub runners.</verify>
  <done>Single bundled dist/index.js under 5MB. Action installs in 0 seconds (no npm install needed). Marketplace listing shows correct inputs/outputs.</done>
</task>
```

---

## Phase 6 — Marketing site
REQ: REQ-31 through REQ-38

Build the Astro static site deployed to GitHub Pages.

```xml
<task type="auto">
  <n>Set up Astro marketing site with design system</n>
  <files>apps/marketing/astro.config.mjs, apps/marketing/tailwind.config.mjs, apps/marketing/src/styles/global.css, apps/marketing/src/layouts/Base.astro, apps/marketing/public/CNAME, apps/marketing/package.json</files>
  <action>
    Astro 4 with @astrojs/tailwind and @astrojs/sitemap integrations.
    output: static. site: https://aeorank.com. trailingSlash: never.
    
    global.css: CSS custom properties per design system in PROJECT.md.
    --color-bg: #FAF9F7, --color-bg-subtle: #F0EFE9, --color-bg-code: #1C1C1C
    --color-text: #111111, --color-text-muted: #666666, --color-text-faint: #999999
    --color-border: #E0DDD6, --color-accent: #1A1A1A, --color-accent-alt: #2563EB
    --color-score-low: #EF4444, --color-score-mid: #F59E0B, --color-score-high: #22C55E
    --font-sans: 'Inter', system-ui, sans-serif
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace
    Font sizes: --text-hero: 72px through --text-xs: 12px (8 steps).
    
    Base.astro: html lang=en, meta charset/viewport, Inter font (Google Fonts preconnect + stylesheet),
    OG tags (title, description, image, url), canonical. Slot for content. No JS in base layout.
    
    CNAME: aeorank.com (single line, no https://)
    
    tailwind.config.mjs: extend theme to use CSS variables for colors. fontFamily: sans uses --font-sans var.
  </action>
  <verify>npm run build in apps/marketing produces dist/. CNAME file in dist/. No JS errors in browser console.</verify>
  <done>Astro build succeeds. CSS variables render correctly in browser. Font loads via Google Fonts CDN.</done>
</task>

<task type="auto">
  <n>Build Nav, Hero, and terminal demo components</n>
  <files>apps/marketing/src/components/Nav.astro, apps/marketing/src/components/Hero.astro, apps/marketing/src/components/TerminalDemo.astro</files>
  <action>
    Nav.astro: sticky. Logo left (AEOrank in 500-weight monospace, 18px). Links: Docs · Pricing · GitHub.
    GitHub link shows star count badge (fetched at build time from GitHub API or static placeholder).
    CTA: "Get started free →" — black bg (#111), white text, 12px 24px padding, border-radius 4px, font-weight 600.
    On scroll: thin border-bottom #E0DDD6 appears. Pure CSS scroll detection via position:sticky + shadow.
    Mobile: hamburger menu collapses links. CSS-only toggle using checkbox hack.
    
    Hero.astro: max-width 680px, centered, padding 80px 24px.
    H1 (72px, font-weight 900, line-height 1.1, #111): "Your site is invisible to AI."
    H2 sibling (20px, #666, margin-top 8px): "AEOrank fixes that in 60 seconds."
    Subhead paragraph (18px, #666, margin-top 16px, max-width 560px): "Scan any website. Get your AEO Score. Download the 8 files that make ChatGPT, Perplexity, and Claude cite you instead of your competitors."
    Two CTAs (margin-top 32px): black primary button "Run a free scan →", bordered secondary "View on GitHub ↗".
    Trust line (14px, #999, margin-top 16px): "Free forever · No account required · Works on any site"
    
    TerminalDemo.astro: dark terminal window. Background #1C1C1C, border-radius 8px, padding 24px.
    Window chrome: three dots (red/amber/green circles, 12px each).
    Content: CSS keyframe animation types out the command, then shows scan output, then score, then file list.
    Animation: 0s command appears → 0.5s spinner starts → 2s output lines appear one by one → 3s score revealed in amber → 4s file list in green.
    Below terminal: input field "Try with your URL →" that copies `npx aeorank scan {url}` to clipboard on submit.
    Pure CSS animation + minimal vanilla JS for clipboard only. No frameworks.
  </action>
  <verify>Nav is sticky and border appears on scroll. Hero renders at correct sizes. Terminal animation completes in 4s. Clipboard copy works.</verify>
  <done>All three components render without console errors. Animation runs once on page load. Mobile nav collapses correctly at 768px.</done>
</task>

<task type="auto">
  <n>Build homepage sections: How It Works, Generated Files, Score Explainer, Integrations, Pricing, FAQ, Footer</n>
  <files>apps/marketing/src/components/HowItWorks.astro, apps/marketing/src/components/GeneratedFiles.astro, apps/marketing/src/components/ScoreExplainer.astro, apps/marketing/src/components/Integrations.astro, apps/marketing/src/components/Pricing.astro, apps/marketing/src/components/FAQ.astro, apps/marketing/src/components/Footer.astro, apps/marketing/src/pages/index.astro</files>
  <action>
    HowItWorks.astro: 3-step layout. Large step number (64px, very light gray), title (24px bold), 2-sentence description. Steps: Scan / Score / Fix. Horizontal on desktop, vertical on mobile.
    
    GeneratedFiles.astro: 8-item list. Icon (file emoji or SVG), filename in monospace, description. Layout: 2-column grid on desktop.
    
    ScoreExplainer.astro: SVG arc gauge (viewBox 0 0 200 120). Show score 34→87 with before/after toggle. 12-dimension list with weight indicators. No Chart.js — pure SVG.
    
    Integrations.astro: 4-column grid of 20 logos (10 CMS + 10 frameworks). Each: gray SVG logo that goes black on hover. Use text/abbrev placeholders if SVGs not available. "Don't see yours? Request it →" link.
    
    Pricing.astro: 4-tier cards (Free, Pro $29, API $99, Agency $499). Pro card has 2px info border. Feature list per tier. Annual pricing toggle (+20% savings). CTA button per tier.
    
    FAQ.astro: 8 questions in CSS-only accordion (details/summary HTML elements). Questions: What is AEO? How is AEO Score calculated? Does this replace SEO? How do I upload the files? Does it work with [WordPress/Shopify/etc]? How often should I re-scan? Is the CLI really free? What AI engines does this help with?
    
    Footer.astro: 3-column. Left: logo + tagline. Center: Product links + Docs links. Right: GitHub, Twitter, LinkedIn. Bottom line: "© 2026 AEOrank · Made by Vin Patel · vinpatel.com". Top border #E0DDD6 only.
    
    index.astro: assemble all components in order with consistent section spacing (96px vertical padding).
  </action>
  <verify>All 8 sections render. Pricing toggle works (CSS-only). FAQ accordion opens/closes. Footer links are correct. Page scores 95+ on Lighthouse.</verify>
  <done>Homepage complete. All sections visible. No broken links. Lighthouse: Performance ≥90, Accessibility ≥95, SEO 100.</done>
</task>

<task type="auto">
  <n>Build pricing, changelog, open pages and GitHub Actions deploy workflow</n>
  <files>apps/marketing/src/pages/pricing.astro, apps/marketing/src/pages/changelog.astro, apps/marketing/src/pages/open.astro, .github/workflows/deploy-marketing.yml</files>
  <action>
    pricing.astro: full feature comparison table. 4 tiers × 15 features. Boolean cells use ✓/—. Numeric cells show limits. FAQ section for pricing questions (6 Qs). Same pricing cards as homepage.
    
    changelog.astro: reads from src/content/changelog/*.md files (Astro content collections).
    Each entry: date, version badge, type badge (Feature/Fix/Improvement in different colors), description.
    Generates RSS feed at /changelog.xml via Astro RSS integration.
    
    open.astro: shows GitHub stars (fetched at build time from api.github.com/repos/vinpatel/aeorank),
    npm weekly downloads (api.npmjs.org/downloads/point/last-week/@aeorank/cli),
    MRR (read from src/data/metrics.json — manually updated), sites scanned (placeholder).
    Values shown as large numbers with labels. "Last updated: {build date}" footer note.
    
    deploy-marketing.yml:
      trigger: push to main, paths apps/marketing/**
      permissions: contents:read, pages:write, id-token:write
      jobs: build (pnpm install, pnpm --filter marketing build), deploy (actions/deploy-pages@v4)
      environment: github-pages
      concurrency: cancel-in-progress to avoid redundant deploys
  </action>
  <verify>
    All 3 pages build without error. RSS feed validates. Open metrics page shows fetched star count.
    GitHub Actions workflow YAML is valid (yamllint). Deploy workflow triggers on push and deploys to GitHub Pages.
  </verify>
  <done>3 pages deployed. RSS at /changelog.xml returns valid XML. Stars count fetched from GitHub API at build time.</done>
</task>
```

---

## Phase 7 — Documentation site
REQ: REQ-39 through REQ-47

Build the Starlight docs at docs.aeorank.com.

```xml
<task type="auto">
  <n>Set up Starlight docs and write core content</n>
  <files>apps/docs/astro.config.mjs, apps/docs/src/content/docs/getting-started/introduction.md, apps/docs/src/content/docs/getting-started/quick-start.md, apps/docs/src/content/docs/getting-started/installation.md, apps/docs/src/content/docs/cli/commands.md, apps/docs/src/content/docs/cli/configuration.md, apps/docs/public/CNAME, .github/workflows/deploy-docs.yml</files>
  <action>
    astro.config.mjs: @astrojs/starlight with title AEOrank Docs. Sidebar navigation matching the full structure from REQUIREMENTS.md REQ-39-47. Social links: GitHub. favicon.svg. head tags for analytics.
    
    introduction.md: What is AEOrank, What is AEO, Why it matters (AI search stats), how AEOrank fits in.
    
    quick-start.md: 5 steps, max 5 minutes. Step 1: npx aeorank scan https://yoursite.com. Step 2: review score. Step 3: download files. Step 4: upload (table per platform). Step 5: re-scan. Real code blocks. No jargon.
    
    installation.md: Requirements (Node 18+). Install options: npx (no install), global npm install, local package.json devDependency. Verify: aeorank --version.
    
    commands.md: Full reference table. Every command, every flag, examples for each. Includes exit codes.
    
    configuration.md: Full aeorank.config.js reference. Every key documented with type, default, description, example.
    
    CNAME: docs.aeorank.com
    
    deploy-docs.yml: same pattern as deploy-marketing.yml but for apps/docs and separate github-pages environment.
  </action>
  <verify>Starlight builds without error. Sidebar links all resolve. Search indexes correctly (Pagefind).</verify>
  <done>Docs site builds and deploys. Quick start is accurate and tested. All command flags documented.</done>
</task>

<task type="auto">
  <n>Write integration docs for 10 CMS platforms</n>
  <files>apps/docs/src/content/docs/integrations/cms/wordpress.md, shopify.md, webflow.md, squarespace.md, wix.md, ghost.md, contentful.md, sanity.md, drupal.md, hubspot-cms.md</files>
  <action>
    Each CMS doc follows identical template:
    ## Prerequisites, ## Quick install (Level 2 plugin if exists, else skip), ## Manual install (Level 1, always present), ## Verify it works, ## Troubleshooting (3-5 issues), ## Full automation (Level 3 API, where possible).
    
    Every doc specifies: where to put llms.txt (root), where to inject schema.json (head tag or plugin), where to add robots.txt entries, and any platform-specific gotchas.
    
    Platform notes to include:
    - Webflow: cannot serve files at root, use Cloudflare Worker OR subdomain proxy workaround. Document both.
    - Squarespace: no direct robots.txt access on lower plans. List plan requirements.
    - Wix: llms.txt at /_files/llms.txt with redirect. Document Wix Editor and Studio separately.
    - WordPress: functions.php snippet to inject schema + virtual robots.txt rewrite rules.
    - Shopify: app proxy at /apps/aeorank/llms.txt, theme.liquid head injection, Settings > Robots.txt.
    - Ghost: routes.yaml redirect, default.hbs head injection, Ghost Admin file manager.
  </action>
  <verify>Each doc has all 5 required sections. Code blocks are syntax highlighted. No broken markdown.</verify>
  <done>10 CMS docs complete. Each under 800 words. Manual (Level 1) install works on each platform based on platform docs.</done>
</task>

<task type="auto">
  <n>Write integration docs for 10 frameworks + GitHub Action + API reference</n>
  <files>apps/docs/src/content/docs/integrations/frameworks/nextjs.md, nuxt.md, sveltekit.md, astro.md, remix.md, laravel.md, django.md, rails.md, hugo.md, gatsby.md, apps/docs/src/content/docs/integrations/github/overview.md, action.md, reusable-workflow.md, apps/docs/src/content/docs/api/authentication.md, endpoints.md, rate-limits.md</files>
  <action>
    Framework docs: same template as CMS docs. Each includes: npm install snippet, config file snippet (next.config.ts, nuxt.config.ts, vite.config.ts, etc.), build hook setup, where generated files go in the framework's public/ directory, example package.json script "prebuild": "npx aeorank generate".
    
    GitHub Action docs:
    overview.md: architecture diagram (text-based), how it works (4 bullet points), what GITHUB_TOKEN can do, zero-credential model explained.
    action.md: all inputs, all outputs, 4 complete example workflows copied from examples/, shields.io badge setup.
    reusable-workflow.md: how to call aeorank's reusable workflow, inputs, advanced patterns.
    
    API docs:
    authentication.md: Bearer token format, where to get API key, header format.
    endpoints.md: full OpenAPI-style reference. Method, path, request body, response shape, example curl for each endpoint.
    rate-limits.md: limits per plan, 429 response handling, retry-after header.
  </action>
  <verify>Framework docs: each has working npm install command. GitHub docs: example workflows are valid YAML. API docs: all curl examples return expected responses against local dev server.</verify>
  <done>All 23 integration docs complete. No broken code blocks. Framework examples tested against each framework's latest stable version.</done>
</task>
```

---

## Phase 8 — Web dashboard
REQ: REQ-48 through REQ-55

Build the Next.js SaaS dashboard with Clerk, Supabase, and Stripe.

```xml
<task type="auto">
  <n>Next.js app foundation: auth, database, and layout</n>
  <files>apps/dashboard/app/layout.tsx, apps/dashboard/app/(auth)/sign-in/[[...sign-in]]/page.tsx, apps/dashboard/app/(auth)/sign-up/[[...sign-up]]/page.tsx, apps/dashboard/lib/db/schema.ts, apps/dashboard/lib/db/index.ts, apps/dashboard/middleware.ts, apps/dashboard/package.json</files>
  <action>
    Next.js 15 App Router. Clerk for auth (ClerkProvider wraps root layout).
    middleware.ts: clerkMiddleware() protects /dashboard/* routes. Public: /, /sign-in, /sign-up, /pricing, /api/webhooks/*.
    
    schema.ts: Drizzle schema for users, sites, scans, generatedFiles, apiKeys tables — full definition per SPEC.md section 8.
    
    db/index.ts: drizzle(postgres(process.env.DATABASE_URL)) with schema export.
    
    Root layout: Inter font via next/font/google. ClerkProvider. Dark mode via class strategy. Minimal global CSS (Tailwind base).
    
    Sign-in/sign-up pages: Clerk <SignIn> and <SignUp> components centered on page. Clean styling matching marketing site.
  </action>
  <verify>pnpm dev starts without error. / redirects unauthenticated /dashboard requests to /sign-in. Sign-in with Clerk works. Database migrations run: pnpm db:push.</verify>
  <done>Auth flow works end to end. Database tables created. Middleware protects dashboard routes correctly.</done>
</task>

<task type="auto">
  <n>Dashboard: sites list, add site, scan trigger, score display</n>
  <files>apps/dashboard/app/(dashboard)/dashboard/page.tsx, apps/dashboard/app/(dashboard)/sites/[id]/page.tsx, apps/dashboard/components/sites/SiteCard.tsx, apps/dashboard/components/sites/AddSiteModal.tsx, apps/dashboard/components/score/ScoreGauge.tsx, apps/dashboard/components/score/ScoreBreakdown.tsx, apps/dashboard/app/api/scan/route.ts</files>
  <action>
    Dashboard page: summary cards (total sites, avg score, sites improved this week). Site list with SiteCard components. "Add site" button opens AddSiteModal.
    
    AddSiteModal: URL input + site name input + submit. On submit: POST /api/scan with { url, name }. Shows loading state. On success: redirect to /sites/{id}.
    
    api/scan/route.ts: POST handler. Verify Clerk auth. Insert site record. Insert pending scan record. Enqueue scan job via Trigger.dev (or direct execution for MVP — run scan inline, max 60s Vercel function timeout). Update scan with results. Return scan ID.
    
    SiteCard: shows name, URL, score gauge (small, 60px), last scanned time, trend arrow. Links to /sites/{id}.
    
    Site detail page: large ScoreGauge (200px SVG arc), score history chart (30 sparkline using recharts), dimension breakdown table, "Download files" button, "Re-scan" button.
    
    ScoreGauge.tsx: SVG arc gauge. Props: score (0-100), size (px). Arc color: green/amber/red by threshold. Large score number in center. Grade letter below. Pure SVG, no chart lib.
    
    ScoreBreakdown.tsx: table of all 12 dimensions. Name, score bar (CSS width %), status icon, hint text. Sorted by weight then score.
  </action>
  <verify>Add site → scan runs → score shows on dashboard. ScoreGauge renders with correct color. Breakdown table shows all 12 dimensions.</verify>
  <done>Full scan flow works. Score displayed correctly. Site list updates after add. Re-scan button triggers new scan.</done>
</task>

<task type="auto">
  <n>File viewer, download, Stripe subscriptions</n>
  <files>apps/dashboard/app/(dashboard)/sites/[id]/files/page.tsx, apps/dashboard/components/files/FileViewer.tsx, apps/dashboard/app/api/files/[scanId]/download/route.ts, apps/dashboard/app/(dashboard)/billing/page.tsx, apps/dashboard/app/api/webhooks/stripe/route.ts, apps/dashboard/lib/stripe.ts</files>
  <action>
    Files page: tabs for each of 8 generated files. FileViewer shows syntax-highlighted content (use highlight.js or Prism via rehype). Copy button per file. Download individual file button. "Download all as ZIP" button.
    
    download route: GET /api/files/{scanId}/download. Fetch all generated files from DB. Create ZIP using jszip. Return with Content-Disposition: attachment; filename=aeorank-files.zip.
    
    stripe.ts: Stripe client. PLANS constant mapping plan names to Stripe price IDs.
    createCheckoutSession(userId, plan) → Stripe checkout URL.
    createCustomerPortalSession(customerId) → portal URL.
    
    billing page: shows current plan badge. "Upgrade" button for free users → createCheckoutSession → redirect to Stripe. "Manage billing" button for paid users → portal URL.
    
    webhook route: POST /api/webhooks/stripe. Verify Stripe signature. Handle: checkout.session.completed (update user plan), customer.subscription.deleted (downgrade to free), invoice.payment_failed (email alert). Use raw body for signature verification (NextRequest bodyUsed workaround).
  </action>
  <verify>ZIP download works and contains all 8 files. Stripe checkout opens for Pro plan upgrade. Webhook updates user plan in DB after checkout.</verify>
  <done>Files downloadable as individual files and ZIP. Stripe subscription flow complete. Plan shown correctly on billing page.</done>
</task>
```

---

## Phase 9 — Polish, testing, and launch prep
REQ: All

```xml
<task type="auto">
  <n>Write tests for CLI core</n>
  <files>packages/cli/src/__tests__/scorer.test.ts, packages/cli/src/__tests__/generators.test.ts, packages/cli/src/__tests__/urlScanner.test.ts, packages/cli/src/__tests__/fixtures/</files>
  <action>
    Use Vitest. Fixtures: 3 HTML files simulating WordPress homepage, Next.js app, bare HTML site.
    
    scorer.test.ts: test each dimension scorer with known inputs. Test calculateScore boundary values. Test getGrade at every threshold boundary (39→F, 40→D, 55→C, 70→B, 85→A, 95→A+).
    
    generators.test.ts: test each generator with fixture scan results. Assert: llms.txt starts with # and has >, llms-full.txt contains all page text, schema.json is valid JSON with Organization type, robots-patch.txt contains GPTBot entry.
    
    urlScanner.test.ts: mock HTTP with nock. Test that 404 pages are skipped. Test that maxPages is respected. Test platform detection for WordPress (wp-content in HTML).
  </action>
  <verify>vitest run shows all tests passing. No skipped tests. Coverage ≥70% for scorer and generators.</verify>
  <done>Test suite passes. Coverage report generated. No test leaks or timeouts.</done>
</task>

<task type="auto">
  <n>README, repo setup, and launch assets</n>
  <files>README.md, .github/ISSUE_TEMPLATE/bug_report.yml, .github/ISSUE_TEMPLATE/feature_request.yml, .github/PULL_REQUEST_TEMPLATE.md, apps/marketing/public/og-image.png (placeholder), apps/marketing/public/favicon.svg</files>
  <action>
    README.md: top-level monorepo README.
    Header: AEOrank logo text + one-liner. npm badge + license badge + GitHub stars badge (shields.io).
    Sections: What it does (4 bullets), Quick start (3 code blocks: npx scan, add action, dashboard link), Architecture (monorepo structure tree, 3 levels deep), Contributing (fork, install, test commands), License.
    
    favicon.svg: text "AE" in black on transparent background. Simple, renders at 16px and 32px.
    
    og-image.png placeholder: 1200×630px, dark background (#111), white text "AEOrank", tagline below in gray. Can be a simple SVG converted to PNG via sharp in build script.
    
    Issue templates: bug_report.yml with fields: describe the bug, steps to reproduce, expected behavior, CLI version, Node version. feature_request.yml: problem, proposed solution, alternatives.
    
    PR template: checklist: tests added/updated, docs updated, changelog entry, types updated.
  </action>
  <verify>README renders correctly on GitHub. OG image is 1200×630. Favicon displays in browser tab. Issue templates show correct fields when creating issues.</verify>
  <done>Repo has professional appearance. All templates work. README passes markdownlint.</done>
</task>
```

---

## How to use this with Claude Code + GSD

### Setup (one-time, 5 minutes)

```bash
# 1. Install GSD
npx get-shit-done-cc@latest
# Choose: Claude Code, Global

# 2. Create your repo
mkdir aeorank && cd aeorank
git init

# 3. Copy these files into your repo
cp PROJECT.md REQUIREMENTS.md ROADMAP.md .

# 4. Start Claude Code in full-auto mode
claude --dangerously-skip-permissions
```

### Run it

```
/gsd:new-project
# When asked, point to the existing PROJECT.md and REQUIREMENTS.md
# Approve the roadmap (use ROADMAP.md as-is)

/gsd:execute-phase 1
# Walk away. Come back to a working monorepo with CLI scanner.

/gsd:verify-work 1
# Confirm scanner works on a real URL

/gsd:execute-phase 2
# AEO scoring engine

... repeat through Phase 9
```

### Phase execution order

Execute phases in strict order — each depends on the previous:

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 (CLI complete, ship to npm)
                                    ↓
Phase 5 (GitHub Action, ship to Marketplace)
                                    ↓
Phase 6 (Marketing site, deploy to GitHub Pages)
Phase 7 (Docs site, deploy to docs.aeorank.com)
Phase 8 (Dashboard, deploy to Vercel)
Phase 9 (Tests + launch)
```

### Expected total build time with Claude Code

- Phases 1–4 (CLI): 2–4 hours
- Phase 5 (GitHub Action): 1–2 hours
- Phase 6 (Marketing): 2–3 hours
- Phase 7 (Docs): 2–3 hours
- Phase 8 (Dashboard): 3–5 hours
- Phase 9 (Polish): 1 hour

**Total: 11–18 hours of Claude Code execution time. 1–2 days of wall clock.**
