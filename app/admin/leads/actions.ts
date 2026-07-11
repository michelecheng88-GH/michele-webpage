"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Closed"] as const;
const GRANT_STATUSES = ["Identified", "Applied", "Approved", "Rejected"] as const;

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

export async function updateLeadGrant(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const grantName = String(formData.get("grant_name") ?? "").trim();
  const grantStatus = String(formData.get("grant_status") ?? "");
  const grantNotes = String(formData.get("grant_notes") ?? "").trim();

  if (grantStatus && !GRANT_STATUSES.includes(grantStatus as (typeof GRANT_STATUSES)[number])) {
    throw new Error("Invalid grant status");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ grant_name: grantName || null, grant_status: grantStatus || null, grant_notes: grantNotes || null })
    .eq("id", leadId);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor: "admin",
    action: "lead.grant_updated",
    object_type: "leads",
    object_id: leadId,
    payload: { after: { grant_name: grantName, grant_status: grantStatus, grant_notes: grantNotes } },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}
