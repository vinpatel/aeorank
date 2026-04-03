# Privacy Policy

**Last updated:** April 3, 2026

## Overview

AEOrank ("we", "our", "us") is an open-source tool that scans websites for AI Engine Optimization (AEO). This policy explains what data we collect and how we use it.

## What We Collect

### GitHub App

When you install the AEOrank GitHub App, we receive:

- **Repository metadata** — repository name, owner, default branch (used to detect your site URL)
- **Pull request metadata** — PR number, head SHA (used to post Check Runs and comments)
- **Installation ID** — identifies which repositories the App is installed on

We do **not** access your source code, commits, issues, or any private repository content beyond the files needed for URL detection (.aeorank, CNAME, package.json, aeorank.config.js).

### Website Scans

When a scan runs, we fetch your publicly accessible website URL and analyze its HTML structure. We do not store the full HTML content. We store only the computed AEO score, dimension breakdown, and generated file content.

### SaaS Dashboard

If you use the dashboard at app.aeorank.dev, we collect:

- **Account information** — email address and name via Clerk authentication
- **Sites you add** — URLs you submit for scanning
- **Scan results** — scores, dimensions, and generated files
- **Payment information** — processed by Stripe; we do not store card numbers

### CLI

The CLI tool (`npx aeorank-cli scan`) runs entirely on your machine. It sends no data to our servers.

## How We Use Your Data

- To scan websites and compute AEO scores
- To post Check Runs and PR comments on your repositories
- To display scan history on the dashboard
- To process payments via Stripe

We do **not** sell your data. We do **not** use your data for advertising. We do **not** share your data with third parties except as required for the services above (Clerk for auth, Supabase for storage, Stripe for payments, QStash for async processing).

## Data Storage

Data is stored in Supabase (PostgreSQL) with row-level security. Each user can only access their own sites, scans, and subscription data.

## Data Deletion

You can delete your sites and scan data at any time from the dashboard. To request full account deletion, email vinpatel.pro@gmail.com.

## Cookies

The dashboard uses essential cookies for authentication (Clerk). We use Sentry for error tracking. No advertising cookies.

## Open Source

The AEOrank scoring engine, CLI, and all framework plugins are open source under the MIT license. You can audit the code at https://github.com/vinpatel/aeorank.

## Changes

We may update this policy. Changes will be posted to this page with an updated date.

## Contact

For privacy questions: vinpatel.pro@gmail.com
