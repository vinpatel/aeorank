# Plan 03-04 Summary: GitHub Actions Deployment

## Status: Complete

## What was built
Two GitHub Actions workflow files for deploying marketing and docs sites to GitHub Pages.

## Key files created
- `.github/workflows/deploy-marketing.yml` — Astro build + GitHub Pages deploy
- `.github/workflows/deploy-docs.yml` — Build + push to external aeorank/docs repo

## Verification
- Both YAML files exist and are valid
- Marketing uses withastro/action@v5 with path: apps/marketing
- Docs uses peaceiris/actions-gh-pages@v4 with external_repository
- Both have path-based triggers and workflow_dispatch

## User Setup Required
- Enable GitHub Pages (Settings > Pages > Source: GitHub Actions) on main repo
- Create aeorank/docs repo on GitHub
- Generate SSH deploy key pair, add to both repos
- Configure DNS: A records for aeorank.dev, CNAME for docs.aeorank.dev

## Decisions
- Separate repos needed because GitHub Pages = 1 custom domain per repo
- Marketing uses official withastro/action (handles pnpm, caching automatically)
- Docs uses manual pnpm setup + peaceiris/actions-gh-pages for external repo push
- Concurrency groups prevent simultaneous deploys

---
*Plan: 03-04 | Phase: 03-web-presence*
