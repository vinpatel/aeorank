# Phase 7: Marketing Content & Deployment - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Update marketing site copy to reflect shipped product state (dashboard, GitHub Action), add working dashboard links throughout the site, and create a GitHub Action Marketplace publication checklist. No new features or pages — content and link updates only.

</domain>

<decisions>
## Implementation Decisions

### Pricing tier availability
- Mark ALL three paid tiers (Pro $29, API $99, Agency $499) as available (`available: true`)
- Remove `opacity-60` styling and "Coming Soon" labels from all paid tiers
- CTA text for paid tiers: "Start Free Trial"
- CTA link for all paid tiers: `https://app.aeorank.dev`
- Free tier stays as-is: "Install Now" linking to docs getting-started

### FAQ & copy updates
- Update "Is AEOrank free?" answer: replace "web dashboard (coming soon)" with direct statement about the shipped dashboard — "The web dashboard has paid tiers starting at $29/month for score history, charts, and file downloads"
- Update "Can I use this in CI?" answer: replace "coming soon" with mention of the official GitHub Action — "use the official GitHub Action (aeorank/action@v1) to post scores as Check Runs and PR comments automatically"
- No new FAQ entries — just update stale copy in existing ones
- Only FAQ and Pricing components need copy updates; Hero, HowItWorks, ScoringExplainer, FilesList are current

### Dashboard CTA placement
- Nav bar: Add "Dashboard" link pointing to `https://app.aeorank.dev`
- Footer: Add "Dashboard" link alongside existing Docs/GitHub links
- CTA section: Add "Open Dashboard" as tertiary link (after "Read the Quick Start Guide" and "View on GitHub")
- Hero section: No changes — stays CLI-focused

### GitHub Action Marketplace checklist
- Create `action/PUBLISHING.md` with step-by-step publication instructions
- Docs-only: document the steps but don't execute them
- Document metadata fields to set (icon, color, description) but don't modify action.yml
- No branding assets or verified publisher steps in this phase

### Claude's Discretion
- Exact wording of updated FAQ answers (beyond the key phrases captured above)
- Dashboard link styling in Nav (regular nav item, not a styled button)
- Tertiary CTA link styling in CTA section
- Publication checklist structure and level of detail

</decisions>

<specifics>
## Specific Ideas

- Dashboard URL is `https://app.aeorank.dev` (subdomain pattern)
- Paid tier CTAs say "Start Free Trial" — implies low commitment
- GitHub Action referenced as `aeorank/action@v1` in updated FAQ copy

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Pricing.astro: Data-driven `tiers` array — update `available`, `cta`, `ctaLink` properties per tier
- FAQ.astro: Data-driven `faqs` array — update `answer` strings for questions 2 and 6
- CTASection.astro: Static HTML — add a third link element
- Nav.astro: Add nav item for Dashboard
- Footer.astro: Add footer link for Dashboard

### Established Patterns
- Astro components with Tailwind CSS utility classes
- `btn-primary` and `btn-secondary` CSS classes for CTA buttons
- Data-driven arrays for FAQ and Pricing (easy to update without touching markup)

### Integration Points
- All dashboard links point to `https://app.aeorank.dev`
- Pricing tier `available` boolean controls opacity and CTA rendering (button vs disabled span)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-marketing-content-deployment*
*Context gathered: 2026-03-14*
