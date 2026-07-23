/**
 * Scoring for both SAFER assessment tiers.
 *
 * Decision Check → a Tier verdict (severity-first, same rule and language as
 * the Blueprint's Decision Check: any systemic/high risk, or 4+ flagged
 * pillars, is Tier 3).
 *
 * Readiness Assessment → the Blueprint's two numbers:
 *   Success Score = Σ(pillarScore × weight)/100          (descriptive)
 *   PSSI          = Success Score − Σ(penalties)          (predictive)
 * with the shared 5-band interpretation.
 */

import { PILLARS, PILLAR_NAME, PSSI_PENALTIES, type Pillar } from "./model";
import { pillarAction, type Action } from "./advice";
import type { IndustryContext } from "./industry-context";

export type AnswerRecord = {
  questionId: string;
  pillar: Pillar;
  optionId: string;
  label: string;
  risk: 0 | 1 | 2;
  points: number;
};

// ── Decision Check verdict ──────────────────────────────────────────────────
export type TierId = "tier1" | "tier2" | "tier3";

export type Verdict = {
  id: TierId;
  band: string;
  headline: string;
  decision: string;
  guidance: string;
};

const TIERS: Record<TierId, Verdict> = {
  tier1: {
    id: "tier1",
    band: "Tier 1: Optimised & Resilient (Proceed & Scale)",
    headline: "Tier 1 — Optimised & Resilient",
    decision: "Proceed with confidence. You have the foundations to apply AI now and scale it.",
    guidance:
      "Focus the next 12 months on picking one high-value use case, running it with evaluation and human checkpoints, and measuring the result against a baseline.",
  },
  tier2: {
    id: "tier2",
    band: "Tier 2: Managed with Guardrails (Proceed with Conditions)",
    headline: "Tier 2 — Managed with Guardrails",
    decision: "Proceed — but close the flagged gaps in parallel before you scale.",
    guidance:
      "Don't wait a year to start. Begin a small, well-scoped pilot now while you fix the flagged areas below, so you see a result within 12 months without building on sand.",
  },
  tier3: {
    id: "tier3",
    band: "Tier 3: Operational Roadblock (Stop & Fix Internally)",
    headline: "Tier 3 — Fix Foundations First",
    decision: "Fix the foundations before spending on AI — right now it would amplify existing problems.",
    guidance:
      "Spend the next 3–6 months on the fundamentals below (a named owner, cleaner data, basic governance). These are fast, cheap wins that make a later AI pilot succeed instead of stall.",
  },
};

function tierFor(flagged: number, high: number): TierId {
  // Severity-aware but graduated. A SINGLE high-risk area is a Tier 2
  // "proceed with conditions" — not an automatic "stop everything" Tier 3.
  // Tier 3 is reserved for genuinely weak profiles: two or more systemic
  // (high) risks, or most pillars flagged.
  if (high >= 2 || flagged >= 4) return "tier3";
  if (high >= 1 || flagged >= 2) return "tier2";
  return "tier1";
}

export type PillarStatus = "pass" | "caution" | "high";

export type DecisionResult = {
  verdict: Verdict;
  flaggedCount: number;
  highCount: number;
  postureByPillar: { pillar: Pillar; name: string; status: PillarStatus }[];
};

export function scoreDecisionCheck(answers: AnswerRecord[]): DecisionResult {
  const postureByPillar = PILLARS.map((p) => {
    const a = answers.find((x) => x.pillar === p.key);
    const risk = a?.risk ?? 0;
    const status: PillarStatus = risk === 2 ? "high" : risk === 1 ? "caution" : "pass";
    return { pillar: p.key, name: p.name, status };
  });
  const flaggedCount = postureByPillar.filter((p) => p.status !== "pass").length;
  const highCount = postureByPillar.filter((p) => p.status === "high").length;
  return { verdict: TIERS[tierFor(flaggedCount, highCount)], flaggedCount, highCount, postureByPillar };
}

// ── Readiness Success Score + PSSI ──────────────────────────────────────────
export type Band = {
  key: "enterprise" | "ready" | "moderate" | "high" | "stall";
  label: string;
  /** traffic-light colour name for the UI/report */
  colour: "green" | "yellow" | "orange" | "red" | "black";
};

export function bandFor(score: number): Band {
  if (score >= 85) return { key: "enterprise", label: "Enterprise Ready", colour: "green" };
  if (score >= 70) return { key: "ready", label: "Ready, with improvements", colour: "yellow" };
  if (score >= 55) return { key: "moderate", label: "Moderate risk", colour: "orange" };
  if (score >= 40) return { key: "high", label: "High risk", colour: "red" };
  return { key: "stall", label: "Pilot likely to stall", colour: "black" };
}

export type PillarScore = {
  pillar: Pillar;
  name: string;
  weight: number;
  /** 0–100 mean of this pillar's answers. */
  score: number;
  status: PillarStatus;
};

export type ReadinessResult = {
  pillars: PillarScore[];
  successScore: number;
  successBand: Band;
  pssi: number;
  pssiBand: Band;
  penalties: { label: string; penalty: number }[];
  actions: Action[];
};

export function scoreReadiness(answers: AnswerRecord[], ctx: IndustryContext): ReadinessResult {
  const pillars: PillarScore[] = PILLARS.map((p) => {
    const mine = answers.filter((a) => a.pillar === p.key);
    const mean =
      mine.length > 0 ? Math.round(mine.reduce((s, a) => s + a.points, 0) / mine.length) : 0;
    const worst = mine.reduce((m, a) => Math.max(m, a.risk), 0);
    const status: PillarStatus = worst === 2 ? "high" : worst === 1 ? "caution" : "pass";
    return { pillar: p.key, name: p.name, weight: p.weight, score: mean, status };
  });

  const successScore = Math.round(
    pillars.reduce((s, p) => s + (p.score * p.weight) / 100, 0),
  );

  const penalties = PSSI_PENALTIES.filter((c) =>
    answers.some((a) => a.questionId === c.questionId && a.optionId === c.highRiskOptionId),
  ).map((c) => ({ label: c.label, penalty: c.penalty }));

  const totalPenalty = penalties.reduce((s, p) => s + p.penalty, 0);
  const pssi = Math.max(0, successScore - totalPenalty);

  // Actions: high-risk pillars first, then cautions.
  const ordered = [
    ...pillars.filter((p) => p.status === "high"),
    ...pillars.filter((p) => p.status === "caution"),
  ];
  const actions = ordered.map((p) => pillarAction(p.pillar, ctx));
  // If everything passed, still give forward-looking next steps.
  if (actions.length === 0) {
    actions.push(pillarAction("E", ctx), pillarAction("R", ctx));
  }

  return {
    pillars,
    successScore,
    successBand: bandFor(successScore),
    pssi,
    pssiBand: bandFor(pssi),
    penalties,
    actions,
  };
}

export { PILLAR_NAME };
