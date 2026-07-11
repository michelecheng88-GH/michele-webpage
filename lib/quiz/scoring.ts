import { QUIZ_QUESTIONS, type SaferKey } from "./questions";

export type QuizAnswers = Record<string, number>;

export type ProfileBand =
  | "Foundation Builder"
  | "Emerging Adopter"
  | "Strategic Integrator"
  | "AI-Ready Leader";

export type QuizScoreResult = {
  answers: QuizAnswers;
  dimensionScores: Record<SaferKey, number>;
  totalScore: number;
  band: ProfileBand;
};

const DIMENSION_MAX = 8;
const TOTAL_MAX = DIMENSION_MAX * 5;

export function bandForScore(score: number): ProfileBand {
  if (score >= 80) return "AI-Ready Leader";
  if (score >= 60) return "Strategic Integrator";
  if (score >= 40) return "Emerging Adopter";
  return "Foundation Builder";
}

export function scoreQuiz(answers: QuizAnswers): QuizScoreResult {
  const dimensionScores: Record<SaferKey, number> = { S: 0, A: 0, F: 0, E: 0, R: 0 };

  for (const question of QUIZ_QUESTIONS) {
    dimensionScores[question.dimension] += answers[question.id] ?? 0;
  }

  const rawTotal = Object.values(dimensionScores).reduce((sum, v) => sum + v, 0);
  const totalScore = Math.round((rawTotal / TOTAL_MAX) * 100);

  return {
    answers,
    dimensionScores,
    totalScore,
    band: bandForScore(totalScore),
  };
}
