# Phase 4: GitHub Action — Research

**Researched:** 2026-03-14
**Domain:** GitHub Actions composite action, Checks API, PR comment upsert, Marketplace publishing
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GHA-01 | Composite action wrapping CLI, published to Marketplace as `aeorank/action@v1` | Composite action structure fully documented; Marketplace publish flow verified; must live in a public standalone repo `aeorank/action` |
| GHA-02 | Action uses only `GITHUB_TOKEN` — zero external credentials for basic use | CONFIRMED: GITHUB_TOKEN IS a GitHub App installation access token; `checks:write` + `pull-requests:write` permissions unlock all required API calls |
| GHA-03 | Action posts AEO score as a GitHub Check Run (pass/neutral/fail) with dimension table on every push | `actions/github-script@v8` with `github.rest.checks.create()` is the verified pattern; output.text supports markdown tables up to 65535 chars |
| GHA-04 | Action posts score table as PR comment, upserts using hidden marker (never spams) | `peter-evans/find-comment@v3` + `peter-evans/create-or-update-comment@v5` is the standard two-step upsert pattern |
| GHA-05 | Action supports `fail-below` threshold input (default 0 = never fail) | Composite action `inputs` with `default: '0'`; bash comparison `(( score < fail_below ))`; sets Check conclusion to `failure` vs `success` |
</phase_requirements>

---

## Summary

Phase 4 ships a composite GitHub Action that wraps the `aeorank` CLI (built in Phase 2) and posts results via GitHub's Checks API and PR comments. The action will live in a dedicated public repository (`aeorank/action`) — separate from the monorepo — because GitHub Marketplace requires `action.yml` at the root of a public repo with no workflow files.

The critical research finding: **GITHUB_TOKEN CAN create Check Runs without a separate GitHub App.** GitHub Actions secretly runs on a GitHub App installation token, so adding `permissions: checks: write` to the caller's workflow is sufficient. Many blog posts (and the docs intro page) mislead developers by saying "only GitHub Apps can write checks" — this is technically true, but GITHUB_TOKEN *is* an App installation token. The `LouisBrunner/checks-action@v2` and `actions/github-script@v8` both confirm this pattern works in production.

The recommended implementation is a lean composite action: (1) install `npx aeorank` (already on npm from Phase 2), (2) run `aeorank scan <url> --format json` to get a machine-readable result, (3) parse the JSON and call `github.rest.checks.create()` via `actions/github-script`, (4) on PR events, use `peter-evans/find-comment` + `peter-evans/create-or-update-comment` to upsert a markdown table comment. No custom Node.js action build step required — shell + github-script handles everything.

**Primary recommendation:** Composite action in `aeorank/action` repo; shell steps parse CLI JSON output; `actions/github-script@v8` for Checks API; `peter-evans` duo for PR comment upsert.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `actions/github-script` | v8 (Node 24) | Call GitHub Checks API from workflow steps | Official action; pre-authenticated Octokit; avoids raw curl complexity; used by thousands of actions |
| `peter-evans/find-comment` | v3 | Find existing PR comment by body-includes marker | Most-used find-comment action on Marketplace; actively maintained; outputs `comment-id` (empty if not found) |
| `peter-evans/create-or-update-comment` | v5 | Create or update a PR comment by ID | Companion to find-comment; atomic create-or-update; supports `edit-mode: replace` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `actions/setup-node` | v4 | Ensure Node.js available for `npx aeorank` | Only if ubuntu-latest doesn't have needed Node version (it ships Node 20+; likely not needed) |
| `LouisBrunner/checks-action` | v2.0.0 | Alternative to github-script for Check Runs | If github-script feels heavy; this wraps the API more declaratively |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `actions/github-script` | Raw `gh api` CLI calls | `gh api` works but requires manual JSON escaping; github-script is cleaner for nested objects like check output |
| `peter-evans` pair | `direct-actions/pr-comment` | Both use hidden HTML markers; peter-evans has larger install base and clearer docs |
| Composite action | JavaScript (Node.js) action | JS action would need `dist/` committed or a build step; composite avoids bundling complexity entirely |

**Installation (action.yml repo, not monorepo):**

