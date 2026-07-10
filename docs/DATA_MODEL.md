# Data Model

## services
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable, owner-scope at lock-down |
| created_at | timestamptz | now() |
| title | text | e.g. "The S.A.F.E.R. AI Audit" |
| tier_number | int | 1–4, display order |
| short_description | text | card summary |
| full_description | text | expanded copy |
| cta_label | text | button text |
| is_featured | boolean | homepage highlight |

## blog_posts
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| created_at | timestamptz | |
| title | text | |
| slug | text | unique, URL-safe |
| excerpt | text | listing preview |
| body_markdown | text | full post content |
| published | boolean | false = draft |
| published_at | timestamptz | nullable |
| tags | text[] | filter labels |

## leads
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| created_at | timestamptz | |
| first_name | text | |
| last_name | text | |
| company | text | |
| role | text | |
| email | text | |
| phone | text | |
| biggest_challenge | text | dropdown value |
| challenge_detail | text | free-text |
| status | text | New/Contacted/Qualified/Proposal/Closed |
| notes | text | Michele's notes |
| grant_name | text | e.g. EDG, IMDA |
| grant_status | text | |
| grant_notes | text | |
| source | text | quiz/referral/blog |

## quiz_responses
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| created_at | timestamptz | |
| lead_id | uuid FK → leads.id | |
| answers | jsonb | `{q1: 2, q2: 3, ...}` |
| total_score | numeric | 0–100 |
| profile_band | text | Foundation Builder / Emerging Adopter / Strategic Integrator / AI-Ready Leader |
| s_score | numeric | Sensitivity sub-score |
| a_score | numeric | Accuracy sub-score |
| f_score | numeric | Framing sub-score |
| e_score | numeric | Explainability sub-score |
| r_score | numeric | Responsibility sub-score |
| recommendations | jsonb | `[{title, body}, ...]` — rule-based v1 |
| ai_narrative | text | AI-generated profile summary (v2) |
| ai_narrative_source | text | e.g. "gpt-4o" |
| ai_narrative_confidence | numeric | 0–1 |
| ai_narrative_review_status | text | default 'unreviewed' |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| created_at | timestamptz | |
| actor | text | "system" or admin email |
| action | text | e.g. "lead.status_changed" |
| object_type | text | e.g. "leads" |
| object_id | uuid | |
| payload | jsonb | before/after values |

## RLS
- All tables: v1 open (select/all using true) — replaced at lock-down sprint with `auth.uid() = user_id`
- `blog_posts` and `services` keep public read policy permanently
