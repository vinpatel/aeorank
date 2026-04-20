# Contributing to AEOrank

Thanks for being here. AEOrank is an open-source AEO toolkit, and it only works if outside developers can pick it up, run it, and ship PRs without asking permission. This doc is built so you can do that in the next 30 minutes.

## TL;DR

```bash
git clone https://github.com/vinpatel/aeorank.git
cd aeorank
pnpm install
pnpm test
```

Open a PR. Small, focused, with a test. We merge fast.

## Repo layout

This is a pnpm + turbo monorepo.

| Path | What it is |
| --- | --- |
| `packages/core` | The scoring engine — 36 criteria, 9 generators. The brain. |
| `packages/cli` | `aeorank-cli` — the terminal entrypoint most users hit first. |
| `packages/next`, `packages/astro`, `packages/nuxt`, … | 13 framework plugins. Each wraps `@aeorank/core`. |
| `apps/web` | Dashboard (`app.aeorank.dev`). Next.js + Clerk + Supabase. |
| `apps/marketing` | Marketing site (`aeorank.dev`). Astro. |
| `apps/docs` | Docs site (`docs.aeorank.dev`). Astro Starlight. |
| `action` | The GitHub Action published to Marketplace. |

## What makes a good PR

- **One change per PR.** Bug fix or feature or refactor — pick one.
- **Tests.** If you changed behavior, there's a test. If you found a bug, there's a test that fails before your fix.
- **Conventional commits.** `feat(core): ...`, `fix(cli): ...`, `docs: ...`.
- **No drive-by refactors.** Cosmetic cleanup in unrelated files makes review slow.

## What we're especially looking for

- **New framework plugins** — if your framework isn't in `packages/`, copy one of the existing ones and adapt it. `packages/astro` is the simplest template.
- **New scoring criteria** — the 36 criteria live in `packages/core/src/checks/`. Each is a ~30-line file.
- **Generator improvements** — the 9 files live in `packages/core/src/generators/`.
- **Real-world bug reports** — scan your own site, tell us what broke.

See the [good first issues](https://github.com/vinpatel/aeorank/labels/good%20first%20issue) list for a concrete on-ramp.

## Running locally

```bash
pnpm install                 # install everything
pnpm build                   # build all packages via turbo
pnpm test                    # run all test suites (~700 tests)
pnpm lint                    # biome check
pnpm typecheck               # tsc --noEmit across workspace

# Work on one package only
pnpm --filter @aeorank/core test --watch

# Try the CLI against your change
pnpm --filter aeorank-cli build
node packages/cli/dist/index.js scan https://example.com
```

## Before you open a PR

- [ ] `pnpm lint` is clean
- [ ] `pnpm typecheck` is clean
- [ ] `pnpm test` is green
- [ ] You added a test for your change (or explained why not in the PR)

## Reporting bugs

Use the [bug template](https://github.com/vinpatel/aeorank/issues/new?template=bug_report.yml). A URL + the command you ran + the output you got is enough — you don't need a minimal reproduction unless it's subtle.

## Security issues

Do not open a public issue for security vulnerabilities. Use GitHub's [private advisory](https://github.com/vinpatel/aeorank/security/advisories/new) flow.

## License

By contributing, you agree your changes ship under the [MIT License](LICENSE).
