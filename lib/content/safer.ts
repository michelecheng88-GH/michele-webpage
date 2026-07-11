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
    tagline: "Know what data you hold and how exposed it is.",
    description:
      "Do you know where your sensitive operational and customer data lives, who can touch it, and what happens if an AI tool sees it? Sensitivity is the starting discipline — before automation, before insight.",
  },
  {
    key: "A",
    name: "Accuracy",
    tagline: "Garbage in, garbage out — at scale.",
    description:
      "AI amplifies whatever it's fed. If your inventory counts, timesheets, or customer records are inconsistent, AI won't fix that — it will confidently repeat the error, faster.",
  },
  {
    key: "F",
    name: "Framing",
    tagline: "A vague goal gives AI nothing to aim at.",
    description:
      "\"Use AI to grow the business\" isn't a target. \"Cut stock-take time by 40% in 90 days\" is. Framing is how clearly your team has defined the problem before reaching for a tool.",
  },
  {
    key: "E",
    name: "Explainability",
    tagline: "If leadership can't explain it, they won't trust it.",
    description:
      "Can your ops manager tell the CFO *why* the model flagged that anomaly? Decisions that can't be explained don't get acted on — they get shelved.",
  },
  {
    key: "R",
    name: "Responsibility",
    tagline: "Someone owns the outcome, always.",
    description:
      "Governance, change management, and accountability determine whether an AI pilot survives contact with your actual team — or quietly dies in month two.",
  },
];
