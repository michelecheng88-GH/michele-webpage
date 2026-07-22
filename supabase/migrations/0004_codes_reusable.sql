-- 0004: make redemption codes REUSABLE for now (do not consume/expire on use),
-- controlled by a settings flag so it can be switched to single-use later
-- WITHOUT another code change or redeploy:
--
--   To turn ON single-use (a code expires after one report):
--     update app_settings set value = 'true'  where key = 'codes_single_use';
--   To turn it OFF again (reusable):
--     update app_settings set value = 'false' where key = 'codes_single_use';
--
-- This file is self-contained and idempotent: safe to run on its own even if
-- 0003 has not been applied. It also refreshes the API cache at the end.

-- ── tables (guards, in case 0003 didn't apply) ─────────────────────────────
create table if not exists assessment_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text not null unique,
  status text not null default 'unused',
  label text,
  amount numeric,
  redeemed_at timestamptz,
  redeemed_email text,
  redeemed_phone text,
  report_id uuid
);
alter table assessment_codes enable row level security;
drop policy if exists "assessment_codes_authenticated_all" on assessment_codes;
create policy "assessment_codes_authenticated_all" on assessment_codes
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create table if not exists assessment_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text,
  email text not null,
  phone text not null,
  company text,
  industry text,
  company_size text,
  context jsonb,
  answers jsonb,
  pillar_scores jsonb,
  success_score numeric,
  pssi numeric,
  band text,
  actions jsonb
);
alter table assessment_reports enable row level security;
drop policy if exists "assessment_reports_anon_insert" on assessment_reports;
create policy "assessment_reports_anon_insert" on assessment_reports for insert with check (true);
drop policy if exists "assessment_reports_authenticated_all" on assessment_reports;
create policy "assessment_reports_authenticated_all" on assessment_reports
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ── settings toggle ────────────────────────────────────────────────────────
create table if not exists app_settings (
  key text primary key,
  value text
);
alter table app_settings enable row level security;
drop policy if exists "app_settings_authenticated_all" on app_settings;
create policy "app_settings_authenticated_all" on app_settings
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- default: reusable (single-use OFF)
insert into app_settings (key, value) values ('codes_single_use', 'false')
  on conflict (key) do nothing;

-- ── reusable-aware redemption ──────────────────────────────────────────────
create or replace function redeem_assessment_code(
  p_code text,
  p_email text,
  p_phone text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_single_use boolean;
  v_updated int;
begin
  select coalesce((select value = 'true' from app_settings where key = 'codes_single_use'), false)
    into v_single_use;

  if v_single_use then
    -- single-use: a code works once, then expires
    update assessment_codes
       set status = 'redeemed', redeemed_at = now(),
           redeemed_email = p_email, redeemed_phone = p_phone
     where code = p_code and status = 'unused';
  else
    -- reusable: valid as long as it exists and isn't voided; record latest use,
    -- but keep the code usable (never expires)
    update assessment_codes
       set redeemed_at = now(), redeemed_email = p_email, redeemed_phone = p_phone
     where code = p_code and status <> 'void';
  end if;

  get diagnostics v_updated = row_count;
  return v_updated >= 1;
end;
$$;

grant execute on function redeem_assessment_code(text, text, text) to anon, authenticated;

-- ── ensure test codes exist ────────────────────────────────────────────────
insert into assessment_codes (code, label, amount) values
  ('SAFER-DEMO-2026', 'Demo / internal test', 0),
  ('SAFER-LAUNCH-0001', 'Launch code 1', 200)
on conflict (code) do nothing;

-- ── refresh the API cache so the site sees the function immediately ─────────
notify pgrst, 'reload schema';
