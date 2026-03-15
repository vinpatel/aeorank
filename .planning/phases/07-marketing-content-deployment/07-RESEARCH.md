# Phase 7: Marketing Content & Deployment - Research

**Researched:** 2026-03-14
**Domain:** Astro component editing, Tailwind CSS, GitHub Action Marketplace documentation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pricing tier availability**
- Mark ALL three paid tiers (Pro $29, API $99, Agency $499) as available (`available: true`)
- Remove `opacity-60` styling and "Coming Soon" labels from all paid tiers
- CTA text for paid tiers: "Start Free Trial"
- CTA link for all paid tiers: `https://app.aeorank.dev`
- Free tier stays as-is: "Install Now" linking to docs getting-started

**FAQ & copy updates**
- Update "Is AEOrank free?" answer: replace "web dashboard (coming soon)" with direct statement about the shipped dashboard — "The web dashboard has paid tiers starting at $29/month for score history, charts, and file downloads"
- Update "Can I use this in CI?" answer: replace "coming soon" with mention of the official GitHub Action — "use the official GitHub Action (aeorank/action@v1) to post scores as Check Runs and PR comments automatically"
- No new FAQ entries — just update stale copy in existing ones
- Only FAQ and Pricing components need copy updates; Hero, HowItWorks, ScoringExplainer, FilesList are current

**Dashboard CTA placement**
- Nav bar: Add "Dashboard" link pointing to `https://app.aeorank.dev`
- Footer: Add "Dashboard" link alongside existing Docs/GitHub links
- CTA section: Add "Open Dashboard" as tertiary link (after "Read the Quick Start Guide" and "View on GitHub")
- Hero section: No changes — stays CLI-focused

**GitHub Action Marketplace checklist**
- Create `action/PUBLISHING.md` with step-by-step publication instructions
- Docs-only: document the steps but don't execute them
- Document metadata fields to set (icon, color, description) but don't modify action.yml
- No branding assets or verified publisher steps in this phase

### Claude's Discretion
- Exact wording of updated FAQ answers (beyond the key phrases captured above)
- Dashboard link styling in Nav (regular nav item, not a styled button)
- Tertiary CTA link styling in CTA section
- Publication checklist structure and level of detail

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SITE-02 | Homepage with hero, terminal demo, how-it-works, generated files list, scoring explainer, pricing, FAQ, CTA | Pricing and FAQ components identified as data-driven arrays; specific fields to update are `available`, `cta`, `ctaLink` in tiers array and `answer` strings in faqs array |
| GHA-01 | Composite action wrapping CLI, published to Marketplace as aeorank/action@v1 | action.yml branding block already present (icon: bar-chart-2, color: blue); action/ directory confirmed; PUBLISHING.md checklist is the remaining deliverable |
</phase_requirements>

## Summary

Phase 7 is a pure content and documentation update phase — no new code, no new features, no dependency changes. The work divides into two distinct tracks: (1) updating five Astro components to replace stale "Coming Soon" copy with accurate product state, and (2) writing a Markdown checklist documenting the GitHub Action Marketplace publication steps.

All five Astro components (`Pricing.astro`, `FAQ.astro`, `Nav.astro`, `Footer.astro`, `CTASection.astro`) are static files with no build-time data fetching, no external APIs, and no TypeScript complexity. The components are data-driven where it matters: Pricing uses a `tiers` array (fields: `available`, `cta`, `ctaLink`) and FAQ uses a `faqs` array (field: `answer`). Edits are straightforward field changes. Nav, Footer, and CTASection contain static HTML — additions are new `<a>` elements using existing CSS classes.

The GHA-01 deliverable (`action/PUBLISHING.md`) is documentation only. The `action.yml` already has branding metadata set (`icon: "bar-chart-2"`, `color: "blue"`), so no code changes are needed. The PUBLISHING.md needs to document the manual GitHub UI steps to create the v1.0.0 release tag that triggers Marketplace listing.

