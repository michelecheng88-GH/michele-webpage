import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendLeadNotificationEmail, NOTIFY_EMAIL } from "@/lib/server/notify";

type ContactPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  help?: string;
  company?: string;
};

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fields = {
    first_name: (body.first_name ?? "").trim(),
    last_name: (body.last_name ?? "").trim(),
    email: (body.email ?? "").trim(),
    phone: (body.phone ?? "").trim(),
    help: (body.help ?? "").trim(),
    company: (body.company ?? "").trim(),
  };

  if (!fields.first_name || !fields.last_name || !fields.email || !fields.phone || !fields.help) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const supabase = createClient(url, anonKey);

  // 1) Persist the lead (source=contact). `company` is NOT NULL → empty string.
  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      first_name: fields.first_name,
      last_name: fields.last_name,
      email: fields.email,
      phone: fields.phone,
      company: fields.company,
      challenge_detail: fields.help,
      biggest_challenge: "Book a call",
      source: "contact",
      status: "New",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not save your message" }, { status: 500 });
  }

  // 2) Email the enquiry (non-fatal: lead is already saved).
  const emailSent = await sendLeadNotificationEmail({
    subject: `New Book a Call enquiry — ${fields.first_name} ${fields.last_name}`.trim(),
    replyTo: fields.email,
    footer: "Sent from the Book a Call form on the website.",
    rows: [
      ["First name", fields.first_name || "—"],
      ["Last name", fields.last_name || "—"],
      ["Email", fields.email || "—"],
      ["Mobile no.", fields.phone || "—"],
      ["Company", fields.company || "—"],
      ["What they'd like help with", fields.help || "—"],
    ],
  });

  // 3) Audit log.
  await supabase.from("audit_logs").insert({
    actor: "system",
    action: emailSent ? "contact.submitted_emailed" : "contact.submitted",
    object_type: "leads",
    object_id: lead.id,
    payload: { emailSent, notify: NOTIFY_EMAIL },
  });

  return NextResponse.json({ ok: true, emailSent });
}
