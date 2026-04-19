# v2 Redesign milestone

**Status:** Shipped — 2026-04-19
**Live:** https://aeorank.dev
**Scope:** `apps/marketing` only (docs app + app shell untouched)
**V1 preserved:** git tag `marketing-v1`

A full Version B redesign of the marketing site, concepted as the **AEO Inspector** — the whole site rendered as an exposed developer-tool panel, not a generic SaaS landing. Light warm-paper canvas, monospace-forward chrome, asymmetric editorial layouts, the `/100` score motif as a structural spine. Built to convert into GitHub stars and to be directly sharper than the closed-SaaS competitor landscape (Profound, Scrunch, Otterly, Peec, AthenaHQ).

## Artifacts in this directory

| File | Purpose |
|---|---|
| `README.md` (this) | Milestone index |
| `DESIGN-DIRECTION.md` | The design contract — concept, visual signature, palette, typography, section inventory, non-goals, success criteria |
| `RETROSPECTIVE.md` | Session narrative — decisions made, what went well, what to improve next time |
| `PRODUCT-TRUTHS.md` | Ground-truth numbers that may appear in copy, plus the "don't claim" list and live-fetched values |
| `COMPETITION.md` | Competitor landscape analysis (5 competitors), gaps AEOrank owns, softer framings walked away from, recurring monitoring cadence |
| `DEPLOYMENT.md` | Deploy timeline, workflow reference, recovery paths, rollback procedure |
| `OPEN-ITEMS.md` | Followups not blocking ship — content-truth, repo health, marketing leverage asks, nits, competitive monitoring |

## Key commits on `main`

- `66f33e0` — fix(marketing/v2): sharpen messaging against competitor landscape
- `8a5b1d2` — fix(marketing/v2): restore V1-style nav, remove fabricated stats
- `0716f89` — feat(marketing): Version B redesign — AEO Inspector

## If you're picking this up cold

1. Read `DESIGN-DIRECTION.md` first — it's the contract everything else holds to.
2. Read `PRODUCT-TRUTHS.md` before writing any new marketing copy. The no-fabrication rule is load-bearing.
3. Check `OPEN-ITEMS.md` for what's queued up and why it didn't ship.
4. Read `COMPETITION.md` to understand the category we're pushing against. Refresh the landscape every 60 days.