**Primary recommendation:** Execute all five component edits in a single plan, then create `action/PUBLISHING.md` in a second plan. Both plans are fast — estimated 5 minutes each. Build verification (`pnpm build --filter marketing`) is the success gate.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.x | Static site framework for marketing | Already in use; component format is `.astro` frontmatter + HTML template |
| Tailwind CSS | 4.x (via @tailwindcss/vite) | Utility styling | Already configured in project; utility classes applied directly in templates |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Preact | current | Interactive terminal demo island | Already present; not touched in this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct HTML `<a>` for tertiary CTA | `btn-secondary` class | `btn-secondary` has `border` and `padding` — for a tertiary plain text link, Tailwind utilities `text-text-muted hover:text-text text-sm font-medium transition-colors` match Nav link style without adding a third button class |

**Installation:** No new packages required for this phase.

## Architecture Patterns

### Relevant Project Structure
```
apps/marketing/src/
├── components/
│   ├── Pricing.astro        # tiers[] data array — update available/cta/ctaLink
│   ├── FAQ.astro            # faqs[] data array — update answer strings
│   ├── Nav.astro            # static HTML — add Dashboard <a> in center nav
│   ├── Footer.astro         # static HTML — add Dashboard link in Product column
│   └── CTASection.astro     # static HTML — add "Open Dashboard" tertiary <a>
├── styles/
│   └── global.css           # .btn-primary, .btn-secondary defined here
└── layouts/
    └── Base.astro

action/
├── action.yml               # branding already set (icon, color) — do NOT modify
├── README.md
└── PUBLISHING.md            # CREATE THIS — Marketplace publication checklist
```

### Pattern 1: Data-Driven Astro Component (Pricing, FAQ)
**What:** Frontmatter holds a typed array of objects; the template maps over it. Updates are pure data changes — no markup edits required.
**When to use:** For Pricing and FAQ, change only the array values in the `---` frontmatter block. Do not touch the `{tiers.map(...)}` template logic.

**Pricing tier update (the exact change):**
```astro
// In Pricing.astro frontmatter — change Pro, API, Agency tiers:
{
  name: "Pro",
  cta: "Start Free Trial",   // was "Coming Soon"
  ctaLink: "https://app.aeorank.dev",  // was "#"
  available: true,           // was false
  // ...rest unchanged
}
```
The `opacity-60` class is applied conditionally: `!tier.available && "opacity-60"` — setting `available: true` automatically removes it. No CSS changes needed.

The `btn-primary` path in the template is already wired: `{tier.available ? (<a href={tier.ctaLink} class="btn-primary">) : (<span class="btn-secondary cursor-not-allowed opacity-50">)}` — available tiers get an `<a>` with `btn-primary`, unavailable get a disabled `<span>`.

### Pattern 2: Static HTML Astro Component (Nav, Footer, CTASection)
**What:** No frontmatter data arrays — HTML is written directly. Add new `<a>` elements following existing element patterns.
**When to use:** Copy an adjacent `<a>` element's class attributes exactly to ensure visual consistency.

**Nav Dashboard link:** Add inside the center `<div class="flex items-center justify-center gap-8">`, after the Pricing link:
```html
<a href="https://app.aeorank.dev" class="text-sm font-medium text-text-muted transition-colors hover:text-text">
  Dashboard
</a>
```

**Footer Dashboard link:** Add to the Product column `<ul>` (which currently has Documentation, CLI Reference, Pricing):
```html
<li><a href="https://app.aeorank.dev" class="text-sm text-text-muted hover:text-text transition-colors">Dashboard</a></li>
```

**CTASection tertiary link:** The CTA section's button row is `<div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">`. The tertiary link should be a plain text link, not a button — use the same inline anchor style as Nav links. Claude's discretion on exact styling; recommended pattern:
```html
<a href="https://app.aeorank.dev" class="text-sm font-medium text-text-muted transition-colors hover:text-text">
  Open Dashboard →
</a>
```

