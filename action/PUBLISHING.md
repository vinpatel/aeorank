# AEOrank Action — GitHub Marketplace Publication Checklist

Step-by-step guide to publish `aeorank/action@v1` to the GitHub Actions Marketplace.

---

## 1. Pre-flight Checks

Confirm all required fields are present in `action.yml` before creating a release.

**Current values (already set — no changes needed):**

| Field | Value |
|-------|-------|
| `name` | `AEOrank — AEO Scanner` |
| `description` | `Scan any URL for AI Engine Optimization (AEO) score. Posts results as a GitHub Check and PR comment.` |
| `author` | `AEOrank` |
| `branding.icon` | `bar-chart-2` |
| `branding.color` | `blue` |

- [ ] `action.yml` contains `name`, `description`, `branding`, and `author` — verified above
- [ ] `README.md` exists with quick-start, full workflow example, and input reference
- [ ] `LICENSE` file exists in the repository root (required by Marketplace)

---

## 2. Repository Setup

**Critical requirement:** GitHub Marketplace requires the `action.yml` to be at the **root** of the repository. In this monorepo, `action/action.yml` lives in a subdirectory — it cannot be published directly from here.

You have two options:

### Option A: Create a separate `aeorank/action` repository (Recommended)

This is the standard GitHub Marketplace pattern used by virtually every published action.

1. Create a new GitHub repository at `github.com/aeorank/action`
2. Copy the contents of this monorepo's `action/` directory to the root of the new repository:
   - `action.yml` → root of `aeorank/action`
   - `README.md` → root of `aeorank/action`
   - `LICENSE` → root of `aeorank/action`
3. Push to `main`
4. Proceed to Section 3 (Creating the Release) in the `aeorank/action` repository

To keep the repositories in sync, add a sync workflow or update manually when `action/` changes in the monorepo.

### Option B: Release branch with action files at root

1. Create a new branch in this monorepo (e.g., `action-release`)
2. Move all files from `action/` to the repository root on that branch
3. Set the release tag to target this branch

Option B is more complex and less maintainable than Option A. Only use it if you cannot create a separate repository.

**Recommendation:** Use Option A. It creates a clean, independently versioned repository that matches community expectations for GitHub Actions.

---

## 3. Creating the Release

Perform these steps in the `aeorank/action` repository (after completing Section 2, Option A).

### 3.1 Create the v1.0.0 release

1. Navigate to `https://github.com/aeorank/action/releases`
2. Click **"Draft a new release"**
3. Under **"Choose a tag"**, type `v1.0.0` and select **"Create new tag: v1.0.0 on publish"**
4. Set **Target** to `main`
5. Set **Release title** to: `AEOrank Action v1.0.0`
6. Check **"Publish this Action to the GitHub Marketplace"**
   - If this checkbox is not visible, ensure you are logged in as the repository owner
7. Under **Marketplace categories**, select:
   - `Code quality`
   - `Continuous integration`
8. Write release notes (example below):

```
## AEOrank Action v1.0.0

Scan any URL for AI Engine Optimization (AEO) score directly from your GitHub workflow.

### What this action does
- Runs `aeorank scan <url>` via npx
- Posts an AEO score as a GitHub Check Run (with dimension breakdown table)
- Posts (or updates) a PR comment with the score and recommendations
- Supports `fail-below` threshold to enforce minimum AEO quality in CI

### Inputs
- `url` (required) — URL to scan
- `token` (optional) — GitHub token, defaults to `github.token`
- `fail-below` (optional) — fail Check if score drops below threshold, default `0` (never)

### Permissions required
```yaml
permissions:
  checks: write
  pull-requests: write
  contents: read
```
```

9. Click **"Publish release"**

### 3.2 Create the `v1` major version tag

After the `v1.0.0` release is published, create a `v1` tag pointing to the same commit. This enables `uses: aeorank/action@v1` (semver major pinning, the recommended usage pattern).

```bash
# Clone the action repository locally
git clone https://github.com/aeorank/action.git
cd action

# Create the v1 tag pointing to the same commit as v1.0.0
git tag -fa v1 -m "Update v1 tag to v1.0.0"
git push origin v1 --force
```

Or via GitHub UI:
1. Go to `https://github.com/aeorank/action/releases`
2. Click **"Draft a new release"**
3. Tag: `v1`, Target: the same commit as `v1.0.0`
4. Title: `v1 (points to v1.0.0)`
5. Check **"Set as a pre-release"** to avoid it appearing as the latest release
6. Click **"Publish release"**

---

## 4. Post-Publish Verification

### 4.1 Confirm Marketplace listing

- [ ] Visit `https://github.com/marketplace/actions/aeorank-aeo-scanner`
- [ ] Confirm the listing shows: name, description, categories, and README content
- [ ] Confirm the branding icon (bar-chart-2) and color (blue) appear on the listing

### 4.2 Test installation in a consumer repository

Create a test workflow in any repository and verify end-to-end:

```yaml
name: AEOrank Test

on: [push]

permissions:
  checks: write
  pull-requests: write
  contents: read

jobs:
  aeorank:
    runs-on: ubuntu-latest
    steps:
      - uses: aeorank/action@v1
        with:
          url: https://aeorank.dev
          fail-below: 0
```

- [ ] Workflow runs without errors
- [ ] A "AEOrank Score" Check Run appears on the commit
- [ ] Check Run output shows score, grade, and dimension table
- [ ] No authentication errors or permission failures in the workflow log

### 4.3 Verify `@v1` tag resolution

- [ ] `uses: aeorank/action@v1` resolves to the `v1.0.0` release
- [ ] `uses: aeorank/action@v1.0.0` also works as a pinned reference

---

## 5. Updating (Future Releases)

### Patch and minor releases (v1.0.1, v1.1.0)

1. Make changes in the `aeorank/action` repository
2. Create a new release with the appropriate tag (e.g., `v1.0.1` or `v1.1.0`)
3. Move the `v1` tag to point to the new release:
   ```bash
   git tag -fa v1 -m "Update v1 tag to v1.0.1"
   git push origin v1 --force
   ```

Users pinned to `@v1` will automatically get the update. Users pinned to `@v1.0.0` will stay on the old version until they update.

### Major releases (v2.0.0)

1. Create the `v2.0.0` release tag
2. Create a new `v2` major version tag
3. Do NOT move the `v1` tag — existing users on `@v1` stay on the v1 line
4. Update README.md to document the breaking changes and migration path from v1 to v2

### Monorepo sync

When the `action/` directory in this monorepo changes:
1. Copy updated files to the `aeorank/action` repository
2. Commit and push to `main`
3. Create the appropriate release following the steps above

---

## Checklist Summary

- [ ] Option A: `aeorank/action` repository created with `action.yml` at root
- [ ] `LICENSE` file present in `aeorank/action`
- [ ] `v1.0.0` release published with Marketplace checkbox checked
- [ ] Categories set: Code quality, Continuous integration
- [ ] `v1` major version tag created and pointing to `v1.0.0`
- [ ] Marketplace listing visible at `https://github.com/marketplace/actions/aeorank-aeo-scanner`
- [ ] Consumer test workflow runs successfully with `uses: aeorank/action@v1`
