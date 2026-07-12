import { createClient } from "@/lib/supabase/client";

export type ContactInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  help: string;
  company?: string;
};

export async function insertContactLead(input: ContactInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("leads").insert({
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
    // `company` is NOT NULL in the schema; store empty string when omitted.
    company: input.company?.trim() || "",
    challenge_detail: input.help,
    biggest_challenge: "Book a call",
    source: "contact",
    status: "New",
  });

  if (error) throw new Error(error.message);
}
