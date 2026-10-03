-- Repair sites/scans RLS for Clerk session JWTs.
-- ---------------------------------------------------------------
-- POST /api/scan used to upsert `sites` with the user-scoped client
-- (anon key + Clerk session token) under a single FOR ALL policy that
-- only declared USING. Plan-limit checks already used the service role,
-- so they succeeded while the upsert returned "Failed to create site record".
--
-- The app now writes the authenticated user's rows with the service role
-- (user_id = Clerk userId from auth(), never from the request body).
-- This migration keeps RLS as the backstop for any remaining user-scoped
-- request:
--   * explicit INSERT/UPDATE WITH CHECK (Clerk guide shape)
--   * policies apply TO authenticated, which requires the Clerk session
--     claim `"role": "authenticated"` (Clerk Dashboard → Supabase integration)
--   * GRANT the Data API privileges newer Supabase projects omit by default
--
-- Idempotent. Does not delete rows. Run in the Supabase SQL Editor
-- (privileged role) after 0001_sites_unique_user_id_url.sql.
-- ---------------------------------------------------------------

grant select, insert, update, delete on table public.sites to authenticated;
grant select, insert, update, delete on table public.scans to authenticated;
grant select on table public.subscriptions to authenticated;

drop policy if exists "users_own_sites" on public.sites;
drop policy if exists "users_own_sites_select" on public.sites;
drop policy if exists "users_own_sites_insert" on public.sites;
drop policy if exists "users_own_sites_update" on public.sites;
drop policy if exists "users_own_sites_delete" on public.sites;

create policy "users_own_sites_select" on public.sites
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_sites_insert" on public.sites
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_sites_update" on public.sites
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_sites_delete" on public.sites
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "users_own_scans" on public.scans;
drop policy if exists "users_own_scans_select" on public.scans;
drop policy if exists "users_own_scans_insert" on public.scans;
drop policy if exists "users_own_scans_update" on public.scans;
drop policy if exists "users_own_scans_delete" on public.scans;

create policy "users_own_scans_select" on public.scans
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans_insert" on public.scans
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans_update" on public.scans
  for update to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users_own_scans_delete" on public.scans
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "users_own_subscription" on public.subscriptions;
create policy "users_own_subscription" on public.subscriptions
  for select to authenticated
  using ((select auth.jwt()->>'sub') = user_id);
