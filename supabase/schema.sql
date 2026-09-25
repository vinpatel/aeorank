-- AEOrank Database Schema
-- Run this in the Supabase Dashboard -> SQL Editor
-- Then configure Clerk as third-party auth provider in Auth -> Third-party Auth

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Sites: one row per user-added site
create table sites (
  id               uuid primary key default uuid_generate_v4(),
  user_id          text not null,  -- Clerk user ID (auth.jwt()->>'sub')
  url              text not null,
  name             text,
  rescan_schedule  text,           -- weekly | daily | monthly | null (off)
  next_rescan_at   timestamptz,
  created_at       timestamptz default now(),
  -- Required by the scan API upsert: onConflict "user_id,url".
  -- Postgres rejects ON CONFLICT without a matching unique constraint (42P10).
  constraint sites_user_id_url_key unique (user_id, url)
);

-- Scans: one row per scan run
create table scans (
  id            uuid primary key default uuid_generate_v4(),
  site_id       uuid references sites(id) on delete cascade,
  user_id       text not null,
  status        text not null default 'pending', -- pending | running | complete | error
  score         integer,
  grade         text,
  dimensions    jsonb,    -- DimensionScore[] from @aeorank/core
  page_scores   jsonb,    -- PageScore[] — per-page scoring breakdown
  files         jsonb,    -- GeneratedFile[] from @aeorank/core (name + content)
  pages_scanned integer,
  duration_ms   integer,
  progress      integer default 0,
  error         text,
  scanned_at    timestamptz default now()
);

-- Subscriptions: synced from Stripe webhooks
create table subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 text not null unique,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text not null default 'free',    -- free | pro | api
  status                  text not null default 'active',  -- active | canceled | past_due
  current_period_end      timestamptz,
  updated_at              timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table sites         enable row level security;
alter table scans         enable row level security;
alter table subscriptions enable row level security;

-- Data API grants. Newer Supabase projects do not grant these by default;
-- without them the user-scoped client gets 42501 even when the policy matches.
-- anon is intentionally not granted. Dashboard writes use the service role and
-- set user_id from the Clerk session; these policies are the backstop for any
-- request that still presents a Clerk session JWT.
grant select, insert, update, delete on sites to authenticated;
grant select, insert, update, delete on scans to authenticated;
grant select on subscriptions to authenticated;

-- Sites: Clerk user id is auth.jwt()->>'sub'. INSERT/UPDATE need WITH CHECK;
-- a USING-only policy does not document the write check, and UPSERT also
-- evaluates the SELECT policy on the proposed row.
create policy "users_own_sites_select" on sites
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_sites_insert" on sites
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_sites_update" on sites
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_sites_delete" on sites
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- Scans: same ownership split.
create policy "users_own_scans_select" on scans
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans_insert" on scans
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans_update" on scans
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans_delete" on scans
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- Subscriptions: users can only select their own row
-- Updates are performed by the Stripe webhook handler via service role key
create policy "users_own_subscription" on subscriptions
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

-- ============================================================
-- INDEXES (for common query patterns)
-- ============================================================

create index sites_user_id_idx on sites(user_id);
create index sites_next_rescan_idx on sites(next_rescan_at) where rescan_schedule is not null;
create index scans_site_id_idx on scans(site_id);
create index scans_user_id_idx on scans(user_id);
create index scans_status_idx on scans(status);
create index subscriptions_user_id_idx on subscriptions(user_id);
