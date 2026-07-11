import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authed = await isValidAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  return (
    <div className="min-h-screen bg-cream-100">
      {authed && <AdminNav />}
      {children}
    </div>
  );
}
