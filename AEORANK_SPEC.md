# AEOrank — Full Project Specification
> Answer Engine Optimization scoring, file generation, and AI visibility tooling.
> Version 1.0 · For use with Claude Code

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Guiding Principles](#2-guiding-principles)
3. [Full Tech Stack](#3-full-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Marketing Site (GitHub Pages)](#5-marketing-site-github-pages)
6. [Design System](#6-design-system)
7. [CLI Tool](#7-cli-tool)
8. [Web Dashboard (SaaS)](#8-web-dashboard-saas)
9. [API Layer](#9-api-layer)
10. [CMS Integrations (Top 10)](#10-cms-integrations-top-10)
11. [Framework Integrations (Top 10)](#11-framework-integrations-top-10)
12. [File Generation Engine](#12-file-generation-engine)
13. [AEO Scoring Engine](#13-aeo-scoring-engine)
14. [Documentation Site](#14-documentation-site)
15. [GitHub Actions CI/CD](#15-github-actions-cicd)
16. [GitHub Native Integration](#16-github-native-integration)
17. [Pricing & Monetization](#17-pricing--monetization)
18. [Environment Variables](#18-environment-variables)
19. [Launch Checklist](#19-launch-checklist)

---

## 1. Project Overview

**AEOrank** is an open-source CLI + SaaS that audits any website or GitHub repository for AI visibility, generates all required AI-readability files automatically, and provides an ongoing monitoring dashboard.

### The One-Liner
> "Run one command. Get cited by ChatGPT, Perplexity, and Claude."

### What It Does
- **Scans** any URL or local project
- **Scores** AI readability across 12 dimensions (the AEO Score, 0–100)
- **Generates** all files needed for AI visibility:
  - `llms.txt` and `llms-full.txt`
  - `CLAUDE.md` (for Claude Code projects)
  - `schema.org` JSON-LD blocks (Organization, FAQPage, Article, Product, SoftwareApplication)
  - `robots.txt` patch (AI crawler directives)
  - AEO FAQ content blocks (speakable schema)
  - Citation anchor markup
  - `sitemap-ai.xml` (AI-optimized sitemap)
- **Monitors** ongoing AI citation changes (SaaS dashboard)
- **Integrates** with top 10 CMS and top 10 web frameworks via plugins/adapters

### Target Users
1. **Developer (primary)** — runs `npx aeorank scan https://mysite.com` in terminal
2. **Non-developer / solo founder** — pastes URL into web UI, downloads a ZIP of generated files
3. **Agency** — manages 10–50 client sites from dashboard, generates white-label reports
4. **Enterprise** — API access, CI/CD integration, custom schema rules

---

## 2. Guiding Principles

### Automation First
Every action that can be automated must be. The non-developer user should never need to understand what `llms.txt` is. They paste a URL, click a button, download a ZIP, and upload it to their hosting. That's the entire workflow.

### Zero Config Default, Full Config Available
`npx aeorank scan https://mysite.com` works with zero flags. Advanced users can pass a config file. Never require config to get value.

### Open Core
CLI is 100% open source (MIT). Dashboard monitoring, CI integration, and agency features are paid. The free tier is genuinely useful — not crippled.

### Speed
A scan of a typical 50-page site should complete in under 30 seconds. Use streaming output so the user sees progress.

### Honest Copy
Marketing site copy follows the 37signals philosophy: direct, specific, no buzzwords. Every claim is concrete. "Generates 8 files in 45 seconds" not "Supercharge your AI presence."

---

## 3. Full Tech Stack

### Marketing Site (this repo: `apps/marketing`)
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Astro 4** | Zero JS by default, perfect for static sites, MDX support |
| Styling | **Tailwind CSS 4** | Utility-first, no unused CSS in production |
| Components | Astro components + minimal Preact islands | Keep JS bundle tiny |
| Fonts | **Inter** (body) + **Cal Sans** or **Fraunces** (headlines) | Editorial, clean |
| Icons | **Lucide** (SVG, inline) | Consistent, lightweight |
| Hosting | **GitHub Pages** | Free, fast, zero ops |
| Deploy | **GitHub Actions** | Triggered on push to `main` |
| Analytics | **Umami** (self-hosted) or Plausible | Privacy-first, GDPR clean |
| Forms | Formspree or Netlify Forms | No backend needed for contact |

### CLI (`packages/cli`)
| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | **Node.js 20+** | Universal, npx support |
| Language | **TypeScript** | Type safety, better DX |
| HTTP | **got** | Lightweight, fast |
| HTML parsing | **cheerio** | jQuery-like, well-tested |
| Schema gen | **custom** | No deps, full control |
| Output | **chalk** + **ora** | Colored output + spinners |
| Config | **cosmiconfig** | Zero-config with override |
| Build | **tsup** | Zero-config TypeScript bundler |
| Package | `@aeorank/cli` on npm | `npx aeorank` works immediately |

### Web Dashboard (`apps/dashboard`)
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 15 (App Router)** | Full-stack, RSC, edge-ready |
| Styling | **Tailwind CSS 4** | Consistent with marketing site |
| Auth | **Clerk** | Best DX, handles SSO/passwordless |
| Database | **Supabase (PostgreSQL)** | Free tier, real-time, row-level security |
| ORM | **Drizzle ORM** | Lightweight, type-safe, fast |
| Payments | **Stripe** | Subscriptions, usage billing, invoices |
| Email | **Resend** + **React Email** | Beautiful transactional email |
| Background jobs | **Trigger.dev** | Cron scans, async processing |
| File storage | **Supabase Storage** | Generated file ZIPs |
| Hosting | **Vercel** | Next.js native, edge functions |

### API (`packages/api`)
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Hono** | Tiny, fast, edge-native |
| Runtime | **Cloudflare Workers** or **Vercel Edge** | Low latency globally |
| Auth | Bearer tokens (Clerk JWT) | Stateless, simple |
| Rate limiting | **Upstash Redis** | Edge-compatible |
| Docs | **OpenAPI 3.1** auto-generated | Every endpoint documented |

### Documentation Site (`apps/docs`)
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Astro + Starlight** | Purpose-built for docs, search built-in |
| Content | MDX files | Code blocks, components |
| Search | **Pagefind** | Static, zero backend |
| Hosting | **GitHub Pages** at `docs.aeorank.com` | Same pipeline |

### Monorepo
| Tool | Choice |
|------|--------|
| Package manager | **pnpm** with workspaces |
| Monorepo | **Turborepo** |
| Linting | **ESLint** + **Prettier** |
| Testing | **Vitest** |
| Git hooks | **Husky** + **lint-staged** |

---

## 4. Repository Structure

```
aeorank/
├── apps/
│   ├── marketing/          # Astro static site → GitHub Pages
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro         # Homepage
│   │   │   │   ├── pricing.astro       # Pricing page
│   │   │   │   ├── changelog.astro     # What's new
│   │   │   │   └── open.astro          # Open metrics page (like Buffer)
│   │   │   ├── components/
│   │   │   │   ├── Hero.astro
│   │   │   │   ├── HowItWorks.astro
│   │   │   │   ├── Integrations.astro
│   │   │   │   ├── Pricing.astro
│   │   │   │   ├── Testimonials.astro
│   │   │   │   ├── Footer.astro
│   │   │   │   └── Nav.astro
│   │   │   ├── layouts/
│   │   │   │   └── Base.astro
│   │   │   └── styles/
│   │   │       └── global.css
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   └── og-image.png
│   │   ├── astro.config.mjs
│   │   ├── tailwind.config.mjs
│   │   └── package.json
│   │
│   ├── dashboard/          # Next.js SaaS app → Vercel
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/
│   │   │   │   └── sign-up/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── sites/
│   │   │   │   │   ├── page.tsx          # Site list
│   │   │   │   │   ├── [id]/page.tsx     # Site detail + score
│   │   │   │   │   └── [id]/files/page.tsx  # Generated files viewer
│   │   │   │   ├── reports/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── billing/page.tsx
│   │   │   └── api/
│   │   │       ├── scan/route.ts
│   │   │       ├── generate/route.ts
│   │   │       ├── webhooks/stripe/route.ts
│   │   │       └── webhooks/clerk/route.ts
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── score/
│   │   │   │   ├── ScoreGauge.tsx
│   │   │   │   ├── ScoreBreakdown.tsx
│   │   │   │   └── ScoreHistory.tsx
│   │   │   ├── files/
│   │   │   │   ├── FileViewer.tsx
│   │   │   │   ├── FileDownload.tsx
│   │   │   │   └── FileDiff.tsx
│   │   │   └── sites/
│   │   │       ├── SiteCard.tsx
│   │   │       └── AddSiteModal.tsx
│   │   ├── lib/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   └── index.ts
│   │   │   ├── stripe.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── docs/               # Starlight docs → GitHub Pages
│       ├── src/
│       │   └── content/
│       │       ├── docs/
│       │       │   ├── getting-started/
│       │       │   │   ├── introduction.md
│       │       │   │   ├── quick-start.md
│       │       │   │   └── installation.md
│       │       │   ├── cli/
│       │       │   │   ├── commands.md
│       │       │   │   ├── configuration.md
│       │       │   │   └── output-files.md
│       │       │   ├── integrations/
│       │       │   │   ├── wordpress.md
│       │       │   │   ├── shopify.md
│       │       │   │   ├── webflow.md
│       │       │   │   ├── squarespace.md
│       │       │   │   ├── wix.md
│       │       │   │   ├── ghost.md
│       │       │   │   ├── contentful.md
│       │       │   │   ├── sanity.md
│       │       │   │   ├── drupal.md
│       │       │   │   ├── hubspot-cms.md
│       │       │   │   ├── nextjs.md
│       │       │   │   ├── nuxt.md
│       │       │   │   ├── sveltekit.md
│       │       │   │   ├── astro.md
│       │       │   │   ├── remix.md
│       │       │   │   ├── laravel.md
│       │       │   │   ├── django.md
│       │       │   │   ├── rails.md
│       │       │   │   ├── hugo.md
│       │       │   │   └── gatsby.md
│       │       │   ├── api/
│       │       │   │   ├── authentication.md
│       │       │   │   ├── endpoints.md
│       │       │   │   └── rate-limits.md
│       │       │   ├── aeo-score/
│       │       │   │   ├── how-scoring-works.md
│       │       │   │   └── improving-your-score.md
│       │       │   └── reference/
│       │       │       ├── llms-txt.md
│       │       │       ├── claude-md.md
│       │       │       ├── schema-markup.md
│       │       │       └── faq-schema.md
│       └── astro.config.mjs
│
├── packages/
│   ├── cli/                # @aeorank/cli (published to npm)
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── scan.ts
│   │   │   │   ├── generate.ts
│   │   │   │   ├── watch.ts
│   │   │   │   └── init.ts
│   │   │   ├── scanners/
│   │   │   │   ├── urlScanner.ts
│   │   │   │   ├── repoScanner.ts
│   │   │   │   └── fileScanner.ts
│   │   │   ├── generators/
│   │   │   │   ├── llmsTxt.ts
│   │   │   │   ├── claudeMd.ts
│   │   │   │   ├── schemaOrg.ts
│   │   │   │   ├── robotsTxt.ts
│   │   │   │   ├── faqBlocks.ts
│   │   │   │   ├── sitemapAi.ts
│   │   │   │   └── index.ts
│   │   │   ├── scorer/
│   │   │   │   ├── dimensions.ts
│   │   │   │   ├── calculate.ts
│   │   │   │   └── report.ts
│   │   │   ├── output/
│   │   │   │   ├── terminal.ts
│   │   │   │   ├── json.ts
│   │   │   │   └── zip.ts
│   │   │   └── index.ts
│   │   ├── bin/
│   │   │   └── aeorank.js
│   │   └── package.json
│   │
│   ├── core/               # @aeorank/core (shared logic)
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── integrations/       # @aeorank/integrations
│       ├── src/
│       │   ├── wordpress/
│       │   ├── nextjs/
│       │   ├── astro/
│       │   └── ...
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── deploy-marketing.yml   # Deploy marketing → GitHub Pages
│       ├── deploy-docs.yml        # Deploy docs → GitHub Pages
│       ├── publish-cli.yml        # Publish CLI → npm on tag
│       ├── test.yml               # Run tests on PR
│       └── scan-on-pr.yml         # Optional: scan project itself on PRs
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 5. Marketing Site (GitHub Pages)

### Pages

#### 5.1 Homepage (`/`)

**Layout:** Single column, editorial. No sidebar. Max content width 680px for prose, 960px for wide sections.

**Sections in order:**

```
1. NAV
2. HERO
3. DEMO TERMINAL (interactive)
4. HOW IT WORKS (3 steps)
5. WHAT GETS GENERATED (file list)
6. AEO SCORE EXPLAINER
7. INTEGRATIONS GRID
8. PRICING (3 tiers)
9. TESTIMONIALS / SOCIAL PROOF
10. FAQ
11. FINAL CTA
12. FOOTER
```

**Nav:**
- Logo left: `AEOrank` in monospace or bold sans, small
- Links: Docs · Pricing · GitHub (star count badge) · Sign In
- CTA button: `Get started free →` — black background, white text, no rounded corners (37signals style)
- Sticky on scroll, thin border bottom appears on scroll

**Hero:**
```
[Large headline — 56–72px, tight line height, black]
Your site is invisible to AI.
AEOrank fixes that in 60 seconds.

[Subhead — 20px, gray-600]
Scan any website. Get your AEO Score. Download the 8 files that make
ChatGPT, Perplexity, and Claude cite you instead of your competitors.

[Two CTAs side by side]
[black button] Run a free scan →     [gray border button] View on GitHub ↗

[Small trust line below]
Free forever · No account required · Works on any site
```

**Demo Terminal:**
- Animated terminal window (CSS-only animation, no heavy JS)
- Shows: `npx aeorank scan https://yoursite.com`
- Then scanning animation
- Then score output: `AEO Score: 34/100`
- Then file generation list
- Then: `✓ 8 files generated → ./aeorank-output/`
- Input field below: "Try it with your URL" → on submit, opens web scanner or copies command

**How It Works (3 steps):**
- Step 1: Scan — "Paste your URL or run one terminal command"
- Step 2: Score — "Get a detailed AEO score across 12 dimensions"
- Step 3: Fix — "Download the generated files. Upload to your site. Done."
- Each step has a large number, title, 2-sentence description, and a small visual

**What Gets Generated:**
- 8-item list with file icon, filename, and one-line description
- `llms.txt` · The AI sitemap for your content
- `llms-full.txt` · Full content dump for AI training
- `CLAUDE.md` · Project context for Claude Code
- `schema.json` · JSON-LD structured data blocks
- `robots-patch.txt` · AI crawler directives to add to robots.txt
- `faq-blocks.html` · Speakable FAQ schema snippets
- `citation-anchors.html` · HTML markup for citation targets
- `sitemap-ai.xml` · AI-optimized sitemap

**AEO Score Explainer:**
- Large score gauge visual (SVG, not a chart lib)
- 12 dimension breakdown in a clean table
- Before/after example: average site scores 31, optimized site scores 87

**Integrations Grid:**
- 20 logos in a responsive grid (10 CMS + 10 frameworks)
- Each is a gray logo that turns black on hover
- "Don't see yours? Request it →"

**Pricing:**
- See Section 16

**Testimonials:**
- 3–4 quotes in a simple grid
- No avatars initially (use initials circles)
- Quote, name, title/company

**FAQ:**
- 8 questions in an accordion
- Answers are genuinely useful, not marketing fluff

**Footer:**
- Left: Logo + one-line description
- Center: Product links, Docs links
- Right: GitHub, Twitter/X, LinkedIn
- Bottom: "© 2026 AEOrank · Made by Vin Patel · vinpatel.com"
- No background, just a top border

#### 5.2 Pricing Page (`/pricing`)
- Detailed feature comparison table
- FAQ specific to pricing
- "What's included in free" section

#### 5.3 Changelog (`/changelog`)
- Reverse-chronological list of versions
- Each entry: date, version, type badge (Feature / Fix / Improvement), description
- RSS feed auto-generated

#### 5.4 Open Metrics (`/open`)
- Inspired by Buffer's Open startup page
- GitHub stars (fetched at build time)
- npm downloads (fetched at build time)
- MRR (manually updated in a JSON file)
- Number of sites scanned (from public API endpoint)
- "We believe in transparency"

---

## 6. Design System

### Philosophy
The aesthetic is inspired by **37signals** (Basecamp, HEY, Once, Fizzy) and **Gumroad**:
- Brutalist-adjacent but not harsh
- Typography-first — the writing is the design
- Warm off-whites, not pure white backgrounds
- Strong blacks for text (#111 not #000)
- Very limited color palette
- No gradients, no glassmorphism, no shadows (except functional)
- Large, confident headlines
- Generous whitespace — let things breathe
- Buttons look like buttons (solid black or bordered, not pill shapes)
- Code blocks look like real terminals

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg:         #FAF9F7;   /* Warm off-white (not pure white) */
  --color-bg-subtle:  #F0EFE9;   /* Slightly darker for sections */
  --color-bg-code:    #1C1C1C;   /* Near-black for code blocks */

  /* Text */
  --color-text:       #111111;   /* Near-black body text */
  --color-text-muted: #666666;   /* Secondary text */
  --color-text-faint: #999999;   /* Captions, labels */

  /* Borders */
  --color-border:     #E0DDD6;   /* Default border */
  --color-border-dark:#C5C2BB;   /* Hover/active border */

  /* Accent — ONE accent color only */
  --color-accent:     #1A1A1A;   /* Default: near-black (Basecamp-style) */
  --color-accent-alt: #2563EB;   /* Blue for links only */

  /* Semantic */
  --color-success:    #16A34A;
  --color-warning:    #CA8A04;
  --color-error:      #DC2626;
  --color-score-low:  #EF4444;   /* 0–39 */
  --color-score-mid:  #F59E0B;   /* 40–69 */
  --color-score-high: #22C55E;   /* 70–100 */
}
```

### Typography

```css
/* Font stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
--font-serif: 'Fraunces', 'Georgia', serif; /* headlines only, optional */

/* Scale */
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   20px;
--text-2xl:  24px;
--text-3xl:  30px;
--text-4xl:  36px;
--text-5xl:  48px;
--text-6xl:  60px;
--text-hero: 72px;  /* Hero headline */

/* Line heights */
--leading-tight:  1.1;   /* Headlines */
--leading-normal: 1.5;   /* Body */
--leading-loose:  1.75;  /* Long-form prose */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-bold:   700;
--font-black:  900; /* Hero headlines only */
```

### Spacing System
Use a base-8 grid: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

### Component Patterns

**Buttons:**
```html
<!-- Primary: black fill -->
<button class="btn-primary">Get started free →</button>
/* background: #111; color: #fff; padding: 12px 24px; 
   font-weight: 600; border-radius: 4px; no border */

<!-- Secondary: bordered -->
<button class="btn-secondary">View on GitHub ↗</button>
/* background: transparent; color: #111; padding: 12px 24px;
   border: 1.5px solid #111; border-radius: 4px */

<!-- Ghost: text only -->
<button class="btn-ghost">Learn more →</button>
/* no background; no border; color: #111; font-weight: 500 */
```

**Cards:** Rare. When used: white background, 1px border `#E0DDD6`, border-radius 8px, padding 24px. No box shadows.

**Code Blocks:**
```css
/* Dark terminal style */
background: #1C1C1C;
color: #E8E6DF;
font-family: var(--font-mono);
padding: 24px;
border-radius: 8px;
font-size: 14px;
line-height: 1.6;

/* Prompt line highlight */
.line-prompt { color: #9CA3AF; }
.line-output { color: #E8E6DF; }
.line-success { color: #4ADE80; }
.line-score { color: #FBBF24; font-weight: bold; }
```

**Score Gauge:**
- SVG arc gauge, not a chart library
- Large number in center (e.g., "67")
- "/100" in small muted text below
- Arc color: green (70+), amber (40–69), red (0–39)
- Grade letter beside it: A, B, C, D, F

**Section Dividers:** Simple `<hr>` with `border-top: 1px solid #E0DDD6`. No decorative dividers.

**Badges/Tags:**
```css
/* Inline label */
background: #F0EFE9;
color: #666;
font-size: 12px;
font-weight: 600;
padding: 2px 8px;
border-radius: 3px;
text-transform: uppercase;
letter-spacing: 0.05em;
```

---

## 7. CLI Tool

### Package Name
`@aeorank/cli` on npm. Invoked as `npx aeorank` (no global install required).

### Commands

#### `npx aeorank scan <url-or-path>`
The primary command. Scans a URL or local directory.

```bash
# Scan a live URL
npx aeorank scan https://mysite.com

# Scan a local directory
npx aeorank scan ./my-project

# Scan with output directory
npx aeorank scan https://mysite.com --output ./aeorank-files

# Scan and output JSON
npx aeorank scan https://mysite.com --format json

# Scan and open report in browser
npx aeorank scan https://mysite.com --open

# Scan quietly (score only, no details)
npx aeorank scan https://mysite.com --quiet

# Full deep scan (slower, more thorough)
npx aeorank scan https://mysite.com --deep
```

**Terminal output format:**
```
  ─────────────────────────────────────────────
   AEOrank v1.0.0  ·  Scanning https://mysite.com
  ─────────────────────────────────────────────

  ✓  Fetching pages (47 found)
  ✓  Parsing structure
  ✓  Checking existing AI files
  ✓  Analyzing schema markup
  ✓  Evaluating content structure
  ✓  Building AEO score

  ─────────────────────────────────────────────
   AEO SCORE: 34 / 100   [Grade: D]
  ─────────────────────────────────────────────

   Dimension           Score   Weight   Status
   ─────────────────   ─────   ──────   ──────
   llms.txt present      0/10    High   ✗ Missing
   Schema markup         4/10    High   ✗ Incomplete
   AI crawler access     7/10   Medium  ✓ Good
   Content structure     5/10    High   ~ Partial
   FAQ / speakable       0/10   Medium  ✗ Missing
   Page speed            8/10    Low    ✓ Good
   HTTPS                10/10    Low    ✓ Excellent
   Canonical URLs        6/10   Medium  ~ Partial
   Sitemap freshness     4/10    Low    ✗ Stale
   Entity markup         0/10    High   ✗ Missing
   Citation anchors      0/10   Medium  ✗ Missing
   Content quality       6/10   Medium  ~ Moderate

  ─────────────────────────────────────────────
   Generating 8 files...
  ─────────────────────────────────────────────

  ✓  llms.txt             → ./aeorank-output/llms.txt
  ✓  llms-full.txt        → ./aeorank-output/llms-full.txt
  ✓  CLAUDE.md            → ./aeorank-output/CLAUDE.md
  ✓  schema.json          → ./aeorank-output/schema.json
  ✓  robots-patch.txt     → ./aeorank-output/robots-patch.txt
  ✓  faq-blocks.html      → ./aeorank-output/faq-blocks.html
  ✓  citation-anchors.html→ ./aeorank-output/citation-anchors.html
  ✓  sitemap-ai.xml       → ./aeorank-output/sitemap-ai.xml

  ─────────────────────────────────────────────
   Done in 12.4s
   
   Next steps:
   1. Upload files from ./aeorank-output/ to your site root
   2. Add schema.json contents to your <head> tags
   3. Re-scan to confirm: npx aeorank scan https://mysite.com
   
   Monitor ongoing: https://aeorank.com/dashboard
  ─────────────────────────────────────────────
```

#### `npx aeorank generate <url>`
Generate files only, skip scoring.

#### `npx aeorank init`
Create an `aeorank.config.js` file in the current directory.

```javascript
// aeorank.config.js (generated)
export default {
  site: {
    url: 'https://yoursite.com',
    name: 'Your Site Name',
    description: 'What your site does in one sentence',
    type: 'website', // or: 'saas', 'blog', 'ecommerce', 'docs', 'portfolio'
    language: 'en',
  },
  organization: {
    name: 'Your Company',
    logo: 'https://yoursite.com/logo.png',
    foundingYear: 2024,
    sameAs: [
      'https://twitter.com/yourhandle',
      'https://linkedin.com/company/yourco',
      'https://github.com/yourco',
    ],
  },
  output: {
    dir: './aeorank-output',
    format: 'all', // or: 'llms', 'schema', 'robots'
  },
  scanner: {
    maxPages: 50,
    followLinks: true,
    ignorePatterns: ['/admin', '/api', '/_next'],
    timeout: 30000,
  },
  schema: {
    types: ['Organization', 'WebSite', 'FAQPage', 'Article'],
    customFaqs: [
      { question: 'What is...?', answer: '...' },
    ],
  },
}
```

#### `npx aeorank watch`
Watch mode — re-scans on file change (for local dev).

#### `npx aeorank score <url>`
Score only, no file generation.

#### `npx aeorank diff <url>`
Compare current score against last scan (requires saved baseline).

### npm Package: `package.json`
```json
{
  "name": "@aeorank/cli",
  "version": "1.0.0",
  "description": "AEO Score scanner and AI visibility file generator",
  "bin": {
    "aeorank": "./bin/aeorank.js"
  },
  "keywords": ["aeo", "seo", "llms.txt", "ai-visibility", "schema", "claude", "perplexity"],
  "engines": { "node": ">=18.0.0" },
  "files": ["dist", "bin"],
  "license": "MIT"
}
```

### CI Integration (GitHub Action)
```yaml
# .github/workflows/aeorank.yml
name: AEO Score Check
on: [push]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run AEOrank scan
        run: npx aeorank scan ${{ vars.SITE_URL }} --format json --output ./aeorank-report
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: aeorank-report
          path: ./aeorank-report
```

---

## 8. Web Dashboard (SaaS)

### Overview
The dashboard is for users who want ongoing monitoring, not just a one-time scan. It runs scheduled scans, tracks score history, and provides a one-click file download.

### User Flow

```
Sign up (Clerk) 
  → Add first site (URL + site name)
  → Automatic scan runs (background job)
  → Score displayed on dashboard
  → Files available for download (ZIP)
  → Email: "Your AEO score is 34. Here's what to fix."
  → [Optional] Upgrade to Pro for monitoring alerts
```

### Pages / Routes

#### `/dashboard`
- Summary cards: total sites, average score, sites improved this week
- Site list table: name, URL, score, last scanned, trend arrow
- "Add site" button → modal

#### `/dashboard/sites/[id]`
- Large score gauge
- Score history chart (last 30 days)
- 12-dimension breakdown table
- "Download files" button → generates ZIP and downloads
- "View files" button → inline file viewer (see each generated file)
- "Re-scan now" button
- "Setup instructions" accordion by platform

#### `/dashboard/sites/[id]/files`
- Tabbed view of all 8 generated files
- Syntax highlighted code viewer
- Individual file download buttons
- "Copy to clipboard" for each file
- Deployment instructions specific to detected platform

#### `/dashboard/reports`
- (Pro+) Comparison reports, competitor scoring

#### `/dashboard/settings`
- Site management
- Notification preferences
- API key management

#### `/dashboard/billing`
- Stripe Customer Portal embed

### Database Schema (Drizzle/PostgreSQL)

```typescript
// lib/db/schema.ts

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  plan: text('plan').notNull().default('free'), // free | pro | api | agency
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
});

export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  platform: text('platform'), // auto-detected: wordpress, nextjs, etc.
  createdAt: timestamp('created_at').defaultNow(),
  lastScannedAt: timestamp('last_scanned_at'),
  monitoringEnabled: boolean('monitoring_enabled').default(false),
  monitoringFrequency: text('monitoring_frequency').default('weekly'), // daily | weekly
});

export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  status: text('status').notNull().default('pending'), // pending | running | done | failed
  score: integer('score'),
  grade: text('grade'), // A B C D F
  dimensions: jsonb('dimensions'), // all 12 dimension scores
  pagesScanned: integer('pages_scanned'),
  errorMessage: text('error_message'),
});

export const generatedFiles = pgTable('generated_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  scanId: uuid('scan_id').references(() => scans.id).notNull(),
  filename: text('filename').notNull(),
  content: text('content').notNull(),
  fileType: text('file_type').notNull(), // llms-txt | claude-md | schema-json | etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id).notNull(),
  keyHash: text('key_hash').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
});
```

---

## 9. API Layer

### Base URL
`https://api.aeorank.com/v1`

### Authentication
```
Authorization: Bearer ak_live_xxxxxxxxxxxx
```

### Endpoints

```
POST /scan
  body: { url: string, deep?: boolean }
  returns: { scanId, status: 'queued' }

GET /scan/:scanId
  returns: { scanId, status, score, dimensions, files[] }

POST /generate
  body: { url: string, types?: string[] }
  returns: { files: { filename, content, downloadUrl }[] }

GET /score/:url
  returns: { score, grade, dimensions, scannedAt }

GET /files/:scanId/download
  returns: ZIP file download

GET /sites
  returns: { sites[] }

POST /sites
  body: { url, name, monitoringEnabled? }

GET /usage
  returns: { scansThisMonth, limit, plan }
```

### Rate Limits
- Free: 10 scans/day, 1 scan/minute
- Pro: 100 scans/day, 10 scans/minute
- Agency: 1000 scans/day, 30 scans/minute
- API tier: based on plan

---

## 10. CMS Integrations (Top 10)

Each integration is a self-contained guide + optional plugin. The goal: **non-technical users can complete integration in under 10 minutes.**

### Integration Levels
- **Level 1 — Manual:** Upload files to root directory. Instructions only. No code.
- **Level 2 — Plugin/App:** Install plugin, click "Sync files". Automated.
- **Level 3 — API:** Full programmatic integration. For developers.

### 10.1 WordPress

**Plugin name:** `aeorank-wordpress` (submit to WordPress.org)

**Install:** WordPress Admin → Plugins → Add New → Search "AEOrank"

**Features:**
- Adds settings page under SEO → AEOrank
- One-click scan from WP admin
- Auto-creates `llms.txt` via virtual rewrite rule (no file upload needed)
- Auto-injects schema.org JSON-LD into `<head>`
- Auto-updates FAQ schema from FAQ blocks
- Scheduled weekly re-scan
- Supports: plain WordPress, WooCommerce, WordPress.com Business

**Manual (Level 1):**
```
1. Download ZIP from dashboard
2. Upload llms.txt to /wp-content/uploads/ or site root via FTP
3. Add schema.json contents to header via functions.php or a plugin
4. Add robots-patch.txt directives to robots.txt via WP admin
```

**Plugin code structure:**
```php
aeorank-wordpress/
├── aeorank.php              # Main plugin file
├── includes/
│   ├── Admin.php            # Settings page
│   ├── LlmsTxt.php          # Virtual file serving
│   ├── SchemaInjector.php   # Head injection
│   └── ScheduledScan.php    # WP cron job
└── assets/
    ├── admin.css
    └── admin.js
```

### 10.2 Shopify

**App listing:** Shopify App Store (public or private)

**Install:** From Shopify Admin → Apps → Search "AEOrank"

**Features:**
- Metafield injection for schema data
- Serves `llms.txt` via app proxy (`/apps/aeorank/llms.txt`)
- Auto-generates product schema
- Theme editor block for FAQ schema

**Manual (Level 1):**
```
1. In Shopify Admin → Online Store → Files → Upload llms.txt
2. Go to Online Store → Themes → Edit Code
3. Open layout/theme.liquid
4. Paste schema.json contents before </head>
5. Add robots-patch.txt content in Settings → Robots.txt
```

### 10.3 Webflow

**Integration type:** Webflow App (via Webflow Apps platform) + manual

**Manual (Level 1):**
```
1. Upload llms.txt to Webflow Assets (note: Webflow may not serve from root)
2. Alternative: Use Webflow's Custom Code → Head tag to serve llms.txt content
3. Paste schema.json in Project Settings → Custom Code → Head Code
4. Add robots.txt entries in Project Settings → SEO → Robots.txt
```

**Note:** Webflow doesn't allow serving arbitrary files at root. Workaround: use a Cloudflare Worker to serve llms.txt at the domain root while Webflow hosts everything else. Document this clearly.

### 10.4 Squarespace

**Integration type:** Manual only (Squarespace is closed)

```
1. Settings → Advanced → Code Injection → Header
   Paste: schema.json contents inside <script type="application/ld+json">
2. Settings → SEO → robots.txt section
   Add AI crawler directives
3. For llms.txt: Upload to /s/ folder or use a redirect to an external URL
   (Note: Squarespace cannot serve files at domain root — document workaround)
```

### 10.5 Wix

**App:** Submit to Wix App Market

**Manual (Level 1):**
```
1. Settings → SEO Tools → Structured Data Markup → Add markup
   Paste schema.json contents
2. Settings → SEO Tools → robots.txt → Add AI directives
3. For llms.txt: Wix can serve files via Wix Media Manager at /_files/llms.txt
   Use a URL redirect: /llms.txt → /_files/llms.txt
```

### 10.6 Ghost

**Integration type:** Ghost theme modification + content API

```bash
# Terminal: inject into Ghost theme head
# In your theme's default.hbs or index.hbs
# Add before </head>:
{{ghost_head}}
<script type="application/ld+json">
  <!-- schema.json contents here -->
</script>
```

```
File serving:
1. Ghost serves static files from /content/files/
2. Upload llms.txt via Ghost Admin → Settings → Labs → Files
3. Add redirect: /llms.txt → /content/files/llms.txt in routes.yaml
```

**Ghost npm package:** `@aeorank/ghost` — a Ghost integration that auto-generates files.

### 10.7 Contentful

**Integration type:** Contentful App Framework

```typescript
// @aeorank/contentful app
// Reads all content types and entries
// Generates llms-full.txt from content
// Injects schema markup via Content Management API
```

```
Manual:
1. Run: npx aeorank scan --platform contentful --space-id xxx --token xxx
2. Upload generated files to CDN/hosting layer
```

### 10.8 Sanity

**Integration type:** Sanity Plugin (`@aeorank/sanity`)

```typescript
// sanity.config.ts
import { aeorank } from '@aeorank/sanity'

export default defineConfig({
  plugins: [
    aeorank({
      siteUrl: 'https://yoursite.com',
      apiKey: process.env.AEORANK_API_KEY,
    })
  ]
})
```

**Features:**
- Dashboard widget showing AEO score
- Auto-generates schema from document types
- One-click file generation triggered from Sanity Studio

### 10.9 Drupal

**Module:** `aeorank` on Drupal.org

```
Install via Composer:
composer require drupal/aeorank

Enable in Admin → Extend → AEOrank
Configure at Admin → Configuration → AEOrank
```

### 10.10 HubSpot CMS

**Integration type:** HubSpot App + manual

```
1. CMS Hub → Design Tools → File Manager → Upload llms.txt
2. Settings → Website → Pages → Custom Head HTML
   Paste schema.json contents
3. Marketing → SEO → robots.txt → Add AI directives
```

---

## 11. Framework Integrations (Top 10)

These are **developer-facing** integrations. Each is a package or code snippet that plugs into the framework's build process.

### 11.1 Next.js

**Package:** `@aeorank/next`

```typescript
// next.config.ts
import { withAeorank } from '@aeorank/next'

export default withAeorank({
  aeorank: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    autoGenerate: true,     // generate files on build
    injectSchema: true,     // auto-inject JSON-LD via <Script>
    outputDir: './public',  // where to write llms.txt etc.
  }
})(nextConfig)
```

**Also provides:**
```typescript
// Auto-generates JSON-LD for Next.js pages
import { generateSchema } from '@aeorank/next'

export default function Page() {
  return (
    <>
      <Script
        id="aeorank-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateSchema('homepage') }}
      />
      {/* page content */}
    </>
  )
}
```

**Build hook:** Runs `aeorank generate` automatically during `next build`.

### 11.2 Nuxt.js

**Package:** `@aeorank/nuxt` (Nuxt module)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@aeorank/nuxt'],
  aeorank: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    autoGenerate: true,
  }
})
```

### 11.3 SvelteKit

**Package:** `@aeorank/sveltekit` (Vite plugin)

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { aeorank } from '@aeorank/sveltekit'

export default {
  plugins: [
    sveltekit(),
    aeorank({ siteUrl: 'https://yoursite.com' })
  ]
}
```

### 11.4 Astro

**Package:** `@aeorank/astro` (Astro integration)

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import aeorank from '@aeorank/astro'

export default defineConfig({
  integrations: [
    aeorank({
      siteUrl: 'https://yoursite.com',
      autoGenerate: true,
    })
  ]
})
```

### 11.5 Remix

**Package:** `@aeorank/remix`

```typescript
// remix.config.js
import { aeorank } from '@aeorank/remix'

export default aeorank({
  siteUrl: 'https://yoursite.com',
})({
  // your remix config
})
```

### 11.6 Laravel

**Package:** `aeorank/laravel` (Composer)

```bash
composer require aeorank/laravel
php artisan vendor:publish --provider="Aeorank\AeorankServiceProvider"
php artisan aeorank:generate
php artisan aeorank:scan
```

**Config (`config/aeorank.php`):**
```php
return [
    'site_url' => env('APP_URL'),
    'api_key'  => env('AEORANK_API_KEY'),
    'auto_generate' => true,
    'output_path'   => public_path(),
];
```

### 11.7 Django

**Package:** `aeorank-django` (PyPI)

```bash
pip install aeorank-django
```

```python
# settings.py
INSTALLED_APPS = [
    ...
    'aeorank',
]

AEORANK = {
    'SITE_URL': 'https://yoursite.com',
    'API_KEY': os.environ.get('AEORANK_API_KEY'),
    'AUTO_GENERATE': True,
}
```

```python
# urls.py
urlpatterns = [
    path('llms.txt', aeorank_views.llms_txt),
    path('CLAUDE.md', aeorank_views.claude_md),
    ...
]
```

### 11.8 Ruby on Rails

**Gem:** `aeorank-rails`

```ruby
# Gemfile
gem 'aeorank-rails'

# config/initializers/aeorank.rb
Aeorank.configure do |config|
  config.site_url = ENV['SITE_URL']
  config.api_key  = ENV['AEORANK_API_KEY']
end
```

```bash
rails aeorank:generate
rails aeorank:scan
```

### 11.9 Hugo

**Theme component / script:** Not a module system, so use a build script.

```bash
# In hugo.yaml or config.toml
[params.aeorank]
  siteUrl = "https://yoursite.com"
  autoGenerate = true
```

```bash
# In Makefile or package.json script:
"prebuild": "npx aeorank generate --output ./static"
# Hugo serves /static/ at root, so llms.txt will be at /llms.txt
```

**Hugo partial for schema injection:**
```html
<!-- layouts/partials/aeorank-schema.html -->
<script type="application/ld+json">
  {{ readFile "static/aeorank-output/schema.json" | safeJS }}
</script>
```

### 11.10 Gatsby

**Plugin:** `gatsby-plugin-aeorank`

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-aeorank',
      options: {
        siteUrl: 'https://yoursite.com',
        autoGenerate: true,
      }
    }
  ]
}
```

---

## 12. File Generation Engine

### Generator: `llms.txt`

Standard per the [llmstxt.org](https://llmstxt.org) specification.

```
# [Site Name]

> [One-sentence description of site/project]

[Optional longer description paragraph]

## [Section Name]
- [Page Title](https://site.com/page): [One-line description]
- [Page Title](https://site.com/page): [One-line description]

## [Another Section]
- ...

## Optional
- [Page Title](https://site.com/page): [Description — include if detailed context helps]
```

**Generation logic:**
1. Crawl sitemap or site pages (up to maxPages)
2. Group pages by inferred section (blog, docs, products, about, etc.)
3. Extract page title + meta description per page
4. Write structured output

### Generator: `llms-full.txt`

Full text dump of all pages, formatted for AI training/retrieval.

```
# Full Content Export — [Site Name]
# Generated: [ISO date]
# URL: [site URL]

---

## [Page Title] | [URL]

[Full extracted text content of page]

---

## [Next Page Title] | [URL]

...
```

### Generator: `CLAUDE.md`

Optimized for Claude Code usage in repositories.

```markdown
# [Project Name]

## What this is
[2-3 sentence description of the project]

## Tech stack
- [Framework/language]
- [Key dependencies]

## Key directories
- `src/` — [description]
- `docs/` — [description]

## How to run
[Build/dev commands]

## Important conventions
[Any project-specific conventions a developer should know]

## Files generated by AEOrank
- `public/llms.txt` — AI sitemap
- `public/schema.json` — Structured data
```

### Generator: `schema.json`

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "[Site Name]",
    "url": "[Site URL]",
    "logo": "[Logo URL]",
    "description": "[Description]",
    "sameAs": []
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "[Site Name]",
    "url": "[Site URL]",
    "description": "[Description]",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "[Search URL]?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "[Question?]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[Answer]"
        }
      }
    ]
  }
]
```

### Generator: `robots-patch.txt`

```
# AEOrank — AI Crawler Directives
# Add these lines to your existing robots.txt

# Allow major AI training crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

# Point crawlers to llms.txt
# Add to: User-agent: * section
Sitemap: https://[site-url]/llms.txt
Sitemap: https://[site-url]/sitemap-ai.xml
```

### Generator: `faq-blocks.html`

Ready-to-paste FAQ HTML with speakable schema:

```html
<!-- AEOrank FAQ Blocks — paste into your FAQ page -->
<!-- Include the schema script in your <head> -->

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [product/service]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer extracted from content]"
      }
    }
  ]
}
</script>

<!-- Speakable markup for voice/AI assistants -->
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is [product/service]?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">[Answer]</p>
    </div>
  </div>
</div>
```

---

## 13. AEO Scoring Engine

### Dimensions (12 total)

| # | Dimension | Weight | Max | How Scored |
|---|-----------|--------|-----|-----------|
| 1 | `llms.txt` present | High (1.5x) | 10 | 0 (missing) / 5 (present) / 10 (valid + complete) |
| 2 | Schema markup quality | High (1.5x) | 10 | Count of schema types × completeness |
| 3 | AI crawler access | High (1.5x) | 10 | robots.txt allows GPTBot, ClaudeBot, PerplexityBot |
| 4 | Content structure | High (1.5x) | 10 | Semantic HTML, heading hierarchy, lists vs walls of text |
| 5 | FAQ / speakable present | Medium (1x) | 10 | FAQPage schema or speakable markup |
| 6 | Page speed (Core Web Vitals) | Low (0.5x) | 10 | LCP < 2.5s = 10, < 4s = 6, else 0 |
| 7 | HTTPS enforced | Low (0.5x) | 10 | 10 if HTTPS, 0 if not |
| 8 | Canonical URLs | Medium (1x) | 10 | Canonical tags present and valid |
| 9 | Sitemap freshness | Low (0.5x) | 10 | Sitemap present and recently updated |
| 10 | Entity markup | High (1.5x) | 10 | Organization, Person, Product schema |
| 11 | Citation anchors | Medium (1x) | 10 | Headings with IDs, anchor links |
| 12 | Content quality | Medium (1x) | 10 | Avg word count, update frequency, unique content signals |

### Score Calculation

```typescript
function calculateScore(dimensions: DimensionScore[]): number {
  const weights = {
    high:   1.5,
    medium: 1.0,
    low:    0.5,
  }
  
  let weightedSum = 0
  let totalWeight = 0
  
  for (const dim of dimensions) {
    const w = weights[dim.weight]
    weightedSum += dim.score * w
    totalWeight += 10 * w  // max per dimension
  }
  
  return Math.round((weightedSum / totalWeight) * 100)
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}
```

---

## 14. Documentation Site

### Tech: Astro + Starlight

Hosted at `docs.aeorank.com`, deployed from `apps/docs/` via GitHub Actions.

### Structure

```
Getting Started
├── Introduction
├── Quick Start (5 minutes)
└── Installation

CLI Reference  
├── Commands
├── Configuration (aeorank.config.js)
└── Output Files

Generated Files
├── llms.txt
├── llms-full.txt
├── CLAUDE.md
├── schema.json
├── robots-patch.txt
├── faq-blocks.html
├── citation-anchors.html
└── sitemap-ai.xml

AEO Score
├── How scoring works
├── 12 dimensions explained
└── Improving your score

Integrations → CMS
├── WordPress
├── Shopify
├── Webflow
├── Squarespace
├── Wix
├── Ghost
├── Contentful
├── Sanity
├── Drupal
└── HubSpot CMS

Integrations → Frameworks
├── Next.js
├── Nuxt.js
├── SvelteKit
├── Astro
├── Remix
├── Laravel
├── Django
├── Ruby on Rails
├── Hugo
└── Gatsby

API Reference
├── Authentication
├── Endpoints
├── Rate limits
└── Webhooks

Self-hosting
└── Run AEOrank on your own infrastructure
```

### Every Integration Doc Must Include:
1. **Prerequisites** — what the user needs before starting
2. **Installation** — single command or step list (numbered, max 5 steps)
3. **Configuration** — minimal config example
4. **Verify it works** — how to confirm setup is correct
5. **Troubleshooting** — 3–5 most common issues with solutions
6. **Example output** — screenshot or code block of result
7. **Manual method** — always include the non-plugin fallback

### Quick Start Doc

```markdown
# Quick Start

Get your AEO score in under 5 minutes. No account required.

## Step 1: Scan your site

```bash
npx aeorank scan https://yoursite.com
```

That's it. AEOrank will scan your site and show your score.

## Step 2: Review your score

You'll see output like:

```
AEO SCORE: 34 / 100   [Grade: D]
```

With a breakdown of what's missing.

## Step 3: Download the generated files

AEOrank automatically creates 8 files in `./aeorank-output/`. 
These are the files that improve your AI visibility.

## Step 4: Upload the files

Upload everything from `./aeorank-output/` to your website root.

**Most common platforms:**

| Platform | How to upload |
|----------|---------------|
| Vercel | Put files in `/public/` folder |
| Netlify | Put files in `/public/` folder |
| GitHub Pages | Put files in root or `/docs/` folder |
| WordPress | FTP upload to domain root |
| Shopify | See [Shopify guide](/integrations/shopify) |

## Step 5: Re-scan to verify

```bash
npx aeorank scan https://yoursite.com
```

Your score should improve immediately for file-based dimensions.
```

---

## 15. GitHub Actions CI/CD

### Deploy Marketing Site to GitHub Pages

```yaml
# .github/workflows/deploy-marketing.yml
name: Deploy Marketing Site

on:
  push:
    branches: [main]
    paths: ['apps/marketing/**']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build marketing site
        run: pnpm --filter marketing build
        env:
          SITE_URL: https://aeorank.com
          
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/marketing/dist
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Deploy Docs to GitHub Pages

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths: ['apps/docs/**']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter docs build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: apps/docs/dist
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages-docs
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Publish CLI to npm

```yaml
# .github/workflows/publish-cli.yml
name: Publish CLI to npm

on:
  push:
    tags: ['cli-v*']  # triggered by: git tag cli-v1.0.0 && git push --tags

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @aeorank/cli build
      - run: pnpm --filter @aeorank/cli publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Run Tests on PR

```yaml
# .github/workflows/test.yml
name: Test

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm typecheck
      - run: pnpm lint
```

### GitHub Pages Setup Requirements

1. In repo Settings → Pages → Source: set to "GitHub Actions"
2. For custom domains: add `CNAME` file to `apps/marketing/public/` containing `aeorank.com`
3. For docs subdomain: add `CNAME` file to `apps/docs/public/` containing `docs.aeorank.com`
4. Add DNS records pointing to GitHub Pages IPs (185.199.108.153 etc.)

---

## 16. GitHub Native Integration (Actions Only — Zero External Server)

### Architecture principle
The GitHub integration runs 100% on GitHub's infrastructure. No Cloudflare Workers, no external webhook server, no Probot server to host. Everything uses `GITHUB_TOKEN` — developers install in seconds with zero credential setup.

```
Developer adds to their workflow.yml:
  uses: aeorank/action@v1
  with:
    site-url: https://yoursite.com

             ↓  runs on GitHub's ubuntu-latest runner

GitHub Actions runner:
  1. Auto-detects site URL (if not provided)
  2. Runs AEOrank scan (same engine as CLI)
  3. Posts GitHub Check via GITHUB_TOKEN (pass/neutral/fail)
  4. Posts/updates PR comment via GITHUB_TOKEN (score table, file links)
  5. Uploads generated files as workflow artifact
  6. Writes badge JSON for shields.io
  7. Annotates workspace files inline (robots.txt, llms.txt warnings)
```

### What ships in `packages/action/`

**`action.yml`** — Action manifest defining all inputs, outputs, branding

**`src/index.ts`** — Main entry point: detects URL → scans → posts check → posts comment → uploads artifact

**`src/urlDetect.ts`** — Reads workspace files (aeorank.config.js, CNAME, package.json) to find site URL without any input required

**`src/checks.ts`** — Posts GitHub Check Run via `@actions/github` Octokit using `GITHUB_TOKEN`

**`src/prComment.ts`** — Upserts a single PR comment (hidden marker `<!-- aeorank:score-comment -->` prevents spam)

**`dist/index.js`** — Single bundled file (no node_modules needed at runtime) — committed to repo

### Reusable workflow

Teams that want even less yaml call AEOrank's own reusable workflow:

```yaml
jobs:
  aeo:
    uses: aeorank/aeorank/.github/workflows/aeorank-scan.yml@main
    with:
      site-url: https://yoursite.com
      fail-below: 50
```

### Auto-commit generated files

The action can commit files back to the repo automatically:

```yaml
- uses: aeorank/action@v1
  with:
    site-url: ${{ vars.SITE_URL }}
    generate-files: true
    output-dir: ./public

- name: Commit generated files
  run: |
    git config user.name "aeorank[bot]"
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    git add public/llms.txt public/schema.json public/robots-patch.txt
    git diff --staged --quiet || git commit -m "chore: update AEO files [score: ${{ steps.aeo.outputs.score }}]"
    git push
```

### GitHub App (V2, deferred)

A full GitHub App (Probot-style, with webhook server) is a V2 feature for teams that want zero-yaml, install-and-forget behavior. For V1, the Action covers all use cases. The App would be hosted on Railway or Render in V2.



AEOrank is deeply integrated with GitHub across four layers that work together. A developer who installs the GitHub App gets all four automatically. A developer who prefers manual control uses just the GitHub Action.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Event                             │
│              (push to main / pull_request opened)               │
└────────────────────────────┬────────────────────────────────────┘
                             │ webhook
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               AEOrank GitHub App Server                         │
│           (Cloudflare Workers — workers/github-app)             │
│                                                                 │
│  1. Verify webhook signature                                    │
│  2. Detect deployment URL (Vercel / Netlify / custom)           │
│  3. Queue scan job (Trigger.dev)                                │
│  4. Create GitHub Check (status: in_progress)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ scan completes
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AEOrank Scan Engine                           │
│                   (same core as CLI)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ results
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  GitHub Checks API          │  GitHub PR Comments API            │
│  ─────────────────          │  ────────────────────              │
│  • Update Check to          │  • Post/update score table         │
│    pass / fail / neutral    │  • Show diff vs base branch        │
│  • Attach summary           │  • Link to download files          │
│  • Attach annotations       │  • One-click fix instructions      │
└──────────────────────────────────────────────────────────────────┘
```

---

### 16.1 GitHub App

**App name:** `AEOrank`
**App slug:** `aeorank`
**Marketplace listing:** GitHub Apps Marketplace (free to install)

#### What the App Does

- Installs on any public or private GitHub repository
- Listens for `push` and `pull_request` webhook events
- Auto-detects the deployment URL from:
  - `aeorank.config.js` in the repo root (highest priority)
  - Vercel deployment preview URL (via Vercel webhook / GitHub deployment status)
  - Netlify deploy URL (via Netlify GitHub integration status)
  - `AEORANK_SITE_URL` repository secret/variable
  - Homepage URL in `package.json`
  - `CNAME` file (for GitHub Pages)
- Posts results via GitHub Checks API and PR comments
- Requires **zero workflow yaml** — install and it works

#### Permissions Required

```yaml
# GitHub App manifest permissions
permissions:
  checks: write          # Create and update check runs
  contents: read         # Read repo files (detect config, CNAME, package.json)
  pull_requests: write   # Post and update PR comments
  statuses: write        # Post commit statuses (legacy fallback)
  deployments: read      # Read Vercel/Netlify deployment URLs
  metadata: read         # Required by GitHub for all apps
```

#### App Server (`workers/github-app`)

```typescript
// workers/github-app/src/index.ts
import { Hono } from 'hono'
import { verifyWebhookSignature } from './lib/verify'
import { handlePush } from './handlers/push'
import { handlePullRequest } from './handlers/pullRequest'
import { handleDeploymentStatus } from './handlers/deploymentStatus'

const app = new Hono()

app.post('/webhook', async (c) => {
  const payload = await c.req.text()
  const sig = c.req.header('x-hub-signature-256') ?? ''
  const event = c.req.header('x-github-event') ?? ''

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(
    payload,
    sig,
    c.env.GITHUB_WEBHOOK_SECRET
  )
  if (!isValid) return c.json({ error: 'Unauthorized' }, 401)

  const body = JSON.parse(payload)

  switch (event) {
    case 'push':
      await handlePush(body, c.env)
      break
    case 'pull_request':
      await handlePullRequest(body, c.env)
      break
    case 'deployment_status':
      await handleDeploymentStatus(body, c.env)
      break
  }

  return c.json({ ok: true })
})

export default app
```

#### URL Detection Logic

```typescript
// workers/github-app/src/lib/detectUrl.ts
export async function detectSiteUrl(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string
): Promise<string | null> {
  // Priority 1: aeorank.config.js in repo root
  try {
    const config = await octokit.repos.getContent({
      owner, repo, path: 'aeorank.config.js', ref
    })
    const content = Buffer.from(config.data.content, 'base64').toString()
    const urlMatch = content.match(/url:\s*['"`]([^'"`]+)['"`]/)
    if (urlMatch) return urlMatch[1]
  } catch {}

  // Priority 2: CNAME file (GitHub Pages)
  try {
    const cname = await octokit.repos.getContent({
      owner, repo, path: 'CNAME', ref
    })
    const domain = Buffer.from(cname.data.content, 'base64').toString().trim()
    if (domain) return `https://${domain}`
  } catch {}

  // Priority 3: package.json homepage
  try {
    const pkg = await octokit.repos.getContent({
      owner, repo, path: 'package.json', ref
    })
    const parsed = JSON.parse(
      Buffer.from(pkg.data.content, 'base64').toString()
    )
    if (parsed.homepage) return parsed.homepage
  } catch {}

  // Priority 4: GitHub Pages default URL
  try {
    const pages = await octokit.repos.getPages({ owner, repo })
    if (pages.data.html_url) return pages.data.html_url
  } catch {}

  // Priority 5: Repo variable AEORANK_SITE_URL
  try {
    const variable = await octokit.actions.getRepoVariable({
      owner, repo, name: 'AEORANK_SITE_URL'
    })
    if (variable.data.value) return variable.data.value
  } catch {}

  return null
}
```

#### Push Handler

```typescript
// workers/github-app/src/handlers/push.ts
export async function handlePush(payload: PushEvent, env: Env) {
  const { repository, head_commit, installation } = payload
  const { owner: { login: owner }, name: repo } = repository

  // Only scan pushes to default branch
  if (payload.ref !== `refs/heads/${repository.default_branch}`) return

  const octokit = await getInstallationOctokit(installation.id, env)
  const sha = head_commit.id

  // Create a "pending" check immediately so developer sees it
  const check = await octokit.checks.create({
    owner, repo, name: 'AEO Score',
    head_sha: sha,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    output: {
      title: 'Scanning for AI visibility...',
      summary: 'AEOrank is scanning your site. This takes ~30 seconds.',
    }
  })

  // Detect site URL
  const siteUrl = await detectSiteUrl(octokit, owner, repo, sha)

  if (!siteUrl) {
    await octokit.checks.update({
      owner, repo,
      check_run_id: check.data.id,
      status: 'completed',
      conclusion: 'neutral',
      output: {
        title: 'No site URL detected',
        summary: 'Add a `aeorank.config.js` to your repo root with your site URL.',
        text: setupInstructions(),
      }
    })
    return
  }

  // Queue the actual scan (async)
  await env.SCAN_QUEUE.send({
    type: 'github_push',
    siteUrl,
    owner, repo, sha,
    checkRunId: check.data.id,
    installationId: installation.id,
  })
}
```

---

### 16.2 GitHub Checks API Integration

#### Check Run Appearance

When a push or PR triggers a scan, developers see this in their commit/PR:

```
✓ AEO Score · 78/100 (Grade: B) — aeorank · Details
```

On failure:
```
✗ AEO Score · 31/100 (Grade: F) — aeorank · Details
```

#### Check Run Output Format

The "Details" link opens the check run page with full output:

```
AEO Score: 78 / 100   [Grade: B]
Scanned: https://yoursite.com
Pages scanned: 47
Duration: 14.2s

─────────────────────────────────────────────────
 Dimension             Score   Status
─────────────────────  ─────   ──────────────────
 llms.txt present       10/10  ✓ Found at /llms.txt
 Schema markup           8/10  ✓ Organization + WebSite
 AI crawler access      10/10  ✓ GPTBot, ClaudeBot allowed
 Content structure       7/10  ~ Good, 3 pages need headings
 FAQ / speakable         5/10  ~ FAQPage schema incomplete
 Page speed              8/10  ✓ LCP 1.8s
 HTTPS                  10/10  ✓
 Canonical URLs          6/10  ~ 4 pages missing canonicals
 Sitemap freshness       4/10  ✗ Sitemap 47 days old
 Entity markup           5/10  ~ Missing Product schema
 Citation anchors        3/10  ✗ Headings missing IDs
 Content quality         7/10  ✓
─────────────────────────────────────────────────

3 issues require attention. Download fixes:
https://app.aeorank.com/dashboard/fixes?token=xxx
```

#### Annotations

For each fixable issue, the check run includes a file annotation:

```typescript
// Annotate specific files when issues are detectable in the repo
annotations: [
  {
    path: 'public/robots.txt',
    start_line: 1,
    end_line: 1,
    annotation_level: 'warning',
    message: 'Missing AI crawler directives. Add GPTBot and ClaudeBot Allow rules.',
    title: 'AEO: Missing AI crawler access',
    raw_details: '# Add these lines:\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /'
  },
  {
    path: 'public/llms.txt',
    start_line: 1,
    end_line: 1,
    annotation_level: 'failure',
    message: 'llms.txt is empty or missing required sections.',
    title: 'AEO: Invalid llms.txt'
  }
]
```

#### Pass/Fail Thresholds

```typescript
function getConclusion(score: number, config: AeorankConfig): CheckConclusion {
  const threshold = config.github?.failThreshold ?? 40

  if (score >= 70) return 'success'
  if (score >= threshold) return 'neutral'  // warns but doesn't block merge
  return 'failure'  // blocks merge if branch protection requires this check
}
```

Configurable in `aeorank.config.js`:
```javascript
export default {
  github: {
    failThreshold: 50,    // score below this = check fails (default: 40)
    warnThreshold: 70,    // score below this = neutral (default: 70)
    blockMerge: false,    // require check to pass before merge (default: false)
  }
}
```

---

### 16.3 PR Comment Bot

On every pull request, AEOrank posts a formatted comment that **updates in place** (one comment per PR, never spams).

#### Comment Format

```markdown
## AEOrank · AEO Score Report

| | Base (`main`) | This PR | Change |
|--|--|--|--|
| **Score** | 65/100 (C) | 78/100 (B) | ✅ +13 |
| llms.txt | ✓ | ✓ | — |
| Schema markup | 6/10 | 8/10 | ✅ +2 |
| AI crawler access | 10/10 | 10/10 | — |
| Content structure | 5/10 | 7/10 | ✅ +2 |
| FAQ / speakable | 3/10 | 5/10 | ✅ +2 |
| Citation anchors | 2/10 | 6/10 | ✅ +4 |
| Entity markup | 4/10 | 5/10 | ✅ +1 |
| *(other dimensions unchanged)* | | | |

**Scanned:** https://deploy-preview-42.netlify.app  
**Pages:** 47 · **Duration:** 12.1s

<details>
<summary>📥 Download generated files</summary>

These files are ready to commit to your repo:

| File | Action |
|------|--------|
| `public/llms.txt` | [Download](https://app.aeorank.com/files/xxx/llms.txt) |
| `public/schema.json` | [Download](https://app.aeorank.com/files/xxx/schema.json) |
| `public/robots-patch.txt` | [Download](https://app.aeorank.com/files/xxx/robots-patch.txt) |

Or download all as ZIP: [aeorank-files.zip](https://app.aeorank.com/files/xxx/download)

</details>

<details>
<summary>🔧 Remaining issues (3)</summary>

1. **Sitemap freshness** (4/10) — Your sitemap hasn't been updated in 47 days. Regenerate it.
2. **Citation anchors** (6/10) — 8 headings are missing `id` attributes. Add IDs to `h2` and `h3` tags.
3. **Entity markup** (5/10) — No Product schema detected. Add `@type: Product` to product pages.

</details>

---
*[AEOrank](https://aeorank.com) · [Docs](https://docs.aeorank.com) · [Dashboard](https://app.aeorank.com)*
```

#### Comment Management Logic

```typescript
// workers/github-app/src/lib/prComment.ts

const COMMENT_MARKER = '<!-- aeorank-pr-comment -->'

export async function upsertPrComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
) {
  const markedBody = `${COMMENT_MARKER}\n${body}`

  // Find existing AEOrank comment
  const comments = await octokit.issues.listComments({
    owner, repo, issue_number: pullNumber
  })

  const existing = comments.data.find(c =>
    c.body?.startsWith(COMMENT_MARKER) &&
    c.user?.type === 'Bot'
  )

  if (existing) {
    // Update existing comment — don't spam
    await octokit.issues.updateComment({
      owner, repo,
      comment_id: existing.id,
      body: markedBody,
    })
  } else {
    // Create first comment
    await octokit.issues.createComment({
      owner, repo,
      issue_number: pullNumber,
      body: markedBody,
    })
  }
}
```

#### PR Scan URL Detection

For PRs, AEOrank scans the **preview deployment** URL (not production), so you see the score for what you're about to ship:

```typescript
async function getPrScanUrl(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  baseSiteUrl: string
): Promise<string> {
  // Check for Vercel/Netlify preview deployment
  const deployments = await octokit.repos.listDeployments({
    owner, repo,
    environment: `Preview`,
    per_page: 5,
  })

  for (const deployment of deployments.data) {
    const statuses = await octokit.repos.listDeploymentStatuses({
      owner, repo,
      deployment_id: deployment.id,
    })
    const success = statuses.data.find(s => s.state === 'success')
    if (success?.environment_url) return success.environment_url
  }

  // Fall back to production URL
  return baseSiteUrl
}
```

---

### 16.4 GitHub Action (Marketplace)

For teams that prefer explicit CI control over the App's automatic behavior.

**Marketplace listing:** `aeorank/action` at `https://github.com/marketplace/actions/aeorank`

#### Usage

```yaml
# Minimal — just get a score
- uses: aeorank/action@v1
  with:
    site-url: https://yoursite.com

# Full — score, generate files, fail below threshold
- uses: aeorank/action@v1
  with:
    site-url: https://yoursite.com
    fail-below: 50
    generate-files: true
    output-dir: ./aeorank-output
    api-key: ${{ secrets.AEORANK_API_KEY }}   # optional, unlocks Pro features
```

#### Action Definition (`action.yml`)

```yaml
name: 'AEOrank'
description: 'Scan your site for AI visibility and generate optimization files'
author: 'AEOrank'

branding:
  icon: 'search'
  color: 'black'

inputs:
  site-url:
    description: 'URL of the site to scan'
    required: true

  fail-below:
    description: 'Fail the workflow if score is below this threshold (0 = never fail)'
    required: false
    default: '0'

  generate-files:
    description: 'Generate optimization files (llms.txt, schema.json, etc.)'
    required: false
    default: 'true'

  output-dir:
    description: 'Directory to write generated files'
    required: false
    default: './aeorank-output'

  format:
    description: 'Output format: table | json | minimal'
    required: false
    default: 'table'

  api-key:
    description: 'AEOrank API key (optional — unlocks Pro features)'
    required: false

outputs:
  score:
    description: 'Numeric AEO score (0–100)'
  grade:
    description: 'Letter grade (A+, A, B, C, D, F)'
  report-url:
    description: 'URL to full report on AEOrank dashboard'

runs:
  using: 'node20'
  main: 'dist/index.js'
```

#### Action Implementation (`packages/action/src/index.ts`)

```typescript
import * as core from '@actions/core'
import * as github from '@actions/github'
import { scan, generate } from '@aeorank/core'

async function run() {
  try {
    const siteUrl     = core.getInput('site-url', { required: true })
    const failBelow   = parseInt(core.getInput('fail-below') || '0')
    const genFiles    = core.getInput('generate-files') === 'true'
    const outputDir   = core.getInput('output-dir')
    const format      = core.getInput('format')
    const apiKey      = core.getInput('api-key')

    core.info(`🔍 Scanning ${siteUrl}...`)

    // Run the scan
    const result = await scan(siteUrl, { apiKey })

    // Set outputs
    core.setOutput('score', result.score)
    core.setOutput('grade', result.grade)

    // Print summary
    if (format === 'table') {
      core.summary
        .addHeading('AEO Score Report')
        .addTable([
          [{ data: 'Dimension', header: true }, { data: 'Score', header: true }, { data: 'Status', header: true }],
          ...result.dimensions.map(d => [d.name, `${d.score}/10`, d.status])
        ])
        .addSeparator()
        .addRaw(`**Total Score: ${result.score}/100 (${result.grade})**`)
        .write()
    }

    // Generate files if requested
    if (genFiles) {
      core.info(`📁 Generating files to ${outputDir}...`)
      const files = await generate(siteUrl, { outputDir, apiKey })
      core.info(`✓ Generated ${files.length} files`)

      // Add to job summary
      core.summary
        .addHeading('Generated Files', 3)
        .addList(files.map(f => f.filename))
        .write()
    }

    // Annotate workspace files if issues found
    for (const issue of result.fileAnnotations ?? []) {
      core.warning(issue.message, {
        file: issue.path,
        startLine: issue.line,
        title: issue.title,
      })
    }

    // Fail if below threshold
    if (failBelow > 0 && result.score < failBelow) {
      core.setFailed(
        `AEO Score ${result.score}/100 is below the required threshold of ${failBelow}. ` +
        `Run 'npx aeorank generate ${siteUrl}' and commit the generated files to fix this.`
      )
    } else {
      core.info(`✅ AEO Score: ${result.score}/100 (${result.grade})`)
    }

  } catch (error) {
    core.setFailed(`AEOrank scan failed: ${(error as Error).message}`)
  }
}

run()
```

#### Example Workflow: Score on Every Push

```yaml
# .github/workflows/aeorank.yml
name: AEO Score

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  aeo-score:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan AEO Score
        id: aeo
        uses: aeorank/action@v1
        with:
          site-url: ${{ vars.SITE_URL }}
          fail-below: 50
          generate-files: true
          output-dir: ./public

      - name: Commit generated files (on main only)
        if: github.ref == 'refs/heads/main'
        run: |
          git config user.name "aeorank[bot]"
          git config user.email "bot@aeorank.com"
          git add ./public/llms.txt ./public/schema.json ./public/robots-patch.txt || true
          git diff --staged --quiet || git commit -m "chore: update AEO files [score: ${{ steps.aeo.outputs.score }}]"
          git push
```

#### Example Workflow: With Deploy Preview

```yaml
# Scan the preview URL after deployment
name: AEO Score (Preview)

on:
  deployment_status:

jobs:
  aeo-score:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: aeorank/action@v1
        with:
          site-url: ${{ github.event.deployment_status.environment_url }}
          fail-below: 40
```

---

### 16.5 Repository Structure (GitHub Integration additions)

```
aeorank/
├── workers/
│   └── github-app/           # Cloudflare Worker — webhook handler
│       ├── src/
│       │   ├── index.ts
│       │   ├── handlers/
│       │   │   ├── push.ts
│       │   │   ├── pullRequest.ts
│       │   │   └── deploymentStatus.ts
│       │   └── lib/
│       │       ├── verify.ts         # HMAC webhook verification
│       │       ├── octokit.ts        # GitHub App authentication
│       │       ├── detectUrl.ts      # Site URL auto-detection
│       │       ├── prComment.ts      # Upsert PR comments
│       │       ├── checkRun.ts       # GitHub Checks API
│       │       └── formatReport.ts   # Markdown report builder
│       ├── wrangler.toml
│       └── package.json
│
├── packages/
│   └── action/               # GitHub Action — Marketplace
│       ├── src/
│       │   └── index.ts
│       ├── action.yml         # Action manifest
│       ├── dist/              # Built output (committed for action)
│       └── package.json
```

---

### 16.6 GitHub App Setup (for Claude Code to implement)

```bash
# 1. Create GitHub App at github.com/settings/apps/new
# Required settings:
#   Homepage URL: https://aeorank.com
#   Webhook URL: https://github-app.aeorank.com/webhook
#   Webhook secret: (generate random, store as GITHUB_WEBHOOK_SECRET)
#   Permissions: checks:write, contents:read, pull_requests:write, statuses:write
#   Subscribe to events: push, pull_request, deployment_status

# 2. Generate and download private key (.pem file)
# Store as GITHUB_APP_PRIVATE_KEY secret in Cloudflare Workers

# 3. Note your App ID
# Store as GITHUB_APP_ID secret

# 4. Deploy worker
cd workers/github-app
npx wrangler deploy

# 5. Set secrets
npx wrangler secret put GITHUB_APP_ID
npx wrangler secret put GITHUB_APP_PRIVATE_KEY
npx wrangler secret put GITHUB_WEBHOOK_SECRET
npx wrangler secret put AEORANK_INTERNAL_KEY
```

---

### 16.7 Environment Variables (GitHub App additions)

Add to `workers/github-app/.dev.vars`:
```bash
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
AEORANK_API_URL=https://api.aeorank.com
AEORANK_INTERNAL_KEY=ak_internal_xxxx
```

---

### 16.8 Documentation: GitHub Integration

Add to `apps/docs/src/content/docs/integrations/`:

```
github/
├── overview.md          # How the GitHub integration works
├── github-app.md        # Install the GitHub App (no-code setup)
├── github-action.md     # Add the Action manually (yaml config)
├── pr-comments.md       # Understanding PR score comments
├── checks.md            # GitHub Checks and branch protection
└── configuration.md     # aeorank.config.js github options
```

Each doc follows the same structure as CMS/framework integration docs: prerequisites → install → configure → verify → troubleshoot.

---

## 17. Pricing & Monetization

### Tiers

| Feature | Free | Pro ($29/mo) | API ($99/mo) | Agency ($499/mo) |
|---------|------|--------------|--------------|------------------|
| CLI scans | Unlimited | Unlimited | Unlimited | Unlimited |
| Dashboard sites | 1 | 5 | Unlimited | 50 client sites |
| Monitoring | — | Weekly | Daily | Daily |
| File download | ✓ | ✓ | ✓ | ✓ |
| Score history | 7 days | 90 days | 365 days | 365 days |
| API access | — | — | ✓ | ✓ |
| White-label reports | — | — | — | ✓ |
| AI citation tracker | — | ✓ | ✓ | ✓ |
| Competitor scoring | — | — | ✓ | ✓ |
| Priority support | — | Email | Email + Slack | Dedicated |
| Seats | 1 | 1 | 3 | 10 |

### Stripe Products
```
price_free     → Free (no Stripe product, just Clerk account)
price_pro_monthly   → $29/mo recurring
price_pro_annual    → $290/yr recurring (2 months free)
price_api_monthly   → $99/mo recurring
price_api_annual    → $990/yr recurring
price_agency_monthly→ $499/mo recurring
price_agency_annual → $4990/yr recurring
```

### Revenue Projection
- Month 3: ~40 Pro users = $1,160 MRR
- Month 6: ~120 Pro + 10 API = $4,470 MRR
- Month 12: ~300 Pro + 40 API + 10 Agency = $17,560 MRR
- Year 2: scale to $50K+ MRR with enterprise/agency growth

---

## 18. Environment Variables

### Marketing Site (`apps/marketing/.env`)
```bash
PUBLIC_SITE_URL=https://aeorank.com
PUBLIC_GITHUB_REPO=vinpatel/aeorank
PUBLIC_PLAUSIBLE_DOMAIN=aeorank.com
```

### Dashboard (`apps/dashboard/.env.local`)
```bash
# App
NEXT_PUBLIC_APP_URL=https://app.aeorank.com
NEXT_PUBLIC_SITE_URL=https://aeorank.com

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=hello@aeorank.com

# Background Jobs (Trigger.dev)
TRIGGER_API_KEY=tr_dev_...

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=AX...

# AEOrank API (self-referential for scanning)
AEORANK_INTERNAL_KEY=ak_internal_...
```

### CLI (`packages/cli/.env`)
```bash
AEORANK_API_URL=https://api.aeorank.com
```

---

## 19. Launch Checklist

### Phase 1 — Open Source CLI (Week 1–2)
- [ ] Set up monorepo with Turborepo + pnpm
- [ ] Build CLI scanner (URL + local)
- [ ] Build all 8 file generators
- [ ] Build AEO scoring engine (12 dimensions)
- [ ] CLI terminal output with chalk + ora
- [ ] Publish `@aeorank/cli` to npm
- [ ] Create GitHub repo with good README
- [ ] Write 5-minute Quick Start guide
- [ ] Add CLI to vinpatel.com projects page

### Phase 5 — Marketing Site (Week 5–6)
- [ ] Build Astro marketing site
- [ ] Implement design system (colors, type, components)
- [ ] Write all homepage sections
- [ ] Build interactive terminal demo
- [ ] Set up GitHub Actions → GitHub Pages deploy
- [ ] Configure custom domain (aeorank.com)
- [ ] Add OG images for social sharing
- [ ] Submit to GitHub topics for discoverability

### Phase 3 — GitHub Native Integration (Week 3–4)
- [ ] Build GitHub App server (Cloudflare Worker + Hono)
- [ ] Implement webhook signature verification
- [ ] Implement site URL auto-detection (6 strategies)
- [ ] Implement GitHub Checks API integration (pass/fail/neutral)
- [ ] Implement PR comment bot (upsert, not spam)
- [ ] Implement file annotations for fixable issues
- [ ] Build GitHub Action (`packages/action`)
- [ ] Write `action.yml` manifest
- [ ] Deploy worker to `github-app.aeorank.com`
- [ ] Register GitHub App at github.com/settings/apps
- [ ] Submit Action to GitHub Marketplace
- [ ] Write GitHub integration docs (6 pages)

### Phase 4 — Documentation (Week 4–5)
- [ ] Set up Starlight docs site
- [ ] Write Getting Started + Quick Start
- [ ] Write CLI reference
- [ ] Write all 8 file reference docs
- [ ] Write AEO scoring explainer
- [ ] Write 10 CMS integration guides
- [ ] Write 10 framework integration guides
- [ ] Deploy docs to docs.aeorank.com

### Phase 6 — Dashboard MVP (Week 6–8)
- [ ] Next.js app with Clerk auth
- [ ] Supabase + Drizzle schema
- [ ] Site management (add/remove/scan)
- [ ] Score display + history chart
- [ ] File download (ZIP)
- [ ] Stripe integration (Pro plan only)
- [ ] Triggered scan on site add
- [ ] Welcome email via Resend
- [ ] Deploy to Vercel

### Phase 7 — CMS/Framework Integrations (Week 8–10)
- [ ] WordPress plugin
- [ ] Next.js package
- [ ] Astro integration
- [ ] Remaining framework packages
- [ ] Submit WP plugin to WordPress.org

### Phase 8 — Launch
- [ ] Post on Hacker News (Show HN: AEOrank — open-source AEO scanner)
- [ ] Product Hunt launch
- [ ] LinkedIn post (13K followers)
- [ ] vinpatel.com project feature
- [ ] Twitter/X thread with demo GIF
- [ ] Tweet/post the GitHub App install link specifically
- [ ] Post in GitHub community forums and changelog discussions
- [ ] Reply to every early GitHub issue within 24h

---

---

## Appendix: Claude Code + GSD Execution Guide

### This spec is designed for GSD (get-shit-done)

Use the three GSD files in `/gsd/` — `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` — instead of this SPEC.md when running Claude Code. The GSD files have atomic XML task plans that Claude Code can execute one by one.

### Setup

```bash
# Install GSD globally
npx get-shit-done-cc@latest

# Create repo
mkdir aeorank && cd aeorank
git init

# Copy GSD planning files
cp gsd/PROJECT.md PROJECT.md
cp gsd/REQUIREMENTS.md REQUIREMENTS.md
cp gsd/ROADMAP.md ROADMAP.md

# Open Claude Code in full-auto mode (recommended)
claude --dangerously-skip-permissions
```

### Execute

```bash
# Inside Claude Code:
/gsd:new-project          # Review existing PROJECT.md + REQUIREMENTS.md, approve ROADMAP.md

/gsd:execute-phase 1      # Monorepo foundation + CLI scanner (~45 min)
/gsd:verify-work 1

/gsd:execute-phase 2      # AEO scoring engine (~30 min)
/gsd:verify-work 2

/gsd:execute-phase 3      # File generation engine (~45 min)
/gsd:verify-work 3

/gsd:execute-phase 4      # CLI interface + npm publish setup (~30 min)
/gsd:verify-work 4        # ← Ship CLI to npm here

/gsd:execute-phase 5      # GitHub Action (Marketplace) (~45 min)
/gsd:verify-work 5        # ← Ship Action to Marketplace here

/gsd:execute-phase 6      # Marketing site → GitHub Pages (~2 hours)
/gsd:verify-work 6

/gsd:execute-phase 7      # Docs site → docs.aeorank.com (~2 hours)
/gsd:verify-work 7

/gsd:execute-phase 8      # Dashboard SaaS (~3 hours)
/gsd:verify-work 8

/gsd:execute-phase 9      # Tests + launch assets (~1 hour)
/gsd:verify-work 9

/gsd:complete-milestone   # Tag v1.0.0, archive milestone
```

### Important Claude Code settings for this project

Add to `.claude/settings.json` before starting:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(git tag:*)",
      "Bash(mkdir:*)",
      "Bash(cp:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)"
    ]
  }
}
```

### Expected build time

11–18 hours of Claude Code execution. 1–2 calendar days.



When using Claude Code to build this project, start in this order:

1. **Init the monorepo first:**
   ```bash
   mkdir aeorank && cd aeorank
   npx create-turbo@latest .
   pnpm add -D turbo
   ```

2. **Build the CLI core before anything else.** It's the foundation.
   Focus on: `scanner → scorer → generators → CLI output`

3. **Marketing site is a fast follow.** It's mostly HTML/CSS with Astro.
   Refer to the design system section closely.

4. **Dashboard last.** It depends on the CLI core being stable.

5. **For each generator, write tests first** using Vitest with fixture sites.

6. **Never hardcode.** All config via `aeorank.config.js` or CLI flags.

7. **The non-developer UX is the hardest part.** Every error message must suggest a next action. Every success must tell the user what to do next.