No npm deps needed in the action itself — it uses `npx aeorank` (installs from npm at runtime) and invokes marketplace actions.

---

## Architecture Patterns

### Recommended Project Structure

The action lives in a **separate public repository** (`aeorank/action`), NOT inside the monorepo. GitHub Marketplace requires `action.yml` at the repo root with no workflow files in `.github/workflows/`.

```
aeorank/action (separate public repo)
├── action.yml          # Composite action definition — MUST be at root
├── README.md           # Marketplace listing description
└── .github/
    └── workflows/
        └── test.yml    # Self-test workflow (does NOT conflict with Marketplace rule)
```

Note: The "no workflow files" rule applies to the action definition repo's `action.yml` page on GitHub (it flags errors if workflows exist at root), but CI workflows in `.github/workflows/` are fine for testing the action itself.

### Pattern 1: Composite Action with Shell + github-script Steps

**What:** Composite action uses shell steps to run CLI and capture JSON output, then github-script steps to call GitHub APIs.

**When to use:** Always — this is the correct pattern for a composite action that calls GitHub APIs.

**action.yml example:**
```yaml
name: 'AEOrank'
description: 'Scan any URL for AEO score and post results as a GitHub Check and PR comment'
author: 'AEOrank'

branding:
  icon: 'bar-chart-2'
  color: 'blue'

inputs:
  url:
    description: 'URL to scan'
    required: true
  token:
    description: 'GitHub token'
    required: false
    default: ${{ github.token }}
  fail-below:
    description: 'Fail the Check if AEO score drops below this value (0 = never fail)'
    required: false
    default: '0'

runs:
  using: "composite"
  steps:
    - name: Run AEOrank scan
      id: scan
      shell: bash
      run: |
        RESULT=$(npx aeorank@latest scan "${{ inputs.url }}" --format json --no-files 2>/dev/null)
        echo "result<<EOF" >> $GITHUB_OUTPUT
        echo "$RESULT" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT

    - name: Post Check Run
      uses: actions/github-script@v8
      with:
        github-token: ${{ inputs.token }}
        script: |
          const result = JSON.parse(`${{ steps.scan.outputs.result }}`);
          const failBelow = parseInt('${{ inputs.fail-below }}', 10);
          const conclusion = (failBelow > 0 && result.score < failBelow) ? 'failure' : 'success';
          // ... build markdown table and call github.rest.checks.create(...)

    - name: Find existing PR comment
      if: github.event_name == 'pull_request'
      id: fc
      uses: peter-evans/find-comment@v3
      with:
        token: ${{ inputs.token }}
        issue-number: ${{ github.event.pull_request.number }}
        comment-author: 'github-actions[bot]'
        body-includes: '<!-- aeorank-score -->'

    - name: Upsert PR comment
      if: github.event_name == 'pull_request'
      uses: peter-evans/create-or-update-comment@v5
      with:
        token: ${{ inputs.token }}
        comment-id: ${{ steps.fc.outputs.comment-id }}
        issue-number: ${{ github.event.pull_request.number }}
        body: |
          <!-- aeorank-score -->
          ## AEOrank Score: ...
        edit-mode: replace
```

### Pattern 2: Check Run Conclusion Logic

**What:** Map `fail-below` input + score to Check conclusion.

**Valid conclusion values:** `success`, `failure`, `neutral`, `cancelled`, `timed_out`, `action_required`, `skipped`

**Implementation (in github-script):**
```javascript
const score = result.score;
const failBelow = parseInt('${{ inputs.fail-below }}', 10);
let conclusion;
if (failBelow > 0 && score < failBelow) {
  conclusion = 'failure';
} else if (score >= 70) {
  conclusion = 'success';
} else if (score >= 40) {
  conclusion = 'neutral';  // amber — worth knowing but not blocking
} else {
  conclusion = 'failure';  // below 40 always fails regardless of fail-below
}
```

### Pattern 3: PR Comment Hidden Marker Upsert

**What:** Embed an invisible HTML comment `<!-- aeorank-score -->` as a stable identifier. `find-comment` searches `body-includes` for this string. If `comment-id` is empty (first run), `create-or-update-comment` creates a new comment. Subsequent runs find the ID and update in place.

