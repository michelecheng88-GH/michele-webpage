# Security

## Secret Handling
- Supabase service-role key: server-side only (Next.js API routes / Edge Functions) — never in client bundle
- Supabase anon key: client-safe for public reads and form inserts under v1 open RLS
- Resend API key: Edge Function env var only
- Calendly embed URL: public, no secret
- All secrets in Vercel environment variables — never committed to repo

## Permission Model (v1 → lock-down progression)
- **v1 (now):** RLS policies are open (`using (true)`) — anyone can read/write. Acceptable because no PII is exposed publicly and the site is pre-launch demo.
- **Lock-down sprint:** replace all write policies with `auth.uid() = user_id`; public read retained only on `blog_posts` and `services`; `leads` and `quiz_responses` become owner-only.
- Admin route protected by Supabase Auth session (Sprint 5) — not env-var secret.

## Approved Tools Rule
- Agent/automation may only call named tools listed in AGENTIC_LAYER.md
- No `run_any`, no raw SQL from client, no dynamic tool construction
- Every tool call that mutates data writes a row to `audit_logs` before returning

## Audit Principle
Every meaningful state change (lead status, email sent, blog published) produces an `audit_logs` row with actor, action, object, and before/after payload. Logs are append-only — no delete policy on `audit_logs`.

## Stop and Get a Human
- Any change to RLS policies: stop, review with a Supabase-experienced developer
- Any bulk export of lead PII: PDPA assessment required first
- Payment or grant disbursement flows: legal review before implementation
