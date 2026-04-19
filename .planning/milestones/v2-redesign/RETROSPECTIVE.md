# v2 Redesign — Retrospective

**Shipped:** 2026-04-19 (live at aeorank.dev via GitHub Pages deploy)
**Branch:** `redesign/v2` → rebased and fast-forwarded onto `main`
**V1 preserved as:** git tag `marketing-v1` on remote
**Scope:** `apps/marketing` only — `apps/docs` and the app shell untouched

## Narrative

Starting state was a dark, accent-heavy marketing site (orange brand, dark paper) that read as a generic SaaS landing template. User asked for a full "Version B" redesign inspired by factory.ai's restraint and density, *in a light variant*, with an open-source / GitHub-star-driving positioning — keeping Version A fully intact so nothing shipped could be lost.

The design direction landed on a concept called **AEO Inspector**: treat the entire site as an exposed developer-tool panel that's actively auditing the visitor's site for AI visibility. Every section is built from product-native material — scan output, JSON fragments, file tree with real previews, a tabular leaderboard, pricing as report cards, FAQ rendered twice (as JSON-LD and as prose). The `/100` score motif acts as a spine across the page; a measurement-tick "rail" runs down the left gutter; monospace is a load-bearing design element, not a decoration. See `DESIGN-DIRECTION.md` for the written contract.

Three commits landed on `main`:

1. `0716f89` — **feat(marketing):** full redesign. New CSS tokens (warm paper + ink + mono-first type scale), rewritten Base/Nav/Footer, eleven new sections replacing V1's, and a rewrite of `scoreboard.astro` + `privacy.astro` so the whole site reads as one system.

2. `8a5b1d2` — **fix(marketing/v2): restore V1-style nav, remove fabricated stats.** First round of user feedback. The initial nav had an overengineered scanbar + monospace route crumb that read as "off." Replaced with a cleaner V1-layout nav adapted to the light canvas: centered sans-serif links, live-fetched star count, ink CTA. Also ripped out every fabricated metric — no more hardcoded "2,847 stars," "411 tests," "13 framework plugins," "42 contributors," "+172/wk growth," or "v0.9.3 · 2 days ago." Numbers that aren't verifiable in the codebase were either deleted, swapped for real counts (288 tests, 11 plugins), or wired to the live GitHub API (stars/forks/issues/watchers/license/commits/contributors all now populate from `api.github.com/repos/vinpatel/aeorank`). "Made in SF" removed — unverified.

3. `66f33e0` — **fix(marketing/v2): sharpen messaging against competitor landscape.** Spawned a competition-research agent that surveyed Profound, Scrunch AI, Otterly.AI, Peec AI, and AthenaHQ. Used the findings to push three angles AEOrank owns that closed-SaaS competitors don't: (1) *others monitor, AEOrank fixes* — no competitor generates the 9 files; (2) *deterministic vs LLM-evaluated* — you can fail a PR on AEOrank, you cannot fail a PR on a GPT-4 judge; (3) *MIT + self-host vs $89–$499/mo closed dashboards*. Pricing strip updated with real 2026 competitor prices.

After user gave "push live" approval, main moved ahead on remote by 20 automated `[skip ci]` bot commits (daily scan / readme / badge updates touching only `.github/latest-scan.json`, `.github/scan-count.txt`, `DEMO.md`, `README.md` — no conflict with V2). Rebased `redesign/v2` cleanly onto `origin/main`, tagged the pre-v2 state as `marketing-v1`, fast-forward-merged to `main`, and pushed. Marketing deploy workflow (`deploy-marketing.yml` → GitHub Pages) completed successfully in ~1 minute. Site responded 200 at aeorank.dev within two minutes of push.

## Decisions worth remembering

- **Light variant of a dark reference** — factory.ai is dark and monochrome; the user explicitly wanted a light version. Translated factory.ai's *restraint + density* (asymmetric grids, monospace-forward, real data) onto a warm-paper canvas. Keeping the restraint is what makes this feel original; the color was a secondary axis.
- **No fabricated numbers policy** — once called out, we treated it as a hard rule for the whole codebase. All metrics are either derivable facts (36 criteria, 9 files, 11 plugins, 288 tests, MIT, CLI version 0.1.1) or fetched live from GitHub. Placeholder states show `—` or loading text, never a made-up number. Codified in `PRODUCT-TRUTHS.md`.
- **Don't wade into funding-war framing** — early copy had "Profound raised $58M." Competition agent found they're at ~$155M now, and the number will stale again. Removed entirely — it's not a frame AEOrank wins.
- **V1 preserved by tag, not branch** — one less long-lived branch to maintain. Tag `marketing-v1` + the `redesign/v2` archive branch are the two recovery paths.

## What went well

- Single-session end-to-end delivery: concept → design system → 11 components → two secondary pages → two rounds of user-driven revisions → competitor research → production deploy.
- Honest-numbers pivot was caught early (first user review) and retrofitted cleanly — no residue of fake stats remained after the fix commit.
- Competition research was scoped tightly enough to produce a single atomic commit with concrete before/after edits, rather than a sprawling rewrite.
- Build was green on every commit. Zero rollbacks needed post-deploy.

## What could have gone better

- **Nav went wrong on the first pass.** Overengineered with a scanbar + monospace breadcrumb that read as "off" to the user. Should have anchored to V1's proven layout earlier rather than inventing a new one — the monospace-as-chrome idea is already carried by rails, coords, and section-meta; the nav didn't need to also carry it.
- **Fabricated stats shipped in the initial commit** and had to be walked back. The concept is "the site renders as the product," which tempted me toward plausible-looking numbers as visual material. Right rule: if it sits at a real-claim type position (headline stats, repo metrics), it must be a real claim.
- **20 bot commits on main during the work** caused a late-stage rebase. Harmless here but a risk — would have been cleaner to rebase onto origin/main once per day during the session rather than once at the very end.

See `OPEN-ITEMS.md` for product-truth asks and followups.
