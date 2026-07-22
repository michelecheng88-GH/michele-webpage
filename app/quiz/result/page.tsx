"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { DECISION_KEY, type DecisionPayload } from "@/lib/assessment/session";
import { scoreDecisionCheck, type PillarStatus } from "@/lib/assessment/scoring";
import { matchIndustryContext } from "@/lib/assessment/industry-context";
import { pillarAction, type Action } from "@/lib/assessment/advice";
import { PILLARS, type Pillar } from "@/lib/assessment/model";
import { insertLead } from "@/lib/data/leads";

const VERDICT_STYLES: Record<string, { banner: string; icon: string }> = {
  tier1: { banner: "border-green-600 bg-green-50", icon: "✅" },
  tier2: { banner: "border-amber-500 bg-amber-50", icon: "⚠️" },
  tier3: { banner: "border-red-600 bg-red-50", icon: "❌" },
};

const STATUS_BADGES: Record<PillarStatus, { label: string; cls: string }> = {
  pass: { label: "Ready", cls: "bg-green-50 text-green-700" },
  caution: { label: "Needs work", cls: "bg-amber-50 text-amber-700" },
  high: { label: "Fix first", cls: "bg-red-50 text-red-700" },
};

export default function DecisionResultPage() {
  const [status, setStatus] = useState<"loading" | "no-result" | "ready">("loading");
  const [payload, setPayload] = useState<DecisionPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(DECISION_KEY);
    if (!raw) return setStatus("no-result");
    try {
      const parsed = JSON.parse(raw) as DecisionPayload;
      if (!parsed?.context || !Array.isArray(parsed?.answers)) return setStatus("no-result");
      setPayload(parsed);
      setStatus("ready");
    } catch {
      setStatus("no-result");
    }
  }, []);

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-3xl animate-pulse px-6 py-20">
        <div className="h-4 w-32 rounded bg-navy-900/10" />
        <div className="mt-4 h-10 w-2/3 rounded bg-navy-900/10" />
        <div className="mt-10 h-64 rounded-2xl bg-navy-900/10" />
      </main>
    );
  }

  if (status === "no-result" || !payload) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-navy-950">No result found</h1>
        <p className="mt-3 text-navy-800/80">Please take the Decision Check first to see your result.</p>
        <Link
          href="/quiz"
          className="mt-8 rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-gold-500 hover:text-navy-950"
        >
          Take the Decision Check
        </Link>
      </main>
    );
  }

  return <ResultReady payload={payload} />;
}

