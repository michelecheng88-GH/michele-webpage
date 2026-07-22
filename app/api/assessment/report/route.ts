import { NextResponse } from "next/server";
import { matchIndustryContext } from "@/lib/assessment/industry-context";
import { scoreReadiness, type AnswerRecord } from "@/lib/assessment/scoring";
import { buildReadinessReport } from "@/lib/assessment/report";
import { redeemCode, storeReport } from "@/lib/data/assessment";
import type { DecisionContext } from "@/lib/assessment/session";

// docx needs the Node runtime (not edge).
export const runtime = "nodejs";

type Body = {
  code?: string;
  email?: string;
  phone?: string;
  company?: string;
  context?: DecisionContext;
  answers?: AnswerRecord[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = body.code?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const company = body.company?.trim() ?? "";
  const context = body.context;
  const answers = body.answers;

  if (!code) return NextResponse.json({ error: "A redemption code is required." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "A mobile number is required." }, { status: 400 });
  if (!context || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "Please complete the assessment questions first." }, { status: 400 });
  }

  // Redeem the code first — atomic, single-use.
  let redeemed = false;
  try {
    redeemed = await redeemCode(code, email, phone);
  } catch {
    return NextResponse.json({ error: "We couldn't verify your code — please try again." }, { status: 500 });
  }
  if (!redeemed) {
    return NextResponse.json(
      { error: "That code is invalid or has already been used. Please check it, or contact Michele." },
      { status: 402 },
    );
  }

  // Score + build the report.
  const ctx = matchIndustryContext(context.industry);
  const result = scoreReadiness(answers, ctx);
  const reportId = crypto.randomUUID();
  const date = new Date().toLocaleDateString("en-SG", { year: "numeric", month: "long", day: "numeric" });

  let buffer: Buffer;
  try {
    buffer = await buildReadinessReport({ company, email, phone, context, ctx, result, reportId, date });
  } catch {
    return NextResponse.json({ error: "Report generation failed — please contact Michele; your code is recorded." }, { status: 500 });
  }

  // Best-effort store (don't fail the download if this errors).
  try {
    await storeReport({ id: reportId, code, email, phone, company, context, answers, result });
  } catch {
    // swallow — the buyer still gets their report; Michele has the code redemption on file.
  }

  const safeName = (company || "Your-Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  const filename = `AI-Readiness-Assessment-${safeName}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
