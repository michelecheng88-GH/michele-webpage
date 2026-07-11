export type SaferKey = "S" | "A" | "F" | "E" | "R";

export type QuizQuestion = {
  id: string;
  dimension: SaferKey;
  text: string;
};

export const SCALE_LABELS = ["Strongly Disagree", "Disagree", "Agree", "Strongly Agree"];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    dimension: "S",
    text: "We know exactly which systems hold our customers' or employees' sensitive data.",
  },
  {
    id: "q2",
    dimension: "S",
    text: "If an AI tool analysed our operational data today, we'd be confident nothing sensitive would leak or be misused.",
  },
  {
    id: "q3",
    dimension: "A",
    text: "Our core operational records (inventory, timesheets, transactions) are accurate and consistent across systems.",
  },
  {
    id: "q4",
    dimension: "A",
    text: "When we pull the same report twice, we get the same numbers — our data doesn't contradict itself.",
  },
  {
    id: "q5",
    dimension: "F",
    text: "Before starting any AI initiative, we define a specific, measurable target (e.g. \"cut X by Y% in Z months\").",
  },
  {
    id: "q6",
    dimension: "F",
    text: "Everyone on the team could tell you, in one sentence, what problem our AI effort is meant to solve.",
  },
  {
    id: "q7",
    dimension: "E",
    text: "When a system flags something unusual, someone on our team can explain why it happened.",
  },
  {
    id: "q8",
    dimension: "E",
    text: "Our leadership team trusts and acts on data-driven recommendations, rather than shelving them.",
  },
  {
    id: "q9",
    dimension: "R",
    text: "There is a named person accountable for the outcome of any AI or data initiative we run.",
  },
  {
    id: "q10",
    dimension: "R",
    text: "We have a change-management plan for how our team adopts new tools — it's not left to chance.",
  },
];
