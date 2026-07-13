import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendLeadNotificationEmail, NOTIFY_EMAIL } from "@/lib/server/notify";
import { splitFullName } from "@/lib/utils/name";
import { INDUSTRIES } from "@/lib/content/industries";

const FOCUS_AREAS = [
  "AI Governance & Risk Management",
  "Data Foundation & Infrastructure Strategy",
  "Change Leadership & Operational Excellence",
  "Framework Alignment (e.g., ESG, IMDA/PDPA)",
];
const TARGET_AUDIENCES = [
  "Board/C-Suite Only",
  "Senior Management Team (Directors/Heads of Dept)",
  "Cross-Functional Leadership (IT, Ops, Compliance)",
  "Other",
];
const TIMELINES = ["Within the next 30 days", "Next quarter", "Exploring for future planning"];

type AdvisoryPayload = {
  full_name?: string;
  job_title?: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  focus_areas?: string[];
  target_audience?: string;
  timeline?: string;
};

export async function POST(request: Request) {
  let body: AdvisoryPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fields = {
    full_name: (body.full_name ?? "").trim(),
    job_title: (body.job_title ?? "").trim(),
    company: (body.company ?? "").trim(),
    industry: (body.industry ?? "").trim(),
    email: (body.email ?? "").trim(),
    phone: (body.phone ?? "").trim(),
    focus_areas: Array.isArray(body.focus_areas) ? body.focus_areas : [],
    target_audience: (body.target_audience ?? "").trim(),
    timeline: (body.timeline ?? "").trim(),
  };

  if (
    !fields.full_name ||
    !fields.job_title ||
    !fields.company ||
    !fields.industry ||
    !fields.email ||
    !fields.phone
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!INDUSTRIES.includes(fields.industry)) {
    return NextResponse.json({ error: "Invalid industry" }, { status: 400 });
  }
  if (fields.focus_areas.length === 0 || !fields.focus_areas.every((a) => FOCUS_AREAS.includes(a))) {
    return NextResponse.json({ error: "Please select at least one focus area" }, { status: 400 });
  }
  if (!fields.target_audience || !TARGET_AUDIENCES.includes(fields.target_audience)) {
    return NextResponse.json({ error: "Invalid target audience" }, { status: 400 });
  }
  if (!fields.timeline || !TIMELINES.includes(fields.timeline)) {
    return NextResponse.json({ error: "Invalid timeline" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const supabase = createClient(url, anonKey);
  const { first_name, last_name } = splitFullName(fields.full_name);

  const challengeDetail = [
    `Industry: ${fields.industry}`,
    `Primary Focus Area(s): ${fields.focus_areas.join(", ")}`,
    `Target Audience: ${fields.target_audience}`,
    `Anticipated Timeline: ${fields.timeline}`,
  ].join("\n");

  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      first_name,
      last_name,
      role: fields.job_title,
      company: fields.company,
      email: fields.email,
      phone: fields.phone,
      biggest_challenge: "Strategic advisory enquiry",
      challenge_detail: challengeDetail,
      source: "advisory-enquiry",
      status: "New",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not save your enquiry" }, { status: 500 });
  }

  const emailSent = await sendLeadNotificationEmail({
    subject: `New Strategic Advisory enquiry — ${fields.full_name}`,
    replyTo: fields.email,
    footer: "Sent from the Strategic Advisory & Workshops enquiry form.",
    rows: [
      ["Full name", fields.full_name],
      ["Job title", fields.job_title],
      ["Company", fields.company],
      ["Industry", fields.industry],
      ["Email", fields.email],
      ["Mobile no.", fields.phone],
      ["Primary focus area(s)", fields.focus_areas.join(", ")],
      ["Target audience", fields.target_audience],
      ["Anticipated timeline", fields.timeline],
    ],
  });

  await supabase.from("audit_logs").insert({
    actor: "system",
    action: emailSent ? "advisory.submitted_emailed" : "advisory.submitted",
    object_type: "leads",
    object_id: lead.id,
    payload: { emailSent, notify: NOTIFY_EMAIL },
  });

  return NextResponse.json({ ok: true, emailSent });
}
