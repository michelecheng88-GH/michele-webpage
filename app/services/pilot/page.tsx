"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

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

type FormState = {
  full_name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  environment_type: string;
  asset_type: string;
  pain_point: string;
};

const EMPTY_FORM: FormState = {
  full_name: "",
  job_title: "",
  company: "",
  email: "",
  phone: "",
  environment_type: "",
  asset_type: "",
  pain_point: "",
};

export default function PilotEnquiryPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required";
    if (!form.job_title.trim()) next.job_title = "Job title is required";
    if (!form.company.trim()) next.company = "Company name is required";
    if (!form.email.trim()) {
      next.email = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email";
    }
    if (!form.phone.trim()) next.phone = "Phone number is required";
    if (!form.environment_type) next.environment_type = "Please select your primary environment type";
    if (!form.asset_type) next.asset_type = "Please select the target asset type";
    if (!form.pain_point) next.pain_point = "Please select your current primary pain point";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/services/pilot", {
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
            Your pilot enquiry has been received. Our support team will reach out to map out your
            pilot items shortly.
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
        Tier 2 — Clean Data for Your AI
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 md:text-4xl">
        Let&apos;s get your pilot items mapped out.
      </h1>
      <p className="mt-4 text-navy-800/80">
        Fill in the details below, and our support team will reach out to you.
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
            <Field label="Company Name" required error={errors.company} full>
              <input
                className={inputCls}
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
              />
            </Field>
            <Field label="Business Email" required error={errors.email}>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>
            <Field label="Phone Number" required error={errors.phone}>
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
            The Operational Fit
          </h2>

          <Field label="Primary Environment Type" required error={errors.environment_type}>
            <select
              className={inputCls}
              value={form.environment_type}
              onChange={(e) => update("environment_type", e.target.value)}
            >
              <option value="">Select one…</option>
              {ENVIRONMENT_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Target Asset Type" required error={errors.asset_type}>
            <select
              className={inputCls}
              value={form.asset_type}
              onChange={(e) => update("asset_type", e.target.value)}
            >
              <option value="">Select one…</option>
              {ASSET_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="font-medium text-navy-800">
              Current Primary Pain Point<span className="text-gold-500"> *</span>
            </legend>
            <div className="flex flex-col gap-2">
              {PAIN_POINTS.map((opt) => (
                <label key={opt} className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="pain_point"
                    className="mt-1"
                    checked={form.pain_point === opt}
                    onChange={() => update("pain_point", opt)}
                  />
                  <span className="text-navy-800">{opt}</span>
                </label>
              ))}
            </div>
            {errors.pain_point && <span className="text-xs text-red-600">{errors.pain_point}</span>}
          </fieldset>
        </section>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-navy-950 px-6 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Pilot Enquiry"}
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
  full,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-navy-800">
        {label}
        {required && <span className="text-gold-500"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