### Pattern 3: GitHub Action Marketplace PUBLISHING.md
**What:** A Markdown checklist file at `action/PUBLISHING.md` documenting the manual steps to publish to GitHub Marketplace.
**Structure:** Ordered checklist with sections for pre-flight checks, creating the release, Marketplace listing fields, post-publish verification. No code execution — all steps are GitHub UI actions or shell commands the human runs manually.

**Key fields already set in action.yml (document as confirmed):**
- `name`: "AEOrank — AEO Scanner"
- `description`: already present
- `branding.icon`: "bar-chart-2"
- `branding.color`: "blue"
- `author`: "AEOrank"

**Key Marketplace publication steps to document:**
1. Ensure action.yml has valid `name`, `description`, `branding` (already done)
2. Create GitHub release with tag `v1.0.0` on the `action/` subdirectory source (the action lives at `aeorank/action` repo root or a subdirectory — clarify in checklist)
3. Check "Publish this Action to the GitHub Marketplace" checkbox during release creation
4. Verify listing appears at `https://github.com/marketplace/actions/aeorank-aeo-scanner`
5. Test with `uses: aeorank/action@v1` in a consumer workflow

### Anti-Patterns to Avoid
- **Modifying Pricing template markup:** The conditional rendering logic (`tier.available ? <a> : <span>`) is correct and works — only change data values, not template logic.
- **Adding a fourth CSS button class:** There are two button classes (`btn-primary`, `btn-secondary`). The tertiary Dashboard CTA in CTASection should use plain text link styling (Tailwind utilities), not a new CSS class, to maintain visual hierarchy.
- **Touching action.yml:** The branding metadata is already correct. PUBLISHING.md is docs-only.
- **Adding "Available Now" badge to paid tiers:** The badge (`<span class="absolute -top-3 left-6 bg-accent-warm">Available now</span>`) currently shows only when `tier.highlighted` is true. The Free tier has `highlighted: true`. Do not change `highlighted` for paid tiers — the badge should remain on Free only. The CONTEXT.md only asks to set `available: true`, not `highlighted: true`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Disabled CTA state | Custom disabled logic | Existing `tier.available` conditional in Pricing.astro template | Already handles button vs. disabled span rendering |
| Tertiary CTA styling | New CSS class | Tailwind utilities matching existing nav link style | Keeps style consistent without CSS maintenance |

## Common Pitfalls

### Pitfall 1: available vs highlighted badge confusion
**What goes wrong:** Setting `available: true` on paid tiers might tempt setting `highlighted: true` too, which adds the "Available now" badge — but that badge is intended only for the Free tier (the featured/highlighted tier).
**Why it happens:** The two flags look related but serve different purposes: `available` controls CTA rendering and opacity; `highlighted` controls border emphasis and the "Available now" badge.
**How to avoid:** Only change `available`, `cta`, and `ctaLink` on paid tiers. Leave `highlighted: false` unchanged.

### Pitfall 2: Build verification scope
**What goes wrong:** Editing Astro files with syntax errors (unclosed tags, malformed frontmatter) that aren't caught until build.
**Why it happens:** Astro's `.astro` format mixes JS frontmatter and HTML — syntax errors in either block fail silently in editors.
**How to avoid:** Run `pnpm --filter marketing build` after each component edit group. The success criteria requires "zero errors" build.
**Warning signs:** TypeScript errors in frontmatter, unclosed HTML tags, mismatched JSX-style conditional expressions.

### Pitfall 3: Hardcoded dashboard URL consistency
**What goes wrong:** Using slightly different URL forms (`https://app.aeorank.dev`, `https://app.aeorank.dev/`, `http://app.aeorank.dev`) across different components.
**Why it happens:** Copy-paste variance across five separate files.
**How to avoid:** Canonical URL is `https://app.aeorank.dev` (no trailing slash). Use this form consistently across all five components.

