# Test Plan

## Core Success Scenario (manual, run after Sprint 2)
1. Open homepage URL in an incognito window (no cookies, no login)
2. **Check:** hero headline visible, 3 service cards visible, S.A.F.E.R. section visible — no login prompt
3. Click "Take the S.A.F.E.R. Quiz" CTA → /quiz loads
4. Answer all 10 questions with varied answers (mix of 1s and 4s)
5. Click Submit → /quiz/result loads
6. **Check:** profile band label displayed, total score shown (0–100), 3 recommendations listed, score breakdown per dimension visible
7. Fill lead form: valid first name, last name, company, role, email, phone, select "AI pilot stalled" from dropdown, add detail text
8. Click Submit
9. **Check:** thank-you screen appears, Calendly embed loads
10. Open Supabase dashboard → `leads` table → **confirm** new row with correct email exists
11. Open `quiz_responses` table → **confirm** row exists with matching `lead_id`, correct `total_score`, correct `profile_band`

## Empty / Edge Cases
| Scenario | Expected behaviour |
|---|---|
| /blog with no published posts | "No articles yet — check back soon" message, no error |
| Quiz submitted with blank required field | Inline error under field, form does not submit |
| Quiz submitted with invalid email | "Please enter a valid email" error, form does not submit |
| Supabase insert fails (network off) | Error message: "Something went wrong — please try again", no data lost |
| /blog/[slug] with non-existent slug | Next.js 404 page |
| Homepage loaded on 3G throttle | Skeleton loaders visible, content appears within 5s |
| Admin page accessed without password (Sprint 3) | Redirected to /admin/login |

## Regression Check (after Sprint 5 — auth lock-down)
- Fetch `leads` table with anon key from browser console → expect 0 rows (RLS blocks it)
- Submit quiz as anonymous visitor → lead row created in DB (anon insert path still works)
- Log in as Michele → admin panel shows all leads
- Log out → admin panel redirects to login