**Why it works:** GitHub renders HTML comments as invisible. The bot's comment body contains both the hidden marker and the visible markdown table.

### Pattern 4: github.rest.checks.create() Shape

**Verified from actions/github-script docs + WebSearch:**
```javascript
await github.rest.checks.create({
  owner: context.repo.owner,
  repo: context.repo.repo,
  head_sha: context.sha,          // on PR: context.payload.pull_request.head.sha
  name: 'AEOrank Score',
  status: 'completed',
  conclusion: conclusion,          // 'success' | 'failure' | 'neutral'
  output: {
    title: `AEOrank: ${result.score}/100 (${result.grade})`,
    summary: `Score: **${result.score}** | Grade: **${result.grade}**`,
    text: markdownTable,           // markdown dimension table — max 65535 chars
  }
});
```

### Anti-Patterns to Avoid

- **Posting a new comment on every run:** Always use `find-comment` + `create-or-update-comment` with a stable HTML marker — never unconditionally post a new comment.
- **Running the action on fork PRs:** `GITHUB_TOKEN` from forked PRs has read-only permissions; `checks:write` and `pull-requests:write` are unavailable. Caller workflows should gate the action on `github.event.pull_request.head.repo.full_name == github.repository`.
- **Hardcoding `context.sha` on PRs:** On `pull_request` events, `context.sha` is the merge commit SHA (not the head commit). Use `context.payload.pull_request.head.sha` instead so the Check attaches to the correct commit.
- **Pinning to `npx aeorank@latest` without lockfile:** Could pick up a broken release. Consider pinning to a specific version like `npx aeorank@0.0.1` or using the `aeorank-version` input.
- **Storing full generated files in Check output:** `output.text` max is 65535 chars. The check should show the dimension table only; link to the full report elsewhere.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calling GitHub Checks API | Custom curl/fetch with manual auth headers | `actions/github-script@v8` | Handles auth, retry, type safety; avoids JSON escaping bugs |
| Find-or-create PR comment | Custom loop over `gh api /repos/.../comments` | `peter-evans/find-comment@v3` | Handles pagination, edge cases (comment deleted), outputs clean `comment-id` |
| Creating/updating PR comments | Custom `gh api` call with conditional logic | `peter-evans/create-or-update-comment@v5` | Atomic create-or-update; handles race conditions; battle-tested |
| Parsing CLI JSON output in bash | Custom `jq` pipeline | Pass JSON to `actions/github-script` script block | github-script runs JS — native JSON.parse is safer than jq pipelines for nested objects |

**Key insight:** The composite action's job is to wire together existing marketplace actions and the CLI — not to reimplement GitHub API plumbing.

---

## Common Pitfalls

### Pitfall 1: GITHUB_TOKEN Cannot Write Checks (Misconception)

**What goes wrong:** Developer reads GitHub docs intro page ("only GitHub Apps can write checks"), concludes GITHUB_TOKEN is insufficient, adds a separate GitHub App or PAT.

**Why it happens:** The docs intro is technically correct but misleading — GITHUB_TOKEN IS a GitHub App installation token (GitHub installs an App when Actions is enabled on a repo).

**How to avoid:** Caller workflow must declare `permissions: checks: write`. The action README should document this required permission clearly.

**Warning signs:** "Resource not accessible by integration" error in the action log.

### Pitfall 2: Wrong SHA on Pull Request Events

**What goes wrong:** Check Run attaches to the merge commit SHA (`context.sha` = refs/pull/N/merge) instead of the PR head commit, causing the check to appear disconnected from the PR diff.

**Why it happens:** On `pull_request` events, `github.sha` is the merge commit, not the head commit.

**How to avoid:** Use `context.payload.pull_request.head.sha` when `context.eventName === 'pull_request'`.

**Warning signs:** Check appears but doesn't show on the PR's Checks tab — only on commits page.

### Pitfall 3: PR Comment Spam on Re-runs

**What goes wrong:** Every workflow run posts a new comment, cluttering the PR thread.

**Why it happens:** Missing the `find-comment` lookup step; always calling `create-or-update-comment` without a `comment-id`.

**How to avoid:** Always run `find-comment` first; pass `steps.fc.outputs.comment-id` to `create-or-update-comment`; if empty, it creates; if set, it updates.

