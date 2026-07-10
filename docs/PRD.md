# Product Requirements — Michele Cheng Personal Brand Site

## Problem
SME decision-makers (age 30–45) searching for AI implementation guidance and program management expertise have no trusted, authoritative resource from Michele. Potential leads evaporate because there is no destination that explains her value, builds credibility, or captures intent.

## Target User
**Visitor:** COO / CFO / GM at a Singapore SME, aware that AI is important, uncertain where to start or why their current pilot is failing.  
**Owner:** Michele — publishes content, reviews leads, follows up, tracks grant applications.

## Core Objects
- `services` — 4 service tiers with descriptions and CTAs
- `blog_posts` — articles written and published by Michele
- `leads` — every visitor who submits a contact or quiz form
- `quiz_responses` — scored S.A.F.E.R. assessment linked to a lead
- `audit_logs` — record of every meaningful admin action

## MVP Must-Haves (v1)
- [ ] Homepage: hero, Michele's story, 3 core services, S.A.F.E.R. framework, social proof, dual CTA
- [ ] /quiz: 10-question self-assessment, rule-based scoring, 4 profile bands, personalised recommendations
- [ ] Lead capture form at quiz end — persists to database
- [ ] /blog: listing page + individual post page (3 seed posts live)
- [ ] /services: 4 tiers displayed
- [ ] Book-a-call CTA (Calendly embed)
- [ ] All pages render for anonymous visitors — no login wall

## Non-Goals (v1)
- User authentication / login for visitors
- AI-generated quiz narratives
- Automated email follow-up
- Admin dashboard
- Resource library or chatbot

## Success Criteria
A Singapore SME operations manager lands on the homepage, reads about S.A.F.E.R. AI™, takes the quiz, sees a scored profile result with their band and 3 recommendations, submits their name/email/company, and a row appears in `leads` and `quiz_responses` in Supabase — all without creating an account. Target: 10 such lead rows within 7 days of launch.