### Pitfall 4: FAQ answer index assumption
**What goes wrong:** Updating wrong FAQ answers if array order changes or is miscounted.
**Why it happens:** The faqs array has 7 entries; updates are needed at index 1 ("Is AEOrank free?") and index 5 ("Can I use this in CI?").
**How to avoid:** Match by `question` string content, not array index. The question strings are unique and stable identifiers.

## Code Examples

### Confirmed exact current state of stale FAQ answers
From direct file read of `apps/marketing/src/components/FAQ.astro`:

```javascript
// Index 1 — stale text to replace:
answer: "The CLI is free and MIT-licensed. Run unlimited scans, generate all 8 files, pipe JSON to CI — no account needed. The web dashboard (coming soon) has paid tiers starting at $29/month.",

// Index 5 — stale text to replace:
answer: "Yes. Run npx aeorank scan --format json in any CI pipeline. A GitHub Action that posts scores as Check Runs and PR comments is coming soon.",
```

### Confirmed exact current state of stale Pricing tier fields
From direct file read of `apps/marketing/src/components/Pricing.astro`:

```javascript
// Pro tier — all three fields stale:
cta: "Coming Soon",
ctaLink: "#",
available: false,

// API tier — same pattern:
cta: "Coming Soon",
ctaLink: "#",
available: false,

// Agency tier — same pattern:
cta: "Coming Soon",
ctaLink: "#",
available: false,
```

### Confirmed action.yml branding (already correct, document as-is in PUBLISHING.md)
From direct file read of `action/action.yml`:

```yaml
branding:
  icon: "bar-chart-2"
  color: "blue"
```

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| @astrojs/tailwind integration | @tailwindcss/vite (Tailwind CSS 4) | Already in use in this project — no change |
| Static "coming soon" placeholders | Live product URLs | This phase's core change |

## Open Questions

1. **Agency tier features vs. shipped dashboard**
   - What we know: Agency tier ($499) features "White-label PDF reports" — per REQUIREMENTS.md, ADV-05 (white-label PDF) is v2/deferred.
   - What's unclear: Should the Agency tier CTA link to `https://app.aeorank.dev` even though not all features are available there yet?
   - Recommendation: CONTEXT.md explicitly says mark ALL three paid tiers with `ctaLink: "https://app.aeorank.dev"` — follow this decision as-is. The tier description stays unchanged; the dashboard handles what's available.

2. **PUBLISHING.md — action repo structure**
   - What we know: The action lives in the monorepo at `action/` directory. GitHub Marketplace requires the action to be accessible at the root of a GitHub repository.
   - What's unclear: Whether `aeorank/action` is a separate GitHub repo (implied by README referencing `uses: aeorank/action@v1`) or if it's published from the monorepo with some subdirectory mechanism.
   - Recommendation: The PUBLISHING.md checklist should include a step noting this structural requirement — the `action/` directory contents need to exist at the root of a `github.com/aeorank/action` repository. The checklist documents what to do; it doesn't need to resolve the repo structure question to be useful.

## Sources

### Primary (HIGH confidence)
- Direct file reads — `apps/marketing/src/components/Pricing.astro`, `FAQ.astro`, `Nav.astro`, `Footer.astro`, `CTASection.astro`, `styles/global.css` — actual component source inspected
- Direct file read — `action/action.yml` — branding metadata confirmed present
- Direct file read — `.planning/phases/07-marketing-content-deployment/07-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- GitHub Actions Marketplace documentation (from training knowledge): action.yml `branding` block with `icon` and `color` fields is required for Marketplace listing; creating a GitHub release with tag triggers the Marketplace publish flow

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Component edit targets: HIGH — direct file reads confirmed exact field names and current values
- CSS class patterns: HIGH — global.css read directly
- GHA Marketplace publication steps: MEDIUM — based on training knowledge, not verified against current GitHub docs (but steps are well-established and unlikely to have changed significantly)
- action.yml branding: HIGH — file read directly

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain — Astro component editing, GitHub Action Marketplace publish flow)