**Warning signs:** Multiple AEOrank comments on a single PR.

### Pitfall 4: Marketplace Publish Fails — Name Collision

**What goes wrong:** `action.yml` name field conflicts with an existing Marketplace action name or GitHub feature name.

**Why it happens:** GitHub enforces uniqueness of action names on the Marketplace.

**How to avoid:** Use a distinctive name like `"AEOrank — AEO Scanner"`. Check Marketplace search before publishing.

**Warning signs:** "This name is already taken" error during Marketplace release creation.

### Pitfall 5: action.yml at Wrong Path

**What goes wrong:** Action is not discoverable when referenced as `aeorank/action@v1`.

**Why it happens:** `action.yml` must be at the **root** of the repository, not in a subdirectory.

**How to avoid:** The `aeorank/action` repo must have `action.yml` at `/action.yml` (root level). Confirmed by Marketplace publishing docs.

### Pitfall 6: Fork PR Permission Restrictions

**What goes wrong:** Action fails on PRs from forks with permission errors.

**Why it happens:** GitHub restricts `GITHUB_TOKEN` to read-only for fork-originated PRs to prevent credential exfiltration.

**How to avoid:** Document in README that fork PRs require `pull_request_target` event instead of `pull_request`, or that the action only posts checks on non-fork PRs. The action itself cannot fix this — the caller's workflow must handle it.

---

## Code Examples

### Dimension Table Markdown (for Check output.text and PR comment)

```javascript
// Source: manual construction from DimensionScore type (packages/core/src/types.ts)
function buildDimensionTable(dimensions) {
  const statusEmoji = { pass: '✅', warn: '⚠️', fail: '❌' };
  const rows = dimensions.map(d =>
    `| ${d.name} | ${d.score}/${d.maxScore} | ${statusEmoji[d.status]} ${d.status.toUpperCase()} | ${d.hint} |`
  );
  return [
    '| Dimension | Score | Status | Recommendation |',
    '|-----------|-------|--------|----------------|',
    ...rows
  ].join('\n');
}
```

### Caller Workflow Pattern (documented in README)

```yaml
# .github/workflows/aeorank.yml (in a consumer repo)
name: AEOrank Check
on:
  push:
    branches: [main]
  pull_request:

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
          url: https://example.com
          token: ${{ secrets.GITHUB_TOKEN }}
          fail-below: 70
```

### Check Run Creation (actions/github-script)

```javascript
// Source: actions/github-script docs + WebSearch verification
const sha = context.eventName === 'pull_request'
  ? context.payload.pull_request.head.sha
  : context.sha;

await github.rest.checks.create({
  owner: context.repo.owner,
  repo: context.repo.repo,
  head_sha: sha,
  name: 'AEOrank Score',
  status: 'completed',
  conclusion: conclusion,
  output: {
    title: `AEO Score: ${result.score}/100 (${result.grade})`,
    summary: `Your site scored **${result.score}** — Grade **${result.grade}**`,
    text: buildDimensionTable(result.dimensions),
  }
});
```

### Passing Large JSON Between Steps

The `GITHUB_OUTPUT` multiline pattern is required for JSON with newlines:

```bash
# In shell step
RESULT=$(npx aeorank scan "$URL" --format json --no-files 2>/dev/null)
echo "result<<EOF" >> $GITHUB_OUTPUT
echo "$RESULT" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
```

Then consume in github-script: `JSON.parse(process.env.SCAN_RESULT)` via `env:` block (safer than template interpolation for large payloads).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `set-output` command | `$GITHUB_OUTPUT` file | 2022 (security fix) | Must use `echo "key<<EOF"` multiline syntax for JSON |
| Node 16 actions | Node 20 → Node 24 | 2024 (node20), 2026 (node24 migration starting) | `actions/github-script@v8` uses Node 24; v7 uses Node 20 |
| `actions/checkout@v3` | `actions/checkout@v4` or `v5` | 2023-2024 | v5 is current; v3 deprecated |
| `::set-output` | `$GITHUB_OUTPUT` | Oct 2022 | Old syntax disabled; must use file-based output |

