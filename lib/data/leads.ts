import { createClient } from "@/lib/supabase/client";
import type { QuizResultPayload } from "@/lib/quiz/engine";
import type { Recommendation, SaferDimension } from "@/lib/quiz/schema";

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
  payload: QuizResultPayload,
  recommendations: Recommendation[],
): Promise<void> {
  const supabase = createClient();

  const dimScore = (dim: SaferDimension): number | null =>
    payload.dimensions.find((d) => d.dimension === dim)?.score ?? null;

  const { error } = await supabase.from("quiz_responses").insert({
    lead_id: leadId,
    answers: {
      context: payload.context,
      responses: payload.answers,
    },
    total_score: payload.totalScore,
    profile_band: payload.verdict.band,
    s_score: dimScore("S"),
    a_score: dimScore("A"),
    f_score: dimScore("F"),
    e_score: dimScore("E"),
    r_score: dimScore("R"),
    recommendations,
  });

  if (error) throw new Error(error.message);
}
