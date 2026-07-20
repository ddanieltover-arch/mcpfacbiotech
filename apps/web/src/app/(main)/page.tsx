import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Hero Section — Placeholder until Milestone 2 */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-pale px-4 py-2 text-sm font-medium text-brand-deep">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-leaf" />
          Platform Under Development
        </div>

        <h1 className="mb-4 font-heading text-5xl font-bold tracking-tight text-brand-deep md:text-6xl lg:text-7xl">
          MCPFAC{' '}
          <span className="text-gradient">BIOTECH</span>
        </h1>

        <p className="mb-2 font-heading text-lg font-medium tracking-wide text-brand-natural">
          Learn • Understand • Grow
        </p>

        <p className="mx-auto mb-8 max-w-xl text-lg text-neutral-600">
          Enterprise-grade biotechnology research products and laboratory supplies.
          Serving research institutions, universities, and pharmaceutical companies worldwide.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
          >
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { title: 'Research Peptides', desc: 'High-purity peptides for research applications' },
          { title: 'Quality Assured', desc: 'COA, MSDS, and HPLC reports for every product' },
          { title: 'Global Shipping', desc: 'Reliable delivery to laboratories worldwide' },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="mb-2 font-heading text-lg font-semibold text-brand-deep">
              {feature.title}
            </h3>
            <p className="text-sm text-neutral-600">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer placeholder */}
      <footer className="mt-20 pb-8 text-center text-sm text-neutral-400">
        © 2016–{new Date().getFullYear()} MCPFAC BIOTECH. All rights reserved.
      </footer>
    </main>
  );
}
