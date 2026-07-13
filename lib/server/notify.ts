/**
 * Shared server-side lead notification email (via Resend).
 * Used by /api/contact, /api/services/pilot, /api/services/advisory.
 */

const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "m@thizworks.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Michele Cheng Website <onboarding@resend.dev>";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendLeadNotificationEmail(params: {
  subject: string;
  rows: [string, string][];
  replyTo?: string;
  footer: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[notify] RESEND_API_KEY not set; skipping email for "${params.subject}".`);
    return false;
  }

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#0f1f3d">${escapeHtml(params.subject)}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${params.rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e0d5;background:#faf8f3;font-weight:600;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
            <td style="padding:8px 12px;border:1px solid #e5e0d5;white-space:pre-wrap">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <p style="color:#6b7280;font-size:12px;margin-top:16px">${escapeHtml(params.footer)}</p>
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
      reply_to: params.replyTo || undefined,
      subject: params.subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[notify] Resend email failed: ${res.status} ${detail}`);
    return false;
  }
  return true;
}

export { NOTIFY_EMAIL };
