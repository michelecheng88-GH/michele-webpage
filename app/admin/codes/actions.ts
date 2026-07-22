"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Human-friendly, hard-to-guess code like SAFER-K3M9-P2X7. */
function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  const block = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `SAFER-${block()}-${block()}`;
}

export async function generateCodes(formData: FormData) {
  const count = Math.min(50, Math.max(1, Number(formData.get("count") ?? 1)));
  const label = String(formData.get("label") ?? "").trim() || null;
  const amount = Number(formData.get("amount") ?? 200) || null;

  const supabase = await createClient();
  const rows = Array.from({ length: count }, () => ({ code: generateCode(), label, amount }));
  const { error } = await supabase.from("assessment_codes").insert(rows);
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor: "admin",
    action: "assessment_code.generated",
    object_type: "assessment_codes",
    object_id: null,
    payload: { count, label },
  });

  revalidatePath("/admin/codes");
}

export async function voidCode(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessment_codes")
    .update({ status: "void" })
    .eq("id", id)
    .eq("status", "unused");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/codes");
}
