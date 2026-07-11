"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QUIZ_QUESTIONS, SCALE_LABELS } from "@/lib/quiz/questions";
import { scoreQuiz, type QuizAnswers } from "@/lib/quiz/scoring";

const QUIZ_RESULT_KEY = "safer-quiz-result";

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const question = QUIZ_QUESTIONS[currentIndex];
  const isLast = currentIndex === QUIZ_QUESTIONS.length - 1;
  const progress = Math.round(((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100);

  function selectAnswer(value: number) {
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);

    if (isLast) {
      const result = scoreQuiz(nextAnswers);
      sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(result));
      router.push("/quiz/result");
      return;
    }

    setCurrentIndex((i) => i + 1);
  }

  function goBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <div className="flex items-center justify-between text-sm text-navy-800/70">
          <span>
            Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="font-semibold text-gold-500">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-900/10">
          <div
            className="h-full rounded-full bg-gold-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold leading-snug text-navy-950 md:text-3xl">
        {question.text}
      </h1>

      <div className="mt-10 flex flex-col gap-3">
        {SCALE_LABELS.map((label, idx) => {
          const value = idx + 1;
          const selected = answers[question.id] === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => selectAnswer(value)}
              className={`rounded-xl border px-6 py-4 text-left font-medium transition ${
                selected
                  ? "border-gold-500 bg-gold-500/10 text-navy-950"
                  : "border-navy-900/10 bg-white text-navy-800 hover:border-gold-500/50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={currentIndex === 0}
          className="text-sm font-semibold text-navy-800 disabled:opacity-0"
        >
          ← Back
        </button>
        <p className="text-xs text-navy-800/50">Your answers stay on this device until you submit.</p>
      </div>
    </main>
  );
}
