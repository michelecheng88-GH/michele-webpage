"use client";

import { useState, useTransition } from "react";
import { updateLeadGrant } from "@/app/admin/leads/actions";

const GRANT_STATUSES = ["", "Identified", "Applied", "Approved", "Rejected"];

export function LeadGrantForm({
  leadId,
  initialGrantName,
  initialGrantStatus,
  initialGrantNotes,
}: {
  leadId: string;
  initialGrantName: string;
  initialGrantStatus: string;
  initialGrantNotes: string;
}) {
  const [grantName, setGrantName] = useState(initialGrantName);
  const [grantStatus, setGrantStatus] = useState(initialGrantStatus);
  const [grantNotes, setGrantNotes] = useState(initialGrantNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateLeadGrant(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="leadId" value={leadId} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Grant name</span>
        <input
          name="grant_name"
          value={grantName}
          onChange={(e) => {
            setGrantName(e.target.value);
            setSaved(false);
          }}
          placeholder="e.g. EDG, IMDA"
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Grant status</span>
        <select
          name="grant_status"
          value={grantStatus}
          onChange={(e) => {
            setGrantStatus(e.target.value);
            setSaved(false);
          }}
          className="rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950"
        >
          {GRANT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "—"}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-navy-800">Grant notes</span>
        <textarea
          name="grant_notes"
          rows={3}
          value={grantNotes}
          onChange={(e) => {
            setGrantNotes(e.target.value);
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
          {isPending ? "Saving…" : "Save grant details"}
        </button>
        {saved && <span className="text-sm font-medium text-green-700">Saved ✓</span>}
      </div>
    </form>
  );
}
