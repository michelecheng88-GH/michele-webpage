/**
 * Server-side Word (.docx) builder for the paid AI Readiness Assessment.
 * Imported only by the API route (Node runtime) — never in a client bundle.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { DecisionContext } from "./session";
import type { IndustryContext } from "./industry-context";
import type { Band, ReadinessResult } from "./scoring";
import { PILLARS } from "./model";

const NAVY = "0F1F3D";
const NAVY2 = "1F3766";
const GOLD = "C9A227";
const GRAY = "55606E";
const CREAMD = "F3EFE4";
const WHITE = "FFFFFF";

const BAND_HEX: Record<Band["colour"], string> = {
  green: "2E8B4F",
  yellow: "C99A00",
  orange: "E07B12",
  red: "C0392B",
  black: "1A1A1A",
};

export type ReportInput = {
  company: string;
  email: string;
  phone: string;
  context: DecisionContext;
  ctx: IndustryContext;
  result: ReadinessResult;
  reportId: string;
  date: string;
};

function t(text: string, opts: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}) {
  return new TextRun({ text, bold: opts.bold, color: opts.color ?? NAVY, size: opts.size ?? 22, italics: opts.italics, font: "Calibri" });
}
function p(children: TextRun[], opts: { spacing?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) {
  return new Paragraph({ children, spacing: { after: opts.spacing ?? 140 }, alignment: opts.align });
}
function h1(text: string) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 140 }, children: [new TextRun({ text, bold: true, color: NAVY, size: 30, font: "Calibri" })] });
}
function h2(text: string) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true, color: NAVY2, size: 24, font: "Calibri" })] });
}

function cell(children: Paragraph[], opts: { fill?: string; width?: number } = {}) {
  return new TableCell({
    children,
    shading: opts.fill ? { type: ShadingType.CLEAR, color: "auto", fill: opts.fill } : undefined,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}
function textCell(text: string, opts: { bold?: boolean; color?: string; fill?: string; width?: number } = {}) {
  return cell([p([t(text, { bold: opts.bold, color: opts.color })], { spacing: 0 })], { fill: opts.fill, width: opts.width });
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
function table(rows: TableRow[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: CREAMD },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: CREAMD },
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: CREAMD },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: CREAMD },
    },
  });
}

function scoreBlock(label: string, score: number, band: Band, sub: string): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 120, after: 20 }, children: [t(label.toUpperCase(), { bold: true, color: GOLD, size: 18 })] }),
    new Paragraph({ spacing: { after: 20 }, children: [
      new TextRun({ text: `${score}`, bold: true, color: NAVY, size: 56, font: "Calibri" }),
      new TextRun({ text: " / 100    ", color: GRAY, size: 24, font: "Calibri" }),
      new TextRun({ text: band.label, bold: true, color: BAND_HEX[band.colour], size: 26, font: "Calibri" }),
    ] }),
    new Paragraph({ spacing: { after: 160 }, children: [t(sub, { italics: true, color: GRAY, size: 20 })] }),
  ];
}

export async function buildReadinessReport(input: ReportInput): Promise<Buffer> {
  const { company, context, ctx, result, reportId, date } = input;
  const footerText = "SAFER™ AI Readiness Assessment · Michele Cheng · ThizWorks · Confidential";

  const pillarRows = [
    new TableRow({ tableHeader: true, children: [
      textCell("Pillar", { bold: true, color: WHITE, fill: NAVY, width: 34 }),
      textCell("Score", { bold: true, color: WHITE, fill: NAVY, width: 16 }),
      textCell("Weight", { bold: true, color: WHITE, fill: NAVY, width: 16 }),
      textCell("Status", { bold: true, color: WHITE, fill: NAVY, width: 34 }),
    ] }),
    ...result.pillars.map((pl) => {
      const statusLabel = pl.status === "high" ? "Fix first" : pl.status === "caution" ? "Needs work" : "Ready";
      const statusColor = pl.status === "high" ? BAND_HEX.red : pl.status === "caution" ? BAND_HEX.orange : BAND_HEX.green;
      return new TableRow({ children: [
        textCell(`${pl.pillar} — ${pl.name}`, { bold: true, width: 34 }),
        textCell(`${pl.score}`, { width: 16 }),
        textCell(`${pl.weight}%`, { color: GRAY, width: 16 }),
        textCell(statusLabel, { bold: true, color: statusColor, width: 34 }),
      ] });
    }),
  ];

  const actionParas: Paragraph[] = [];
  result.actions.forEach((a, i) => {
    actionParas.push(new Paragraph({ spacing: { before: 140, after: 20 }, children: [
      new TextRun({ text: `${i + 1}. ${a.title}`, bold: true, color: NAVY, size: 24, font: "Calibri" }),
      new TextRun({ text: `   (${a.timeframe})`, italics: true, color: GOLD, size: 20, font: "Calibri" }),
    ] }));
    actionParas.push(p([t(a.body, { color: GRAY, size: 21 })]));
  });

  const penaltyParas: Paragraph[] =
    result.penalties.length > 0
      ? result.penalties.map((pen) =>
          new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [
            t(`${pen.label} `, { bold: true }),
            t(`(−${pen.penalty} to your PSSI)`, { color: BAND_HEX.red }),
          ] }),
        )
      : [p([t("No critical success factors were flagged — a strong signal for scaling.", { italics: true, color: GRAY })])];

  const contextRows = [
    ["Industry", context.industry],
    ["Organisation size", context.companySize],
    ["Role of respondent", context.role],
    ["Most pressing problem", context.painPoint],
    ["12-month goal", context.goal],
    ["Desired timeline", context.timeline],
  ].map(([k, v]) =>
    new TableRow({ children: [textCell(k, { bold: true, width: 34 }), textCell(v || "—", { color: GRAY, width: 66 })] }),
  );

  const doc = new Document({
    creator: "Michele Cheng · ThizWorks",
    title: "AI Readiness Assessment",
    styles: { default: { document: { run: { font: "Calibri", color: NAVY } } } },
    sections: [
      {
        properties: {},
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [t(footerText, { color: GRAY, size: 16, italics: true })] })] }) },
        children: [
          // Cover
          new Paragraph({ spacing: { before: 1400, after: 80 }, alignment: AlignmentType.CENTER, children: [t("AI Readiness Assessment", { bold: true, color: NAVY, size: 52 })] }),
          new Paragraph({ spacing: { after: 60 }, alignment: AlignmentType.CENTER, children: [t("Powered by the SAFER™ Framework", { bold: true, color: GOLD, size: 26 })] }),
          new Paragraph({ spacing: { after: 500 }, alignment: AlignmentType.CENTER, children: [t(`Prepared for ${company || "your organisation"} · ${ctx.label}`, { color: GRAY, size: 24 })] }),
          new Paragraph({ spacing: { after: 40 }, alignment: AlignmentType.CENTER, children: [t("Michele Cheng · ThizWorks", { bold: true, size: 24 })] }),
          new Paragraph({ spacing: { after: 40 }, alignment: AlignmentType.CENTER, children: [t(date, { color: GRAY, size: 20 })] }),
          new Paragraph({ spacing: { after: 40 }, alignment: AlignmentType.CENTER, children: [t(`Report reference: ${reportId}`, { color: GRAY, size: 16 })] }),
          new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [t("SAFER™ and Pilot-to-Scale Success Index™ (PSSI™) are trademarks of Michele Cheng. Confidential.", { italics: true, color: GRAY, size: 16 })] }),

          // Executive summary
          h1("Executive summary"),
          p([
            t(`Based on your answers, ${company || "your organisation"} scores as follows across the SAFER framework. `),
            t("Two numbers matter: the "),
            t("AI Implementation Success Score", { bold: true }),
            t(" tells you how ready you are today; the "),
            t("Pilot-to-Scale Success Index™ (PSSI™)", { bold: true }),
            t(" tells you how likely you are to reach enterprise scale — because some weaknesses are disproportionately fatal to scaling."),
          ]),
          ...scoreBlock("AI Implementation Success Score", result.successScore, result.successBand, "Descriptive — how ready are you today?"),
          ...scoreBlock("Pilot-to-Scale Success Index™ (PSSI™)", result.pssi, result.pssiBand, "Predictive — will your pilots reach enterprise scale?"),

          // Pillar breakdown
          h1("Your five pillars"),
          p([t("A healthy overall number can still hide a weak pillar — so each is scored on its own. Weightings reflect each pillar's impact on delivery success.", { color: GRAY })]),
          table(pillarRows),

          // Why PSSI differs
          h1("What's holding back your PSSI"),
          p([t("The PSSI starts from your Success Score and subtracts penalties for critical success factors that are missing — the gaps most likely to stall a pilot after it works:", { color: GRAY })]),
          ...penaltyParas,

          // Recommended actions
          h1("Recommended actions"),
          p([t("Prioritised by severity — the highest-risk pillars first. Each is written to be started now and to show a result within 12 months.", { color: GRAY })]),
          ...actionParas,

          // Re-score note
          h1("Keep score — readiness drifts"),
          p([t("Readiness is not a one-time number. As your data, people and processes change, so does your ability to deliver AI safely. We recommend re-scoring each quarter to track each pillar over time and confirm your gaps are closing.", { color: GRAY })]),
          p([t("Benchmarking against peers in your sector is coming soon — future reports will show how you compare against similar organisations.", { italics: true, color: GOLD })]),

          // Appendix
          h1("Appendix — your inputs"),
          table(contextRows),
          new Paragraph({ spacing: { before: 240 }, children: [t("This report is a structured, standards-derived expert estimate (SAFER V1), not a statistically validated prediction. It is intended to guide investment decisions, not replace professional or legal advice.", { italics: true, color: GRAY, size: 18 })] }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc) as unknown as Promise<Buffer>;
}
