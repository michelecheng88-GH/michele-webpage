"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_QUIZ } from "@/lib/quiz/default-config";
import { DIMENSION_NAMES } from "@/lib/quiz/schema";
import type { QuizAnswer, QuizNode, QuizOption } from "@/lib/quiz/schema";
import { buildResultPayload } from "@/lib/quiz/engine";

const QUIZ_RESULT_KEY = "safer-quiz-result";

type HistoryEntry = { current: QuizNode; pending: QuizNode[] };

export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState<QuizNode>(DEFAULT_QUIZ[0]);
  const [pending, setPending] = useState<QuizNode[]>(DEFAULT_QUIZ.slice(1));
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [freeTextOptionId, setFreeTextOptionId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");

  // Adaptive progress: follow-up questions extend the total as they appear.
  const total = answers.length + 1 + pending.length;
  const progress = Math.round((answers.length / total) * 100);

  function commit(option: QuizOption, text?: string) {
    const answer: QuizAnswer = {
      nodeId: current.id,
      question: current.question,
      optionId: option.id,
      optionLabel: option.label,
      freeText: text?.trim() || undefined,
      dimension: current.kind === "diagnostic" ? current.dimension : undefined,
      risk: current.kind === "diagnostic" ? option.risk : undefined,
    };
    const nextAnswers = [...answers, answer];
    const nextPending = option.children ? [...option.children, ...pending] : pending;

    if (nextPending.length === 0) {
      const payload = buildResultPayload(nextAnswers);
      sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(payload));
      router.push("/quiz/result");
      return;
    }

    setHistory([...history, { current, pending }]);
    setAnswers(nextAnswers);
    setCurrent(nextPending[0]);
    setPending(nextPending.slice(1));
    setFreeTextOptionId(null);
    setFreeText("");
  }

  function handleSelect(option: QuizOption) {
    if (option.allowFreeText) {
      setFreeTextOptionId(option.id);
      return;
    }
    commit(option);
  }

  function goBack() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory(history.slice(0, -1));
    setAnswers(answers.slice(0, -1));
    setCurrent(prev.current);
    setPending(prev.pending);
    setFreeTextOptionId(null);
    setFreeText("");
  }

  const freeTextOption =
    freeTextOptionId != null ? current.options.find((o) => o.id === freeTextOptionId) : undefined;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
        The S.A.F.E.R. AI™ Decision Check
      </p>

      <div className="mb-10 mt-4">
        <div className="flex items-center justify-between text-sm text-navy-800/70">
          <span>Question {answers.length + 1}</span>
          <span className="font-semibold text-gold-500">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-900/10">
          <div
            className="h-full rounded-full bg-gold-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {current.kind === "diagnostic" && current.dimension && (
        <span className="mb-3 inline-block rounded-full bg-navy-950 px-3 py-1 text-xs font-semibold text-gold-400">
          {current.dimension} — {DIMENSION_NAMES[current.dimension]}
        </span>
      )}

      <h1 className="text-2xl font-bold leading-snug text-navy-950 md:text-3xl">
        {current.question}
      </h1>
      {current.help && <p className="mt-2 text-sm text-navy-800/60">{current.help}</p>}

      <div className="mt-8 flex flex-col gap-3">
        {current.options.map((option) => {
          const selected = freeTextOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              className={`rounded-xl border px-6 py-4 text-left font-medium transition ${
                selected
                  ? "border-gold-500 bg-gold-500/10 text-navy-950"
                  : "border-navy-900/10 bg-white text-navy-800 hover:border-gold-500/50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {freeTextOption && (
        <div className="mt-4 rounded-xl border border-gold-500 bg-white p-5">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-navy-800">
              {current.id === "industry" ? "Tell us your industry" : "Please specify"}
            </span>
            <input
              autoFocus
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </label>
          <button
            type="button"
            disabled={!freeText.trim()}
            onClick={() => commit(freeTextOption, freeText)}
            className="mt-4 rounded-full bg-navy-950 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={history.length === 0}
          className="text-sm font-semibold text-navy-800 disabled:opacity-0"
        >
          ← Back
        </button>
        <p className="text-xs text-navy-800/50">
          Your answers stay on this device until you submit.
        </p>
      </div>
    </main>
  );
}
