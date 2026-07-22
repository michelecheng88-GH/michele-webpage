/**
 * Shared client-side session shape for the two-tier survey.
 *
 * The free Decision Check writes `safer-decision` to sessionStorage; the result
 * page and the paid Readiness Assessment both read it, so the paid report
 * genuinely builds on the free answers.
 */

import { INDUSTRIES } from "@/lib/content/industries";
import { DECISION_POSTURE, fillTokens, type PillarQuestion } from "./model";
import { matchIndustryContext } from "./industry-context";
import type { AnswerRecord } from "./scoring";

export const DECISION_KEY = "safer-decision";
export const READINESS_KEY = "safer-readiness";

export type DecisionContext = {
  industry: string;
  companySize: string;
  role: string;
  painPoint: string;
  goal: string;
  timeline: string;
};

export type DecisionPayload = {
  context: DecisionContext;
  answers: AnswerRecord[];
};

export const COMPANY_SIZES = [
  "Micro (1–9 staff)",
  "Small (10–49 staff)",
  "Medium (50–199 staff)",
  "Large (200+ staff)",
];

export const ROLES = [
  "Owner / CEO / Managing Director",
  "C-suite / Director",
  "Head of Operations / Department Head",
  "IT / Technology Lead",
  "Manager / Other",
];

export const GOALS = [
  "Cut cost and manual effort",
  "Speed up a process / go to market faster",
  "Improve accuracy and reduce errors",
  "Grow or scale without adding headcount",
  "Meet compliance and reporting demands",
  "Still exploring — not sure yet",
];

export const TIMELINES = [
  "We need results within 3 months",
  "Within 6 months",
  "Within 12 months",
  "Exploring — no fixed timeline",
];

/** A single step in the linear Decision Check flow. */
export type ContextStep = {
  kind: "context";
  field: keyof DecisionContext;
  question: string;
  help?: string;
  options: { id: string; label: string; allowFreeText?: boolean }[];
};
export type PostureStep = { kind: "posture"; question: PillarQuestion };
export type Step = ContextStep | PostureStep;

/**
 * Build the flow. Industry is chosen first; every later step is worded for that
 * sector (pain-point options + posture-question tokens).
 */
export function buildDecisionSteps(industry?: string): Step[] {
  const ctx = matchIndustryContext(industry);

  const kyc: Step[] = [
    {
      kind: "context",
      field: "companySize",
      question: "How big is your organisation?",
      options: COMPANY_SIZES.map((label, i) => ({ id: `size-${i}`, label })),
    },
    {
      kind: "context",
      field: "role",
      question: "What's your role?",
      options: ROLES.map((label, i) => ({ id: `role-${i}`, label })),
    },
    {
      kind: "context",
      field: "painPoint",
      question: "Which of these is your most pressing problem right now?",
      help: "Pick the one that costs you the most today.",
      options: [
        ...ctx.painPoints.map((label, i) => ({ id: `pain-${i}`, label })),
        { id: "pain-other", label: "Something else", allowFreeText: true },
      ],
    },
  ];

  const posture: Step[] = DECISION_POSTURE.map((q) => ({
    kind: "posture" as const,
    question: { ...q, question: fillTokens(q.question, ctx), help: q.help ? fillTokens(q.help, ctx) : undefined },
  }));

  const goals: Step[] = [
    {
      kind: "context",
      field: "goal",
      question: "What outcome do you most want from AI in the next 12 months?",
      options: GOALS.map((label, i) => ({ id: `goal-${i}`, label })),
    },
    {
      kind: "context",
      field: "timeline",
      question: "How soon do you need to see a result?",
      help: "We'll tailor advice you can start now and see pay off within a year.",
      options: TIMELINES.map((label, i) => ({ id: `time-${i}`, label })),
    },
  ];

  return [...kyc, ...posture, ...goals];
}

export const INDUSTRY_OPTIONS = INDUSTRIES;
