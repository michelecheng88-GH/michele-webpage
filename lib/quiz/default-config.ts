/**
 * DEFAULT quiz configuration — edit this file to customise the quiz.
 * See lib/quiz/schema.ts for the full documentation of the structure.
 *
 * Flow: industry (L1) → challenge (L2) → focus area (L3)
 *       → that area's S.A.F.E.R. diagnostics (L4) → follow-ups (L5).
 */

import type { QuizNode } from "./schema";

// ────────────────────────────────────────────────────────────────────────────
// LEVEL 4–5 · DIAGNOSTICS — Physical & Digital Asset Management
// ────────────────────────────────────────────────────────────────────────────

const ASSET_DIAGNOSTICS: QuizNode[] = [
  {
    id: "am-s1",
    kind: "diagnostic",
    dimension: "S",
    question: "If an AI tool analysed your asset and inventory records today, what would it see?",
    options: [
      { id: "ops-only", label: "Operational data only — locations, quantities, maintenance logs. Nothing personal.", risk: 0 },
      { id: "some-mixed", label: "Mostly operational, but some records include staff or customer details.", risk: 1 },
      { id: "heavily-mixed", label: "Records are mixed with personal or confidential data — client sites, IDs, contract terms.", risk: 2 },
    ],
  },
  {
    id: "am-s2",
    kind: "diagnostic",
    dimension: "S",
    question: "Who can currently access or export your asset records?",
    options: [
      { id: "role-based", label: "Access is role-based, and we review who has it.", risk: 0 },
      { id: "most-staff", label: "Most staff can view them; exports aren't tracked.", risk: 1 },
      { id: "anyone", label: "Anyone with the spreadsheet link — we've never really checked.", risk: 2 },
    ],
  },
  {
    id: "am-a1",
    kind: "diagnostic",
    dimension: "A",
    question: "When you physically audit your assets or stock, how close are the records to reality?",
    options: [
      { id: "tight", label: "Within 1–2% — our counts match reality.", risk: 0 },
      { id: "loose", label: "5–10% discrepancies are normal for us.", risk: 1 },
      {
        id: "surprised",
        label: "We're often surprised — stock-takes reveal big gaps.",
        risk: 2,
        // Level-5 follow-up: only asked when this risky answer is chosen.
        children: [
          {
            id: "am-a1-cause",
            kind: "diagnostic",
            dimension: "A",
            question: "What's the biggest cause of those gaps?",
            options: [
              { id: "manual-entry", label: "Manual data entry errors.", risk: 1 },
              { id: "multi-systems", label: "Multiple systems that disagree — no single source of truth.", risk: 2 },
              { id: "no-owner", label: "No one really owns the count.", risk: 2 },
              { id: "untraced-loss", label: "Loss or theft we can't trace.", risk: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "am-a2",
    kind: "diagnostic",
    dimension: "A",
    question: "If you pull the same asset report twice — or from two systems — do the numbers match?",
    options: [
      { id: "always", label: "Yes, consistently.", risk: 0 },
      { id: "small-gaps", label: "Usually, with small gaps we can explain.", risk: 1 },
      { id: "disagree", label: "We have multiple sources of truth that disagree.", risk: 2 },
    ],
  },
  {
    id: "am-f1",
    kind: "diagnostic",
    dimension: "F",
    question: "If you automated or applied AI to asset tracking tomorrow, what would success look like?",
    options: [
      { id: "specific", label: "A specific target — e.g. cut stock-take time 40% within 90 days.", risk: 0 },
      { id: "general", label: "A general goal — fewer errors, save time.", risk: 1 },
      { id: "figure-out", label: "We'd figure it out as we go.", risk: 2 },
    ],
  },
  {
    id: "am-f2",
    kind: "diagnostic",
    dimension: "F",
    question: "Can your team name the ONE asset process to fix first?",
    options: [
      { id: "agreed", label: "Yes — it's agreed and written down.", risk: 0 },
      { id: "candidates", label: "We have several candidates but no agreement.", risk: 1 },
      { id: "everything", label: "No — everything feels broken.", risk: 2 },
    ],
  },
  {
    id: "am-e1",
    kind: "diagnostic",
    dimension: "E",
    question: "When your current system flags a discrepancy, can someone explain why it happened?",
    options: [
      { id: "traceable", label: "Usually — adjustments carry a reason and an owner.", risk: 0 },
      { id: "sometimes", label: "Sometimes, if the right person remembers.", risk: 1 },
      { id: "ignore", label: "Honestly, we ignore flags we can't explain.", risk: 2 },
    ],
  },
  {
    id: "am-e2",
    kind: "diagnostic",
    dimension: "E",
    question: "Could you defend your asset records to an auditor or insurer tomorrow?",
    options: [
      { id: "documented", label: "Yes — records and methods are documented.", risk: 0 },
      { id: "scramble", label: "We'd manage it, with a scramble.", risk: 1 },
      { id: "exposed", label: "No — we'd be exposed.", risk: 2 },
    ],
  },
  {
    id: "am-r1",
    kind: "diagnostic",
    dimension: "R",
    question: "Who owns asset data quality in your company?",
    options: [
      { id: "named", label: "A named person or role.", risk: 0 },
      { id: "shared", label: "It's shared and informal.", risk: 1 },
      { id: "no-one", label: "No one — it's everyone's job and no one's.", risk: 2 },
    ],
  },
  {
    id: "am-r2",
    kind: "diagnostic",
    dimension: "R",
    question: "If an automated system made a wrong call — say, wrote off the wrong asset — what would happen?",
    options: [
      { id: "signoff", label: "A human signs off before changes; there's a clear escalation path.", risk: 0 },
      { id: "case-by-case", label: "We'd sort it out case by case.", risk: 1 },
      { id: "notice-later", label: "Nothing is defined — we'd only notice later.", risk: 2 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// LEVEL 4–5 · DIAGNOSTICS — Emerging Technology & AI Guardrails
// ────────────────────────────────────────────────────────────────────────────

const GUARDRAIL_DIAGNOSTICS: QuizNode[] = [
  {
    id: "gr-s1",
    kind: "diagnostic",
    dimension: "S",
    question: "What data would your planned AI use case touch?",
    options: [
      { id: "public", label: "Public or Aggregated Data", risk: 0 },
      { id: "operational", label: "Operational & Asset Data", risk: 0 },
      { id: "financial", label: "Financial & Accounting Data", risk: 1 },
      { id: "compliance", label: "Compliance, Security, & Governance Data", risk: 1 },
      { id: "customer", label: "Customer & Relationship Data", risk: 2 },
      { id: "hr", label: "Human Resources & Workforce Data", risk: 2 },
    ],
  },
  {
    id: "gr-s2",
    kind: "diagnostic",
    dimension: "S",
    question: "Do staff already paste company information into ChatGPT or similar tools?",
    options: [
      {
        id: "managed",
        label: "Managed & Monitored: We have clear policies and approved tools, and usage is actively managed.",
        risk: 0,
      },
      {
        id: "untracked",
        label: "Policy in Place, Behavior Untracked: We have a formal policy, but we lack visibility into actual employee behavior.",
        risk: 1,
      },
      {
        id: "unmonitored",
        label: "Unmonitored / No Policy: We do not currently have a policy or a mechanism to track AI tool usage.",
        risk: 2,
      },
    ],
  },
  {
    id: "gr-a1",
    kind: "diagnostic",
    dimension: "A",
    question: "How correct must the AI's output be for this use case?",
    options: [
      { id: "drafts", label: "It produces drafts or ideas — a human always reviews before use.", risk: 0 },
      { id: "mostly", label: "It should be mostly right; errors would be embarrassing but fixable.", risk: 1 },
      { id: "hundred", label: "It must be 100% right — clinical, financial, or legal consequences if not.", risk: 2 },
    ],
  },
  {
    id: "gr-a2",
    kind: "diagnostic",
    dimension: "A",
    question: "If the AI is wrong one time in twenty, what actually happens?",
    options: [
      { id: "rework", label: "Minor internal rework.", risk: 0 },
      { id: "customer", label: "A customer is affected.", risk: 1 },
      { id: "breach", label: "A regulatory, safety, or financial breach.", risk: 2 },
    ],
  },
  {
    id: "gr-f1",
    kind: "diagnostic",
    dimension: "F",
    question: "How clearly is the AI use case defined?",
    options: [
      { id: "defined", label: "A specific process with a measurable outcome.", risk: 0 },
      { id: "broad", label: "A broad idea — \"use AI for marketing\".", risk: 1 },
      { id: "mandate", label: "Management says \"we need AI\" — no defined problem yet.", risk: 2 },
    ],
  },
  {
    id: "gr-f2",
    kind: "diagnostic",
    dimension: "F",
    question: "How will you measure whether the AI delivered value?",
    options: [
      { id: "metric", label: "A named metric with a baseline we've already recorded.", risk: 0 },
      { id: "know-it", label: "We'd know it when we see it.", risk: 1 },
      { id: "not-thought", label: "We haven't thought about measurement.", risk: 2 },
    ],
  },
  {
    id: "gr-e1",
    kind: "diagnostic",
    dimension: "E",
    question: "If the AI recommends something, can your team explain how it got there?",
    options: [
      { id: "explainable", label: "Yes — inputs and logic are traceable.", risk: 0 },
      { id: "partly", label: "Partly — we understand the inputs, not the reasoning.", risk: 1 },
      { id: "black-box", label: "No — it's a black box to us.", risk: 2 },
    ],
  },
  {
    id: "gr-e2",
    kind: "diagnostic",
    dimension: "E",
    question: "Could you defend an AI-influenced decision to a customer, auditor, or regulator?",
    options: [
      { id: "defend", label: "Yes — we could show how the decision was made.", risk: 0 },
      { id: "partially", label: "Partially — it would take effort to reconstruct.", risk: 1 },
      { id: "cannot", label: "No — we couldn't explain it.", risk: 2 },
    ],
  },
  {
    id: "gr-r1",
    kind: "diagnostic",
    dimension: "R",
    question: "If the AI's output causes harm or loss, who is accountable?",
    options: [
      { id: "owner", label: "A named owner, with a human in the loop.", risk: 0 },
      { id: "vendor", label: "Unclear — we assume the vendor.", risk: 1 },
      { id: "nobody-asked", label: "Nobody has asked that question.", risk: 2 },
    ],
  },
  {
    id: "gr-r2",
    kind: "diagnostic",
    dimension: "R",
    question: "Is there a review step before AI output reaches customers?",
    options: [
      { id: "always", label: "Always — human sign-off is required.", risk: 0 },
      { id: "sometimes", label: "Sometimes, depending on who's on duty.", risk: 1 },
      { id: "straight", label: "No — output goes straight to customers.", risk: 2 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// LEVEL 4–5 · DIAGNOSTICS — Sustainability & Green Compliance
// ────────────────────────────────────────────────────────────────────────────

const SUSTAINABILITY_DIAGNOSTICS: QuizNode[] = [
  {
    id: "su-s1",
    kind: "diagnostic",
    dimension: "S",
    question: "Does your sustainability/ESG data include sensitive information — supplier contracts, employee records?",
    options: [
      { id: "aggregated", label: "No — it's aggregated operational data.", risk: 0 },
      { id: "some", label: "Some records include sensitive details.", risk: 1 },
      { id: "heavily", label: "It's heavily mixed with contracts and personal data.", risk: 2 },
    ],
  },
  {
    id: "su-s2",
    kind: "diagnostic",
    dimension: "S",
    question: "Where does your emissions and compliance data actually live?",
    options: [
      { id: "governed", label: "In a governed system with access control.", risk: 0 },
      { id: "one-person", label: "In spreadsheets owned by one person.", risk: 1 },
      { id: "scattered", label: "Scattered — some of it with ex-staff or vendors.", risk: 2 },
    ],
  },
  {
    id: "su-a1",
    kind: "diagnostic",
    dimension: "A",
    question: "How confident are you in your energy, waste, and emissions numbers?",
    options: [
      { id: "metered", label: "They're metered or receipted, and reconciled.", risk: 0 },
      { id: "estimates", label: "They're estimates built on documented assumptions.", risk: 1 },
      { id: "guesses", label: "They're rough guesses we use for reporting.", risk: 2 },
    ],
  },
  {
    id: "su-a2",
    kind: "diagnostic",
    dimension: "A",
    question: "If a customer or regulator audited your green claims tomorrow, what would happen?",
    options: [
      { id: "evidence", label: "Evidence is ready — we'd pass.", risk: 0 },
      { id: "weeks", label: "We could assemble it in a few weeks.", risk: 1 },
      { id: "exposed", label: "We'd be exposed.", risk: 2 },
    ],
  },
  {
    id: "su-f1",
    kind: "diagnostic",
    dimension: "F",
    question: "Why are you pursuing sustainability reporting?",
    options: [
      { id: "requirement", label: "A specific requirement — a tender, regulation, or named customer — with a defined scope.", risk: 0 },
      { id: "ahead", label: "Getting ahead of expected demands.", risk: 1 },
      { id: "feels-important", label: "It feels important, but there's no concrete driver.", risk: 2 },
    ],
  },
  {
    id: "su-f2",
    kind: "diagnostic",
    dimension: "F",
    question: "Which single sustainability metric matters most for the next 12 months?",
    options: [
      { id: "named", label: "One named metric, with a baseline.", risk: 0 },
      { id: "shortlist", label: "A shortlist we haven't narrowed down.", risk: 1 },
      { id: "unknown", label: "We don't know.", risk: 2 },
    ],
  },
  {
    id: "su-e1",
    kind: "diagnostic",
    dimension: "E",
    question: "Can you trace each reported figure back to its source data?",
    options: [
      { id: "traceable", label: "Yes — every figure has a source and method.", risk: 0 },
      { id: "mostly", label: "Mostly, though some figures would take digging.", risk: 1 },
      { id: "no-trace", label: "No — we couldn't reconstruct them.", risk: 2 },
    ],
  },
  {
    id: "su-e2",
    kind: "diagnostic",
    dimension: "E",
    question: "Could you explain your carbon calculation method to an auditor?",
    options: [
      { id: "documented", label: "Yes — the method is documented.", risk: 0 },
      { id: "consultant", label: "Our consultant could; we couldn't.", risk: 1 },
      { id: "no-method", label: "There isn't really a method.", risk: 2 },
    ],
  },
  {
    id: "su-r1",
    kind: "diagnostic",
    dimension: "R",
    question: "Who owns ESG data and reporting in your company?",
    options: [
      { id: "named", label: "A named owner.", risk: 0 },
      { id: "finance-also", label: "Finance handles it among many other things.", risk: 1 },
      { id: "no-one", label: "No one.", risk: 2 },
    ],
  },
  {
    id: "su-r2",
    kind: "diagnostic",
    dimension: "R",
    question: "If a reported figure turns out to be wrong, what happens?",
    options: [
      { id: "process", label: "We have a correction and disclosure process.", risk: 0 },
      { id: "quietly", label: "We'd fix it quietly.", risk: 1 },
      { id: "unknown", label: "Unknown — it hasn't come up.", risk: 2 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// LEVEL 4–5 · DIAGNOSTICS — Others (generic, industry/area-agnostic)
// Used when the visitor's problem doesn't fit the three fixed focus areas.
// ────────────────────────────────────────────────────────────────────────────

const GENERIC_DIAGNOSTICS: QuizNode[] = [
  {
    id: "ot-s1",
    kind: "diagnostic",
    dimension: "S",
    question: "If an AI tool analysed the data behind this problem today, what would it see?",
    options: [
      { id: "ops-only", label: "Operational data only — nothing personal or confidential.", risk: 0 },
      { id: "some-mixed", label: "Mostly operational, but some personal or confidential records are mixed in.", risk: 1 },
      { id: "heavily-mixed", label: "It's heavily mixed with personal, financial, or confidential information.", risk: 2 },
    ],
  },
  {
    id: "ot-s2",
    kind: "diagnostic",
    dimension: "S",
    question: "Who can currently access or export this data?",
    options: [
      { id: "role-based", label: "Access is role-based, and we review who has it.", risk: 0 },
      { id: "most-staff", label: "Most staff can view it; exports aren't tracked.", risk: 1 },
      { id: "anyone", label: "Anyone with the file or link — we've never really checked.", risk: 2 },
    ],
  },
  {
    id: "ot-a1",
    kind: "diagnostic",
    dimension: "A",
    question: "How confident are you that this data is accurate and up to date?",
    options: [
      { id: "confident", label: "Very — it's reconciled or verified regularly.", risk: 0 },
      { id: "mostly", label: "Mostly, with occasional gaps we can explain.", risk: 1 },
      { id: "unsure", label: "Not very — we've been caught out by it before.", risk: 2 },
    ],
  },
  {
    id: "ot-a2",
    kind: "diagnostic",
    dimension: "A",
    question: "If you pulled this data from two different sources, would the numbers match?",
    options: [
      { id: "always", label: "Yes, consistently.", risk: 0 },
      { id: "small-gaps", label: "Usually, with small gaps we can explain.", risk: 1 },
      { id: "disagree", label: "We have multiple sources of truth that disagree.", risk: 2 },
    ],
  },
  {
    id: "ot-f1",
    kind: "diagnostic",
    dimension: "F",
    question: "If you applied AI to this problem tomorrow, what would success look like?",
    options: [
      { id: "specific", label: "A specific, measurable target with a deadline.", risk: 0 },
      { id: "general", label: "A general goal — fewer errors, save time.", risk: 1 },
      { id: "figure-out", label: "We'd figure it out as we go.", risk: 2 },
    ],
  },
  {
    id: "ot-f2",
    kind: "diagnostic",
    dimension: "F",
    question: "Can your team name the ONE thing to fix first?",
    options: [
      { id: "agreed", label: "Yes — it's agreed and written down.", risk: 0 },
      { id: "candidates", label: "We have several candidates but no agreement.", risk: 1 },
      { id: "everything", label: "No — everything feels broken.", risk: 2 },
    ],
  },
  {
    id: "ot-e1",
    kind: "diagnostic",
    dimension: "E",
    question: "When something goes wrong here, can someone explain why?",
    options: [
      { id: "traceable", label: "Usually — the cause and owner are traceable.", risk: 0 },
      { id: "sometimes", label: "Sometimes, if the right person remembers.", risk: 1 },
      { id: "ignore", label: "Honestly, we often can't explain it.", risk: 2 },
    ],
  },
  {
    id: "ot-e2",
    kind: "diagnostic",
    dimension: "E",
    question: "Could you defend this process or its records to an auditor, customer, or regulator tomorrow?",
    options: [
      { id: "documented", label: "Yes — it's documented.", risk: 0 },
      { id: "scramble", label: "We'd manage it, with a scramble.", risk: 1 },
      { id: "exposed", label: "No — we'd be exposed.", risk: 2 },
    ],
  },
  {
    id: "ot-r1",
    kind: "diagnostic",
    dimension: "R",
    question: "Who owns this problem in your company?",
    options: [
      { id: "named", label: "A named person or role.", risk: 0 },
      { id: "shared", label: "It's shared and informal.", risk: 1 },
      { id: "no-one", label: "No one — it's everyone's job and no one's.", risk: 2 },
    ],
  },
  {
    id: "ot-r2",
    kind: "diagnostic",
    dimension: "R",
    question: "If an automated system got this wrong, what would happen?",
    options: [
      { id: "signoff", label: "A human signs off before changes; there's a clear escalation path.", risk: 0 },
      { id: "case-by-case", label: "We'd sort it out case by case.", risk: 1 },
      { id: "notice-later", label: "Nothing is defined — we'd only notice later.", risk: 2 },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// LEVELS 1–3 · CONTEXT FUNNEL (industry → challenge → focus area)
// The ids "industry", "challenge" and "area" are special — keep them.
// ────────────────────────────────────────────────────────────────────────────

export const DEFAULT_QUIZ: QuizNode[] = [
  {
    id: "industry",
    kind: "choice",
    question: "Which industry is your business in?",
    help: "Every industry has its own failure patterns — this anchors your result.",
    options: [
      { id: "manufacturing", label: "Manufacturing & Precision Engineering" },
      { id: "logistics", label: "Logistics & Supply Chain" },
      { id: "construction", label: "Construction & Facilities Management" },
      { id: "retail", label: "Retail & E-commerce" },
      { id: "fnb", label: "Food & Beverage" },
      { id: "healthcare", label: "Healthcare & Medical Services" },
      { id: "professional", label: "Professional Services (Legal, Accounting, Consulting)" },
      { id: "education", label: "Education & Training" },
      { id: "events", label: "Events & MICE" },
      { id: "wholesale", label: "Wholesale & Trading" },
      { id: "other", label: "Others", allowFreeText: true },
    ],
  },
  {
    id: "challenge",
    kind: "choice",
    question: "What's the ONE business problem you most want to solve right now?",
    help: "Pick the pain that's costing you the most today.",
    options: [
      { id: "revenue", label: "Revenue growth has stalled" },
      { id: "speed", label: "Too slow getting products or services to market" },
      { id: "cost", label: "Rising costs are squeezing margins" },
      { id: "leads", label: "Not enough leads or sales conversions" },
      { id: "people", label: "Hiring, retaining, or upskilling people" },
      { id: "manual", label: "Manual processes eat up too much time" },
      { id: "assets", label: "We can't reliably track our assets or inventory" },
      { id: "compliance", label: "Compliance & reporting burden (PDPA, ESG, audits)" },
      { id: "service", label: "Customer service quality or response times" },
      { id: "data", label: "Data is scattered — we can't get answers for decisions" },
    ],
  },
  {
    id: "area",
    kind: "choice",
    question: "Which area is this problem most connected to?",
    help: "This decides which diagnostic questions you'll get.",
    options: [
      {
        id: "asset-management",
        label: "Physical & Digital Asset Management",
        children: ASSET_DIAGNOSTICS,
      },
      {
        id: "ai-guardrails",
        label: "Emerging Technology & AI Guardrails",
        children: GUARDRAIL_DIAGNOSTICS,
      },
      {
        id: "sustainability",
        label: "Sustainability & Green Compliance",
        children: SUSTAINABILITY_DIAGNOSTICS,
      },
      {
        id: "other",
        label: "Others",
        allowFreeText: true,
        children: GENERIC_DIAGNOSTICS,
      },
    ],
  },
];
