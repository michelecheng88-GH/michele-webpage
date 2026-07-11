import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const legacyValid = await isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authed = Boolean(user) || legacyValid;

  return (
    <div className="min-h-screen bg-cream-100">
      {authed && <AdminNav />}
      {children}
    </div>
  );
}
