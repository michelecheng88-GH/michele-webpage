-- Sprint 5: replace v1 open RLS policies with locked-down ones.
--
-- Design note: leads and quiz_responses are captured from anonymous visitors
-- (no user_id is ever set on those rows), so an auth.uid() = user_id
-- ownership check would never match and would lock Michele out of her own
-- data. Instead, this app has exactly one owner/admin, so policies grant
-- write/read access to "any authenticated user" (auth.uid() is not null)
-- rather than per-row ownership. Create Michele's account first (Supabase
-- Dashboard -> Authentication -> Add user) and confirm she can log in at
-- /admin/login via Supabase Auth BEFORE applying this migration, since the
-- legacy env-var admin password will no longer be able to write to these
-- tables once these policies are active.

-- ── services: public read stays open, writes require authentication ────────
drop policy if exists "services_v1_write" on services;
drop policy if exists "services_authenticated_write" on services;
create policy "services_authenticated_write" on services
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- "services_v1_read" (select using (true)) is left in place — public read stays permanent.

-- ── blog_posts: public read only sees published posts; admin sees all ─────
drop policy if exists "blog_posts_v1_read" on blog_posts;
drop policy if exists "blog_posts_v1_write" on blog_posts;
drop policy if exists "blog_posts_public_read" on blog_posts;
drop policy if exists "blog_posts_authenticated_read_all" on blog_posts;
drop policy if exists "blog_posts_authenticated_write" on blog_posts;

create policy "blog_posts_public_read" on blog_posts
  for select using (published = true);
create policy "blog_posts_authenticated_read_all" on blog_posts
  for select using (auth.uid() is not null);
create policy "blog_posts_authenticated_write" on blog_posts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ── leads: anonymous visitors may still INSERT (quiz submissions); ─────────
-- ── all read/update/delete requires authentication ─────────────────────────
drop policy if exists "leads_v1_read" on leads;
drop policy if exists "leads_v1_write" on leads;
drop policy if exists "leads_anon_insert" on leads;
drop policy if exists "leads_authenticated_all" on leads;

create policy "leads_anon_insert" on leads
  for insert with check (true);
create policy "leads_authenticated_all" on leads
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ── quiz_responses: same pattern as leads ──────────────────────────────────
drop policy if exists "quiz_responses_v1_read" on quiz_responses;
drop policy if exists "quiz_responses_v1_write" on quiz_responses;
drop policy if exists "quiz_responses_anon_insert" on quiz_responses;
drop policy if exists "quiz_responses_authenticated_all" on quiz_responses;

create policy "quiz_responses_anon_insert" on quiz_responses
  for insert with check (true);
create policy "quiz_responses_authenticated_all" on quiz_responses
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ── audit_logs: authenticated-only, append-only (no delete policy ever) ────
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
drop policy if exists "audit_logs_authenticated_read" on audit_logs;
drop policy if exists "audit_logs_authenticated_insert" on audit_logs;

create policy "audit_logs_authenticated_read" on audit_logs
  for select using (auth.uid() is not null);
create policy "audit_logs_authenticated_insert" on audit_logs
  for insert with check (auth.uid() is not null);
