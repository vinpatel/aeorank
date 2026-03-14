# Phase 3: Web Presence - Research

**Researched:** 2026-03-14
**Status:** Complete

## Stack Decisions

### Marketing Site (apps/marketing/)
- **Framework:** Astro 5.x (latest stable)
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite` plugin (NOT the deprecated `@astrojs/tailwind` integration)
- **Interactivity:** Preact via `@astrojs/preact` for the terminal demo island only
- **Build:** Static HTML output (default Astro behavior)
- **Deploy:** GitHub Pages via `withastro/action@v5` + `actions/deploy-pages@v4`

### Documentation Site (apps/docs/)
- **Framework:** Astro 5.x + Starlight (`@astrojs/starlight`)
- **Content:** Markdown files in `src/content/docs/`
- **Content config:** `src/content.config.ts` using `docsLoader()` and `docsSchema()`
- **Deploy:** GitHub Pages (separate deployment — see Deployment Architecture below)

## Deployment Architecture

### Critical Constraint: GitHub Pages = 1 Custom Domain Per Repo

GitHub Pages only supports a single custom domain per repository. Since we need:
- `aeorank.dev` → marketing site
- `docs.aeorank.dev` → documentation site

**Solution: Two separate GitHub Pages deployments**

**Option A (Recommended): Separate repos for Pages deployment**
- The monorepo builds both sites
- Marketing site deploys to the main repo's GitHub Pages (aeorank.dev via CNAME)
- Docs site deploys to a separate `aeorank/docs` repo's GitHub Pages (docs.aeorank.dev via CNAME)
- GitHub Action in main repo builds docs, then pushes built output to the docs repo

**Option B: Docs as subpath**
- Deploy docs at `aeorank.dev/docs/` instead of `docs.aeorank.dev`
- Simpler but less professional, breaks convention for dev tool docs
- NOT recommended per CONTEXT.md which specifies docs.aeorank.dev

**Option C: Alternative hosting for docs**
- Use Cloudflare Pages, Netlify, or Vercel for the docs site
- Adds hosting complexity outside GitHub ecosystem
- NOT recommended — keep everything on GitHub Pages

**Decision: Option A** — Build both in monorepo, deploy marketing to main repo Pages, deploy docs to `aeorank/docs` repo Pages. Single GitHub Actions workflow handles both.

### GitHub Actions Workflow Structure

Two workflow files:
1. `.github/workflows/deploy-marketing.yml` — builds and deploys marketing to main repo Pages
2. `.github/workflows/deploy-docs.yml` — builds docs, pushes to aeorank/docs repo, triggers Pages deploy there

Marketing workflow uses the official `withastro/action@v5`:
```yaml
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
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: withastro/action@v5
        with:
          path: apps/marketing
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
```

Docs workflow builds in monorepo and pushes to separate repo:
```yaml
name: Deploy Docs Site
on:
  push:
    branches: [main]
    paths: ['apps/docs/**']
  workflow_dispatch:
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @aeorank/docs build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          deploy_key: ${{ secrets.DOCS_DEPLOY_KEY }}
          external_repository: aeorank/docs
          publish_dir: apps/docs/dist
          cname: docs.aeorank.dev
