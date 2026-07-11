import type { ProfileBand } from "./scoring";

export type Recommendation = { title: string; body: string };

export const RECOMMENDATIONS: Record<ProfileBand, Recommendation[]> = {
  "Foundation Builder": [
    {
      title: "Start with a data audit",
      body: "You can't fix what you can't see. Map where your core operational data actually lives before touching any AI tool.",
    },
    {
      title: "Pick one narrow, measurable problem",
      body: "Not \"improve efficiency\" — something like \"cut stock-take time by 40% in 90 days\". A vague goal gives AI nothing to aim at.",
    },
    {
      title: "Assign a single owner",
      body: "Name one person accountable for your AI readiness effort. Accountability beats enthusiasm.",
    },
  ],
  "Emerging Adopter": [
    {
      title: "Clean up your noisiest data source",
      body: "Find the one or two systems causing the most contradictions and fix those before scaling any pilot.",
    },
    {
      title: "Write your success metric down",
      body: "One sentence, shared with the whole team, so everyone is rowing toward the same target.",
    },
    {
      title: "Build a lightweight change-management habit",
      body: "A 15-minute weekly check-in on adoption blockers prevents pilots from quietly stalling.",
    },
  ],
  "Strategic Integrator": [
    {
      title: "Formalise your data governance",
      body: "Accuracy has held so far — make sure it holds as you scale beyond one team or one system.",
    },
    {
      title: "Start tracking explainability",
      body: "Document why key AI-driven decisions were made, not just what happened, so trust scales with usage.",
    },
    {
      title: "Expand accountability",
      body: "Move from a single owner to a small cross-functional steering group as AI touches more of the business.",
    },
  ],
  "AI-Ready Leader": [
    {
      title: "Book a full S.A.F.E.R. AI Audit",
      body: "You're ready to identify your next-level opportunities with a focused diagnostic across all five dimensions.",
    },
    {
      title: "Formalise what's working informally",
      body: "A Core Professional Implementation turns your ad-hoc wins into a repeatable, governed system.",
    },
    {
      title: "Mentor another team through the journey",
      body: "Your foundation is strong enough to help a sibling team or department build the same readiness.",
    },
  ],
};
