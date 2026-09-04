-- Fix: "Failed to create site record"
-- ---------------------------------------------------------------
-- The scan API (apps/web/app/api/scan/route.ts) upserts sites with
-- `onConflict: "user_id,url"`. Postgres rejects an ON CONFLICT clause
-- that has no matching unique/exclusion constraint (SQLSTATE 42P10),
-- so every site upsert failed and the route returned 500.
--
-- The original schema.sql only created a NON-unique index on user_id.
-- This migration adds the required unique constraint on (user_id, url).
--
-- Idempotent and dedupe-safe: run it in the Supabase Dashboard -> SQL Editor.
-- ---------------------------------------------------------------

-- 1) Collapse any pre-existing duplicate (user_id, url) rows.
--    Re-point their scans to the earliest-kept site row, then delete the dupes.
with ranked as (
  select
    id,
    first_value(id) over (
      partition by user_id, url
      order by created_at asc, id asc
    ) as keep_id
  from sites
),
dupes as (
  select id, keep_id from ranked where id <> keep_id
)
update scans s
set site_id = d.keep_id
from dupes d
where s.site_id = d.id;

with ranked as (
  select
    id,
    first_value(id) over (
      partition by user_id, url
      order by created_at asc, id asc
    ) as keep_id
  from sites
)
delete from sites
where id in (select id from ranked where id <> keep_id);

-- 2) Add the unique constraint the upsert depends on (only if absent).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sites_user_id_url_key'
  ) then
    alter table sites
      add constraint sites_user_id_url_key unique (user_id, url);
  end if;
end $$;
