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
      "AI is only as accurate as the data beneath it — you cannot automate what you cannot measure as ground truth. Does the task demand 100% correctness (clinical, financial, or regulatory)? Where errors carry legal weight, AI must never be the final decision-maker.",
  },
  {
    key: "F",
    name: "Framing",
    tagline: "AI amplifies clarity — not confusion.",
    description:
      "Is the problem clearly defined, measurable, and outcome-driven? If problem statement is NOT clear → AI will produce noise, not value.",
  },
  {
    key: "E",
    name: "Explainability",
    tagline: "If you can't explain it, you can't defend it.",
    description:
      "Can you show how a result was derived, and defend it to auditors, regulators, or customers? A decision your team cannot explain is one it cannot stand behind — or safely repeat across markets.",
  },
  {
    key: "R",
    name: "Responsibility",
    tagline: "AI generates outputs. Humans carry responsibility.",
    description:
      "The biggest barrier to AI is rarely the technology — it is an organisation that hasn't decided who owns the outcome. Who is accountable when things go wrong: you, your organisation, or the system? If ownership is unclear, don't rely on AI.",
  },
];
