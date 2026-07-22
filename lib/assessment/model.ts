/**
 * The SAFER assessment model — questions for both tiers.
 * ======================================================
 * ONE pillar model powers both products, so the paid report genuinely
 * "builds on top of" the free check:
 *
 *   Decision Check (free)  — KYC + pain + ONE posture question per pillar +
 *                            1-year goal → a Tier verdict + immediate actions.
 *   Readiness Assessment   — the same context + 2 DEEPER questions per pillar
 *   (paid)                   → weighted Success Score + PSSI™ + actions.
 *
 * The five pillars are the SAFER framework pillars (not the public Decision
 * Check's Sensitivity/Accuracy… lens):
 *   S — Strategy & Sponsorship
 *   A — Assess Readiness (data, tech, people)
 *   F — Fortify Foundations (governance, controls)
 *   E — Execute Responsibly (delivery, evaluation)
 *   R — Review & Scale (measurement, scaling)
 *
 * Every posture/readiness option carries a `risk` grade (0 safe · 1 caution ·
 * 2 high) AND a `points` value 0–100 for that pillar. Scoring lives in
 * scoring.ts. Industry wording is injected at render time from
 * industry-context.ts via {asset}/{frontline}/{standards} tokens.
 */

import type { IndustryContext } from "./industry-context";

export type Pillar = "S" | "A" | "F" | "E" | "R";

export type PillarDef = {
  key: Pillar;
  name: string;
  /** Blueprint weight for the Success Score (sums to 100). */
  weight: number;
  tagline: string;
};

export const PILLARS: PillarDef[] = [
  { key: "S", name: "Strategy & Sponsorship", weight: 20, tagline: "Solving the right problem, owned by a named leader." },
  { key: "A", name: "Assess Readiness", weight: 25, tagline: "Honest data, technology and people readiness." },
  { key: "F", name: "Fortify Foundations", weight: 20, tagline: "Governance and controls before AI lands." },
  { key: "E", name: "Execute Responsibly", weight: 20, tagline: "Guardrails, human checkpoints and evaluation." },
  { key: "R", name: "Review & Scale", weight: 15, tagline: "Measured value that compounds and scales." },
];

export const PILLAR_NAME: Record<Pillar, string> = Object.fromEntries(
  PILLARS.map((p) => [p.key, p.name]),
) as Record<Pillar, string>;

export type Choice = {
  id: string;
  label: string;
  /** 0 = safe, 1 = caution, 2 = high risk. */
  risk: 0 | 1 | 2;
  /** 0–100 contribution to this pillar's score. */
  points: number;
};

export type PillarQuestion = {
  id: string;
  pillar: Pillar;
  /** May contain {asset} {frontline} {standards} {pain} tokens. */
  question: string;
  help?: string;
  options: Choice[];
};

/** A generic 3-rung answer set (mature / partial / none) reused a lot. */
function ladder(idBase: string, mature: string, partial: string, none: string): Choice[] {
  return [
    { id: `${idBase}-a`, label: mature, risk: 0, points: 100 },
    { id: `${idBase}-b`, label: partial, risk: 1, points: 55 },
    { id: `${idBase}-c`, label: none, risk: 2, points: 15 },
  ];
}

// ── Decision Check: one quick posture question per pillar ───────────────────
export const DECISION_POSTURE: PillarQuestion[] = [
  {
    id: "dc-s",
    pillar: "S",
    question: "Is there a named business owner and a costed problem behind your AI ambition?",
    help: "Not IT by default — a business leader who owns the outcome.",
    options: ladder(
      "dc-s",
      "Yes — a named owner and a problem we've quantified in time or dollars",
      "Loosely — there's interest but no single owner or hard number yet",
      "No — it's a general 'we should use AI' idea for now",
    ),
  },
  {
    id: "dc-a",
    pillar: "A",
    question: "How reliable is the data your AI would depend on — your {asset}?",
    help: "Be honest: AI amplifies whatever the data already is.",
    options: ladder(
      "dc-a",
      "Reliable — a single source of truth we'd trust to act on",
      "Mixed — usable but fragmented across systems or spreadsheets",
      "Unreliable — inconsistent, duplicated, or out of date",
    ),
  },
  {
    id: "dc-f",
    pillar: "F",
    question: "Do you have governance for how AI may be used — given {standards}?",
    help: "Who approves, what's logged, what AI must never do alone.",
    options: ladder(
      "dc-f",
      "Yes — clear policy, approvals and logging are defined",
      "Partly — some rules exist but aren't written down or enforced",
      "No governance for AI use yet",
    ),
  },
  {
    id: "dc-e",
    pillar: "E",
    question: "Have your {frontline} used AI in a real task, with a human checking the output?",
    help: "Real usage beats intention.",
    options: ladder(
      "dc-e",
      "Yes — we've run a real task with human checkpoints",
      "A little — informal experiments, no guardrails",
      "Not yet",
    ),
  },
  {
    id: "dc-r",
    pillar: "R",
    question: "Would you be able to measure whether an AI initiative actually worked?",
    help: "A baseline today and a target to compare against.",
    options: ladder(
      "dc-r",
      "Yes — we have baselines and would track the result",
      "Roughly — we'd know anecdotally, not in numbers",
      "No — we couldn't prove the value either way",
    ),
  },
];

