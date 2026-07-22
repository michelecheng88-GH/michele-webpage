"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { DECISION_KEY, READINESS_KEY, type DecisionPayload } from "@/lib/assessment/session";
import { READINESS_QUESTIONS, fillTokens, PILLAR_NAME } from "@/lib/assessment/model";
import { matchIndustryContext } from "@/lib/assessment/industry-context";
import type { AnswerRecord } from "@/lib/assessment/scoring";

type Phase = "loading" | "no-decision" | "intro" | "questions" | "gate" | "done";

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [decision, setDecision] = useState<DecisionPayload | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem(DECISION_KEY);
    if (!raw) return setPhase("no-decision");
    try {
      const parsed = JSON.parse(raw) as DecisionPayload;
      if (!parsed?.context || !Array.isArray(parsed?.answers)) return setPhase("no-decision");
      setDecision(parsed);
      // restore in-progress readiness answers if any
      const r = sessionStorage.getItem(READINESS_KEY);
      if (r) {
        try {
          setAnswers(JSON.parse(r) as AnswerRecord[]);
        } catch {}
      }
      setPhase("intro");
    } catch {
      setPhase("no-decision");
    }
  }, []);

  const ctx = useMemo(
    () => matchIndustryContext(decision?.context.industry),
    [decision?.context.industry],
  );

  const questions = useMemo(
    () =>
      READINESS_QUESTIONS.map((q) => ({
        ...q,
        question: fillTokens(q.question, ctx),
        help: q.help ? fillTokens(q.help, ctx) : undefined,
      })),
    [ctx],
  );

  function answer(optionId: string) {
    const q = questions[cursor];
    const opt = q.options.find((o) => o.id === optionId)!;
    const rec: AnswerRecord = {
      questionId: q.id,
      pillar: q.pillar,
      optionId: opt.id,
      label: opt.label,
      risk: opt.risk,
      points: opt.points,
    };
    const next = [...answers.filter((a) => a.questionId !== q.id), rec];
    setAnswers(next);
    sessionStorage.setItem(READINESS_KEY, JSON.stringify(next));
    if (cursor + 1 >= questions.length) setPhase("gate");
    else setCursor(cursor + 1);
  }

  if (phase === "loading") {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-navy-800/60">Loading…</div>;
  }

  if (phase === "no-decision") {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">AI Readiness Assessment</p>
        <h1 className="mt-3 text-2xl font-bold text-navy-950">Start with the free Decision Check</h1>
        <p className="mt-3 text-navy-800/80">
          The paid Readiness Assessment builds on your Decision Check answers, so it&apos;s tailored to
          your industry and goals. Please take the free 3-minute check first.
        </p>
        <Link
          href="/quiz"
          className="mt-8 rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-gold-500 hover:text-navy-950"
        >
          Take the free Decision Check
        </Link>
      </main>
    );
  }

  if (phase === "intro" && decision) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
          AI Readiness Assessment · Paid report
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy-950">Your comprehensive readiness report</h1>
        <p className="mt-4 text-navy-800/80">
          A few deeper questions — tailored to <span className="font-semibold text-navy-950">{ctx.label}</span> —
          then you&apos;ll get an editable Word report with your <strong>AI Implementation Success Score</strong>,
          your <strong>Pilot-to-Scale Success Index™ (PSSI™)</strong>, and prioritised actions.
        </p>
        <div className="mt-6 rounded-2xl border border-navy-900/10 bg-white p-6 text-sm text-navy-800/80">
          <p className="font-semibold text-navy-950">How it works</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>Answer {questions.length} deeper questions (about 4 minutes).</li>
            <li>Enter your redemption code, email and mobile number.</li>
            <li>Your Word report downloads instantly.</li>
          </ol>
          <p className="mt-4 text-xs text-navy-800/60">
            The report is a paid service ($200). After payment you&apos;ll receive a one-time code.
            Don&apos;t have one yet?{" "}
            <Link href="/contact" className="font-semibold text-gold-600 underline">
              Contact Michele
            </Link>{" "}
            to purchase.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPhase(answers.length >= questions.length ? "gate" : "questions")}
          className="mt-8 rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
        >
          {answers.length >= questions.length ? "Continue to report" : "Start the assessment →"}
        </button>
      </main>
    );
  }

  if (phase === "questions") {
    const q = questions[cursor];
    const progress = Math.round((cursor / questions.length) * 100);
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">AI Readiness Assessment</p>
        <div className="mb-10 mt-4">
          <div className="flex items-center justify-between text-sm text-navy-800/70">
            <span>Question {cursor + 1} of {questions.length}</span>
            <span className="font-semibold text-gold-500">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-900/10">
            <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="mb-3 inline-block rounded-full bg-navy-950 px-3 py-1 text-xs font-semibold text-gold-400">
          {q.pillar} — {PILLAR_NAME[q.pillar]}
        </span>
        <h1 className="text-2xl font-bold leading-snug text-navy-950 md:text-3xl">{q.question}</h1>
        {q.help && <p className="mt-2 text-sm text-navy-800/60">{q.help}</p>}
        <div className="mt-8 flex flex-col gap-3">
          {q.options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => answer(o.id)}
              className="rounded-xl border border-navy-900/10 bg-white px-6 py-4 text-left font-medium text-navy-800 transition hover:border-gold-500/50"
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-10">
          <button
            type="button"
            onClick={() => (cursor === 0 ? setPhase("intro") : setCursor(cursor - 1))}
            className="text-sm font-semibold text-navy-800"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  if (phase === "gate" && decision) {
    return <GateForm decision={decision} readinessAnswers={answers} onDone={() => setPhase("done")} />;
  }

  if (phase === "done") {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="mt-4 text-2xl font-bold text-navy-950">Your report is downloading</h1>
        <p className="mt-3 text-navy-800/80">
          Check your downloads folder for your AI Readiness Assessment (.docx). If it didn&apos;t
          start, your code may already be used — please{" "}
          <Link href="/contact" className="font-semibold text-gold-600 underline">
            contact Michele
          </Link>
          .
        </p>
        <p className="mt-6 text-sm text-navy-800/60">
          Readiness drifts as your organisation changes — re-score each quarter to track your progress.
        </p>
      </main>
    );
  }

  return null;
}

