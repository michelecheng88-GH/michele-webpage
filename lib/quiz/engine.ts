/**
 * Scoring engine for the S.A.F.E.R. AI™ Decision Check.
 *
 * Decision rule — severity, not just a count of risks
 * -----------------------------------------------------
 * AI inherently carries residual risk, so governance shouldn't just count
 * problems — it should measure the organisation's capability to handle them.
 * Every dimension is graded pass / caution / high, and the verdict is driven
 * by SEVERITY first, count second:
 *
 *   Tier 1 — Optimized & Resilient (Proceed & Scale)
 *     Low inherent risk: 0–1 dimensions flagged, none at "high" severity.
 *
 *   Tier 2 — Managed with Guardrails (Proceed with Conditions)
 *     Moderate risk profile: 2–3 dimensions flagged, none at "high" severity.
 *
 *   Tier 3 — Operational Roadblock (Stop & Fix Internally)
 *     High risk profile: 4+ dimensions flagged, OR any single dimension at
 *     "high" severity (a systemic risk) regardless of how many others pass.
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

export type VerdictId = "tier1" | "tier2" | "tier3";

export type Verdict = {
  id: VerdictId;
  /** Full label — stored as quiz_responses.profile_band and shown in the admin panel. */
  band: string;
  /** Short label for the result banner. */
  headline: string;
  /** One-line decision rule for this tier. */
  decision: string;
  /** What-to-do-next guidance for this tier. */
  guidance: string;
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
  /** Count of dimensions that flagged caution or high risk (out of 5). */
  riskCount: number;
  /** Count of dimensions at "high" (systemic) severity, out of 5. */
  highRiskCount: number;
  verdict: Verdict;
};

const DIMENSION_ORDER: SaferDimension[] = ["S", "A", "F", "E", "R"];

const TIERS: Record<VerdictId, Verdict> = {
  tier1: {
    id: "tier1",
    band: "Tier 1: Optimized & Resilient (Proceed & Scale)",
    headline: "Tier 1 — Optimized & Resilient",
    decision: "Proceed with Confidence. Scale AI investments actively.",
    guidance:
      "Guardrails are already embedded in the operational fabric. Focus on continuous monitoring, performance optimisation, and driving ROI.",
  },
  tier2: {
    id: "tier2",
    band: "Tier 2: Managed with Guardrails (Proceed with Conditions)",
    headline: "Tier 2 — Managed with Guardrails",
    decision:
      "Proceed with Targeted Controls. Invest in technology, but mandate project-specific mitigations before deployment.",
    guidance:
      "Don't halt procurement — but tie budget release to specific guardrails first: human-in-the-loop validation, strict access logging, or similar controls for the flagged areas below.",
  },
  tier3: {
    id: "tier3",
    band: "Tier 3: Operational Roadblock (Stop & Fix Internally)",
    headline: "Tier 3 — Operational Roadblock",
    decision: "Must-Fix Internal Operations. Freeze new external AI technology procurement immediately.",
    guidance:
      "AI will only accelerate and scale existing bad data or broken processes — \"garbage in, garbage out.\" Divert the budget into foundational internal fixes: data cleaning, process mapping, and basic governance, before any new AI spend.",
  },
};

function contextLabel(answers: QuizAnswer[], nodeId: string): string {
  const a = answers.find((ans) => ans.nodeId === nodeId);
  if (!a) return "";
  return a.freeText?.trim() || a.optionLabel;
}

/** Severity-first tiering: any systemic (high) risk, or 4+ flagged dimensions, is Tier 3. */
function tierFor(riskCount: number, highRiskCount: number): VerdictId {
  if (highRiskCount >= 1 || riskCount >= 4) return "tier3";
  if (riskCount >= 2) return "tier2";
  return "tier1";
}

export function buildResultPayload(answers: QuizAnswer[]): QuizResultPayload {
  const areaAnswer = answers.find((a) => a.nodeId === "area");
  const context: QuizContext = {
    industry: contextLabel(answers, "industry"),
    challenge: contextLabel(answers, "challenge"),
    area: contextLabel(answers, "area"),
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
  const highRiskCount = dimensions.filter((d) => d.status === "high").length;
  const verdict = TIERS[tierFor(riskCount, highRiskCount)];

  return { context, answers, dimensions, totalScore, riskCount, highRiskCount, verdict };
}

/** One narrative paragraph anchored to the visitor's industry/challenge/area. */
export function buildNarrative(payload: QuizResultPayload): string {
  const { context, verdict } = payload;
  const industry = context.industry || "your";
  const challenge = context.challenge ? `"${context.challenge}"` : "your stated challenge";
  const area = context.area || "the area you chose";

  if (verdict.id === "tier1") {
    return `Based on your answers, your ${industry} business is in a strong position to apply AI to ${challenge} within ${area}. ${verdict.decision} ${verdict.guidance}`;
  }
  if (verdict.id === "tier2") {
    return `Your ${industry} business can move ahead on ${challenge} within ${area} — under defined conditions. ${verdict.decision} ${verdict.guidance}`;
  }
  return `Right now, AI would amplify problems rather than solve them for your ${industry} business in ${area}. ${verdict.decision} ${verdict.guidance}`;
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
