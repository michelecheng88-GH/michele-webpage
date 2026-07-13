import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendLeadNotificationEmail, NOTIFY_EMAIL } from "@/lib/server/notify";
import { splitFullName } from "@/lib/utils/name";

const ENVIRONMENT_TYPES = [
  "Warehouse / Logistics",
  "Manufacturing Plant / Factory Floor",
  "Laboratory / Cleanroom",
  "Data Center",
  "Other",
];
const ASSET_TYPES = ["Tools & Equipment", "Raw Materials / Inventory", "IT Assets / Server Equipment", "Other"];
const PAIN_POINTS = [
  "Losing track of floor items / wasted search time",
  "Inaccurate data feeding our ERP/AI systems",
  "Need automated data for ESG/carbon-disclosure reporting",
  "Others",
];

type PilotPayload = {
  full_name?: string;
  job_title?: string;
  company?: string;
  email?: string;
  phone?: string;
  environment_type?: string;
  asset_type?: string;
  pain_point?: string;
};

export async function POST(request: Request) {
  let body: PilotPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fields = {
    full_name: (body.full_name ?? "").trim(),
    job_title: (body.job_title ?? "").trim(),
    company: (body.company ?? "").trim(),
    email: (body.email ?? "").trim(),
    phone: (body.phone ?? "").trim(),
    environment_type: (body.environment_type ?? "").trim(),
    asset_type: (body.asset_type ?? "").trim(),
    pain_point: (body.pain_point ?? "").trim(),
  };

  if (
    !fields.full_name ||
    !fields.job_title ||
    !fields.company ||
    !fields.email ||
    !fields.phone ||
    !fields.environment_type ||
    !fields.asset_type ||
    !fields.pain_point
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!ENVIRONMENT_TYPES.includes(fields.environment_type)) {
    return NextResponse.json({ error: "Invalid environment type" }, { status: 400 });
  }
  if (!ASSET_TYPES.includes(fields.asset_type)) {
    return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
  }
  if (!PAIN_POINTS.includes(fields.pain_point)) {
    return NextResponse.json({ error: "Invalid pain point" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const supabase = createClient(url, anonKey);
  const { first_name, last_name } = splitFullName(fields.full_name);

  const challengeDetail = [
    `Primary Environment Type: ${fields.environment_type}`,
    `Target Asset Type: ${fields.asset_type}`,
    `Current Primary Pain Point: ${fields.pain_point}`,
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
      biggest_challenge: fields.pain_point,
      challenge_detail: challengeDetail,
      source: "pilot-enquiry",
      status: "New",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not save your enquiry" }, { status: 500 });
  }

  const emailSent = await sendLeadNotificationEmail({
    subject: `New Pilot enquiry — ${fields.full_name}`,
    replyTo: fields.email,
    footer: "Sent from the Clean Data for Your AI pilot enquiry form.",
    rows: [
      ["Full name", fields.full_name],
      ["Job title", fields.job_title],
      ["Company", fields.company],
      ["Email", fields.email],
      ["Mobile no.", fields.phone],
      ["Primary environment type", fields.environment_type],
      ["Target asset type", fields.asset_type],
      ["Current primary pain point", fields.pain_point],
    ],
  });

  await supabase.from("audit_logs").insert({
    actor: "system",
    action: emailSent ? "pilot.submitted_emailed" : "pilot.submitted",
    object_type: "leads",
    object_id: lead.id,
    payload: { emailSent, notify: NOTIFY_EMAIL },
  });

  return NextResponse.json({ ok: true, emailSent });
}
