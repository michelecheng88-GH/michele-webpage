"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Insights" },
  { href: "/quiz", label: "Take the Quiz" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-cream-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-navy-950">
          Michele Cheng <span className="text-gold-500">·</span> S.A.F.E.R. AI™
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy-800 transition hover:text-gold-500"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quiz"
            className="rounded-full bg-navy-950 px-5 py-2 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
          >
            Book a Call
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-navy-950 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-navy-900/10 px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-navy-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