**Deprecated/outdated:**
- `set-output` workflow command: Disabled by GitHub in May 2023. Always use `$GITHUB_OUTPUT`.
- `actions/github-script@v6`: Uses Node 16 (EOL). Use v7 (Node 20) or v8 (Node 24).
- `peter-evans/create-or-update-comment@v3`: Use v5.

---

## Open Questions

1. **Separate repo vs monorepo subdirectory for the action**
   - What we know: Marketplace requires `action.yml` at root of a public repo; the current monorepo is `aeorank/aeorank` (or similar).
   - What's unclear: Whether `aeorank/action` repo needs to be created manually before Phase 4, or if it can be a subdirectory used only in local workflows and published later.
   - Recommendation: Create `aeorank/action` as a fresh public repo. Reference it via `uses: aeorank/action@v1` only after the v1 tag exists. During Phase 4 development, test with a local composite action path.

2. **`--no-files` flag on CLI during action**
   - What we know: The CLI scan command writes files to `--output` dir by default; in CI we don't want to write files to the runner.
   - What's unclear: Whether `--no-files` flag is already implemented in the Phase 2 CLI.
   - Recommendation: Verify the CLI has `--no-files` option (source confirms it does: `'--no-files', 'Skip writing generated files'`). Use `npx aeorank scan <url> --format json --no-files` in the action.

3. **npx install latency in CI**
   - What we know: `npx aeorank@latest` downloads from npm on every run; adds 5-15s to workflow.
   - What's unclear: Whether this is acceptable or if caching is needed.
   - Recommendation: Accept the latency for v1; document that users can cache `~/.npm` with `actions/cache` to reduce it.

4. **Output text character limit**
   - What we know: Check Run `output.text` has a 65535-character limit.
   - What's unclear: Exact limit not confirmed via official docs fetch (docs page returned partial content).
   - Recommendation: The dimension table for 12 dimensions will be ~500 chars — well within any reasonable limit. Truncate only if `pages` or `files` content is included.

---

## Sources

### Primary (HIGH confidence)
- [actions/github-script GitHub repo](https://github.com/actions/github-script) — github-script v8, Node 24 runtime, `github.rest.checks.create()` API shape
- [peter-evans/find-comment GitHub repo](https://github.com/peter-evans/find-comment) — `body-includes` input, `comment-id` output, HTML marker pattern
- [peter-evans/create-or-update-comment GitHub repo](https://github.com/peter-evans/create-or-update-comment) — upsert pattern with `comment-id`, `edit-mode: replace`
- [LouisBrunner/checks-action GitHub repo](https://github.com/LouisBrunner/checks-action) — confirms `checks:write` + `GITHUB_TOKEN` works for Check Runs
- [GitHub Docs: Metadata syntax for GitHub Actions](https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions) — composite action `action.yml` structure, inputs/outputs, branding
- [GitHub Docs: Publishing actions in Marketplace](https://docs.github.com/en/actions/sharing-automations/creating-actions/publishing-actions-in-github-marketplace) — public repo required, `action.yml` at root, release-based publishing

### Secondary (MEDIUM confidence)
- [kenmuse.com: Creating GitHub Checks](https://www.kenmuse.com/blog/creating-github-checks/) — explains why GITHUB_TOKEN works (GitHub App installation token); verified against LouisBrunner action behavior
- [WebSearch: GITHUB_TOKEN checks:write 2024/2025](https://github.blog/changelog/2021-04-20-github-actions-control-permissions-for-github_token/) — multiple sources confirm `checks:write` permission enables Check Run creation with GITHUB_TOKEN

### Tertiary (LOW confidence)
- Output.text 65535 character limit — mentioned in community posts but not confirmed via official REST API docs (docs page returned partial content during research)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via official action repos and docs
- Architecture: HIGH — composite action pattern + peter-evans upsert pattern both verified
- Check Runs with GITHUB_TOKEN: HIGH — confirmed by kenmuse.com analysis + LouisBrunner action (production use)
- Pitfalls: MEDIUM — most from official docs; fork PR limitation and SHA issues from community sources

**Research date:** 2026-03-14
**Valid until:** 2026-06-14 (GitHub Actions APIs are stable; node version migration is the main moving target)
