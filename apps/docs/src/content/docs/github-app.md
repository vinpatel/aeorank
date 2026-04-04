---
title: GitHub App
description: Install the AEOrank GitHub App for zero-config AI visibility scoring on every PR.
---

The AEOrank GitHub App scores your site's AI visibility on every pull request — **zero YAML, zero config, one-click install**.

## Install

1. Go to [github.com/apps/aeorank](https://github.com/apps/aeorank)
2. Click **Install**
3. Choose your account and select repositories
4. Done — AEOrank now runs on every PR

## How it works

When you open or update a pull request, AEOrank automatically:

1. **Detects your site URL** from your repo (see [URL detection](#url-detection) below)
2. **Scans your site** across 36 AI visibility criteria
3. **Posts a Check Run** on the commit with your score and grade
4. **Posts a PR comment** with a full dimension breakdown and recommendations

The Check Run shows ✅ green (score ≥ 70), grey neutral (40–69), or ❌ red (below 40).

## URL detection

AEOrank auto-detects your site URL by checking these files in order:

| Priority | File | Format |
|----------|------|--------|
| 1 | `.aeorank` | JSON: `{"url": "https://your-site.com"}` |
| 2 | `aeorank.config.js` | JS: `siteUrl: "https://your-site.com"` |
| 3 | `CNAME` | Plain text: `your-site.com` |
| 4 | `package.json` | JSON: `"homepage": "https://your-site.com"` |

The simplest option: add a `.aeorank` file to your repo root:

```json
{"url": "https://your-site.com"}
```

If no URL is found, AEOrank posts a neutral Check Run with setup instructions.

## What you get

### Check Run on every commit

The Check Run appears in your PR's checks tab with:

- **AEO Score** (0–100) with letter grade (A+ through F)
- **Pass/neutral/fail** conclusion based on score
- **36-dimension table** grouped by pillar with scores and recommendations

### PR comment

A comment is posted (or updated) on the PR with the full score breakdown. The comment uses a hidden marker (`<!-- aeorank-score -->`) so re-pushes update the existing comment instead of creating new ones.

## Rate limits

| Plan | Scans per day |
|------|--------------|
| Free | 10 per repo |

Scans are counted per installation per day. If you hit the limit, AEOrank posts a neutral Check Run letting you know.

## Permissions

The App requests these permissions:

| Permission | Access | Why |
|-----------|--------|-----|
| Checks | Read & write | Post Check Runs on commits |
| Contents | Read-only | Read `.aeorank`, `CNAME`, `package.json` for URL detection |
| Pull requests | Read & write | Post and update PR comments |
| Metadata | Read-only | Required by GitHub for all Apps |

The App subscribes to `pull_request` and `push` events.

## GitHub App vs GitHub Action

Both post the same Check Run and PR comment. Choose based on your preference:

| | GitHub App | GitHub Action |
|---|---|---|
| **Setup** | One-click install | Add YAML workflow file |
| **Config** | Zero — auto-detects URL | Set `url` input in workflow |
| **Runs on** | AEOrank servers | GitHub Actions runners (your minutes) |
| **Control** | Automatic on every PR | Full control via workflow triggers |
| **`fail-below`** | Not yet (coming soon) | ✅ Set minimum score threshold |

**Recommendation:** Start with the GitHub App for zero friction. Switch to the Action if you need `fail-below` thresholds or custom workflow triggers.

## Troubleshooting

### "No Site URL Configured" Check Run

AEOrank couldn't detect your site URL. Add a `.aeorank` file to your repo root:

```json
{"url": "https://your-site.com"}
```

### No Check Run appears

1. Verify the App is installed: [github.com/settings/installations](https://github.com/settings/installations)
2. Check that your repo is in the App's selected repositories
3. Push a new commit to the PR to trigger a fresh webhook

### Score seems wrong

AEOrank scans the URL found in your config. Make sure it points to your live, publicly accessible site — not `localhost` or a staging URL.

## Privacy

The App reads only the files needed for URL detection (`.aeorank`, `CNAME`, `package.json`, `aeorank.config.js`). It does **not** access your source code, commits, issues, or any other repository content. See our [privacy policy](https://aeorank.dev/privacy).

## Links

- [Install the App](https://github.com/apps/aeorank)
- [GitHub Action alternative](/cli/scan)
- [36 scoring criteria](/scoring/dimensions)
- [Privacy policy](https://aeorank.dev/privacy)
