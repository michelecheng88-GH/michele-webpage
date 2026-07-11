"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Closed"] as const;

export async function updateLeadStatus(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const previousStatus = String(formData.get("previousStatus"));
  const status = String(formData.get("status"));
  const notes = String(formData.get("notes") ?? "");

  if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status, notes }).eq("id", leadId);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor: "admin",
    action: "lead.status_changed",
    object_type: "leads",
    object_id: leadId,
    payload: { before: { status: previousStatus }, after: { status, notes } },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}
