import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeadById } from "@/lib/data/admin-leads";
import { LeadStatusForm } from "@/components/admin/LeadStatusForm";
import { LeadGrantForm } from "@/components/admin/LeadGrantForm";

export const metadata: Metadata = { title: "Lead detail — Admin" };

const DIMENSION_LABELS: Record<string, string> = {
  S: "Sensitivity",
  A: "Accuracy",
  F: "Framing",
  E: "Explainability",
  R: "Responsibility",
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let lead: Awaited<ReturnType<typeof getLeadById>> = null;
  let loadError = false;
  try {
    lead = await getLeadById(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load this lead. Please refresh the page.
        </p>
      </main>
    );
  }

  if (!lead) notFound();

  const quiz = lead.quiz_responses?.[0];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/leads" className="text-sm font-semibold text-navy-800 hover:text-gold-500">
        ← Back to Leads
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-navy-950">
        {lead.first_name} {lead.last_name}
      </h1>
      <p className="text-navy-800/70">{lead.company}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Contact info</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <Row label="Email" value={lead.email} />
            <Row label="Phone" value={lead.phone ?? "—"} />
            <Row label="Role" value={lead.role ?? "—"} />
            <Row label="Company" value={lead.company} />
            <Row label="Source" value={lead.source ?? "—"} />
            <Row label="Biggest challenge" value={lead.biggest_challenge ?? "—"} />
            <Row label="Challenge detail" value={lead.challenge_detail ?? "—"} />
            <Row label="Created" value={new Date(lead.created_at).toLocaleString("en-SG")} />
          </dl>
        </section>

        <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Quiz result</h2>
          {quiz ? (
            <>
              <p className="mt-3 text-lg font-bold text-navy-950">{quiz.profile_band}</p>
              <p className="text-sm text-navy-800/70">Score: {quiz.total_score} / 100</p>
              <div className="mt-4 flex flex-col gap-2">
                {(["S", "A", "F", "E", "R"] as const).map((key) => {
                  const score = quiz[`${key.toLowerCase()}_score` as keyof typeof quiz] as number;
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-navy-800">{DIMENSION_LABELS[key]}</span>
                      <span className="font-medium text-navy-950">{score}/8</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-navy-800/60">No quiz response linked.</p>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Status &amp; notes</h2>
          <div className="mt-4">
            <LeadStatusForm leadId={lead.id} initialStatus={lead.status} initialNotes={lead.notes ?? ""} />
          </div>
        </section>

        <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
          <h2 className="font-semibold text-navy-950">Grant tracker</h2>
          <div className="mt-4">
            <LeadGrantForm
              leadId={lead.id}
              initialGrantName={lead.grant_name ?? ""}
              initialGrantStatus={lead.grant_status ?? ""}
              initialGrantNotes={lead.grant_notes ?? ""}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-navy-800/60">{label}</dt>
      <dd className="text-right font-medium text-navy-950">{value}</dd>
    </div>
  );
}
