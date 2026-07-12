/**
 * Actionable advice content — edit alongside lib/quiz/default-config.ts.
 *
 * When a dimension flags a risk, the result page picks the advice for
 * (focus area × dimension). If you add a new focus area without advice here,
 * the GENERIC_ADVICE for that dimension is used as a fallback.
 */

import type { Recommendation, SaferDimension } from "./schema";

/** Keyed by the "area" option id in default-config.ts. */
export const AREA_ADVICE: Record<string, Record<SaferDimension, Recommendation>> = {
  "asset-management": {
    S: {
      title: "Classify before you connect",
      body: "Within 30 days, label your asset records: purely operational vs anything containing personal or client data (PDPA). Separate the two before any AI or automation touches them — not all data is meant for AI.",
    },
    A: {
      title: "Fix the count before the tool",
      body: "Run one full reconciliation of your highest-value asset category and name the top cause of discrepancies — manual entry, disagreeing systems, or no owner. AI applied to wrong counts just scales the error faster.",
    },
    F: {
      title: "One process, one number, 90 days",
      body: "Pick a single asset process and set a measurable target — e.g. \"cut stock-take time 40% in 90 days\". A goal you can't measure is a goal you can't automate.",
    },
    E: {
      title: "Make every discrepancy traceable",
      body: "Require every stock adjustment to carry a reason code and an owner. When each flag can be explained, you can trust — and defend — the system that raises it.",
    },
    R: {
      title: "Name the owner",
      body: "Appoint one named owner for asset data quality with a weekly 15-minute review, and define who signs off before any automated write-off. Systems don't carry responsibility; people do.",
    },
  },
  "ai-guardrails": {
    S: {
      title: "Draw the data line first",
      body: "Publish a one-page policy this month: what staff may and may never paste into AI tools (PDPA personal data, patient info, client confidential), plus an approved-tools list. Enforcement starts with clarity.",
    },
    A: {
      title: "Decide where 100% matters",
      body: "Split the use case: AI drafts, humans decide. Anywhere the output must be clinically, financially, or legally correct, AI can assist — it cannot be accountable.",
    },
    F: {
      title: "Define the problem before the pilot",
      body: "Write one sentence: \"We will use AI on [process] so that [metric] improves by [X] within [Y] months\" — and record the baseline now. If you can't fill the blanks, you're not ready to pilot.",
    },
    E: {
      title: "No black boxes for real decisions",
      body: "For any AI that influences decisions about people or money, require your vendor or team to show how outputs are derived. If you can't explain it, you can't defend it — to a customer or a regulator.",
    },
    R: {
      title: "Human sign-off, named owner",
      body: "Before launch, name who is accountable if the AI is wrong, and add a human review step before outputs reach customers. \"The vendor\" is not an answer a regulator will accept.",
    },
  },
  sustainability: {
    S: {
      title: "Separate the sensitive from the reportable",
      body: "Move ESG source data that contains supplier contracts or staff records into a governed location with access control before feeding any of it into analytics or AI tools.",
    },
    A: {
      title: "Measure, don't estimate",
      body: "Replace your roughest estimate — usually energy or waste — with metered or receipted data first. Green claims built on guesses become liabilities the day someone audits them.",
    },
    F: {
      title: "Report for a reason",
      body: "Anchor the effort to one concrete driver — a tender requirement, a named customer, or upcoming disclosure rules — and define the single metric that matters for the next 12 months.",
    },
    E: {
      title: "Trace every figure",
      body: "Keep a simple source-and-method log for every reported number, so you can walk an auditor from figure to evidence. If you can't trace it, don't report it.",
    },
    R: {
      title: "Give ESG a name, not a committee",
      body: "Assign a named owner for sustainability data, with a defined correction-and-disclosure process for errors — before regulators or customers find them first.",
    },
  },
};

/** Fallback advice when a focus area has no entry in AREA_ADVICE. */
export const GENERIC_ADVICE: Record<SaferDimension, Recommendation> = {
  S: {
    title: "Audit your data sensitivity",
    body: "Map which systems hold personal (PDPA), patient, or confidential data, and keep AI tools away from them until access is controlled. Not all data is meant for AI.",
  },
  A: {
    title: "Verify accuracy before automating",
    body: "Reconcile your core records against reality and fix the biggest source of error first. AI amplifies whatever accuracy — or inaccuracy — you feed it.",
  },
  F: {
    title: "Frame a measurable problem",
    body: "Define one process, one metric, one deadline, and record today's baseline. AI amplifies clarity — not confusion.",
  },
  E: {
    title: "Insist on explainability",
    body: "Only adopt tools whose outputs your team can explain and defend to an auditor, customer, or regulator.",
  },
  R: {
    title: "Assign accountability before adoption",
    body: "Name one owner for the outcome and add human sign-off wherever output affects customers or money. AI generates outputs; humans carry responsibility.",
  },
};

/** Shown when all five checks pass (and used to pad short lists to 3 items). */
export const GREEN_LIGHT_ADVICE: Recommendation[] = [
  {
    title: "Start where the value is provable",
    body: "Pick the use case with the clearest metric and run a 90-day pilot using the guardrails you already have. Move deliberately — being ready is an advantage most SMEs don't have.",
  },
  {
    title: "Formalise what's working informally",
    body: "Write down your data ownership, review steps, and tool policies as you scale, so readiness survives staff changes and growth.",
  },
  {
    title: "Validate your readiness independently",
    body: "A S.A.F.E.R. AI Audit pressure-tests these answers against your actual systems and gives you a prioritised roadmap — before you commit serious budget.",
  },
];
