# Competitive parity analysis — 2026-08-15

Refresh of `.planning/milestones/v2-redesign/COMPETITION.md` (2026-04-19, 4 months stale;
that doc recommended a 60-day refresh cadence that lapsed). Live-fetched homepages and
pricing pages for all five competitors on 2026-08-15.

Purpose: establish what "at par for all features" actually means before restarting
development, so the scope is a decision rather than an assumption.

---

## 1. The five, as of August 2026

| # | Competitor | H1 | Entry price | Top self-serve | Positioning verb |
|---|---|---|---|---|---|
| 1 | **Profound** | "Marketing agents to win in AI search" | $99/mo Starter | $399/mo Growth → Enterprise | *agents* |
| 2 | **Scrunch AI** | "Monitor and improve your brand's visibility in AI search" | undisclosed (7-day trial) | Enterprise / sales-led | *monitor* |
| 3 | **Otterly.AI** | "We otter know where your brand shows up on AI Search" | $29/mo Lite | $489/mo Premium | *track* |
| 4 | **Peec AI** | "AI search analytics for marketing teams" | undisclosed (4 tiers) | Enterprise | *analyze* |
| 5 | **AthenaHQ** | "Become the Brand AI Trusts" | **Free** (300 credits) | $295/mo Starter → Enterprise | *trust* |

### What changed since April

- **AthenaHQ launched a free tier.** In April the cheapest entry was $295. There is now a
  $0 Essential plan with $25 of credit and 5 AI platforms. This directly erodes the
  "$89–$295/mo closed dashboards vs our $29" pricing frame in current marketing copy.
- **Profound went down-market.** A $99 Starter tier now exists (was $399 entry). The
  "roughly 7–14× cheaper than Profound" line in marketing copy is now ~3.4× at the entry
  point and needs rewording.
- **Agent/bot analytics became table stakes.** Profound, Scrunch, and Otterly all now sell
  server-log-style AI crawler analytics. In April this was a Profound-only feature.
- **Otterly shipped an MCP server** (2,000 req/mo on Standard). First MCP surface in the
  category.
- **Scrunch shipped AXP (Agent Experience Platform)** — serving AI-optimised lightweight
  page variants to crawlers. This is the first competitor move *into* AEOrank's
  generation territory, and it is the single most strategically threatening item on this list.
- **Otterly shipped "GEO URL audits"** (1k–10k/mo by tier) — a deterministic on-page audit
  bolted onto a monitoring product. Second encroachment on our territory.

---

## 2. Feature parity matrix

✅ = shipped · ⚠️ = partial · ❌ = absent

| Capability | Profound | Scrunch | Otterly | Peec | AthenaHQ | **AEOrank** |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **— Monitoring (category table stakes) —** |
| Prompt/answer tracking across LLMs | ✅ 9 | ✅ 5+ | ✅ 7 | ✅ 5 | ✅ 8 | ❌ |
| Citation / source tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Competitor share-of-voice | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Brand sentiment analysis | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Prompt volume / demand data | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Hallucination / error detection | ❌ | ⚠️ | ❌ | ❌ | ✅ | ❌ |
| **— Analytics —** |
| AI crawler / agent log analytics | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Multi-region / multi-language | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Alerts / notifications | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Scheduled + exportable reports | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ ZIP only |
| **— Optimisation —** |
| Content recommendations / briefs | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ fix-list only |
| Deterministic on-page/technical audit | ❌ | ⚠️ | ✅ | ❌ | ❌ | ✅ **36 criteria** |
| Generates the AI files (llms.txt, ai.txt…) | ❌ | ⚠️ AXP | ❌ | ❌ | ❌ | ✅ **9 files** |
| **— Developer surface —** |
| Public REST API | ✅ ent | ✅ | ✅ | ✅ | ✅ add-on | ❌ |
| MCP server | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| CI integration (Action / Check Runs) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **unique** |
| Framework build plugins | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **11, unique** |
| CLI | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **unique** |
| **— Platform / trust —** |
| Third-party integrations (GA4, GSC, BI, CMS) | ✅ | ✅ | ⚠️ | ✅ Looker | ✅ | ❌ |
| SSO / SAML / RBAC | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| SOC 2 | ✅ | ✅ | — | — | — | ❌ |
| Free tier | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Open source / self-hostable | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **MIT, unique** |

### Score

- **Capabilities all five have and AEOrank has none of: 8** (prompt tracking, citations,
  share-of-voice, sentiment, prompt volume, alerts, public API, integrations).
- **Capabilities AEOrank has that none of the five have: 4** (CLI, CI/Check Runs, framework
  plugins, MIT self-hostable) — plus file generation, where only Scrunch has moved.

The two products are not the same shape. AEOrank is a **build-time correctness tool**.
All five competitors are **run-time brand-monitoring tools**. Parity is not a matter of
finishing a checklist; it is a second product.

---

## 3. What "at par for all features" costs

Grouped by what the work actually requires.

### Tier 0 — Monitoring core (all 5 competitors have it; we have zero)

Requires standing up recurring LLM querying, response storage, and entity extraction.

| Gap | Est. size | Notes |
|---|---|---|
| Prompt set management + scheduled multi-engine querying | L | New tables, new worker; cost scales per prompt × engine × day |
| Citation/source extraction from responses | M | Parse URLs out of answers, attribute to domains |
| Share-of-voice + competitor tracking | M | Depends on the above |
| Sentiment scoring | S | LLM call per response |
| Prompt volume / demand data | XL | Competitors buy or scrape this; no cheap path |

