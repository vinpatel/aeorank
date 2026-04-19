# Deployment record — v2-redesign

## Timeline

| UTC | Event |
|---|---|
| 2026-04-19T16:34:18Z | `main` push with V2 commits (run `24633860964` triggered) |
| 2026-04-19T16:34:21Z | Build job started |
| 2026-04-19T16:35:13Z | Build job succeeded (49s) |
| 2026-04-19T16:35:17Z | Deploy job started |
| 2026-04-19T16:35:26Z | Deploy job succeeded (9s) |
| 2026-04-19T16:36:~  | `https://aeorank.dev` confirmed 200, V2 live |

Total: build + deploy in **~1 minute** end-to-end.

## What landed

| Ref | SHA | Summary |
|---|---|---|
| main | `66f33e0` | fix(marketing/v2): sharpen messaging against competitor landscape |
| main~1 | `8a5b1d2` | fix(marketing/v2): restore V1-style nav, remove fabricated stats |
| main~2 | `0716f89` | feat(marketing): Version B redesign — AEO Inspector (light, monospace, OSS-forward) |
| main~3 | `83c77c3` | demo: daily scan update 2026-04-19 [skip ci] — last V1 state |

## Recovery paths

1. **Git tag:** `marketing-v1` points at `83c77c3` (pre-V2 live state).
2. **Git branch:** `redesign/v2` on remote is a permanent archive of the V2 work (post-rebase SHAs).
3. **GitHub Pages rollback:** previous deploy artifact still selectable from the Pages deployment history in GitHub Actions UI.

## Rollback procedure (if needed)

```bash
# Fastest — revert main to the V1 state and redeploy
git checkout main
git reset --hard marketing-v1
git push origin main --force-with-lease
# Deploy workflow will auto-trigger on push.
```

This is a destructive, history-rewriting operation — run only if V2 is actively harmful. Preferred alternative is a forward-fix commit.

## Deploy pipeline

- **Workflow:** `.github/workflows/deploy-marketing.yml`
- **Trigger:** push to `main` affecting `apps/marketing/**`, `packages/astro/**`, `packages/core/**`, or the workflow file itself.
- **Target:** GitHub Pages.
- **DNS:** `aeorank.dev` apex (with `www.aeorank.dev` 301 → apex).
- **Build steps:** pnpm 10.32.1, Node 22, workspace deps (`@aeorank/core` + `@aeorank/astro`), then `withastro/action@v5`.
- **Deploy:** `actions/deploy-pages@v4`.

## Post-deploy notes

- GitHub flagged **80 Dependabot alerts** on push: 3 critical, 24 high, 42 moderate, 11 low. Pre-existing — not introduced by this deploy. Review at https://github.com/vinpatel/aeorank/security/dependabot. Tracked in `OPEN-ITEMS.md`.
- `withastro/action@v5` is running on Node.js 20 actions that are deprecated (June 2026 cutoff). Tracked in `OPEN-ITEMS.md`.
- `@aeorank/astro` log line during build: `Generated 8 AEO files in output directory` — site copy says 9. Tracked in `OPEN-ITEMS.md` and `PRODUCT-TRUTHS.md`.
