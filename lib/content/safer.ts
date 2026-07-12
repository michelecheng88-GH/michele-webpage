export type SaferDimension = {
  key: "S" | "A" | "F" | "E" | "R";
  name: string;
  tagline: string;
  description: string;
};

export const SAFER_DIMENSIONS: SaferDimension[] = [
  {
    key: "S",
    name: "Sensitivity",
    tagline: "Not all data is meant for AI.",
    description:
      "Are you pointing AI at personal data (PDPA), patient records, or confidential business information? The more sensitive the data, the stronger the case to avoid — or strictly control — AI use.",
  },
  {
    key: "A",
    name: "Accuracy",
    tagline: "AI can assist. It cannot be accountable.",
    description:
      "Does the task demand 100% correctness — clinical, financial, or regulatory precision? Where errors carry legal weight, AI must never be the final decision-maker.",
  },
  {
    key: "F",
    name: "Framing",
    tagline: "AI amplifies clarity — not confusion.",
    description:
      "Is the problem clearly defined, measurable, and outcome-driven? A vague brief in means noise out: AI multiplies whatever clarity — or confusion — you feed it.",
  },
  {
    key: "E",
    name: "Explainability",
    tagline: "If you can't explain it, you can't defend it.",
    description:
      "Can you show how a result was derived, and defend it to auditors, regulators, or customers? Decisions you can't explain are risks you can't manage.",
  },
  {
    key: "R",
    name: "Responsibility",
    tagline: "AI generates outputs. Humans carry responsibility.",
    description:
      "Who is accountable when things go wrong — you, your organisation, or the system? If ownership is unclear, don't rely on AI.",
  },
];
