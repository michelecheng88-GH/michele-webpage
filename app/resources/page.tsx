import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources — SAFER AI",
  description: "Checklists and templates to put the SAFER framework into practice. Coming soon.",
};

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-28 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">Resources</p>
      <h1 className="mt-3 text-3xl font-bold text-navy-950 md:text-4xl">
        Checklists &amp; templates
      </h1>
      <div className="mt-8 rounded-2xl border-2 border-dashed border-gold-500/60 bg-white p-10">
        <span className="text-4xl">🚧</span>
        <h2 className="mt-4 text-xl font-bold text-navy-950">Work in progress</h2>
        <p className="mt-3 text-navy-800/80">
          We&apos;re preparing downloadable SAFER checklists and templates — the data-readiness
          checklist, the AI project charter, the governance one-pager, and more. Check back soon.
        </p>
        <p className="mt-6 text-sm text-navy-800/60">
          Want early access when they&apos;re ready?{" "}
          <Link href="/contact" className="font-semibold text-gold-600 underline">
            Let Michele know
          </Link>
          .
        </p>
      </div>
      <div className="mt-10">
        <Link
          href="/quiz"
          className="rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
        >
          Take the free Decision Check
        </Link>
      </div>
    </main>
  );
}
