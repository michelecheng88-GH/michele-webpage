import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy-900/10 bg-navy-950 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-cream-50">Michele Cheng</p>
          <p className="mt-2 text-sm text-cream-100/70">
            AI implementation &amp; program management for Singapore SMEs — built on the
            S.A.F.E.R. AI™ framework.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-gold-400">Explore</p>
          <Link href="/services" className="text-cream-100/70 hover:text-gold-300">
            Services
          </Link>
          <Link href="/blog" className="text-cream-100/70 hover:text-gold-300">
            Insights
          </Link>
          <Link href="/quiz" className="text-cream-100/70 hover:text-gold-300">
            S.A.F.E.R. AI Quiz
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-gold-400">Get in touch</p>
          <p className="text-cream-100/70">Singapore</p>
          <Link href="/quiz" className="text-cream-100/70 hover:text-gold-300">
            Book a 30-min call →
          </Link>
        </div>
      </div>
      <div className="border-t border-cream-100/10 px-6 py-4 text-center text-xs text-cream-100/50">
        © {new Date().getFullYear()} Michele Cheng. All rights reserved.
      </div>
    </footer>
  );
}