function ResultReady({ payload }: { payload: DecisionPayload }) {
  const { context } = payload;
  const result = useMemo(() => scoreDecisionCheck(payload.answers), [payload]);
  const ctx = useMemo(() => matchIndustryContext(context.industry), [context.industry]);
  const [submitted, setSubmitted] = useState(false);

  // 12-month action plan: flagged pillars first (high, then caution), padded to 3.
  const actions: Action[] = useMemo(() => {
    const order: Record<PillarStatus, number> = { high: 0, caution: 1, pass: 2 };
    const flagged = [...result.postureByPillar]
      .filter((p) => p.status !== "pass")
      .sort((a, b) => order[a.status] - order[b.status])
      .map((p) => p.pillar);
    const list = flagged.map((p) => pillarAction(p, ctx));
    const fillOrder: Pillar[] = ["E", "R", "S", "A", "F"];
    for (const p of fillOrder) {
      if (list.length >= 3) break;
      if (!list.some((a) => a.pillar === p)) list.push(pillarAction(p, ctx));
    }
    return list.slice(0, 3);
  }, [result, ctx]);

  const style = VERDICT_STYLES[result.verdict.id];
  const chips = [context.industry, context.companySize, context.painPoint, context.goal].filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
        Your S.A.F.E.R. AI™ Decision
      </p>

      <div className={`mt-4 rounded-2xl border-2 p-6 ${style.banner}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{style.icon}</span>
          <h1 className="text-2xl font-bold text-navy-950 md:text-3xl">{result.verdict.headline}</h1>
        </div>
        <p className="mt-4 font-medium text-navy-900">{result.verdict.decision}</p>
        <p className="mt-2 text-sm text-navy-800/80">{result.verdict.guidance}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {chips.map((chip) => (
          <span key={chip} className="rounded-full bg-cream-100 px-3 py-1.5 font-medium text-navy-800">
            {chip}
          </span>
        ))}
      </div>

      {/* Pillar posture snapshot */}
      <h2 className="mt-10 text-xl font-bold text-navy-950">Your readiness at a glance</h2>
      <p className="mt-1 text-sm text-navy-800/70">
        A quick read across the five SAFER pillars. The full picture — with your Success Score and
        Pilot-to-Scale Success Index™ — is in the paid Readiness Assessment.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {result.postureByPillar.map((p) => {
          const badge = STATUS_BADGES[p.status];
          const def = PILLARS.find((x) => x.key === p.pillar)!;
          return (
            <div
              key={p.pillar}
              className="flex items-center justify-between gap-3 rounded-2xl border border-navy-900/10 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-950 font-bold text-gold-400">
                  {p.pillar}
                </span>
                <div>
                  <p className="font-semibold text-navy-950">{p.name}</p>
                  <p className="text-xs italic text-navy-800/60">{def.tagline}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
            </div>
          );
        })}
      </div>

      {/* 12-month action plan */}
      <h2 className="mt-10 text-xl font-bold text-navy-950">Start now — see results within 12 months</h2>
      <div className="mt-4 flex flex-col gap-4">
        {actions.map((rec, i) => (
          <div key={rec.pillar} className="flex gap-4 rounded-2xl border border-navy-900/10 bg-white p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">
              {i + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-navy-950">{rec.title}</p>
                <span className="rounded-full bg-cream-100 px-2 py-0.5 text-xs font-medium text-navy-800">
                  {rec.timeframe}
                </span>
              </div>
              <p className="mt-1 text-sm text-navy-800/80">{rec.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upsell to paid Readiness Assessment */}
      <UpsellCard />

      {/* Lead capture */}
      <div className="mt-10">
        {submitted ? <ThankYou /> : <LeadForm payload={payload} onSuccess={() => setSubmitted(true)} />}
      </div>
    </main>
  );
}

function UpsellCard() {
  return (
    <div className="mt-12 rounded-2xl border-2 border-gold-500 bg-navy-950 p-7 text-cream-100">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
        Go deeper · Paid report
      </p>
      <h3 className="mt-2 text-2xl font-bold text-cream-50">The full AI Readiness Assessment</h3>
      <p className="mt-3 text-sm text-cream-100/85">
        A comprehensive, industry-specific report ($200) that turns this snapshot into two defensible
        numbers your board can act on:
      </p>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {[
          "AI Implementation Success Score (how ready you are today)",
          "Pilot-to-Scale Success Index™ — PSSI (will you reach scale?)",
          "Recommended actions, prioritised by severity",
          "Delivered as an editable Word document",
        ].map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-gold-400">◆</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/assessment"
        className="mt-6 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
      >
        Get the full Readiness Assessment →
      </Link>
      <p className="mt-3 text-xs text-cream-100/60">
        Readiness drifts as your organisation changes — most clients re-score each quarter to track
        each pillar over time.
      </p>
    </div>
  );
}

type FormState = { first_name: string; last_name: string; company: string; email: string; phone: string };
const EMPTY_FORM: FormState = { first_name: "", last_name: "", company: "", email: "", phone: "" };

function LeadForm({ payload, onSuccess }: { payload: DecisionPayload; onSuccess: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.first_name.trim()) next.first_name = "Required";
    if (!form.last_name.trim()) next.last_name = "Required";
    if (!form.company.trim()) next.company = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await insertLead({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        biggest_challenge: payload.context.painPoint || undefined,
        challenge_detail: `Industry: ${payload.context.industry} · Goal: ${payload.context.goal} · Timeline: ${payload.context.timeline}`,
      });
      onSuccess();
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-8">
      <h2 className="text-xl font-bold text-navy-950">Want Michele to walk you through this?</h2>
      <p className="mt-2 text-sm text-navy-800/70">
        Leave your details for a free 30-minute call on your result and next steps.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="First name" error={errors.first_name}>
          <input className={inputCls} value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
        </Field>
        <Field label="Last name" error={errors.last_name}>
          <input className={inputCls} value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
        </Field>
        <Field label="Company" error={errors.company}>
          <input className={inputCls} value={form.company} onChange={(e) => update("company", e.target.value)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} />
        </Field>
        <Field label="Phone (optional)" error={errors.phone} full>
          <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{submitError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-navy-950 px-6 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60 sm:col-span-2"
        >
          {submitting ? "Submitting…" : "Book my free call"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-navy-800">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function ThankYou() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  return (
    <div className="rounded-2xl border border-gold-500 bg-white p-8 text-center">
      <h2 className="text-2xl font-bold text-navy-950">You&apos;re all set 🎉</h2>
      <p className="mt-3 text-navy-800/80">
        Thanks — we&apos;ve saved your details and will be in touch. Prefer to book now?
      </p>
      {calendlyUrl ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-navy-900/10">
          <iframe src={calendlyUrl} title="Book a call with Michele Cheng" className="h-[650px] w-full" />
        </div>
      ) : (
        <p className="mt-8 text-sm text-navy-800/60">Booking link coming soon — we&apos;ll reach out by email.</p>
      )}
    </div>
  );
}
