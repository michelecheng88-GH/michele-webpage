"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const links = [
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/codes", label: "Codes" },
  ];

  return (
    <div className="border-b border-navy-900/10 bg-navy-950 text-cream-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold-400">
            Admin
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? "text-gold-400"
                  : "text-cream-100/70 hover:text-cream-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-cream-100/70 hover:text-cream-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
