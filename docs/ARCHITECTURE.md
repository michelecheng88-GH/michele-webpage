# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) — static pages + client components for quiz
- **Database:** Supabase (Postgres + RLS)
- **Hosting:** Vercel (preview + prod)
- **Email (Sprint 4):** Resend via Supabase Edge Function
- **Booking:** Calendly embed (no backend needed)

## What Gets Built Now vs Later
**Now:** public homepage, blog, services, quiz, lead capture form — all read/write without auth.  
**Later:** admin panel, automated emails, grant tracker, auth + RLS lock-down, chatbot.

## Key User Action — Visitor Takes the Quiz
1. Visitor lands on `/quiz` via homepage CTA
2. Answers 10 questions (client-side state, no DB writes mid-quiz)
3. On submit: client calculates score per S/A/F/E/R dimension → derives band
4. Result page renders profile band, score, 3 static recommendations
5. Lead capture form shown — visitor fills name, company, email, challenge
6. Single POST to Supabase: write `leads` row → get `lead_id` → write `quiz_responses` row linked to it
7. Thank-you screen + Calendly embed displayed
8. Michele sees new row in Supabase table (admin panel in Sprint 3)

## Layer Plan
1. **Data first:** all tables, RLS policies, and seed data in place before any UI
2. **App logic:** scoring rules coded in pure TypeScript (no AI dependency) — site works fully if AI is off
3. **Smart features later:** AI-generated narrative added to `quiz_responses.ai_narrative` field in Sprint 4+, always stored with `source`, `confidence`, `review_status`
