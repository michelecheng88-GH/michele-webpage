import Link from "next/link";
import type { Metadata } from "next";
import { PILLARS } from "@/lib/assessment/model";

export const metadata: Metadata = {
  title: "The SAFER Framework — AI Implementation Success",
  description:
    "SAFER™ is a practical, business-first framework that takes any organisation from AI ambition to enterprise-scale adoption — five disciplined pillars, for logistics, manufacturing, financial services, F&B, retail and SMEs.",
};

const PILLAR_DETAIL: Record<string, { question: string; outputs: string }> = {
  S: {
    question: "Are we solving the right business problem, and who owns it?",
    outputs: "A costed problem, a named business owner, and measurable outcomes with deadlines.",
  },
  A: {
    question: "Are we actually ready — data, technology and people?",
    outputs: "An honest readiness picture, a gap register, and your Success Score and PSSI™.",
  },
  F: {
    question: "Have we prepared the foundations before introducing AI?",
    outputs: "A single source of truth, governance roles, an AI usage policy and audit logging.",
  },
  E: {
    question: "Can AI be deployed safely, effectively and measurably?",
    outputs: "A guarded pilot with human checkpoints, evaluation checklists and a clear result.",
  },
  R: {
    question: "Can we sustain and scale what worked?",
    outputs: "A staged rollout, an operating model, and value measured against the baseline.",
  },
};

const INDUSTRIES_APPLIED: { sector: string; example: string }[] = [
  { sector: "Logistics & supply chain", example: "Route and load planning, and flagging at-risk deliveries — a dispatcher approves." },
  { sector: "Manufacturing", example: "Predictive maintenance and drafting quality reports — an engineer verifies." },
  { sector: "Financial services", example: "Assembling regulatory evidence (MAS TRM) and flagging exceptions — a human signs off." },
  { sector: "Food & beverage", example: "Demand forecasting and drafting stock orders — an outlet manager approves." },
  { sector: "Retail & eCommerce", example: "Drafting customer replies and flagging stock risks — a person confirms." },
  { sector: "SMEs (any sector)", example: "Taking one repetitive, costly task off your team — with a human owning the outcome." },
];

export default function FrameworkPage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">The framework</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-navy-950 md:text-5xl">
          SAFER™ — the AI Implementation Success Framework
        </h1>
        <p className="mt-6 text-lg text-navy-800">
          Most AI pilots don&apos;t fail on the technology. They fail because the business underneath
          isn&apos;t ready to scale them. SAFER is a practical, business-first framework that closes
          that <span className="font-semibold text-navy-950">Pilot-to-Scale Gap</span> — taking any
          organisation from AI ambition to enterprise-scale adoption in five disciplined pillars.
        </p>
        <p className="mt-4 text-base text-navy-800/80">
          It doesn&apos;t compete with governance standards — it operationalises them. ISO/IEC 42001,
          the NIST AI RMF and Singapore&apos;s guidance tell you <em>what good looks like</em>; SAFER
          tells you <em>what to do on Monday morning</em>. It works the same whether you run a
          warehouse, a factory floor, a bank, a restaurant group, a retail chain, or a lean SME.
        </p>
      </section>

      {/* Decision Check vs Framework */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-navy-900/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Start here · free</p>
              <h2 className="mt-2 text-xl font-bold text-navy-950">The S.A.F.E.R. AI™ Decision Check</h2>
              <p className="mt-3 text-sm text-navy-800/80">
                A 3-minute check that asks the sharp preliminary question: <em>should you be using AI on
                this — right now?</em> You get a clear Tier verdict and immediate actions you can start
                today to see results within 12 months.
              </p>
              <Link href="/quiz" className="mt-5 inline-block text-sm font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-500">
                Take the Decision Check →
              </Link>
            </div>
            <div className="rounded-2xl border border-navy-900/10 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Go deeper · paid</p>
              <h2 className="mt-2 text-xl font-bold text-navy-950">The AI Readiness Assessment</h2>
              <p className="mt-3 text-sm text-navy-800/80">
                A comprehensive report ($200) scoring you across all five pillars — your{" "}
                <strong>AI Implementation Success Score</strong> and{" "}
                <strong>Pilot-to-Scale Success Index™</strong> — with prioritised actions, delivered as
                an editable Word document.
              </p>
              <Link href="/assessment" className="mt-5 inline-block text-sm font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-500">
                Get the Readiness Assessment →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The five pillars */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">The five pillars</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">S · A · F · E · R</h2>
          <p className="mt-4 text-navy-800/80">
            Five stages, in sequence. Each answers one question and produces concrete outputs — so
            &quot;readiness&quot; stops being a vague idea and becomes a checklist you can act on.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          {PILLARS.map((pillar) => {
            const d = PILLAR_DETAIL[pillar.key];
            return (
              <div key={pillar.key} className="grid gap-4 rounded-2xl border border-navy-900/10 bg-white p-6 md:grid-cols-[64px_1fr]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-950 text-2xl font-bold text-gold-400">
                  {pillar.key}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-950">{pillar.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-gold-600">{d.question}</p>
                  <p className="mt-2 text-sm text-navy-800/80">
                    <span className="font-semibold text-navy-950">What it produces:</span> {d.outputs}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The two numbers */}
      <section className="bg-navy-950 py-20 text-cream-50">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">The two numbers</p>
          <h2 className="mt-3 text-3xl font-bold">Readiness you can put a number on</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-cream-100/15 bg-navy-900/40 p-7">
              <h3 className="text-xl font-bold text-cream-50">AI Implementation Success Score</h3>
              <p className="mt-2 text-sm text-cream-100/80">
                A weighted, <em>descriptive</em> measure of how ready you are today across the five
                pillars — so a healthy overall number can never hide a weak pillar.
              </p>
            </div>
            <div className="rounded-2xl border border-cream-100/15 bg-navy-900/40 p-7">
              <h3 className="text-xl font-bold text-cream-50">Pilot-to-Scale Success Index™</h3>
              <p className="mt-2 text-sm text-cream-100/80">
                A <em>predictive</em> measure of how likely you are to reach enterprise scale — because
                a few weaknesses (no owner, poor data, no governance) are disproportionately fatal.
              </p>
            </div>
          </div>
          <p className="mt-6 rounded-xl bg-gold-500 px-5 py-4 text-center text-sm font-semibold text-navy-950">
            Readiness drifts as your organisation changes — re-score each quarter to track each pillar
            over time. Peer benchmarking is coming soon.
          </p>
        </div>
      </section>

      {/* Across industries */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">One framework, every sector</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">The same discipline, applied to your world</h2>
          <p className="mt-4 text-navy-800/80">
            The pillars don&apos;t change; the examples do. A safe first AI use case usually means taking
            one repetitive, costly task off your team — with a human always approving the output.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {INDUSTRIES_APPLIED.map((row) => (
            <div key={row.sector} className="rounded-2xl border border-navy-900/10 bg-white p-6">
              <h3 className="font-bold text-navy-950">{row.sector}</h3>
              <p className="mt-2 text-sm text-navy-800/80">{row.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-navy-950">See where you stand</h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-800/80">
          Start with the free Decision Check, then go deeper with the full Readiness Assessment when
          you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/quiz" className="rounded-full bg-navy-950 px-8 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950">
            Take the free Decision Check
          </Link>
          <Link href="/assessment" className="rounded-full border border-navy-950/20 px-8 py-4 text-sm font-semibold text-navy-950 transition hover:border-gold-500 hover:text-gold-500">
            Get the Readiness Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
