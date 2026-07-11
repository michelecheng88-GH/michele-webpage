"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { QuizScoreResult, SaferKey } from "@/lib/quiz/scoring";
import { RECOMMENDATIONS } from "@/lib/quiz/recommendations";
import { insertLead, insertQuizResponse } from "@/lib/data/leads";

const QUIZ_RESULT_KEY = "safer-quiz-result";

const DIMENSION_LABELS: Record<SaferKey, string> = {
  S: "Sensitivity",
  A: "Accuracy",
  F: "Framing",
  E: "Explainability",
  R: "Responsibility",
};

const CHALLENGE_OPTIONS = [
  "Starting AI journey",
  "AI pilot stalled",
  "Data/inventory chaos",
  "ESG compliance",
  "Other",
];

type FormState = {
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  biggest_challenge: string;
  challenge_detail: string;
};

const EMPTY_FORM: FormState = {
  first_name: "",
  last_name: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  biggest_challenge: CHALLENGE_OPTIONS[0],
  challenge_detail: "",
};

export default function QuizResultPage() {
  const [status, setStatus] = useState<"loading" | "no-result" | "ready">("loading");
  const [result, setResult] = useState<QuizScoreResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(QUIZ_RESULT_KEY);
    if (!raw) {
      setStatus("no-result");
      return;
    }
    try {
      setResult(JSON.parse(raw));
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

  if (status === "no-result" || !result) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-navy-950">No quiz result found</h1>
        <p className="mt-3 text-navy-800/80">
          Please take the S.A.F.E.R. AI quiz first to see your profile.
        </p>
        <Link
          href="/quiz"
          className="mt-8 rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-gold-500 hover:text-navy-950"
        >
          Take the Quiz
        </Link>
      </main>
    );
  }

  return <ResultReady result={result} />;
}

function ResultReady({ result }: { result: QuizScoreResult }) {
  const [submitted, setSubmitted] = useState(false);
  const recommendations = RECOMMENDATIONS[result.band];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
        Your S.A.F.E.R. AI Profile
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 md:text-4xl">
        {result.band}
      </h1>
      <p className="mt-2 text-navy-800/80">
        Overall score: <span className="font-bold text-navy-950">{result.totalScore}</span> / 100
      </p>

      <div className="mt-8 grid gap-4 rounded-2xl border border-navy-900/10 bg-white p-6 sm:grid-cols-2">
        {(Object.keys(result.dimensionScores) as SaferKey[]).map((key) => {
          const score = result.dimensionScores[key];
          const pct = Math.round((score / 8) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-navy-950">{DIMENSION_LABELS[key]}</span>
                <span className="text-navy-800/70">{score}/8</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy-900/10">
                <div className="h-full rounded-full bg-gold-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-navy-950">Your recommendations</h2>
        <div className="mt-4 flex flex-col gap-4">
          {recommendations.map((rec) => (
            <div key={rec.title} className="rounded-2xl border border-navy-900/10 bg-white p-5">
              <p className="font-semibold text-navy-950">{rec.title}</p>
              <p className="mt-1 text-sm text-navy-800/80">{rec.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        {submitted ? (
          <ThankYou />
        ) : (
          <LeadCaptureForm result={result} onSuccess={() => setSubmitted(true)} />
        )}
      </div>
    </main>
  );
}

function LeadCaptureForm({
  result,
  onSuccess,
}: {
  result: QuizScoreResult;
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
        biggest_challenge: form.biggest_challenge,
        challenge_detail: form.challenge_detail.trim() || undefined,
      });
      await insertQuizResponse(leadId, result, RECOMMENDATIONS[result.band]);
      onSuccess();
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-8">
      <h2 className="text-xl font-bold text-navy-950">Get your full results &amp; book a call</h2>
      <p className="mt-2 text-sm text-navy-800/70">
        Tell us a bit about your business and we&apos;ll follow up with tailored next steps.
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
        <Field label="Biggest challenge" error={errors.biggest_challenge} full>
          <select
            className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            value={form.biggest_challenge}
            onChange={(e) => update("biggest_challenge", e.target.value)}
          >
            {CHALLENGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tell us more (optional)" error={errors.challenge_detail} full>
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
          {submitting ? "Submitting…" : "Get My Results & Book a Call"}
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
        Thanks — your S.A.F.E.R. AI profile has been saved. Pick a time below for a free 30-minute
        call to walk through your results.
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
