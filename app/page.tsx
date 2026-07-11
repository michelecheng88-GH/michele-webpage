import Link from "next/link";
import { getServices, type Service } from "@/lib/data/services";
import { SAFER_DIMENSIONS } from "@/lib/content/safer";

export default async function HomePage() {
  let services: Service[] = [];
  let loadError = false;
  try {
    services = await getServices();
  } catch {
    loadError = true;
  }
  const featured = services.slice(0, 3);

  if (loadError) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Something went wrong</h1>
        <p className="mt-3 text-navy-800/80">
          We couldn&apos;t load this page. Please try again in a moment.
        </p>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-500">
            For Singapore SME leaders
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-navy-950 md:text-6xl">
            Your AI pilot isn&apos;t failing because of the technology.
          </h1>
          <p className="mt-6 text-lg text-navy-800 md:text-xl">
            I help COOs, CFOs, and GMs find exactly where their AI readiness is stuck —
            using the S.A.F.E.R. AI™ framework, built from managing operations at national
            scale. No hype. No jargon. A clear diagnostic and a plan you can act on this
            quarter.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/quiz"
              className="rounded-full bg-navy-950 px-8 py-4 text-center text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
            >
              Take the Free S.A.F.E.R. AI Quiz
            </Link>
            <Link
              href="/quiz"
              className="rounded-full border border-navy-950/20 px-8 py-4 text-center text-sm font-semibold text-navy-950 transition hover:border-gold-500 hover:text-gold-500"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </section>

      {/* Michele's story */}
      <section className="bg-navy-950 py-20 text-cream-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[220px_1fr]">
          <div className="flex justify-center md:justify-start">
            <div
              aria-hidden
              className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-4xl font-bold text-navy-950 md:h-48 md:w-48"
            >
              MC
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
              Michele&apos;s story
            </p>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              From managing 100,000+ devices in national programmes to helping SMEs get
              the basics right.
            </h2>
            <p className="mt-6 max-w-2xl text-cream-100/80">
              I&apos;ve spent my career in operations and program management at a scale where
              &quot;approximately&quot; isn&apos;t good enough — national deployments, government
              programmes, and large-scale asset tracking where governance and data quality
              are the whole job, not an afterthought.
            </p>
            <p className="mt-4 max-w-2xl text-cream-100/80">
              What I learned at scale applies directly to SMEs: AI cannot fix a broken
              foundation, but it can powerfully scale a healthy one. My job is to find
              exactly which foundation piece is missing — and help you fix it before you
              spend on a pilot that&apos;s doomed to stall.
            </p>
          </div>
        </div>
      </section>

      {/* Core services */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
            How I help
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
            Three ways to get unstuck
          </h2>
        </div>

        {featured.length === 0 ? (
          <p className="text-navy-800/60">Services are being updated — check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-navy-900/10 bg-white p-8 shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Tier {service.tier_number}
                </span>
                <h3 className="mt-3 text-xl font-bold text-navy-950">{service.title}</h3>
                <p className="mt-3 flex-1 text-sm text-navy-800/80">
                  {service.short_description}
                </p>
                <Link
                  href="/services"
                  className="mt-6 text-sm font-semibold text-navy-950 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-500"
                >
                  {service.cta_label} →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/services" className="text-sm font-semibold text-navy-950 hover:text-gold-500">
            View all services →
          </Link>
        </div>
      </section>

      {/* S.A.F.E.R. framework */}
      <section className="bg-cream-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
              The framework
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              The S.A.F.E.R. AI™ Framework
            </h2>
            <p className="mt-4 text-navy-800/80">
              Five dimensions that determine whether AI will help your business — or expose
              the cracks already in it.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {SAFER_DIMENSIONS.map((dim) => (
              <div key={dim.key} className="rounded-2xl border border-navy-900/10 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950 text-lg font-bold text-gold-400">
                  {dim.key}
                </div>
                <h3 className="mt-4 font-bold text-navy-950">{dim.name}</h3>
                <p className="mt-2 text-xs font-semibold text-gold-500">{dim.tagline}</p>
                <p className="mt-3 text-sm text-navy-800/80">{dim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 rounded-3xl bg-navy-950 px-8 py-12 text-cream-50 md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-gold-400">100,000+</p>
            <p className="mt-2 text-sm text-cream-100/80">
              devices managed across national-scale programmes
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold-400">5</p>
            <p className="mt-2 text-sm text-cream-100/80">
              S.A.F.E.R. dimensions assessed in a 5-minute quiz
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold-400">SG</p>
            <p className="mt-2 text-sm text-cream-100/80">
              Singapore-based, PDPA and IMDA-aware guidance
            </p>
          </div>
        </div>
      </section>

      {/* Bottom dual CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-navy-950">
          Where is your AI readiness actually stuck?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-800/80">
          Take the free 5-minute S.A.F.E.R. AI quiz and get a scored profile with
          personalised recommendations.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/quiz"
            className="rounded-full bg-navy-950 px-8 py-4 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
          >
            Take the Free S.A.F.E.R. AI Quiz
          </Link>
          <Link
            href="/quiz"
            className="rounded-full border border-navy-950/20 px-8 py-4 text-sm font-semibold text-navy-950 transition hover:border-gold-500 hover:text-gold-500"
          >
            Book a Call
          </Link>
        </div>
      </section>
    </main>
  );
}
