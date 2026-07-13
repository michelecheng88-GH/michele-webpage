import Link from "next/link";
import type { Metadata } from "next";
import { getServices } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Services — Michele Cheng",
  description: "Four ways to work with Michele Cheng on AI readiness and implementation.",
};

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof getServices>> = [];
  let loadError = false;
  try {
    services = await getServices();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-navy-950">Couldn&apos;t load services</h1>
        <p className="mt-3 text-navy-800/80">Please try again in a moment.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
          Services
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-950">
          Four ways to work together
        </h1>
        <p className="mt-4 text-navy-800/80">
          From a focused diagnostic to hands-on implementation — pick the tier that
          matches where you are today.
        </p>
      </div>

      {services.length === 0 ? (
        <p className="mt-16 text-navy-800/60">
          Services are being updated — check back soon.
        </p>
      ) : (
        <div className="mt-14 flex flex-col gap-6">
          {services.map((service) => {
            const ctaHref =
              service.tier_number === 2
                ? "/services/pilot"
                : service.tier_number === 4
                  ? "/services/advisory"
                  : "/quiz";
            return (
              <div
                key={service.id}
                id={`tier-${service.tier_number}`}
                className={`scroll-mt-24 rounded-2xl border p-8 ${
                  service.is_featured
                    ? "border-gold-500 bg-white shadow-md"
                    : "border-navy-900/10 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-navy-950 px-3 py-1 text-xs font-semibold text-gold-400">
                    Tier {service.tier_number}
                  </span>
                  {service.is_featured && (
                    <span className="rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-500">
                      Most popular
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-navy-950">{service.title}</h2>
                <p className="mt-2 text-sm font-medium text-navy-800/70">
                  {service.short_description}
                </p>
                <p className="mt-4 text-navy-800/80">{service.full_description}</p>
                <Link
                  href={ctaHref}
                  className="mt-6 inline-block rounded-full bg-navy-950 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-gold-500 hover:text-navy-950"
                >
                  {service.cta_label}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
