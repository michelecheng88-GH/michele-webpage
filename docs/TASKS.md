# Tasks & Sprints

## Sprint 1 — Database, seed data & public site live
**Goal:** Every public page renders for an anonymous visitor. No login wall.

- [ ] Run migration SQL in Supabase (creates all tables, RLS v1, seed data)
- [ ] Scaffold Next.js 14 project, connect Supabase client (anon key, client-safe)
- [ ] Build homepage: hero headline + sub-headline, Michele's story section, 3 core service cards (from `services` table), S.A.F.E.R. framework explainer (5 dimension cards), dual CTA buttons (Quiz + Book a Call)
- [ ] Build `/blog` listing: reads published `blog_posts` from Supabase, displays title + excerpt + tags
- [ ] Build `/blog/[slug]` detail: renders `body_markdown` as HTML
- [ ] Build `/services` page: reads all 4 service rows, displays tier number, title, description, CTA button
- [ ] Mobile-responsive layout, minimalist palette (navy/white/warm gold), Michele's photo/headshot
- [ ] Deploy to Vercel; confirm all pages load in preview URL
- [ ] **States covered:** loading skeleton, empty (no published posts), error boundary on data fetch, ready (seeded data)

**Definition of Done:** Homepage, /blog, and /services all load in <3s on mobile with seeded data. Zero console errors. Screenshot shows real content, not a login page.

---

## Sprint 2 — S.A.F.E.R. Quiz + Lead Capture ← v1 functional milestone
**Goal:** Core engine works end-to-end. A visitor takes the quiz, gets a score, submits their details, and a lead row exists in the database.

- [ ] Build `/quiz` page: 10 questions (2 per S.A.F.E.R. dimension), 4-point scale UI, progress indicator
- [ ] Client-side scoring: calculate S/A/F/E/R sub-scores and total (0–100), derive profile band
- [ ] Build `/quiz/result` page: display band label, total score, score breakdown per dimension, 3 rule-based recommendations (static lookup by band)
- [ ] Lead capture form on result page: first name, last name, company, role, email, phone, biggest challenge (dropdown: "Starting AI journey" / "AI pilot stalled" / "Data/inventory chaos" / "ESG compliance" / "Other"), challenge detail (textarea)
- [ ] On form submit: POST to Supabase — insert `leads` row, capture returned `lead_id`, insert `quiz_responses` row with all scores and answers
- [ ] Thank-you screen: confirmation message + Calendly embed for 30-min booking
- [ ] Form validation: required fields, valid email format, inline error messages
- [ ] **States covered:** quiz in-progress, result loading, form empty, form error (missing fields / network fail), form success (thank-you screen)

**Definition of Done:** End-to-end run — visitor completes quiz → sees profile band → submits form → thank-you screen appears → `leads` and `quiz_responses` rows both exist in Supabase with correct data. Tested on desktop and mobile Chrome.

---

## Sprint 3 — Admin lead panel & blog authoring
**Goal:** Michele can manage leads and publish posts without touching Supabase directly.

- [ ] `/admin` route: password-protected via env-var secret (middleware check) — temporary until Sprint 5 auth
- [ ] Lead list: table of all `leads` sorted by `created_at` desc, columns: name, company, score band, status, created date
- [ ] Lead detail drawer/page: full quiz answers, contact info, status dropdown (New/Contacted/Qualified/Proposal/Closed), notes textarea — all changes persist + write to `audit_logs`
- [ ] Blog post editor: form with title, slug (auto-generated from title), excerpt, body (markdown textarea), tags, published toggle
- [ ] Blog post list in admin: shows draft and published, edit button
- [ ] **States covered:** lead list empty, lead list loading, lead detail error, blog editor unsaved-changes warning

**Definition of Done:** Michele logs into /admin, changes a lead's status from New to Contacted — change persists on reload and an `audit_logs` row exists. She creates a new blog post, toggles published=true — post appears on /blog listing for anonymous visitor.

---

## Sprint 4 — Follow-up automation & grant tracker
**Goal:** Leads receive a welcome email automatically; Michele can track grant applications per lead.

- [ ] Supabase Edge Function `on_lead_insert`: triggers on `leads` INSERT, sends welcome email via Resend using Michele's template (subject: "Your S.A.F.E.R. AI Profile is ready")
- [ ] Email template: personalised with first name, profile band, top recommendation, link to book a call
- [ ] Grant tracker fields on lead detail: grant name (text), grant status (dropdown: Identified/Applied/Approved/Rejected), grant notes
- [ ] Grant pipeline column in lead table in admin
- [ ] Write `audit_logs` row on email send: `action: "email.welcome_sent"`

**Definition of Done:** Submit quiz form with a real email address → welcome email arrives in inbox within 60 seconds. Michele can add grant details to a lead and see them on reload.

---

## Sprint 5 — Lock it down (auth + per-user RLS)
**Goal:** No unauthorised writes possible. Michele's data is protected before real leads accumulate.

- [ ] Enable Supabase Auth; create Michele's single owner account
- [ ] Replace v1 open write policies on `leads`, `quiz_responses`, `audit_logs` with `auth.uid() = user_id` owner-scoped policies
- [ ] Public read policy retained on `blog_posts` (published only) and `services`
- [ ] Quiz form submit: unauthenticated insert still works (anon inserts allowed on `leads` + `quiz_responses` for visitor submissions — no user_id set, Michele's admin view scoped separately via service-role in Edge Function)
- [ ] `/admin` middleware replaced with Supabase Auth session check
- [ ] Confirm: unauthenticated user cannot read `leads` table via browser network tab

**Definition of Done:** Browser dev tools network tab shows 0 rows returned from `leads` for an unauthenticated fetch. Michele's login grants full admin access. Quiz submission still creates a lead row (anon insert path confirmed working).

---

## Gantt (sprint landing)
```
Week 1: Sprint 1 (DB + public site)
Week 1: Sprint 2 (Quiz + Lead capture) ← v1 functional
Week 2: Sprint 3 (Admin panel)
Week 3: Sprint 4 (Email + Grant tracker)
Week 4: Sprint 5 (Auth + RLS lock-down)
```
