# Pitfalls Research

**Domain:** CLI scanner + SaaS dashboard (AEO/website audit)
**Researched:** 2026-03-14
**Confidence:** MEDIUM — primary findings from WebSearch with cross-source verification; domain is emerging so some AEO-specific claims are LOW confidence

---

## Critical Pitfalls

### Pitfall 1: SSRF via User-Supplied URLs

**What goes wrong:**
The SaaS web dashboard accepts a URL from the user and then crawls it server-side. Without validation, an attacker submits `http://169.254.169.254/latest/meta-data/` (AWS metadata endpoint), `http://localhost:6379` (Redis), or internal VPC hostnames. The server dutifully fetches them and leaks infrastructure secrets.

**Why it happens:**
Developers treat URL input like a search query. The crawler logic is written for the CLI (where the user controls their own machine) and copy-pasted into the SaaS API route without adding network boundary enforcement.

**How to avoid:**
- Resolve DNS before making requests; block private/loopback/link-local IP ranges (RFC 1918, 127.x, 169.254.x, ::1, fc00::/7)
- Disallow non-https schemes entirely in the SaaS path
- Do not follow redirects automatically — re-validate each hop's destination IP
- Use the `ssrf-req-filter` npm package as a baseline; add allow-list for expected TLDs if scope allows
- Run SaaS scan jobs in an isolated worker process/container with no access to internal network

**Warning signs:**
- API route that accepts `url` parameter calls `fetch(url)` or `axios.get(url)` without validation
- Scan worker runs with same network access as the API server
- Tests only cover happy-path public URLs

**Phase to address:**
SaaS API / scan-job phase (before any public access). Treat as a launch blocker.

---

### Pitfall 2: Stripe Webhook Non-Idempotency

**What goes wrong:**
Stripe retries webhook delivery for up to 3 days on any non-2xx response or timeout. A slow database write or unhandled exception causes Stripe to retry, and the handler runs twice — provisioning the user twice, sending duplicate welcome emails, crediting usage twice, or failing with a unique-constraint violation that leaves the subscription in an unknown state.

**Why it happens:**
Developers build the happy path first. Webhook handlers perform database writes and side effects inline without checking whether the event was already processed. Tests run against a clean database so duplicates never surface.

**How to avoid:**
- Store `event.id` in a `stripe_events` table with a unique constraint; skip processing if already present
- Return 200 immediately; queue the actual work asynchronously (BullMQ or Supabase Edge Functions queue)
- Respond within 5 seconds — Stripe times out at 20 seconds but network latency + DB writes frequently exceed this
- Use Stripe's `customer.subscription.updated` as the canonical source of truth for plan status; never trust only the checkout session event
- Implement dunning: handle `invoice.payment_failed` to send day-1, day-3, day-7 recovery emails and degrade (not cut off) access during retry window

**Warning signs:**
- Webhook handler has `await db.insert(...)` without a prior `SELECT` for deduplication
- Webhook endpoint response time > 5 seconds in staging
- No `stripe_events` table in the database schema

**Phase to address:**
SaaS billing phase. Test with Stripe CLI event replay before launch.

---

### Pitfall 3: Supabase RLS Disabled on Tenant Tables

