# Open items — v2-redesign

Followups surfaced during the redesign that did not block ship, but should be resolved before the next marketing push or category expansion.

## Priority: content-truth

1. **`@aeorank/astro` emits "Generated 8 AEO files" during build, but site copy claims 9.**
   - Seen in every `pnpm --filter @aeorank/marketing build` run.
   - Likely `feed.xml` is opt-in per framework — needs confirmation.
   - **Fix one of:** (a) make the 9th file always-on in the Astro plugin, (b) update site copy to "up to 9, 8 by default," (c) document which frameworks emit which files.

2. **"2–4 weeks to citation lift" in the FAQ.**
   - Currently stated as: *"Fix the 9 failing checks and a typical site goes from 31→70+ on the next scan. Citations in Perplexity and ChatGPT tend to follow within 2–4 weeks."*
   - Plausible, not measured. Either soften to "often" / "reportedly" or run a before/after case study we can cite.

## Priority: repo health (pre-existing, surfaced by push)

3. **80 Dependabot alerts on `main`** — 3 critical, 24 high, 42 moderate, 11 low.
   - https://github.com/vinpatel/aeorank/security/dependabot
   - Not introduced by V2. Audit and upgrade; group by package.

4. **Node.js 20 action deprecation.**
   - `actions/setup-node@v4`, `actions/upload-artifact`, `pnpm/action-setup@v4` still on Node 20.
   - Forced to Node 24 by GitHub on 2026-06-02. Node 20 removed entirely 2026-09-16.
   - Low effort — bump action versions or add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` to the workflow env.

## Priority: marketing leverage (claims we'd ship if we had the data)

5. **npm weekly downloads for `aeorank-cli`.**
   - Currently no CLI-adoption claim on the site.
   - Competitors use "25,000+ marketing professionals" / "2,000+ teams" to signal traction.
   - Implementation: shields.io badge (`/npm/dw/aeorank-cli`) + wire into the OSS metrics panel as a 7th cell.

6. **Test-suite CI badge.**
   - `packages/core` has 288 tests that currently pass. The site says so. No badge backs it.
   - Add a shields.io GitHub Actions badge for the test workflow in OSS section next to the `288` number.

7. **One named early-adopter logo.**
   - Unlocks CI-integration credibility that hypotheticals ("teams shipping in CI") cannot. Needs user consent and a ready-to-use logo asset.

8. **"First / only open-source AEO toolkit" claim.**
   - Currently softened to "unusual in the category." To hard-claim: ship a dated blog post with an explicit competitor list (Profound, Scrunch, Otterly, Peec, AthenaHQ, Evertune, Goodie, Writesonic AI Monitor, HubSpot AI Search Grader, Ahrefs Brand Radar, Semrush AI Toolkit), each tagged open/closed. When at least one of these flips to open source, the claim falls — so the post needs to be revisited periodically.

## Priority: nav / UX nits (not blocking)

9. **Mobile nav sheet could show the GitHub star count.**
   - The desktop star pill is hidden under 900px. Mobile menu just has "Star on GitHub" text. Consider showing the live star count in the mobile sheet too, now that the API fetch is free.

10. **Hero inspector "diff" tab currently dims both panes.**
    - Functional but aesthetic; a true diff view (side-by-side with red/green highlights) would land harder. Small project if someone has an afternoon.

## Priority: competitive monitoring (recurring)

11. **Re-run competition agent every 60 days.**
    - Pricing, positioning verbs, and feature gaps will move. Refresh `COMPETITION.md`. See that file's "Research method" section for what to scan.

12. **Watch for Profound shipping auto-generation of fixes.**
    - They're the best-funded competitor. If they ship a file-generator equivalent, the "others monitor, AEOrank fixes" frame weakens. Worth a dedicated check whenever they announce a product update.

## Priority: followups from the competition agent's findings

13. **Consider swapping Semrush for Peec in the pricing competitor strip.**
    - Semrush is a useful price anchor but isn't really in the AEO-tool conversation. Peec AI is. Deferred for this pass because the instructions said keep competitor names correct; worth revisiting.
