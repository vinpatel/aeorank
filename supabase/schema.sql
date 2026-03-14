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
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,  -- Clerk user ID (auth.jwt()->>'sub')
  url         text not null,
  name        text,
  created_at  timestamptz default now()
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
  files         jsonb,    -- GeneratedFile[] from @aeorank/core (name + content)
  pages_scanned integer,
  duration_ms   integer,
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

-- Sites: users own their own rows (all operations)
create policy "users_own_sites" on sites
  for all using ((select auth.jwt()->>'sub') = user_id);

-- Scans: users own their own rows (all operations)
create policy "users_own_scans" on scans
  for all using ((select auth.jwt()->>'sub') = user_id);

-- Subscriptions: users can only select their own row
-- Updates are performed by the Stripe webhook handler via service role key
create policy "users_own_subscription" on subscriptions
  for select using ((select auth.jwt()->>'sub') = user_id);

-- ============================================================
-- INDEXES (for common query patterns)
-- ============================================================

create index sites_user_id_idx on sites(user_id);
create index scans_site_id_idx on scans(site_id);
create index scans_user_id_idx on scans(user_id);
create index scans_status_idx on scans(status);
create index subscriptions_user_id_idx on subscriptions(user_id);