**Blocker:** this reverses two decisions recorded in `PROJECT.md` → Out of Scope:
*"AI citation tracker — separate product category"* and *"LLM-based scoring — must remain
deterministic."* It also breaks the determinism claim that the CI story and all V2
marketing copy rest on. It can be built *alongside* deterministic scoring, but the messaging
must be re-cut so the two are visibly separate subsystems.

**Recurring cost:** unlike everything AEOrank has shipped so far, this has a per-customer
marginal cost (LLM API spend). 100 prompts × 5 engines × daily = 15,000 calls/mo per
customer. The $29 Pro tier does not survive contact with that.

### Tier 1 — Platform gaps (4–5 of 5 have it; genuinely missing, no philosophical conflict)

| Gap | Est. size | Notes |
|---|---|---|
| Public REST API + API keys | M | Already a promised $99 tier in PROJECT.md; currently nonexistent |
| AI crawler / agent log analytics | M | Ingest edge logs; fits our deterministic story cleanly |
| Alerts (score drop, crawler block, file regression) | S | Email/Slack/webhook on existing scan data |
| Scheduled + exportable reports (CSV/JSON/PDF) | S | We have ZIP download only |
| Integrations: GSC, GA4, Vercel, Cloudflare | M | Table stakes for the buyer persona |
| MCP server | S | Only Otterly has one; cheap, and it is *exactly* our audience |
| Multi-region / multi-language scanning | M | |
| SSO/SAML + RBAC | M | Explicitly deferred in PROJECT.md as enterprise-tier |

### Tier 2 — Defend what we already own (nobody else has it; two are encroaching)

| Work | Why now |
|---|---|
| Harden file generation vs Scrunch AXP | Scrunch is serving AI-optimised page variants. Our answer is generation + edge middleware. |
| Beat Otterly's "GEO URL audit" on depth | They bolted on a shallow audit. Our 36 criteria are deeper — but theirs is *inside* a monitoring product they already sell. |
| Ship the scoreboard publicly | 100 pre-scanned funded startups sitting in a JSON file. Category-defining content asset, unpublished since April. |

---

## 4. Blockers that gate any launch, regardless of feature scope

These are not feature work. They are launch-blocking defects found while auditing.

1. **242 open Dependabot alerts** (7 critical, 101 high, 108 medium, 26 low). This is up
   **3×** from the 80 recorded in `growth/DIAGNOSIS.md` in April — the debt compounded while
   development was paused. Any technical evaluator who opens the Security tab on launch day
   reads this as an abandoned project.
2. **`LAUNCH.md` states "675 tests, 0 Dependabot / CodeQL alerts."** This is false as of
   today, and it is in the copy drafted for the Show HN post. Shipping it would be a
   self-inflicted credibility wound on the most scrutinising audience available.
3. **Test-count claims disagree across docs** — `PROJECT.md` says 637, `LAUNCH.md` says 675,
   `growth/DIAGNOSIS.md` says 288, repo has 39 test files. Needs one measured number.
4. **Uncommitted working tree** on `fix/scan-callback-url`, including a deleted
   `.planning/ROADMAP.md` and `STATE.md`, an unapplied `supabase/migrations/`, and an
   untracked `api/cron/keep-alive/` route.
5. **Deploy status unverified** since April — marketing DNS, dashboard credentials, and
   GitHub Marketplace publication were all listed "pending" in `PROJECT.md`.

---

## 5. The strategic tension, stated plainly

The instruction is "come at par for all features first, then launch." Two facts from this
repo's own records argue against the sequencing:

- `growth/DIAGNOSIS.md` (2026-04-19) concluded: *"The product is ready. The distribution
  hasn't started. That's the single most fixable thing."* It named
  **polish-before-distribution** as structural bottleneck #1.
- Since that diagnosis, four months passed with no launch executed. Stars went 4 → 12.
  The 16-phase distribution playbook is 3/16 complete and stalled at Phase 03. Meanwhile
  security debt tripled.

Building Tier 0 + Tier 1 before launching is a 4–8 month solo build that repeats the exact
cycle the diagnosis identified — and it does so while two competitors are actively moving
into the one area where AEOrank is uncontested.

There is a defensible version of the instruction: **parity on the developer-surface gaps
(Tier 1) is real, cheap, and consistent with the product's identity.** Parity on monitoring
(Tier 0) is a different product with a different cost structure and a reversed core
decision.

---

## 6. Three candidate paths

| | **A. Full parity** | **B. Developer parity** | **C. Launch first** |
|---|---|---|---|
| Scope | Tier 0 + Tier 1 + Tier 2 | Tier 1 + Tier 2, defer Tier 0 | Blockers only |
| Time to launch | 4–8 months | 6–10 weeks | 1–2 weeks |
| Reverses PROJECT.md decisions | Yes (2) | No | No |
| New recurring COGS | Yes, significant | No | No |
| Pricing impact | $29 tier unviable | Holds | Holds |
| Competes on | Their terms | Our terms | Our terms |
| Risk | Repeats the diagnosed failure cycle; out-funded 1000:1 | Monitoring gap persists in feature comparisons | Launches without parity the instruction asked for |

Recommended: **B**, with the Tier 0 monitoring build sequenced *after* first real user
feedback — so the prompt-monitoring design is informed by what users actually ask for,
rather than by cloning five competitors who are all guessing too.

---

*Sources fetched live 2026-08-15: tryprofound.com + /pricing, scrunch.com, otterly.ai +
/pricing, peec.ai + /pricing, athenahq.ai. Repo facts from `gh api` and working tree.*
