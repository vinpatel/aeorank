# v2 Redesign — Design Direction

**Branch:** `redesign/v2`
**Scope:** `apps/marketing` only. Main branch untouched. Version A preserved on `main`.
**Goal:** a marketing site that converts into GitHub stars. The design must read as original, not AI-templated.

---

## The concept: AEO Inspector

Treat the entire marketing site as if the visitor has opened a developer tool panel that is actively auditing their website for AI visibility. It is not a "landing page with features." It is an exposed inspector.

Everything on screen looks like it was produced *by the product* — scanner output, JSON fragments, tree previews, scoring rails, measurement ticks, grade cards, real tabular leaderboards. The site does not *describe* AEOrank; it *renders as* AEOrank.

Reference aesthetic: factory.ai's restraint, density, and monospace-forwardness — but rendered on a warm paper-white canvas rather than dark, and with tighter thematic coupling to the product.

## Visual signature (required in every section)

- **Monospace-first.** Headings and body use Inter; numbers, labels, annotations, scan lines, and UI chrome use JetBrains Mono. Mono is a load-bearing design element, not a decoration.
- **Measurement ticks** along the left gutter of every section, forming a continuous "scoring rail" down the page.
- **Scanner annotations** in mono green/amber (`// 36 checks · 29 pass · 7 fail`).
- **Asymmetric grids.** No 3-column equal-width card strips. Use 12-col with 7/5, 8/4, 4/4/4 mixes, and occasional full-bleed editorial breaks.
- **Real data, real JSON, real file contents** — no lorem, no fake numbers. Preview previews actually preview.
- **The `/100` motif** as recurring spine — a score indicator visible in the nav, the hero, callouts, the pricing grade cards, and the footer.

## Palette (light, warm paper)

| Token | Value | Role |
|---|---|---|
| `--ink` | `#111111` | primary text, wordmark |
| `--ink-2` | `#4B4B4F` | secondary text |
| `--ink-3` | `#8A8A90` | muted, labels, ticks |
| `--paper` | `#F6F4EE` | page background |
| `--paper-2` | `#EFECE4` | raised surface |
| `--page` | `#FFFFFF` | inset panels (code, files) |
| `--rule` | `rgba(17,17,17,0.08)` | default borders |
| `--rule-2` | `rgba(17,17,17,0.14)` | strong borders |
| `--mark` | `#E8590C` | brand accent (sparing) |
| `--ok` | `#0F7D4B` | pass signals (mono-green) |
| `--warn` | `#B25B00` | warn signals |
| `--fail` | `#B8251E` | fail signals |
| `--ink-fog` | `rgba(17,17,17,0.04)` | subtle fills |

No gradients-as-decoration. No glassmorphism. No frosted nav.

## Typography

- **Sans:** Inter (already loaded). Tracking tight on display sizes.
- **Mono:** JetBrains Mono (already loaded). Used for labels, numbers, ticks, code.
- **Serif accent:** Instrument Serif italic — used in two places only: the hero's second-line editorial kicker and the OSS manifesto pull-quote. Used anywhere else, it loses impact.

Type scale is tighter and more editorial than V1: 88/72/56/40/24/16/13/11.

## Section inventory (new, not a port of V1)

1. **Nav** — left: wordmark, mono route breadcrumb (`/ inspector / home`). Right: GitHub star count pill with live number, small "sign in" and primary "Star on GitHub".
2. **Hero** — split layout. Left column: a rendered "pretty" marketing page mock. Right column: the same page as an AI crawler extracts it (greyscale, content-only, annotated with what's missing). Below: one-line `npx aeorank-cli scan your-site.com` + two CTAs (Star, Get score).
3. **Live Scan strip** — sideways auto-scrolling marquee of scanner output lines: `✓ llms.txt · present`, `✗ ai.txt · missing · -4`, `✓ schema.json · 9 types`. Pauses on hover. Monospace, measurement-tick ends.
4. **/100 Anatomy** — the number `100` rendered huge, with ticked callouts pulling out each of the five pillars (weights in mono).
5. **Generated Files** — left: real file tree with 9 files. Right: previewer showing actual content for the selected file with syntax highlighting.
6. **Open Source** — editorial manifesto in serif italic + live-feeling GitHub metrics row (stars, forks, contributors, MIT) + avatar grid.
7. **Install** — three-tab block (npx · GitHub App · GitHub Action) with real code, copy button, a small diff-style "what this adds to your repo."
8. **Leaderboard preview** — real tabular data: rank, site, AEO score, letter grade, 7d delta. Dense, ordinal. Link to full scoreboard.
9. **Pricing grade cards** — each tier rendered as an AEO report card: letter grade, criteria-checked list, scorer's note.
10. **FAQ** — a two-pane structured layout: left is the JSON-LD the page actually emits (syntax-highlighted, real), right is the rendered prose. Meta and original.
11. **Footer / session-end** — terminal-flavored closer: `SCAN COMPLETE · SCORE /100 · star the repo →`.

## Non-goals

- No hero terminal demo video.
- No 3-column feature card grid.
- No glassmorphism, no backdrop-blur cards.
- No rotating testimonial carousel.
- No gradient mesh blobs behind the hero.
- No emoji in headings or body.

## Success criteria

- A reviewer who has never seen AEOrank cannot confuse the site with a generic SaaS landing template.
- Every section contains at least one element that only makes sense *for this product* (a real file, a real score, a real check).
- The primary conversion action on every viewport is "Star on GitHub".
- Build succeeds (`pnpm --filter @aeorank/marketing build`). Lighthouse accessibility ≥ 95.