```

## Tailwind CSS 4 Setup (Marketing Site)

Tailwind 4 uses the Vite plugin approach (NOT the old @astrojs/tailwind integration):

1. Install: `pnpm add tailwindcss @tailwindcss/vite`
2. Configure in `astro.config.mjs`:
   ```js
   import tailwindcss from "@tailwindcss/vite";
   export default defineConfig({
     vite: { plugins: [tailwindcss()] }
   });
   ```
3. Create `src/styles/global.css` with `@import "tailwindcss";`
4. Import in layout: `import "../styles/global.css";`
5. Custom theme values via CSS `@theme` directive (Tailwind 4 approach):
   ```css
   @import "tailwindcss";
   @theme {
     --color-bg: #FAF9F7;
     --color-text: #111111;
     --font-sans: "Inter", sans-serif;
   }
   ```

## Starlight Setup (Docs Site)

### Adding to Existing Astro Project

1. Install: `pnpm astro add starlight` (from apps/docs/)
2. Configure `astro.config.mjs`:
   ```js
   import starlight from '@astrojs/starlight';
   export default defineConfig({
     site: 'https://docs.aeorank.dev',
     integrations: [
       starlight({
         title: 'AEOrank Docs',
         sidebar: [/* ... */],
       }),
     ],
   });
   ```
3. Create `src/content.config.ts`:
   ```ts
   import { defineCollection } from 'astro:content';
   import { docsLoader } from '@astrojs/starlight/loaders';
   import { docsSchema } from '@astrojs/starlight/schema';
   export const collections = {
     docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
   };
   ```
4. Add docs as Markdown files in `src/content/docs/`

### Starlight Sidebar Configuration
```js
sidebar: [
  { label: 'Getting Started', items: ['getting-started', 'what-is-aeo'] },
  { label: 'CLI Reference', items: ['cli/scan', 'cli/init', 'cli/generate', 'cli/configuration'] },
  { label: 'Generated Files', items: [
    'files/llms-txt', 'files/llms-full-txt', 'files/claude-md',
    'files/schema-json', 'files/robots-patch-txt', 'files/faq-blocks-html',
    'files/citation-anchors-html', 'files/sitemap-ai-xml'
  ]},
  { label: 'Scoring', items: ['scoring/dimensions', 'scoring/calculation', 'scoring/grades'] },
]
```

## Terminal Demo (Astro Island)

### Architecture
- Preact component rendered as Astro island with `client:visible` directive
- Only JS on the entire marketing site — rest is pure HTML/CSS
- Auto-plays typing animation when scrolled into viewport

### Implementation Approach
1. Install `@astrojs/preact`: `pnpm astro add preact`
2. Create `src/components/TerminalDemo.tsx` (Preact component)
3. Use in Astro page: `<TerminalDemo client:visible />`
4. `client:visible` loads JS only when terminal scrolls into view
5. Component renders dark terminal UI, types commands, shows output progressively

### Terminal Output to Simulate
```
$ npx aeorank scan https://example.com

  Scanning https://example.com...
  ✓ Fetched 12 pages in 3.2s
  ✓ Analyzed structure and schema
  ✓ Generated 8 files

  AEO Score: 42/100 (D)

  Dimension          Score  Status
  ─────────────────────────────────
  llms.txt             0    ✗ fail
  Schema Markup       65    ⚠ warn
  FAQ Structure       20    ✗ fail
  Heading Hierarchy   80    ✓ pass
  ...

  ✓ 8 files written to ./aeo-output/
```

## Astro Configuration (Marketing)

```js
// apps/marketing/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://aeorank.dev',
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

With `public/CNAME` containing: `aeorank.dev`

## Content Accuracy Requirements

### Docs Must Reference Real Code
- CLI commands from `@aeorank/cli` (scan, init)
- Flags from actual implementation (--format, --output, --config)
- 12 scoring dimensions from `@aeorank/core` scorer
- 8 file formats from `@aeorank/core` generators
- Configuration options from actual config schema

### Marketing Copy Must Be Specific
- "Generates 8 files in 45 seconds" (not "Supercharge your AI presence")
- Actual CLI output examples
- Real dimension names from scorer
- Honest pricing: Free CLI / Pro $29 / API $99 / Agency $499

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GitHub Pages 1-domain limit | Can't host both sites from same repo | Use separate docs repo for Pages deployment |
| Tailwind 4 breaking changes | Old guides use deprecated @astrojs/tailwind | Use @tailwindcss/vite plugin exclusively |
| Starlight theme conflicts with brand | Starlight has its own design system | Docs use Starlight defaults (good enough); marketing uses custom Tailwind |
| Terminal demo JS size | Could bloat marketing site | Preact (~3KB) + client:visible (lazy load) keeps it minimal |
| Docs content accuracy | Docs could drift from actual CLI | Reference actual @aeorank/core types and CLI help output during content creation |
| Inter font loading | Web fonts add weight | Use `font-display: swap` + preload; fallback to system sans-serif |

## RESEARCH COMPLETE

---

*Phase: 03-web-presence*
*Researched: 2026-03-14*
