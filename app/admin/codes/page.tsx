import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { generateCodes, voidCode } from "./actions";

export const metadata: Metadata = { title: "Assessment Codes — Admin" };

type CodeRow = {
  id: string;
  code: string;
  status: string;
  label: string | null;
  amount: number | null;
  created_at: string;
  redeemed_at: string | null;
  redeemed_email: string | null;
  redeemed_phone: string | null;
};

const STATUS_CLS: Record<string, string> = {
  unused: "bg-green-50 text-green-700",
  redeemed: "bg-navy-950/10 text-navy-800",
  void: "bg-red-50 text-red-700",
};

export default async function AdminCodesPage() {
  let codes: CodeRow[] = [];
  let loadError = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assessment_codes")
      .select("id, code, status, label, amount, created_at, redeemed_at, redeemed_email, redeemed_phone")
      .order("created_at", { ascending: false });
    if (error) throw error;
    codes = (data ?? []) as CodeRow[];
  } catch {
    loadError = true;
  }

  const unused = codes.filter((c) => c.status === "unused").length;
  const redeemed = codes.filter((c) => c.status === "redeemed").length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-navy-950">Assessment Codes</h1>
      <p className="mt-1 text-sm text-navy-800/70">
        Issue a code after a buyer pays; they redeem it on the Readiness Assessment page.{" "}
        <span className="font-medium text-navy-950">{unused} unused</span> · {redeemed} redeemed ·{" "}
        {codes.length} total
      </p>

      {/* Generate */}
      <form
        action={generateCodes}
        className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-navy-900/10 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">How many</span>
          <input name="count" type="number" min={1} max={50} defaultValue={1} className={inputCls + " w-24"} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">Label (buyer / invoice ref)</span>
          <input name="label" className={inputCls + " w-64"} placeholder="e.g. Acme Bank — INV-1024" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">Amount (S$)</span>
          <input name="amount" type="number" defaultValue={200} className={inputCls + " w-28"} />
        </label>
        <button
          type="submit"
          className="rounded-full bg-navy-950 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
        >
          Generate codes
        </button>
      </form>

      {loadError ? (
        <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load codes. Make sure migration 0003 has been applied and you&apos;re logged in.
        </p>
      ) : codes.length === 0 ? (
        <p className="mt-10 text-navy-800/60">No codes yet — generate a batch above.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-navy-900/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-900/10 bg-navy-950/5 text-xs font-semibold uppercase tracking-wide text-navy-800/70">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Redeemed by</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-navy-900/5 last:border-0 hover:bg-cream-50">
                  <td className="px-4 py-3 font-mono font-semibold text-navy-950">{c.code}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[c.status] ?? ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-800/80">{c.label ?? "—"}</td>
                  <td className="px-4 py-3 text-navy-800/80">
                    {c.redeemed_email ? (
                      <span>
                        {c.redeemed_email}
                        <br />
                        <span className="text-xs text-navy-800/60">{c.redeemed_phone}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy-800/70">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "unused" && (
                      <form action={voidCode}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                          Void
                        </button>
                      </form>
                    )}
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

const inputCls =
  "rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";
