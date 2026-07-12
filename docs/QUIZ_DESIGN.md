# S.A.F.E.R. AI™ Decision Check — design & customisation guide

## Why the quiz was rebuilt

The v1 quiz asked 10 generic agree/disagree questions and returned a 0–100
"readiness" score. Two problems:

1. **No context** — without knowing the industry, the actual business problem,
   or the domain, the recommendations could only ever be generic.
2. **Wrong framing** — the S.A.F.E.R. AI™ Decision Framework is not a maturity
   score. It answers a sharper question: *should you be using AI at all — right
   now?* Most frameworks focus on how to use AI; this one focuses on when NOT to.

## The new structure (5 levels)

```
Level 1  Industry        10 SME industries + "Others" (free text)
Level 2  Challenge       10 business problems (revenue, speed, cost, leads, HR, …)
Level 3  Focus area      1) Physical & Digital Asset Management
                         2) Emerging Technology & AI Guardrails
                         3) Sustainability & Green Compliance
Level 4  Diagnostics     10 S.A.F.E.R. questions specific to the chosen area
                         (2 per dimension, each option graded risk 0/1/2)
Level 5  Follow-ups      drill-down questions triggered only by risky answers
```

Levels 1–3 give every result its context; levels 4–5 do the diagnosis.

## Scoring — the decision rule

- Each diagnostic option carries a risk grade: **0 = safe, 1 = caution, 2 = high risk**.
- A dimension's status = its **worst** answer (max, not average) — one critical
  red flag must not be averaged away.
- Verdict, per Michele's framework:
  - ✅ **0 dimensions at risk** → *Use AI Confidently*
  - ⚠️ **1–2 at risk** → *Use AI — With Guardrails*
  - ❌ **3+ at risk** → *Do Not Use AI Yet*
- A 0–100 readiness score is still computed and stored for trend comparison.

## Why this produces actionable output

- **Risk-graded multiple choice instead of agree/disagree.** Each option
  describes a concrete situation ("anyone with the spreadsheet link"), so the
  answer itself is the diagnosis — and it avoids the social-desirability bias
  of Likert scales where everyone "agrees" they are diligent.
- **Every flag maps to one concrete action.** Advice lives in
  `lib/quiz/advice.ts`, keyed by (focus area × dimension), written as
  do-this-in-30/90-days steps that reference Michele's services where natural.
- **The verdict is a go/no-go, not a grade.** "Amber — use with guardrails" is
  a decision the reader can act on today; "62/100" is not.
- **Adaptive depth.** Healthy companies get a short quiz; risky answers open
  follow-up questions (level 5), so effort is spent where the problems are.
- **The result page shows *what raised each flag*** — the exact question and
  answer — so the follow-up call starts from evidence, not a number.

## Where things live

| File | What it is |
|---|---|
| `lib/quiz/schema.ts` | Types + full documentation of the config structure |
| `lib/quiz/default-config.ts` | **The content — edit this to customise questions** |
| `lib/quiz/advice.ts` | **Recommendations & fallbacks — edit this to customise advice** |
| `lib/quiz/engine.ts` | Scoring, verdict, narrative (rarely needs editing) |
| `app/quiz/page.tsx` | The wizard UI (walks whatever tree the config defines) |
| `app/quiz/result/page.tsx` | Verdict, breakdown, action plan, lead form |

## How to customise (common tasks)

- **Reword a question/option:** edit it in `default-config.ts`. Done.
- **Add an industry or challenge:** add an option to the `industry` /
  `challenge` node.
- **Add a follow-up question:** add `children: [ { …QuizNode } ]` to the option
  that should trigger it (see `am-a1` and `gr-s1` for working examples).
- **Add a new focus area:** add an option to the `area` node with a new
  diagnostic set as `children`, plus advice for it in `advice.ts` (generic
  advice is used if you skip this).
- **Industry-specific diagnostics (later):** put `children` on an *industry*
  option — the structure already supports it; it's a content decision, not a
  code change.

Keep every node `id` unique, and never rename the special ids
`industry`, `challenge`, `area`.

## Roadmap ideas (not yet built)

1. **Move config to the database + admin editor** — lets Michele edit questions
   without a deploy. Needs a `quiz_configs` table (new migration) and an
   admin screen; the engine already only depends on the tree shape.
2. **Industry benchmarks** — "you vs. other logistics SMEs" once enough
   responses accumulate (the context is stored per response for this reason).
3. **AI-generated narrative** — the `quiz_responses.ai_narrative` columns exist;
   generate a personalised summary after capture, gated by
   `review_status` so Michele approves before it's shown or emailed.
4. **Event tracking** — `quiz.started` / `quiz.completed` / drop-off per level,
   to see where visitors abandon.
5. **PDF report** — turn the result page into a downloadable branded report as
   the email follow-up asset (pairs with the Resend welcome email in Sprint 4).
