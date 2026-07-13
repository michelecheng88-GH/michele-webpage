"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
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

type FormState = {
  full_name: string;
  job_title: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  focus_areas: string[];
  target_audience: string;
  timeline: string;
};

const EMPTY_FORM: FormState = {
  full_name: "",
  job_title: "",
  company: "",
  industry: "",
  email: "",
  phone: "",
  focus_areas: [],
  target_audience: "",
  timeline: "",
};

export default function AdvisoryEnquiryPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFocusArea(area: string) {
    setForm((f) => ({
      ...f,
      focus_areas: f.focus_areas.includes(area)
        ? f.focus_areas.filter((a) => a !== area)
        : [...f.focus_areas, area],
    }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required";
    if (!form.job_title.trim()) next.job_title = "Job title is required";
    if (!form.company.trim()) next.company = "Company name is required";
    if (!form.industry) next.industry = "Please select your industry";
    if (!form.email.trim()) {
      next.email = "Corporate email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email";
    }
    if (!form.phone.trim()) next.phone = "Mobile number is required";
    if (form.focus_areas.length === 0)
      next.focus_areas = "Please select at least one focus area";
    if (!form.target_audience) next.target_audience = "Please select the target audience";
    if (!form.timeline) next.timeline = "Please select an anticipated timeline";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/services/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <div className="rounded-2xl border border-gold-500 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-navy-950">Thank you 🎉</h1>
          <p className="mt-3 text-navy-800/80">
            Your enquiry has been received. Our advisory team will get in touch with you shortly.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-block rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-gold-500 hover:text-navy-950"
          >
            Back to Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
        Tier 4 — Strategic Advisory &amp; Workshops
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 md:text-4xl">
        Let&apos;s scope your engagement.
      </h1>
      <p className="mt-4 text-navy-800/80">
        Fill up the form, our advisory team will get in touch with you.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8" noValidate>
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-navy-800/70">
            The Essentials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required error={errors.full_name}>
              <input
                className={inputCls}
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
            </Field>
            <Field label="Job Title" required error={errors.job_title}>
              <input
                className={inputCls}
                value={form.job_title}
                onChange={(e) => update("job_title", e.target.value)}
              />
            </Field>
            <Field label="Company Name" required error={errors.company}>
              <input
                className={inputCls}
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
              />
            </Field>
            <Field label="Industry" required error={errors.industry}>
              <select
                className={inputCls}
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                <option value="">Select one…</option>
                {INDUSTRIES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Corporate Email" required error={errors.email}>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>
            <Field label="Mobile Number" required error={errors.phone}>
              <input
                type="tel"
                className={inputCls}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-navy-800/70">
            Strategic Scope
          </h2>

          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="font-medium text-navy-800">
              Primary Focus Area for the Workshop/Advisory
              <span className="text-gold-500"> *</span>
            </legend>
            <div className="flex flex-col gap-2">
              {FOCUS_AREAS.map((area) => (
                <label key={area} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.focus_areas.includes(area)}
                    onChange={() => toggleFocusArea(area)}
                  />
                  <span className="text-navy-800">{area}</span>
                </label>
              ))}
            </div>
            {errors.focus_areas && (
              <span className="text-xs text-red-600">{errors.focus_areas}</span>
            )}
          </fieldset>

          <Field label="Target Audience for the Engagement" required error={errors.target_audience}>
            <select
              className={inputCls}
              value={form.target_audience}
              onChange={(e) => update("target_audience", e.target.value)}
            >
              <option value="">Select one…</option>
              {TARGET_AUDIENCES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-navy-800/70">
            Timeline &amp; Urgency
          </h2>
          <Field label="Anticipated Timeline for Engagement" required error={errors.timeline}>
            <select
              className={inputCls}
              value={form.timeline}
              onChange={(e) => update("timeline", e.target.value)}
            >
              <option value="">Select one…</option>
              {TIMELINES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </section>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-navy-950 px-6 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Enquiry"}
        </button>
      </form>
    </main>
  );
}

const inputCls =
  "rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-navy-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-navy-800">
        {label}
        {required && <span className="text-gold-500"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
