import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Where Book-a-Call enquiries are emailed. Overridable via env. */
const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "m@thizworks.com";
/** Must be a verified Resend sender; onboarding@resend.dev works for testing. */
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Michele Cheng Website <onboarding@resend.dev>";

type ContactPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  help?: string;
  company?: string;
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendNotificationEmail(fields: Required<Omit<ContactPayload, never>>): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No key configured yet — lead is still saved; email is skipped.
    console.warn("[contact] RESEND_API_KEY not set; skipping email notification.");
    return false;
  }

  const rows: [string, string][] = [
    ["First name", fields.first_name || "—"],
    ["Last name", fields.last_name || "—"],
    ["Email", fields.email || "—"],
    ["Mobile no.", fields.phone || "—"],
    ["Company", fields.company || "—"],
    ["What they'd like help with", fields.help || "—"],
  ];

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#0f1f3d">New "Book a Call" enquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e0d5;background:#faf8f3;font-weight:600;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:8px 12px;border:1px solid #e5e0d5;white-space:pre-wrap">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <p style="color:#6b7280;font-size:12px;margin-top:16px">Sent from the Book a Call form on michele-webpage.vercel.app</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      reply_to: fields.email || undefined,
      subject: `New Book a Call enquiry — ${fields.first_name} ${fields.last_name}`.trim(),
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[contact] Resend email failed: ${res.status} ${detail}`);
    return false;
  }
  return true;
}

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
  const emailSent = await sendNotificationEmail(fields);

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
