create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  title text not null,
  tier_number int not null,
  short_description text not null,
  full_description text not null,
  cta_label text not null,
  is_featured boolean default false
);
alter table services enable row level security;
drop policy if exists "services_v1_read" on services;
create policy "services_v1_read" on services for select using (true);
drop policy if exists "services_v1_write" on services;
create policy "services_v1_write" on services for all using (true) with check (true);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body_markdown text not null,
  published boolean default false,
  published_at timestamptz,
  tags text[]
);
alter table blog_posts enable row level security;
drop policy if exists "blog_posts_v1_read" on blog_posts;
create policy "blog_posts_v1_read" on blog_posts for select using (true);
drop policy if exists "blog_posts_v1_write" on blog_posts;
create policy "blog_posts_v1_write" on blog_posts for all using (true) with check (true);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  company text not null,
  role text,
  email text not null,
  phone text,
  biggest_challenge text,
  challenge_detail text,
  status text not null default 'New',
  notes text,
  grant_name text,
  grant_status text,
  grant_notes text,
  source text default 'quiz'
);
alter table leads enable row level security;
drop policy if exists "leads_v1_read" on leads;
create policy "leads_v1_read" on leads for select using (true);
drop policy if exists "leads_v1_write" on leads;
create policy "leads_v1_write" on leads for all using (true) with check (true);

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id),
  answers jsonb not null,
  total_score numeric not null,
  profile_band text not null,
  s_score numeric,
  a_score numeric,
  f_score numeric,
  e_score numeric,
  r_score numeric,
  recommendations jsonb,
  ai_narrative text,
  ai_narrative_source text,
  ai_narrative_confidence numeric,
  ai_narrative_review_status text default 'unreviewed'
);
alter table quiz_responses enable row level security;
drop policy if exists "quiz_responses_v1_read" on quiz_responses;
create policy "quiz_responses_v1_read" on quiz_responses for select using (true);
drop policy if exists "quiz_responses_v1_write" on quiz_responses;
create policy "quiz_responses_v1_write" on quiz_responses for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  actor text,
  action text not null,
  object_type text not null,
  object_id uuid,
  payload jsonb
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into services (title, tier_number, short_description, full_description, cta_label, is_featured) values
('The S.A.F.E.R. AI Audit', 1, 'A focused diagnostic to unpack exactly where your AI readiness is stuck.', 'We assess your data hygiene, problem clarity, governance posture, and team change-readiness across all five S.A.F.E.R. dimensions. Output: a prioritised roadmap with clear next actions.', 'Book the Audit', true),
('Seek & Find Starter Pilot', 2, 'Move from manual chaos to precision asset tracking in two weeks.', 'Low-risk 2-week pilot for up to 500 assets. RFID-based location tracking to within 50cm. Eliminates manual stock-takes and gives your AI a clean data feed from day one.', 'Start the Pilot', false),
('Core Professional Implementation', 3, 'Full operational intelligence for mid-size organisations.', 'ERP/WMS integration, advanced ESG carbon-disclosure reporting, and AI-ready data pipelines for up to 5,000 assets. IMDA and PDPA compliant. Singapore-based support.', 'Enquire Now', false),
('Strategic Advisory & Workshops', 4, 'Leadership coaching to build a culture of operational excellence.', 'Bespoke workshops for senior management teams ready to move beyond the hype. Covers AI governance, change leadership, and building the foundational data layer your strategy depends on.', 'Book a Workshop', false);

