-- Survey v2: the paid AI Readiness Assessment.
--
-- Two tables:
--   assessment_codes   — redemption codes Michele issues after payment.
--   assessment_reports — a record of every report generated (answers + scores),
--                        so Michele can re-send or follow up on issues.
--
-- Security model: the public site talks to Supabase with the ANON key only.
-- We must NEVER let an anonymous visitor read the list of valid codes (they
-- could redeem free reports). So assessment_codes has RLS enabled with NO
-- anon read/insert/update policy — direct table access is denied to anon.
-- Redemption happens through the SECURITY DEFINER function redeem_assessment_code(),
-- which atomically flips an unused code to redeemed and never exposes the code list.
-- Michele (any authenticated user) has full access to manage codes.

create table if not exists assessment_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text not null unique,
  status text not null default 'unused',        -- 'unused' | 'redeemed' | 'void'
  label text,                                     -- e.g. buyer name / invoice ref
  amount numeric,                                 -- price paid, for records
  redeemed_at timestamptz,
  redeemed_email text,
  redeemed_phone text,
  report_id uuid
);
alter table assessment_codes enable row level security;
-- Authenticated (Michele) full access; NO anon policy = anon cannot touch this table directly.
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
  context jsonb,               -- Decision Check context (kyc, pain, goal)
  answers jsonb,               -- full readiness answers
  pillar_scores jsonb,         -- { S, A, F, E, R } 0-100
  success_score numeric,
  pssi numeric,
  band text,
  actions jsonb
);
alter table assessment_reports enable row level security;
-- The API (anon key, server-side) inserts a report after a valid redemption.
drop policy if exists "assessment_reports_anon_insert" on assessment_reports;
create policy "assessment_reports_anon_insert" on assessment_reports
  for insert with check (true);
drop policy if exists "assessment_reports_authenticated_all" on assessment_reports;
create policy "assessment_reports_authenticated_all" on assessment_reports
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Atomic, enumeration-safe redemption. Returns true exactly once per unused code.
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
  v_updated int;
begin
  update assessment_codes
     set status = 'redeemed',
         redeemed_at = now(),
         redeemed_email = p_email,
         redeemed_phone = p_phone
   where code = p_code
     and status = 'unused';
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

-- Let the public site (anon) and Michele (authenticated) call the redeem function.
grant execute on function redeem_assessment_code(text, text, text) to anon, authenticated;

-- A couple of sample codes so the flow is testable immediately.
-- Issue more from the admin panel, or:
--   insert into assessment_codes (code, label, amount) values ('SAFER-AB12-CD34', 'Buyer name', 200);
insert into assessment_codes (code, label, amount) values
  ('SAFER-DEMO-2026', 'Demo / internal test', 0),
  ('SAFER-LAUNCH-0001', 'Launch code 1', 200)
on conflict (code) do nothing;