function GateForm({
  decision,
  readinessAnswers,
  onDone,
}: {
  decision: DecisionPayload;
  readinessAnswers: AnswerRecord[];
  onDone: () => void;
}) {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return setError("Please enter your redemption code.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (!phone.trim()) return setError("Please enter your mobile number.");

    setBusy(true);
    try {
      const answers = [...decision.answers, ...readinessAnswers];
      const res = await fetch("/api/assessment/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(), context: decision.context, answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") || "";
      const m = cd.match(/filename="(.+?)"/);
      a.download = m?.[1] || "AI-Readiness-Assessment.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      sessionStorage.removeItem(READINESS_KEY);
      onDone();
    } catch {
      setError("Network error — please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">Almost there</p>
      <h1 className="mt-3 text-2xl font-bold text-navy-950">Unlock your report</h1>
      <p className="mt-2 text-sm text-navy-800/70">
        Enter your redemption code and contact details. Email and mobile are required so Michele can
        reach you if there&apos;s any issue with your paid report.
      </p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">Company (for the report cover)</span>
          <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your organisation" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">Email <span className="text-red-600">*</span></span>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">Mobile number <span className="text-red-600">*</span></span>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+65 …" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-800">Redemption code <span className="text-red-600">*</span></span>
          <input className={`${inputCls} uppercase`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAFER-XXXX-XXXX" />
        </label>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-full bg-navy-950 px-6 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60"
        >
          {busy ? "Generating your report…" : "Generate & download my report"}
        </button>
        <p className="text-center text-xs text-navy-800/50">
          Don&apos;t have a code?{" "}
          <Link href="/contact" className="font-semibold text-gold-600 underline">
            Contact Michele
          </Link>{" "}
          to purchase the $200 report.
        </p>
      </form>
    </main>
  );
}

const inputCls =
  "rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";
