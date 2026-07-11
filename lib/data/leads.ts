import { createClient } from "@/lib/supabase/client";
import type { QuizScoreResult } from "@/lib/quiz/scoring";
import type { Recommendation } from "@/lib/quiz/recommendations";

export type LeadInput = {
  first_name: string;
  last_name: string;
  company: string;
  role?: string;
  email: string;
  phone?: string;
  biggest_challenge?: string;
  challenge_detail?: string;
};

export async function insertLead(input: LeadInput): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, source: "quiz", status: "New" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function insertQuizResponse(
  leadId: string,
  result: QuizScoreResult,
  recommendations: Recommendation[],
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("quiz_responses").insert({
    lead_id: leadId,
    answers: result.answers,
    total_score: result.totalScore,
    profile_band: result.band,
    s_score: result.dimensionScores.S,
    a_score: result.dimensionScores.A,
    f_score: result.dimensionScores.F,
    e_score: result.dimensionScores.E,
    r_score: result.dimensionScores.R,
    recommendations,
  });

  if (error) throw new Error(error.message);
}
