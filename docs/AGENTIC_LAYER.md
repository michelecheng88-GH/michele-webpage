# Agentic Layer

## Risk Classification

### Low Risk — Auto-execute (no approval needed)
- Tag a lead with their quiz profile band on form submit
- Mark a blog post as published (owner action)
- Log a `quiz.completed` event to audit_logs

### Medium Risk — Queued for Michele's approval
- Draft a personalised follow-up email based on quiz answers (shown as draft in admin, Michele sends manually)
- Suggest a matching service tier based on lead's score band

### High Risk — Michele clicks Send explicitly
- Send any outbound email to a lead
- Update a lead's status to Proposal or Closed
- Log a grant application on behalf of a lead

### Critical — Human only, no automation
- Delete a lead record
- Export all lead data
- Modify RLS policies

## Named Tools (v1)
- `db.insert_lead` — writes lead row
- `db.insert_quiz_response` — writes scored response
- `db.update_lead_status` — status field only, logs to audit_logs
- `email.send_welcome` — Resend, fixed template, triggered on lead insert (Sprint 4)

## Audit Log Fields
`actor | action | object_type | object_id | payload (before/after) | created_at`

## v1 vs Later
- **v1:** only `db.insert_lead` and `db.insert_quiz_response` are active (form submit)
- **Sprint 4:** `email.send_welcome` added via Edge Function
- **Later:** AI draft generator for follow-up emails; always medium-risk (draft shown, not auto-sent)
