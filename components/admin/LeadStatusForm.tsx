"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/app/admin/leads/actions";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Closed"];

export function LeadStatusForm({
  leadId,
  initialStatus,
  initialNotes,
}: {
  leadId: string;
  initialStatus: string;
  initialNotes: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateLeadStatus(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="previousStatus" value={initialStatus} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Status</span>
        <select
          name="status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setSaved(false);
          }}
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Notes</span>
        <textarea
          name="notes"
          rows={4}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm font-medium text-green-700">Saved ✓</span>}
      </div>
    </form>
  );
}
