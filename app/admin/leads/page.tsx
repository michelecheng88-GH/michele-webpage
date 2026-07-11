import Link from "next/link";
import type { Metadata } from "next";
import { getLeadsForAdmin } from "@/lib/data/admin-leads";

export const metadata: Metadata = { title: "Leads — Admin" };

export default async function AdminLeadsPage() {
  let leads: Awaited<ReturnType<typeof getLeadsForAdmin>> = [];
  let loadError = false;
  try {
    leads = await getLeadsForAdmin();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load leads. Please refresh the page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold text-navy-950">Leads</h1>
      <p className="mt-1 text-sm text-navy-800/70">{leads.length} total</p>

      {leads.length === 0 ? (
        <p className="mt-10 text-navy-800/60">No leads yet — they&apos;ll appear here as visitors complete the quiz.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-navy-900/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-900/10 bg-navy-950/5 text-xs font-semibold uppercase tracking-wide text-navy-800/70">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Band</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Grant</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-navy-900/5 last:border-0 hover:bg-cream-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-navy-950 hover:text-gold-500">
                      {lead.first_name} {lead.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-navy-800/80">{lead.company}</td>
                  <td className="px-4 py-3 text-navy-800/80">
                    {lead.quiz_responses?.[0]?.profile_band ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-navy-800/80">{lead.grant_status ?? "—"}</td>
                  <td className="px-4 py-3 text-navy-800/60">
                    {new Date(lead.created_at).toLocaleDateString("en-SG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-blue-50 text-blue-700",
    Contacted: "bg-amber-50 text-amber-700",
    Qualified: "bg-purple-50 text-purple-700",
    Proposal: "bg-gold-500/10 text-gold-500",
    Closed: "bg-green-50 text-green-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] ?? "bg-navy-900/5 text-navy-800"}`}>
      {status}
    </span>
  );
}