**What goes wrong:**
Every new Postgres table created via migration or Supabase SQL editor has RLS disabled by default. Without explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` plus policies, any authenticated user can read or write any row through the Supabase PostgREST API. In 2025, 170+ apps built with AI-assisted tools were found to have fully exposed databases due to missing RLS. An AEOrank user could read competitors' scan history and Stripe customer IDs.

**Why it happens:**
Drizzle ORM migrations generate table DDL but do not emit RLS enable statements by default. Developers test via the Supabase SQL Editor, which bypasses RLS even when enabled — so policies appear to work in testing but are never actually exercised.

**How to avoid:**
- Add `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;` to every migration that creates a user-data table
- Use Drizzle's `.enableRLS()` table option (available via `drizzle-supabase-rls` integration) to co-locate policies with schema
- Test RLS policies exclusively through the Supabase JavaScript client SDK — never the SQL Editor
- Maintain two Drizzle clients: `adminDb` (service role key, bypasses RLS for backend jobs) and `clientDb` (anon/user JWT, enforces RLS for API routes)
- Add `user_id` column to every tenant table with a policy: `USING (user_id = auth.uid())`
- Add an integration test that attempts to cross-tenant read and asserts empty result set

**Warning signs:**
- Database schema lacks `ENABLE ROW LEVEL SECURITY` statements
- Single Drizzle client used for both server-side jobs and user-facing queries
- No cross-tenant access test in the test suite

**Phase to address:**
Database schema phase (before any user data is written). Verified by integration tests before SaaS launch.

---

### Pitfall 4: AEO Score Instability Across Runs

**What goes wrong:**
The same URL scanned twice on the same day returns different scores. Non-deterministic signals (HTTP response time used as a score factor, A/B-tested page variants, CDN edge variance, time-of-day server load) cause score drift. Users lose trust in the tool immediately. Worse, the GitHub Action posts a different score than the dashboard, causing confusion.

**Why it happens:**
Scoring dimensions are designed with performance metrics (TTFB, load time) that are inherently variable. Generated file checks may hit cached vs. uncached pages. Schema validation may differ between fetch libraries.

**How to avoid:**
- Separate the score into two categories: structural (deterministic — schema markup presence, llms.txt existence, heading structure) and performance (non-deterministic — TTFB, CWV). Weight structural factors heavily (80%+)
- For performance factors, take the median of 3 fetches rather than a single measurement
- Cache fetched page content for 24 hours and reuse within a session to ensure the CLI and Action score the same snapshot
- Document which dimensions are deterministic vs. sampled; surface this in the UI
- Pin scoring algorithm version and include it in score output so comparisons stay valid across CLI releases

**Warning signs:**
- TTFB or response time appears as a direct score multiplier
- Each score dimension makes an independent HTTP request to the same URL
- No content-hash or cache key logged with score output

**Phase to address:**
Scoring engine design phase (before any user-facing score display). Regression-test score stability as part of CI.

---

### Pitfall 5: Crawl Rate Hammers Target Server (or Gets Blocked)

**What goes wrong:**
The CLI is run against a shared-hosting or small WordPress site. The concurrent-fetch default (no rate limit) causes a spike in server load, triggering HTTP 429 or 503 responses. The scan returns incomplete data — pages marked as errors were never actually broken. Users blame AEOrank for "false" scan results. Alternatively, the target's WAF (Cloudflare) bans the scanner IP and all future scans from that user's IP fail.

**Why it happens:**
Developers test against their own dev server or large sites with CDN caching. The default concurrency that "feels fast" overwhelms small servers. User-agent isn't set, so WAF rate-limits anonymous bot traffic aggressively.

**How to avoid:**
- Set a default concurrency of 3 requests/second with exponential backoff on 429/503
- Set a descriptive `User-Agent: AEOrank/1.0 (+https://aeorank.dev)` header on all requests
- Respect `Crawl-delay` from robots.txt
- On 429, back off for the `Retry-After` header value, not a fixed duration
- Cap total pages scanned at 50 per CLI run (configurable via `--limit`); document the cap
- In the SaaS scan worker, add per-domain rate limiting using Redis or Supabase KV so concurrent users scanning the same domain don't pile on

**Warning signs:**
- No rate limiting or concurrency cap in crawler code
- User-Agent is the default fetch/axios string or missing
- Test suite only uses localhost or mocked HTTP

**Phase to address:**
CLI crawler phase. Add concurrency defaults before alpha release.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single Drizzle client (service role) for all queries | Simpler code, no RLS setup | Any authenticated user can read all tenant data via PostgREST | Never — security regression |
| No webhook idempotency check | Faster first implementation | Duplicate provisioning, data corruption, billing errors | Never — functional regression |
| Hardcode scoring weights as constants | Shipped fast | Score recalibration requires a code release and invalidates all historical scores | MVP only — must externalize before SaaS launch |
| Crawl with `headless: false` (Puppeteer debug mode) | Easy local debugging | 10x slower, doesn't work in headless CI/GitHub Actions | Dev only |
| Use `@latest` for action version pin | Always current | Silent breaking changes break all users' CI on next push | Never — always pin |
| Skip robots.txt compliance | Simpler crawler code | Legal exposure, WAF blocks, user trust issues | Never |
| Return scan results synchronously in API response | Simpler architecture | Times out for large sites; 30-second scan exceeds serverless function limits | MVP for <10-page sites only |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe webhooks | Verifying signature after parsing body | Parse raw body as Buffer before any JSON parsing; signature verification requires the exact raw bytes |
| Stripe Customer Portal | Building custom plan-change UI | Use Stripe's hosted Customer Portal for upgrades/downgrades; avoid replicating subscription management |
| Clerk + Next.js App Router | Checking auth only in layout server components | Auth middleware must run on every route; layouts don't re-execute on client navigation |
| Clerk + Supabase | Using Clerk's `userId` directly as `auth.uid()` | Clerk and Supabase have different JWT issuers; use Supabase's Clerk JWT integration or sync user IDs explicitly |
| GitHub Actions + npx CLI | Running `npx @aeorank/cli` without pinning version | `npx` resolves `latest` at call time; pin to `npx @aeorank/cli@1.2.3` in the Action YAML for reproducibility |
| GitHub Actions permissions | Using `pull_request_target` for PR score posting | Use `pull_request` event; `pull_request_target` runs in base branch context with elevated privileges — SSRF risk |
| Supabase RLS + Drizzle | Testing policies in SQL Editor | SQL Editor runs as superuser and bypasses RLS; always test policies via the JS client SDK |
| Turbo cache + CLI publishing | Cache poisoning from environment variables leaking | Audit Turborepo pipeline env inputs; do not cache tasks that depend on secrets |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Inline synchronous crawl in API route | Vercel function timeout (10s default), incomplete scan results for large sites | Queue scan jobs via Supabase Edge Functions or BullMQ; poll for results | First site > 10 pages scanned via SaaS |
| Per-row RLS policy without index | Dashboard loads slowly as scan history grows; Postgres sequential scans | Index every column used in RLS policies (`user_id`, `org_id`) | ~1,000 rows per user |
| Full-page re-crawl for score history | Compute cost grows linearly with check frequency for Pro users | Store structured score snapshots; only re-crawl on explicit user request or scheduled interval | ~100 monitored sites |
| Loading all scan history in one query | Dashboard pagination breaks; memory pressure on Supabase connection | Paginate with cursor; never `SELECT *` on unbounded scan history | ~500 scans |
| Unpinned Puppeteer/Playwright version | Chromium update changes rendering behavior; scores silently change | Pin browser version; add smoke tests that assert score on a fixture URL | Any Chromium major version bump |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No SSRF protection on SaaS scan API | Attacker reads AWS metadata, Redis, internal services | Validate and allowlist IPs; block RFC 1918 ranges before fetch |
| Storing Stripe secret key in client-side env vars | Key exposure via browser; full billing account takeover | `STRIPE_SECRET_KEY` must only exist server-side; use `NEXT_PUBLIC_` prefix only for publishable key |
| `robots.txt` disallow paths as security boundary | Sensitive paths listed in robots.txt are publicly readable — security through obscurity inverted | Never assume robots.txt hides content; use auth for sensitive pages |
| Committing npm auth token to GitHub repo | Token scraped by bots; malicious package published under your namespace | Use GitHub Actions OIDC with `NPM_TOKEN` as repository secret; enable npm 2FA for publish |
| No rate limiting on `/api/scan` endpoint | Malicious actor hammers third-party sites through AEOrank's server; legal exposure + cost spike | Rate limit by user (Clerk userId) and by target domain per time window |
| Webhook endpoint accepts any payload without signature verification | Attacker crafts fake Stripe events to unlock Pro features | Always call `stripe.webhooks.constructEvent(rawBody, sig, secret)` before processing |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| npx cold start downloads 50MB of dependencies | First-run takes 30+ seconds; user assumes tool is broken | Minimize CLI dependencies aggressively; target <5MB install; show a spinner immediately on start |
| Score output has no explanation | Users see "Score: 47" with no context about what to fix | Always output the top 3 failing dimensions with one-line fix suggestions |
| CLI exits silently on redirect loops or auth-required pages | User doesn't know why score is low for those pages | Log per-page errors to stderr; distinguish between "not crawled" and "scored zero" |
| Dashboard shows "scanning..." indefinitely if job fails | User waits forever; doesn't know whether to retry | Implement job timeout (90 seconds max); surface error state with retry button |
| GitHub Action posts score on every PR even for passing scores | Noise in PR comments; teams disable the Action | Only post a PR comment when score drops below threshold (configurable) or new issues found |
| Generated files overwrite user-customized versions | Users who hand-edited `llms.txt` lose their changes | Detect existing files, offer `--overwrite` flag, or generate to `*.generated.*` and let user merge |

---

## "Looks Done But Isn't" Checklist

- [ ] **SSRF protection:** URL validation blocks 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x before any fetch — verify with a test that submits `http://127.0.0.1:22`
- [ ] **Stripe webhooks:** `stripe_events` table has unique constraint on `event_id`; handler skips if already processed — verify with duplicate event replay via `stripe trigger`
- [ ] **RLS:** Every user-data table has `ENABLE ROW LEVEL SECURITY` and a policy — verify with a cross-tenant read test from a second authenticated user
- [ ] **Webhook response time:** Stripe webhook handler responds in < 5 seconds — verify with load test or timing log
- [ ] **CLI User-Agent:** All HTTP requests from the CLI include `AEOrank/x.x.x` User-Agent — verify with network capture
- [ ] **robots.txt compliance:** Crawler reads and respects `Disallow` and `Crawl-delay` before fetching — verify with a fixture robots.txt that blocks `/private/`
- [ ] **Score determinism:** Running scan twice on same URL within 1 hour returns scores within ±2 points — add to CI regression suite
- [ ] **GitHub Action version pinning:** Action YAML references specific CLI version, not `@latest` — check action.yml uses `npx @aeorank/cli@X.Y.Z`
- [ ] **Generated files conflict handling:** CLI warns rather than silently overwriting existing user files — verify with a fixture directory containing pre-existing `llms.txt`
- [ ] **SaaS scan timeout:** Scan job has a maximum runtime enforced (90 seconds); never hangs indefinitely — verify by scanning a localhost URL that delays responses

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SSRF discovered post-launch | HIGH | Emergency patch + rotate all credentials; audit logs for suspicious scan URLs; notify affected users; add network egress restriction at infra level |
| Stripe double-provisioning | MEDIUM | Identify affected accounts via webhook event log; manually revert duplicate records; issue credits; add idempotency retroactively |
| RLS not enabled on tenant tables | HIGH | Enable RLS + policies in emergency migration; audit who accessed what via Supabase logs; notify affected users per GDPR/CCPA |
| Score instability reported by users | MEDIUM | Pin scoring algorithm version; re-score affected records with new engine; display "recalculated" badge on affected scans |
| Crawl rate caused target downtime | MEDIUM | Add rate limiting; reach out to affected site owners; consider opt-in for aggressive scan mode |
| npm publish of malicious/broken version | HIGH | Immediately unpublish via `npm unpublish`; publish fixed version; push advisory via GitHub Security Advisory |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| SSRF via user-supplied URLs | SaaS API / scan-job phase | Integration test: submit private IP URL, assert 400 response |
| Stripe webhook non-idempotency | SaaS billing phase | Replay event twice via Stripe CLI; assert single DB record |
| Supabase RLS disabled | Database schema phase | Cross-tenant read test; `SELECT` from second user JWT returns 0 rows |
| AEO score instability | Scoring engine design phase | CI test: double-scan fixture URL; assert delta < 2 points |
| Crawl rate overload | CLI crawler phase | Load test with rate-limited fixture server; assert backoff behavior |
| Webhook sync response timeout | SaaS async job phase | Time webhook handler; assert < 5s before queueing |
| Missing User-Agent header | CLI crawler phase | Network capture in test; assert `AEOrank` present in request headers |
| Stripe key in client env | SaaS billing phase | CI env audit script; grep for `STRIPE_SECRET` in `NEXT_PUBLIC_` vars |
| GitHub Action version unpinned | GitHub Action phase | Lint action.yml; assert no `@latest` references |
| Generated file silent overwrite | CLI file generation phase | Test with pre-existing files; assert warning printed and `--overwrite` required |

---

## Sources

- [OWASP SSRF Prevention in Node.js](https://owasp.org/www-community/pages/controls/SSRF_Prevention_in_Nodejs) — MEDIUM confidence
- [Snyk: Preventing SSRF in Node.js](https://snyk.io/blog/preventing-server-side-request-forgery-node-js/) — MEDIUM confidence
- [Stripe Webhook Best Practices — Stigg Engineering](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) — MEDIUM confidence
- [Stripe Idempotent Requests — Official Docs](https://docs.stripe.com/api/idempotent_requests) — HIGH confidence
- [Stripe Advanced Error Handling — Official Docs](https://docs.stripe.com/error-low-level) — HIGH confidence
- [Supabase Row Level Security — Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Drizzle ORM RLS Support — Official Docs](https://orm.drizzle.team/docs/rls) — HIGH confidence
- [Supabase RLS Misconfigurations Analysis — Designrevision](https://designrevision.com/blog/supabase-row-level-security) — LOW confidence (single source)
- [Moldstud: Common Stripe Payment Mistakes](https://moldstud.com/articles/p-common-mistakes-developers-make-when-using-stripe-payment-processing-avoid-these-pitfalls) — LOW confidence (single source)
- [Moldstud: GitHub Actions Pitfalls](https://moldstud.com/articles/p-avoid-these-common-pitfalls-in-github-actions-key-tips-for-success) — LOW confidence (single source)
- [Sitebulb: Crawl Responsibly](https://sitebulb.com/resources/guides/how-to-crawl-responsibly-the-need-for-less-speed/) — MEDIUM confidence
- [GitHub Actions Security Lab — New Vulnerability Patterns](https://securitylab.github.com/resources/github-actions-new-patterns-and-mitigations/) — HIGH confidence
- [Turborepo Pitfalls — DEV Community](https://dev.to/_gdelgado/pitfalls-when-adding-turborepo-to-your-project-4cel) — LOW confidence
- [Yoast: LLM SEO / llms.txt Techniques](https://yoast.com/llm-seo-optimization-techniques-including-llms-txt/) — MEDIUM confidence
- [llmrefs.com: AEO Complete Guide](https://llmrefs.com/answer-engine-optimization) — LOW confidence (single source)

---
*Pitfalls research for: AEOrank — CLI scanner + SaaS dashboard (AEO/website audit)*
*Researched: 2026-03-14*