insert into blog_posts (title, slug, excerpt, body_markdown, published, published_at, tags) values
('The Silent Killer of AI ROI — and How to Fix It', 'silent-killer-ai-roi', 'Did you know 95% of AI projects fail to return a single dollar of profit? The culprit is almost never the technology.', '## The Gap Between Vision and Metric\n\nMost business owners are told AI is a magic cost-cutting tool. Here is the hard truth: the "Silent Killer" is the gap between a vision and a measurable target.\n\nA goal like "increase revenue" sounds great — but without a specific target like "increase revenue by 5% in 6 months," AI has no map to follow. When applied to broad objectives or unreliable data, AI does not create growth; it exposes and accelerates the cracks already in your foundation.\n\n**AI cannot fix a broken business. But it can powerfully scale a healthy one.**\n\n## The Three Root Causes\n\n1. **Vague Problem Definition** — If AI insights don''t guide specific decisions, stakeholders won''t act on them.\n2. **Unreliable Data** — Fragmented or inconsistent data means your AI cannot provide a clear path forward.\n3. **Weak Change Management** — Even the best system fails if your team fears or distrusts it.\n\nI help you find where your data and systems are out of sync — so you can build a foundation for AI that actually works.\n\n*Ready to find your blind spots? Take the S.A.F.E.R. AI Readiness Quiz — 5 minutes, honest results.*', true, now() - interval '10 days', array['AI Strategy', 'Readiness', 'SME']),
('Why Operational Visibility Has to Come Before AI', 'operational-visibility-before-ai', 'You cannot ask AI to optimise what you cannot see. Here is why visibility is the non-negotiable first step.', '## The Pattern-Recognition Problem\n\nAI is fundamentally a pattern-recognition tool. It learns from your operational data to predict, recommend, and optimise. But if you don''t have visibility into your operations first — which assets went where, how long tasks actually took, what was used last month — there is nothing reliable for AI to learn from.\n\nSkipping this step is a recipe for a very specific kind of failure: companies implement AI on top of messy, incomplete data, get poor or misleading recommendations, conclude "AI doesn''t work for our business," and abandon it. The real issue was never the AI. It was the lack of operational visibility underneath it.\n\n## What Good Visibility Looks Like\n\n- Accurate asset location records (not estimated, not remembered — recorded)\n- Consistent logs across every site supervisor and shift\n- A single source of truth your team trusts enough to act on\n\nVisibility has to come first. Once you have it, AI becomes genuinely powerful.\n\n*Curious where your organisation stands? The S.A.F.E.R. AI Quiz takes 5 minutes and gives you a scored profile.*', true, now() - interval '5 days', array['Operational Excellence', 'Data Integrity', 'Asset Management']),
('ESG Compliance Is Not a Checkbox — It Is a Data Problem', 'esg-compliance-data-problem', 'Singapore''s mandatory climate disclosures are coming. The companies that will comply easily are the ones already tracking their operations accurately.', '## Carbon Tax and Your Operations\n\nSingapore''s regulatory environment is tightening around climate disclosure. For CFOs and Operations Managers, this is not a future problem — it is arriving now.\n\nThe companies that will handle it with confidence are not necessarily the most advanced technologically. They are the ones that already know what they own, where it is, and how it is being used.\n\n## Three Things ESG-Ready Organisations Do Differently\n\n1. **They track assets in real time** — not via quarterly stock-takes that are out of date the moment they are completed.\n2. **They link operational data to financial data** — so the CFO and the Operations Manager are working from the same source of truth.\n3. **They automate capture** — so compliance reporting is a by-product of daily operations, not a separate project.\n\nIf you are starting from spreadsheets and manual logs, you are not behind. You are at the beginning. And that is exactly the right place to make the right decisions.\n\n*Let''s talk about what a clean data foundation looks like for your business.*', true, now() - interval '2 days', array['ESG', 'Compliance', 'Singapore', 'CFO']),
('From 100,000 Devices to Your Warehouse: What Scale Teaches You About Asset Management', 'scale-teaches-asset-management', 'Managing a portfolio of over 100,000 devices for a national programme taught me things no textbook covers. Here are the lessons that apply directly to your SME.', '## When the Stakes Are Absolute\n\nIn large-scale public sector programmes, there is no room for "approximately." Every device, every deployment, every piece of equipment must be accounted for — not because auditors will ask, but because the mission depends on it.\n\nThat discipline does not only belong to governments and mega-events. It belongs to every business that wants to make confident decisions.\n\n## The Three Lessons That Transfer\n\n1. **Governance is not overhead — it is infrastructure.** The teams that invested in process early spent far less time firefighting later.\n2. **Data quality is a leadership decision.** It does not happen by accident. Someone has to own it and hold the standard.\n3. **Visibility enables accountability.** When everyone can see the same truth, conversations shift from blame to problem-solving.\n\nYour warehouse may not have 100,000 assets. But the principles are identical — and the technology to apply them is now accessible to SMEs at a fraction of the cost.\n\n*Curious what this could look like for your operation? Let''s find out together.*', false, null, array['Asset Management', 'Lessons Learned', 'SME', 'Governance']);

insert into leads (first_name, last_name, company, role, email, phone, biggest_challenge, status, source) values
('James', 'Tan', 'Apex Manufacturing Pte Ltd', 'COO', 'james.tan@apexmfg.example.com', '+65 9123 4567', 'Manual inventory errors causing production delays', 'Contacted', 'quiz'),
('Priya', 'Nair', 'SilverBridge Logistics', 'CEO', 'priya@silverbridge.example.com', '+65 8234 5678', 'Want to implement AI but don''t know where to start', 'New', 'quiz'),
('David', 'Loh', 'Meridian Events Group', 'Operations Director', 'david.loh@meridian.example.com', '+65 9345 6789', 'ESG reporting requirements coming up and data is messy', 'Qualified', 'quiz'),
('Sarah', 'Wong', 'NovaTech SME Solutions', 'CFO', 'swong@novatech.example.com', '+65 8456 7890', 'AI pilot stalled — over budget and no clear ROI', 'Proposal', 'referral'),
('Ahmad', 'Razak', 'Buildright Construction', 'GM', 'ahmad@buildright.example.com', '+65 9567 8901', 'Asset tracking across multiple worksites is chaotic', 'New', 'blog');