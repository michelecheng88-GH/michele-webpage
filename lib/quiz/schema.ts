/**
 * S.A.F.E.R. AI™ Decision Check — quiz configuration schema
 * ==========================================================
 *
 * The whole quiz is a TREE of `QuizNode`s, up to 5 levels deep:
 *
 *   Level 1  "industry"    — which industry is the visitor in?
 *   Level 2  "challenge"   — which business problem do they want to solve now?
 *   Level 3  "area"        — which of the 3 focus areas does it map to?
 *   Level 4  diagnostics   — the S.A.F.E.R. questions for that area
 *   Level 5  follow-ups    — optional drill-downs triggered by a risky answer
 *
 * HOW BRANCHING WORKS
 * -------------------
 * Every option can carry `children: QuizNode[]`. When the visitor picks that
 * option, its children are asked next (before the rest of the quiz continues).
 * That is the entire mechanism — nesting children is how you go deeper.
 * e.g. each "area" option carries that area's 10 diagnostic questions as
 * children, and a high-risk diagnostic option can carry a follow-up question.
 *
 * HOW TO CUSTOMISE (edit lib/quiz/default-config.ts)
 * --------------------------------------------------
 * - Add/rename industries or challenges: edit the `options` arrays.
 * - Change a diagnostic question: edit its `question` and `options`.
 * - Add a follow-up: put a `children: [ ...QuizNode ]` on the option that
 *   should trigger it.
 * - Add a whole new focus area: add an option to the "area" node with your
 *   new diagnostic set as `children`, then add matching advice for it in
 *   lib/quiz/advice.ts (falls back to generic advice if you don't).
 *
 * RULES
 * -----
 * - Every node `id` must be unique across the whole tree.
 * - The ids "industry", "challenge" and "area" are SPECIAL: their answers are
 *   used in the result narrative and stored on the lead. Keep those ids.
 * - `kind: "diagnostic"` nodes MUST set `dimension` (S/A/F/E/R) and every
 *   option MUST set `risk`:
 *       0 = safe        (this answer passes the check)
 *       1 = caution     (workable, but needs controls)
 *       2 = high risk   (this answer fails the check)
 * - `kind: "choice"` nodes (industry/challenge/area/etc.) don't score; they
 *   route and give context.
 */

export type SaferDimension = "S" | "A" | "F" | "E" | "R";

export const DIMENSION_NAMES: Record<SaferDimension, string> = {
  S: "Sensitivity",
  A: "Accuracy",
  F: "Framing",
  E: "Explainability",
  R: "Responsibility",
};

/** Michele's one-liners, shown alongside each dimension on the result page. */
export const DIMENSION_LINES: Record<SaferDimension, string> = {
  S: "Not all data is meant for AI.",
  A: "AI can assist. It cannot be accountable.",
  F: "AI amplifies clarity — not confusion.",
  E: "If you can't explain it, you can't defend it.",
  R: "AI generates outputs. Humans carry responsibility.",
};

export type QuizOption = {
  /** Unique within its node. */
  id: string;
  label: string;
  /** Diagnostic options only: 0 = safe, 1 = caution, 2 = high risk. */
  risk?: 0 | 1 | 2;
  /** Show a free-text box when selected (used for "Others"). */
  allowFreeText?: boolean;
  /** Questions asked immediately after this option is chosen (max depth 5). */
  children?: QuizNode[];
};

export type QuizNode = {
  /** Unique across the whole tree. "industry" / "challenge" / "area" are special. */
  id: string;
  kind: "choice" | "diagnostic";
  /** Required when kind === "diagnostic". */
  dimension?: SaferDimension;
  question: string;
  /** Optional smaller line under the question. */
  help?: string;
  options: QuizOption[];
};

/** One recorded answer while walking the tree. */
export type QuizAnswer = {
  nodeId: string;
  question: string;
  optionId: string;
  optionLabel: string;
  freeText?: string;
  dimension?: SaferDimension;
  risk?: 0 | 1 | 2;
};

export type Recommendation = { title: string; body: string };
