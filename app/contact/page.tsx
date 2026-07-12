"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { insertContactLead } from "@/lib/data/contact";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  help: string;
  company: string;
};

const EMPTY_FORM: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  help: "",
  company: "",
};

export default function ContactPage() {
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
    if (!form.first_name.trim()) next.first_name = "First name is required";
    if (!form.last_name.trim()) next.last_name = "Last name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email";
    }
    if (!form.phone.trim()) next.phone = "Mobile number is required";
    if (!form.help.trim()) next.help = "Please tell us what you'd like help with";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await insertContactLead({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        help: form.help.trim(),
        company: form.company.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  if (submitted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <div className="rounded-2xl border border-gold-500 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-navy-950">Thank you 🎉</h1>
          <p className="mt-3 text-navy-800/80">
            Your message has reached Michele. We&apos;ll be in touch shortly to arrange your call.
          </p>
          {calendlyUrl ? (
            <div className="mt-8 overflow-hidden rounded-xl border border-navy-900/10">
              <iframe
                src={calendlyUrl}
                title="Book a call with Michele Cheng"
                className="h-[650px] w-full"
              />
            </div>
          ) : (
            <Link
              href="/"
              className="mt-8 inline-block rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-gold-500 hover:text-navy-950"
            >
              Back to home
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">Book a call</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 md:text-4xl">
        Let&apos;s talk about your business
      </h1>
      <p className="mt-4 text-navy-800/80">
        Tell Michele a little about what you&apos;re working on. She&apos;ll follow up personally to
        arrange a free 30-minute call.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="First name" required error={errors.first_name}>
          <input
            className={inputCls}
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
          />
        </Field>
        <Field label="Last name" required error={errors.last_name}>
          <input
            className={inputCls}
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Mobile no." required error={errors.phone}>
          <input
            type="tel"
            className={inputCls}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Company name (optional)" error={errors.company} full>
          <input
            className={inputCls}
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </Field>
        <Field label="What would you like Michele to help you with?" required error={errors.help} full>
          <textarea
            className={inputCls}
            rows={5}
            value={form.help}
            onChange={(e) => update("help", e.target.value)}
          />
        </Field>

        {submitError && (
          <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 mt-2 rounded-full bg-navy-950 px-6 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send & Book a Call"}
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
