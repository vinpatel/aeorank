# Requirements — v3.0 Developer Parity

**Milestone goal:** Close the developer-surface gaps against Profound, Scrunch, Otterly,
Peec, and AthenaHQ — then launch.

Scope derived from `.planning/COMPETITIVE-PARITY.md` (live competitor research,
2026-08-15). Phase numbering continues from v2.0, which ended at Phase 16.

---

## v3.0 Requirements

### Launch blockers — security and truth (SEC)

- [ ] **SEC-01**: Repo has zero open critical and zero open high Dependabot alerts
- [ ] **SEC-02**: Repo has an automated dependency-update cadence so alert debt cannot silently triple again
- [ ] **SEC-03**: Every numeric claim in LAUNCH.md, README.md, and the marketing site is traceable to a measured source
- [ ] **SEC-04**: A single authoritative test count is emitted by CI and consumed by every doc and badge that cites one
- [ ] **SEC-05**: `fix/scan-callback-url` is merged, including the Supabase migration and the keep-alive cron route
- [ ] **SEC-06**: Marketing DNS, dashboard credentials, and GitHub Marketplace publication are verified live

### Public API (API)

- [ ] **API-01**: User can create, name, and revoke scoped API keys from the dashboard
- [ ] **API-02**: Developer can trigger a scan via an authenticated REST endpoint
- [ ] **API-03**: Developer can retrieve a scan's score, grade, and per-dimension breakdown as JSON
- [ ] **API-04**: Developer can list their sites and each site's scan history
- [ ] **API-05**: Developer can retrieve the 9 generated files for a scan via the API
- [ ] **API-06**: API enforces per-plan rate limits and returns quota headers on every response
- [ ] **API-07**: A published OpenAPI spec and API reference exist on the docs site

### MCP server (MCP)

- [ ] **MCP-01**: An MCP server exposes a scan tool that an AI agent can call against any URL
- [ ] **MCP-02**: The MCP server exposes scan results and generated files as readable resources
- [ ] **MCP-03**: Install instructions exist for Claude Code, Claude Desktop, and generic MCP clients

### AI crawler analytics (CRAWL)

- [ ] **CRAWL-01**: User can connect an edge log source (Vercel or Cloudflare) to a site
- [ ] **CRAWL-02**: Dashboard shows AI crawler hits broken down by bot and over time
- [ ] **CRAWL-03**: System detects and surfaces crawler errors, blocks, and non-200 responses to AI bots
- [ ] **CRAWL-04**: User can see which pages AI crawlers actually fetch versus which pages exist

### Alerts (ALERT)

- [ ] **ALERT-01**: User is alerted when a site's AEO score drops beyond a configurable threshold
- [ ] **ALERT-02**: User is alerted when an AI crawler becomes blocked or robots.txt regresses
- [ ] **ALERT-03**: User is alerted when a previously present generated file goes missing or goes stale
- [ ] **ALERT-04**: User can choose delivery by email, Slack, or outbound webhook

### Reports and exports (RPT)

- [ ] **RPT-01**: User can export a scan result as CSV
- [ ] **RPT-02**: User can export a scan result as JSON
- [ ] **RPT-03**: User can generate a shareable PDF report for a site
- [ ] **RPT-04**: User can schedule a recurring report to be delivered on a cadence

### Integrations (CONN)

- [ ] **CONN-01**: User can connect Google Search Console and see AI-referral traffic beside AEO score
- [ ] **CONN-02**: User can connect GA4 as a traffic source
- [ ] **CONN-03**: Vercel integration installs AEOrank against a project in one flow
- [ ] **CONN-04**: Cloudflare integration installs AEOrank against a zone in one flow

### Geographic and language coverage (GEO)

- [ ] **GEO-01**: User can run a scan from a selectable region
- [ ] **GEO-02**: Scoring handles non-English content without penalising it for being non-English

### Defend the moat (DEF)

- [ ] **DEF-01**: Edge middleware can serve AI-optimised page variants to identified AI crawlers
- [ ] **DEF-02**: A published, reproducible benchmark shows AEOrank audit depth against Otterly's GEO URL audit
- [ ] **DEF-03**: The 100-funded-startup scoreboard is live and publicly linkable

---

## Future Requirements (deferred)

Tier 0 monitoring — deferred to a later milestone, after first real user feedback:

- Prompt set management and scheduled multi-engine querying
- Citation and source extraction from LLM responses
- Competitor share-of-voice
- Brand sentiment scoring
- Prompt volume / demand data

Also deferred:

- SSO / SAML / RBAC — enterprise tier, no demand signal yet
- SOC 2 — no enterprise deal in flight to justify the cost

---

## Out of Scope

| Exclusion | Reasoning |
|---|---|
| LLM-based scoring | Determinism is the bedrock of the CI story; an LLM-evaluated score cannot block a PR |
| AI citation tracker as core product | Separate product category with per-customer LLM COGS the $29 tier cannot cover |
| Prompt volume / demand data | Competitors buy or scrape this; no cheap path, and it is the weakest-value Tier 0 item |
| Mobile app | Web-first; PWA works well |
| Browser extension | Not core to value prop |
| Bulk CSV import | Creates queue and abuse problems before PMF |
| On-premise deployment | The MIT CLI is the on-premise answer |
| White-label PDF reports | Agency tier; RPT-03 ships unbranded-shareable first |
| Custom weight profiles | Standard weights match industry |

---

## Traceability

| REQ-ID | Phase | Status |
|---|---|---|
| SEC-01 … SEC-06 | 17 | Pending |
| API-01 … API-07 | 18 | Pending |
| MCP-01 … MCP-03 | 19 | Pending |
| CRAWL-01 … CRAWL-04 | 20 | Pending |
| ALERT-01 … ALERT-04 | 21 | Pending |
| RPT-01 … RPT-04 | 22 | Pending |
| CONN-01 … CONN-04 | 23 | Pending |
| GEO-01 … GEO-02 | 24 | Pending |
| DEF-01 … DEF-03 | 25 | Pending |

**Coverage:** 37 requirements, 9 phases, 100% mapped.
