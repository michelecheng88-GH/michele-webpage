/**
 * Scoring engine for the S.A.F.E.R. AI™ Decision Check.
 *
 * Decision rule (Michele's framework):
 *   ✅ all 5 checks pass          → use AI confidently
 *   ⚠️ 1–2 checks flag risk      → use AI, with controls
 *   ❌ 3+ checks flag risk       → do NOT use AI yet
 *
 * A dimension's status comes from its WORST answer (max risk), not the
 * average — one critical red flag must not be averaged away.
 */

import type { QuizAnswer, Recommendation, SaferDimension } from "./schema";
import { DIMENSION_NAMES } from "./schema";
import { AREA_ADVICE, GENERIC_ADVICE, GREEN_LIGHT_ADVICE } from "./advice";

export type DimensionStatus = "pass" | "caution" | "high";

export type DimensionResult = {
  dimension: SaferDimension;
  name: string;
  /** Number of diagnostic questions answered for this dimension. */
  questions: number;
  /** Worst risk among this dimension's answers: 0 | 1 | 2. */
  maxRisk: 0 | 1 | 2;
  status: DimensionStatus;
  /** 0–8, for storage/compatibility with the quiz_responses columns. */
  score: number;
};

export type VerdictId = "green" | "amber" | "red";

export type Verdict = {
  id: VerdictId;
  /** Stored as quiz_responses.profile_band and shown in the admin panel. */
  band: string;
  headline: string;
};

export type QuizContext = {
  industry: string;
  challenge: string;
  area: string;
  areaId: string;
};

export type QuizResultPayload = {
  context: QuizContext;
  answers: QuizAnswer[];
  dimensions: DimensionResult[];
  /** 0–100 readiness percentage across all diagnostic answers. */
  totalScore: number;
  /** Count of dimensions that flagged caution or high risk. */
  riskCount: number;
  verdict: Verdict;
};

const DIMENSION_ORDER: SaferDimension[] = ["S", "A", "F", "E", "R"];

const VERDICTS: Record<VerdictId, Verdict> = {
  green: {
    id: "green",
    band: "Use AI Confidently",
    headline: "Green light — use AI with confidence",
  },
  amber: {
    id: "amber",
    band: "Use AI — With Guardrails",
    headline: "Amber — use AI, but with guardrails",
  },
  red: {
    id: "red",
    band: "Do Not Use AI Yet",
    headline: "Red — fix the foundations first",
  },
};

function contextLabel(answers: QuizAnswer[], nodeId: string): string {
  const a = answers.find((ans) => ans.nodeId === nodeId);
  if (!a) return "";
  return a.freeText?.trim() || a.optionLabel;
}

export function buildResultPayload(answers: QuizAnswer[]): QuizResultPayload {
  const areaAnswer = answers.find((a) => a.nodeId === "area");
  const context: QuizContext = {
    industry: contextLabel(answers, "industry"),
    challenge: contextLabel(answers, "challenge"),
    area: areaAnswer?.optionLabel ?? "",
    areaId: areaAnswer?.optionId ?? "",
  };

  const diagnostics = answers.filter((a) => a.dimension !== undefined);

  const dimensions: DimensionResult[] = [];
  for (const dim of DIMENSION_ORDER) {
    const dimAnswers = diagnostics.filter((a) => a.dimension === dim);
    if (dimAnswers.length === 0) continue;

    const maxRisk = Math.max(...dimAnswers.map((a) => a.risk ?? 0)) as 0 | 1 | 2;
    const points = dimAnswers.reduce((sum, a) => sum + (2 - (a.risk ?? 0)), 0);
    const score = Math.round((points / (2 * dimAnswers.length)) * 8);

    dimensions.push({
      dimension: dim,
      name: DIMENSION_NAMES[dim],
      questions: dimAnswers.length,
      maxRisk,
      status: maxRisk === 0 ? "pass" : maxRisk === 1 ? "caution" : "high",
      score,
    });
  }

  const totalPoints = diagnostics.reduce((sum, a) => sum + (2 - (a.risk ?? 0)), 0);
  const totalScore =
    diagnostics.length > 0 ? Math.round((totalPoints / (2 * diagnostics.length)) * 100) : 0;

  const riskCount = dimensions.filter((d) => d.status !== "pass").length;
  const verdict = riskCount === 0 ? VERDICTS.green : riskCount <= 2 ? VERDICTS.amber : VERDICTS.red;

  return { context, answers, dimensions, totalScore, riskCount, verdict };
}

/** One narrative paragraph anchored to the visitor's industry/challenge/area. */
export function buildNarrative(payload: QuizResultPayload): string {
  const { context, verdict, riskCount } = payload;
  const industry = context.industry || "your";
  const challenge = context.challenge ? `"${context.challenge}"` : "your stated challenge";
  const area = context.area || "the area you chose";

  if (verdict.id === "green") {
    return `Based on your answers, your ${industry} business is in a strong position to apply AI to ${challenge} within ${area}. All five S.A.F.E.R. checks passed — the goal now is to move deliberately, not to wait.`;
  }
  if (verdict.id === "amber") {
    return `Your ${industry} business can use AI on ${challenge} — but only with guardrails. ${riskCount} of the five S.A.F.E.R. checks flagged risks. Put the controls below in place before or alongside any pilot.`;
  }
  return `Right now, AI would amplify problems rather than solve them for your ${industry} business. ${riskCount} of the five S.A.F.E.R. checks flagged serious gaps around ${area}. The good news: the fixes below are concrete, and most take weeks — not years.`;
}

/**
 * Recommendations ordered by severity: high-risk dimensions first, then
 * cautions, padded with green-light advice to a minimum of three items.
 */
export function buildRecommendations(payload: QuizResultPayload): Recommendation[] {
  const areaAdvice = AREA_ADVICE[payload.context.areaId];

  const atRisk = [
    ...payload.dimensions.filter((d) => d.status === "high"),
    ...payload.dimensions.filter((d) => d.status === "caution"),
  ];

  const recs: Recommendation[] = atRisk.map(
    (d) => areaAdvice?.[d.dimension] ?? GENERIC_ADVICE[d.dimension],
  );

  for (const green of GREEN_LIGHT_ADVICE) {
    if (recs.length >= 3) break;
    recs.push(green);
  }

  return recs;
}
