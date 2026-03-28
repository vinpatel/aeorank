# Phase 3: Web Presence - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Marketing site at aeorank.dev (Astro 5) and documentation site at docs.aeorank.dev (Astro + Starlight), both deployed to GitHub Pages via GitHub Actions. The dashboard (Next.js) is a separate phase.

</domain>

<decisions>
## Implementation Decisions

### Marketing Site (aeorank.dev)
- Astro 5 with Tailwind CSS 4
- Zero JS by default — pure HTML/CSS for all static content
- Astro island only for the interactive terminal demo component
- Deployed to GitHub Pages via GitHub Actions on push to main
- Custom domain: aeorank.dev via CNAME file

### Design Aesthetic (37signals/Gumroad)
- Background: warm off-white #FAF9F7
- Text: near-black #111
- Accent/buttons: solid black, no gradients, no glassmorphism
- Typography: Inter for body, large confident headlines
- Real terminal-style code blocks (dark background, monospace)
- Clean, editorial feel — direct copy, no buzzwords
- Honest marketing: "Generates 8 files in 45 seconds" not "Supercharge your AI presence"

### Homepage Sections
1. Navigation (logo, links, CTA button)
2. Hero: headline + subheadline + CTA + animated terminal demo
3. How it works: 3-step visual (scan → score → generate)
4. Generated files list: show all 8 files with descriptions
5. AEO score explainer: 12 dimensions overview
6. Pricing table: Free CLI / Pro $29 / API $99 / Agency $499
7. FAQ: common questions about AEO and the tool
8. Footer CTA + newsletter signup
9. Footer: links, social, legal

### Terminal Demo
- Interactive Astro island (Preact for minimal JS)
- Shows realistic `npx aeorank scan` output with typing animation
- Displays score, dimension table, generated files list
- Auto-plays on scroll into view

### Documentation Site (docs.aeorank.dev)
- Astro + Starlight framework
- Deployed separately to GitHub Pages (subdomain)
- Navigation: sidebar with sections

### Docs Content Structure
1. Getting Started
   - Quick start (5-minute guide: install → scan → review files)
   - What is AEO?
2. CLI Reference
   - All commands (scan, init, generate)
   - All flags and options
   - Configuration file reference
3. Generated Files
   - One page per file (llms.txt, schema.json, robots-patch.txt, etc.)
   - What it is, why it matters, how to deploy it
4. Scoring
   - 12 dimensions explained
   - How scores are calculated
   - Grade thresholds
5. Integrations (placeholder pages for Phase 6 content)

### Claude's Discretion
- Exact Tailwind utility classes and component structure
- Starlight theme customization details
- GitHub Actions workflow configuration
- Image/illustration choices (if any)
- Exact FAQ questions and answers
- How to structure the terminal demo animation

</decisions>

<specifics>
## Specific Ideas

- Domain is aeorank.dev (NOT aeorank.com)
- Marketing copy should be direct and specific, like 37signals/Basecamp/HEY
- Terminal demo should feel real — actual aeorank output, not mockup
- Docs should get a developer from zero to working scan in under 5 minutes
- Pricing page should be simple and clear — no confusion about what's free vs paid

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- apps/marketing/ already has an Astro stub from Phase 1 monorepo setup
- apps/docs/ already has a stub
- @aeorank/core types and constants can be referenced for accurate docs content
- Turborepo build pipeline already handles apps/

### Established Patterns
- pnpm workspace with Turborepo
- GitHub Pages deployment target
- Tailwind CSS 4 (configured in monorepo)

### Integration Points
- Marketing site links to docs.aeorank.dev
- Docs reference CLI commands from @aeorank/cli
- Both sites deploy via GitHub Actions workflows in .github/workflows/
- CNAME files for custom domains

</code_context>

<deferred>
## Deferred Ideas

- Blog / changelog page — can be added later
- Open metrics page (GitHub stars, npm downloads, MRR) — needs data sources
- CMS integration guides — Phase 6
- Framework integration guides — Phase 6
- Video demos — future enhancement

</deferred>

---

*Phase: 03-web-presence*
*Context gathered: 2026-03-14*
