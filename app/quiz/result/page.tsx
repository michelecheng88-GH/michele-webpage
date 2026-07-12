"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { QuizResultPayload } from "@/lib/quiz/engine";
import { buildNarrative, buildRecommendations } from "@/lib/quiz/engine";
import { DIMENSION_LINES } from "@/lib/quiz/schema";
import { insertLead, insertQuizResponse } from "@/lib/data/leads";

const QUIZ_RESULT_KEY = "safer-quiz-result";

const VERDICT_STYLES: Record<string, { banner: string; badge: string; icon: string }> = {
  green: { banner: "border-green-600 bg-green-50", badge: "bg-green-600", icon: "✅" },
  amber: { banner: "border-amber-500 bg-amber-50", badge: "bg-amber-500", icon: "⚠️" },
  red: { banner: "border-red-600 bg-red-50", badge: "bg-red-600", icon: "❌" },
};

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  pass: { label: "Pass", cls: "bg-green-50 text-green-700" },
  caution: { label: "Caution", cls: "bg-amber-50 text-amber-700" },
  high: { label: "High risk", cls: "bg-red-50 text-red-700" },
};

export default function QuizResultPage() {
  const [status, setStatus] = useState<"loading" | "no-result" | "ready">("loading");
  const [payload, setPayload] = useState<QuizResultPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(QUIZ_RESULT_KEY);
    if (!raw) {
      setStatus("no-result");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as QuizResultPayload;
      // Guard against stale payloads from the previous quiz version.
      if (!parsed?.verdict?.id || !parsed?.context || !Array.isArray(parsed?.dimensions)) {
        setStatus("no-result");
        return;
      }
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
        <p className="mt-3 text-navy-800/80">
          Please take the S.A.F.E.R. AI Decision Check first to see your result.
        </p>
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

function ResultReady({ payload }: { payload: QuizResultPayload }) {
  const [submitted, setSubmitted] = useState(false);
  const recommendations = buildRecommendations(payload);
  const narrative = buildNarrative(payload);
  const style = VERDICT_STYLES[payload.verdict.id];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
        Your S.A.F.E.R. AI™ Decision
      </p>

      {/* Verdict banner */}
      <div className={`mt-4 rounded-2xl border-2 p-6 ${style.banner}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{style.icon}</span>
          <h1 className="text-2xl font-bold text-navy-950 md:text-3xl">
            {payload.verdict.headline}
          </h1>
        </div>
        <p className="mt-4 text-navy-800">{narrative}</p>
        <p className="mt-3 text-sm text-navy-800/70">
          Readiness score: <span className="font-bold text-navy-950">{payload.totalScore}</span> / 100
        </p>
      </div>

      {/* Context chips */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {[payload.context.industry, payload.context.challenge, payload.context.area]
          .filter(Boolean)
          .map((chip) => (
            <span key={chip} className="rounded-full bg-cream-100 px-3 py-1.5 font-medium text-navy-800">
              {chip}
            </span>
          ))}
      </div>

      {/* Decision rule */}
      <p className="mt-6 rounded-xl bg-navy-950 px-5 py-4 text-sm text-cream-100/90">
        <span className="font-semibold text-gold-400">The decision rule:</span> all 5 checks pass →
        use AI confidently. 1–2 risks → use AI with controls. 3+ risks → do <em>not</em> use AI yet.
        Your result: <span className="font-semibold text-cream-50">{payload.riskCount} of 5 checks flagged risk.</span>
      </p>

      {/* Dimension breakdown */}
      <div className="mt-8 flex flex-col gap-3">
        {payload.dimensions.map((dim) => {
          const badge = STATUS_BADGES[dim.status];
          const flagged = payload.answers.filter(
            (a) => a.dimension === dim.dimension && (a.risk ?? 0) > 0,
          );
          return (
            <div key={dim.dimension} className="rounded-2xl border border-navy-900/10 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-950 font-bold text-gold-400">
                    {dim.dimension}
                  </span>
                  <div>
                    <p className="font-semibold text-navy-950">{dim.name}</p>
                    <p className="text-xs italic text-navy-800/60">
                      {DIMENSION_LINES[dim.dimension]}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>

              {flagged.length > 0 && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-medium text-navy-800/80">
                    What raised this flag
                  </summary>
                  <ul className="mt-2 flex flex-col gap-2 border-l-2 border-gold-500/50 pl-4">
                    {flagged.map((a) => (
                      <li key={a.nodeId} className="text-navy-800/80">
                        <span className="font-medium text-navy-950">{a.question}</span>
                        <br />
                        Your answer: {a.optionLabel}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-navy-950">Your action plan</h2>
        <div className="mt-4 flex flex-col gap-4">
          {recommendations.map((rec, i) => (
            <div key={rec.title} className="flex gap-4 rounded-2xl border border-navy-900/10 bg-white p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-navy-950">{rec.title}</p>
                <p className="mt-1 text-sm text-navy-800/80">{rec.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        {submitted ? (
          <ThankYou />
        ) : (
          <LeadCaptureForm payload={payload} onSuccess={() => setSubmitted(true)} />
        )}
      </div>
    </main>
  );
}

type FormState = {
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  challenge_detail: string;
};

const EMPTY_FORM: FormState = {
  first_name: "",
  last_name: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  challenge_detail: "",
};

function LeadCaptureForm({
  payload,
  onSuccess,
}: {
  payload: QuizResultPayload;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.first_name.trim()) next.first_name = "First name is required";
    if (!form.last_name.trim()) next.last_name = "Last name is required";
    if (!form.company.trim()) next.company = "Company is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const leadId = await insertLead({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        company: form.company.trim(),
        role: form.role.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        biggest_challenge: payload.context.challenge || undefined,
        challenge_detail: form.challenge_detail.trim() || undefined,
      });
      await insertQuizResponse(leadId, payload, buildRecommendations(payload));
      onSuccess();
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-8">
      <h2 className="text-xl font-bold text-navy-950">Get your full report &amp; book a call</h2>
      <p className="mt-2 text-sm text-navy-800/70">
        Your stated challenge:{" "}
        <span className="font-medium text-navy-950">{payload.context.challenge || "—"}</span>. Tell
        us a bit about your business and we&apos;ll follow up with tailored next steps.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="First name" error={errors.first_name}>
          <input
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
          />
        </Field>
        <Field label="Last name" error={errors.last_name}>
          <input
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
          />
        </Field>
        <Field label="Company" error={errors.company}>
          <input
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </Field>
        <Field label="Role" error={errors.role}>
          <input
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Anything else about the problem? (optional)" error={errors.challenge_detail} full>
          <textarea
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            rows={3}
            value={form.challenge_detail}
            onChange={(e) => update("challenge_detail", e.target.value)}
          />
        </Field>

        {submitError && (
          <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 mt-2 rounded-full bg-navy-950 px-6 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Get My Report & Book a Call"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
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
        Thanks — your S.A.F.E.R. AI decision report has been saved. Pick a time below for a free
        30-minute call to walk through your result.
      </p>
      {calendlyUrl ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-navy-900/10">
          <iframe
            src={calendlyUrl}
            title="Book a call with Michele Cheng"
            className="h-[650px] w-full"
          />
        </div>
      ) : (
        <p className="mt-8 text-sm text-navy-800/60">
          Booking link coming soon — we&apos;ll be in touch by email.
        </p>
      )}
    </div>
  );
}
