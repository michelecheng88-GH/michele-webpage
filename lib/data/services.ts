import { createClient } from "@/lib/supabase/server";

export type Service = {
  id: string;
  title: string;
  tier_number: number;
  short_description: string;
  full_description: string;
  cta_label: string;
  is_featured: boolean;
};

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, title, tier_number, short_description, full_description, cta_label, is_featured")
    .order("tier_number", { ascending: true });

  if (error) throw new Error(`Failed to load services: ${error.message}`);
  return data ?? [];
}
