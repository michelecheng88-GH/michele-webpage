"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { INDUSTRIES } from "@/lib/content/industries";
import {
  buildDecisionSteps,
  DECISION_KEY,
  type DecisionContext,
  type Step,
} from "@/lib/assessment/session";
import { PILLAR_NAME } from "@/lib/assessment/model";
import type { AnswerRecord } from "@/lib/assessment/scoring";

const EMPTY_CONTEXT: DecisionContext = {
  industry: "",
  companySize: "",
  role: "",
  painPoint: "",
  goal: "",
  timeline: "",
};

export default function DecisionCheckPage() {
  const router = useRouter();
  // Industry is step 0 (drives everything after it), tracked separately.
  const [industry, setIndustry] = useState<string>("");
  const [cursor, setCursor] = useState(0); // index into `steps` AFTER industry is chosen
  const [context, setContext] = useState<DecisionContext>(EMPTY_CONTEXT);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [freeId, setFreeId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");

  const steps: Step[] = useMemo(() => (industry ? buildDecisionSteps(industry) : []), [industry]);

  // Total = industry + all steps. Progress by how many answered.
  const answeredCount = (industry ? 1 : 0) + cursor;
  const total = 1 + (steps.length || 11);
  const progress = Math.round((answeredCount / total) * 100);

  function finish(finalContext: DecisionContext, finalAnswers: AnswerRecord[]) {
    const payload = { context: finalContext, answers: finalAnswers };
    sessionStorage.setItem(DECISION_KEY, JSON.stringify(payload));
    router.push("/quiz/result");
  }

  function chooseIndustry(label: string, text?: string) {
    const value = text?.trim() || label;
    setContext((c) => ({ ...c, industry: value }));
    setIndustry(value);
    setCursor(0);
    setFreeId(null);
    setFreeText("");
  }

  function commitContext(step: Extract<Step, { kind: "context" }>, optionLabel: string, text?: string) {
    const value = text?.trim() || optionLabel;
    const nextContext = { ...context, [step.field]: value };
    setContext(nextContext);
    advance(nextContext, answers);
  }

  function commitPosture(step: Extract<Step, { kind: "posture" }>, optionId: string) {
    const opt = step.question.options.find((o) => o.id === optionId)!;
    const rec: AnswerRecord = {
      questionId: step.question.id,
      pillar: step.question.pillar,
      optionId: opt.id,
      label: opt.label,
      risk: opt.risk,
      points: opt.points,
    };
    const nextAnswers = [...answers.filter((a) => a.questionId !== step.question.id), rec];
    setAnswers(nextAnswers);
    advance(context, nextAnswers);
  }

  function advance(ctx: DecisionContext, ans: AnswerRecord[]) {
    setFreeId(null);
    setFreeText("");
    if (cursor + 1 >= steps.length) {
      finish(ctx, ans);
      return;
    }
    setCursor(cursor + 1);
  }

  function goBack() {
    setFreeId(null);
    setFreeText("");
    if (cursor === 0) {
      // back to industry selection
      setIndustry("");
      setContext(EMPTY_CONTEXT);
      setAnswers([]);
      return;
    }
    setCursor(cursor - 1);
  }

  // ---- Industry step ----
  if (!industry) {
    return (
      <Shell progress={0} step={1}>
        <Heading title="Which industry are you in?" help="We'll tailor every question and the advice to your sector." />
        <Options>
          {INDUSTRIES.map((label) => {
            const isOther = label === "Others";
            const selected = isOther && freeId === "other";
            return (
              <OptionButton
                key={label}
                selected={selected}
                onClick={() => (isOther ? setFreeId("other") : chooseIndustry(label))}
              >
                {label}
              </OptionButton>
            );
          })}
        </Options>
        {freeId === "other" && (
          <FreeText
            label="Tell us your industry"
            value={freeText}
            onChange={setFreeText}
            onSubmit={() => freeText.trim() && chooseIndustry("Others", freeText)}
          />
        )}
      </Shell>
    );
  }

  const step = steps[cursor];

  return (
    <Shell progress={progress} step={answeredCount + 1} onBack={goBack}>
      {step.kind === "posture" && (
        <span className="mb-3 inline-block rounded-full bg-navy-950 px-3 py-1 text-xs font-semibold text-gold-400">
          {step.question.pillar} — {PILLAR_NAME[step.question.pillar]}
        </span>
      )}
      <Heading
        title={step.kind === "posture" ? step.question.question : step.question}
        help={step.kind === "posture" ? step.question.help : step.help}
      />
      <Options>
        {step.kind === "context"
          ? step.options.map((o) => {
              const selected = o.allowFreeText && freeId === o.id;
              return (
                <OptionButton
                  key={o.id}
                  selected={selected}
                  onClick={() => (o.allowFreeText ? setFreeId(o.id) : commitContext(step, o.label))}
                >
                  {o.label}
                </OptionButton>
              );
            })
          : step.question.options.map((o) => (
              <OptionButton key={o.id} onClick={() => commitPosture(step, o.id)}>
                {o.label}
              </OptionButton>
            ))}
      </Options>
      {step.kind === "context" && freeId && (
        <FreeText
          label="Please specify"
          value={freeText}
          onChange={setFreeText}
          onSubmit={() => {
            const opt = step.options.find((o) => o.id === freeId);
            if (opt && freeText.trim()) commitContext(step, opt.label, freeText);
          }}
        />
      )}
    </Shell>
  );
}

/* ---------- presentational helpers ---------- */

function Shell({
  children,
  progress,
  step,
  onBack,
}: {
  children: React.ReactNode;
  progress: number;
  step: number;
  onBack?: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
        The S.A.F.E.R. AI™ Decision Check
      </p>
      <div className="mb-10 mt-4">
        <div className="flex items-center justify-between text-sm text-navy-800/70">
          <span>Question {step}</span>
          <span className="font-semibold text-gold-500">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-900/10">
          <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {children}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className="text-sm font-semibold text-navy-800 disabled:opacity-0"
        >
          ← Back
        </button>
        <p className="text-xs text-navy-800/50">Free · about 3 minutes · answers stay on this device.</p>
      </div>
    </main>
  );
}

function Heading({ title, help }: { title: string; help?: string }) {
  return (
    <>
      <h1 className="text-2xl font-bold leading-snug text-navy-950 md:text-3xl">{title}</h1>
      {help && <p className="mt-2 text-sm text-navy-800/60">{help}</p>}
    </>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 flex flex-col gap-3">{children}</div>;
}

function OptionButton({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-6 py-4 text-left font-medium transition ${
        selected
          ? "border-gold-500 bg-gold-500/10 text-navy-950"
          : "border-navy-900/10 bg-white text-navy-800 hover:border-gold-500/50"
      }`}
    >
      {children}
    </button>
  );
}

function FreeText({
  label,
  value,
  onChange,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-gold-500 bg-white p-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-navy-800">{label}</span>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
        />
      </label>
      <button
        type="button"
        disabled={!value.trim()}
        onClick={onSubmit}
        className="mt-4 rounded-full bg-navy-950 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
