import { createClient } from "@/lib/supabase/server";

export type LeadQuizResponse = {
  profile_band: string;
  total_score: number;
  answers: Record<string, number>;
  s_score: number;
  a_score: number;
  f_score: number;
  e_score: number;
  r_score: number;
  recommendations: { title: string; body: string }[] | null;
};

export type AdminLead = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  company: string;
  role: string | null;
  email: string;
  phone: string | null;
  biggest_challenge: string | null;
  challenge_detail: string | null;
  status: string;
  notes: string | null;
  grant_name: string | null;
  grant_status: string | null;
  grant_notes: string | null;
  source: string | null;
  quiz_responses: LeadQuizResponse[];
};

const LEAD_SELECT =
  "id, created_at, first_name, last_name, company, role, email, phone, biggest_challenge, challenge_detail, status, notes, grant_name, grant_status, grant_notes, source, quiz_responses(profile_band, total_score, answers, s_score, a_score, f_score, e_score, r_score, recommendations)";

export async function getLeadsForAdmin(): Promise<AdminLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as AdminLead[]) ?? [];
}

export async function getLeadById(id: string): Promise<AdminLead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as AdminLead | null;
}