// ── Readiness Assessment: two deeper questions per pillar (paid) ────────────
export const READINESS_QUESTIONS: PillarQuestion[] = [
  // S — Strategy & Sponsorship
  {
    id: "ra-s1",
    pillar: "S",
    question: "How is executive sponsorship for AI expressed in your organisation?",
    options: ladder(
      "ra-s1",
      "A named executive sponsor actively unblocks and funds the work",
      "Leadership is supportive but not personally involved",
      "No clear executive sponsor",
    ),
  },
  {
    id: "ra-s2",
    pillar: "S",
    question: "Are your target outcomes expressed with baselines and deadlines?",
    help: 'e.g. "cut manual reporting effort 50% within 9 months", not "improve efficiency".',
    options: ladder(
      "ra-s2",
      "Yes — measurable targets with baselines and dates",
      "We have goals but no baselines or deadlines",
      "Outcomes are still vague",
    ),
  },
  // A — Assess Readiness
  {
    id: "ra-a1",
    pillar: "A",
    question: "How accurate is your core operational data ({asset}) when sampled against reality?",
    options: [
      { id: "ra-a1-a", label: "High — we've sampled it and it holds up (≈95%+)", risk: 0, points: 100 },
      { id: "ra-a1-b", label: "Moderate — probably 80–95%, not formally checked", risk: 1, points: 55 },
      { id: "ra-a1-c", label: "Low or unknown — we've never measured it", risk: 2, points: 15 },
    ],
  },
  {
    id: "ra-a2",
    pillar: "A",
    question: "Do the systems the AI needs to reach have APIs or integrations available today?",
    options: ladder(
      "ra-a2",
      "Yes — the key systems can exchange data programmatically",
      "Some do; others are manual exports or closed",
      "Mostly manual / no integration available",
    ),
  },
  // F — Fortify Foundations
  {
    id: "ra-f1",
    pillar: "F",
    question: "Is there an AI usage policy defining what AI may do alone, what needs a human, and what's forbidden — aligned to {standards}?",
    options: ladder(
      "ra-f1",
      "Yes — an approved policy with an approval matrix",
      "Draft or informal understanding only",
      "No policy yet",
    ),
  },
  {
    id: "ra-f2",
    pillar: "F",
    question: "Are AI recommendations and the human decisions on them logged for audit?",
    options: ladder(
      "ra-f2",
      "Yes — immutable logging of recommendation + decision",
      "Some records, not systematic",
      "No audit trail",
    ),
  },
  // E — Execute Responsibly
  {
    id: "ra-e1",
    pillar: "E",
    question: "When you trial AI, do you define what an excellent output looks like BEFORE you build — a checklist to evaluate against?",
    options: ladder(
      "ra-e1",
      "Yes — we write evaluation criteria up front",
      "Sometimes / informally",
      "No — we judge outputs ad hoc",
    ),
  },
  {
    id: "ra-e2",
    pillar: "E",
    question: "Are there human approval checkpoints where an AI action would have material consequences?",
    options: ladder(
      "ra-e2",
      "Yes — humans approve every material AI-driven action",
      "For some actions but not consistently",
      "No defined checkpoints",
    ),
  },
  // R — Review & Scale
  {
    id: "ra-r1",
    pillar: "R",
    question: "Do you have a plan (and budget) for scaling an AI pilot beyond the first team?",
    options: ladder(
      "ra-r1",
      "Yes — a staged rollout plan with entry criteria per wave",
      "We'd figure it out if the pilot worked",
      "No scaling plan",
    ),
  },
  {
    id: "ra-r2",
    pillar: "R",
    question: "How will you monitor an AI system for drift and keep reporting its value over time?",
    options: ladder(
      "ra-r2",
      "We have monitoring and a standing value-review cadence",
      "We'd check occasionally",
      "No monitoring or ongoing review planned",
    ),
  },
];

// ── Critical Success Factors → PSSI penalties (from the Blueprint) ──────────
// If the answer to a mapped question is "high risk" (the fatal option), the
// PSSI takes the penalty — these are the disproportionately fatal gaps.
export type CsfPenalty = { questionId: string; highRiskOptionId: string; penalty: number; label: string };

export const PSSI_PENALTIES: CsfPenalty[] = [
  { questionId: "ra-s1", highRiskOptionId: "ra-s1-c", penalty: 15, label: "No executive sponsor" },
  { questionId: "dc-s", highRiskOptionId: "dc-s-c", penalty: 12, label: "No business owner" },
  { questionId: "ra-a1", highRiskOptionId: "ra-a1-c", penalty: 15, label: "Poor data quality" },
  { questionId: "ra-r1", highRiskOptionId: "ra-r1-c", penalty: 12, label: "No scaling roadmap" },
  { questionId: "ra-s2", highRiskOptionId: "ra-s2-c", penalty: 10, label: "No measurable outcomes" },
  { questionId: "ra-r2", highRiskOptionId: "ra-r2-c", penalty: 10, label: "No monitoring / value review" },
  { questionId: "ra-f1", highRiskOptionId: "ra-f1-c", penalty: 8, label: "No AI governance" },
  { questionId: "ra-f2", highRiskOptionId: "ra-f2-c", penalty: 8, label: "No audit trail" },
];

/** Replace {asset}/{frontline}/{standards}/{pain} tokens with sector wording. */
export function fillTokens(text: string, ctx: IndustryContext, pain?: string): string {
  return text
    .replace(/\{asset\}/g, ctx.assetWord)
    .replace(/\{frontline\}/g, ctx.frontline)
    .replace(/\{standards\}/g, ctx.standards)
    .replace(/\{pain\}/g, pain || ctx.painExample);
}
