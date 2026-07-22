/**
 * Recommended-action library, per pillar, phrased in the respondent's sector
 * language. Each action is written to be started immediately and to show a
 * result within 12 months — the promise of the Decision Check.
 */

import type { Pillar } from "./model";
import type { IndustryContext } from "./industry-context";

export type Action = {
  pillar: Pillar;
  title: string;
  body: string;
  /** Suggested timeframe to see movement. */
  timeframe: string;
};

export function pillarAction(pillar: Pillar, ctx: IndustryContext): Action {
  switch (pillar) {
    case "S":
      return {
        pillar: "S",
        title: "Name one owner and one costed problem",
        body: `Pick a single, painful problem — for you, likely ${ctx.painExample} — put a rough dollar or hours cost on it, and name one business leader (not IT) who owns fixing it. This one decision reframes every later conversation.`,
        timeframe: "This month",
      };
    case "A":
      return {
        pillar: "A",
        title: "Measure the data before you build on it",
        body: `Sample the ${ctx.assetWord} the AI would rely on and record how accurate it actually is. If it's below what the use case needs, fixing that first is the highest-return work you can do — AI only amplifies what the data already is.`,
        timeframe: "1–2 months",
      };
    case "F":
      return {
        pillar: "F",
        title: "Write a one-page AI usage policy",
        body: `Define what AI may do alone, what needs a human sign-off, and what it must never do — mapped to ${ctx.standards}. Keep it to one page with a simple approval matrix, or it won't be followed.`,
        timeframe: "1 month",
      };
    case "E":
      return {
        pillar: "E",
        title: `Run one small pilot with a human in the loop`,
        body: `Start ${ctx.starterUseCase}. Write down what "excellent" looks like before you build, keep a human approving every material output, and check results against that checklist each week.`,
        timeframe: "2–3 months to first result",
      };
    case "R":
      return {
        pillar: "R",
        title: "Set a baseline and a 12-month target",
        body: `Capture where you are today (e.g. hours spent, error rate, response time for your ${ctx.frontline}) and set a target for 12 months out. Without a baseline you can't prove the value — and unproven value doesn't get funded to scale.`,
        timeframe: "This month, then track quarterly",
      };
  }
}
