import { createClient } from "@/lib/supabase/server";
import type { DecisionContext } from "@/lib/assessment/session";
import type { ReadinessResult } from "@/lib/assessment/scoring";

/**
 * Atomically redeem a code via the SECURITY DEFINER RPC. Returns true exactly
 * once per unused code; false if the code is unknown or already used.
 */
export async function redeemCode(code: string, email: string, phone: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_assessment_code", {
    p_code: code,
    p_email: email,
    p_phone: phone,
  });
  if (error) throw new Error(error.message);
  return data === true;
}

export type StoreReportInput = {
  id: string;
  code: string;
  email: string;
  phone: string;
  company: string;
  context: DecisionContext;
  answers: unknown;
  result: ReadinessResult;
};

/** Best-effort record of a generated report, so Michele can re-send / follow up. */
export async function storeReport(input: StoreReportInput): Promise<void> {
  const supabase = await createClient();
  const pillar_scores = Object.fromEntries(input.result.pillars.map((p) => [p.pillar, p.score]));
  const { error } = await supabase.from("assessment_reports").insert({
    id: input.id,
    code: input.code,
    email: input.email,
    phone: input.phone,
    company: input.company || null,
    industry: input.context.industry || null,
    company_size: input.context.companySize || null,
    context: input.context,
    answers: input.answers,
    pillar_scores,
    success_score: input.result.successScore,
    pssi: input.result.pssi,
    band: input.result.successBand.label,
    actions: input.result.actions,
  });
  if (error) throw new Error(error.message);
}
