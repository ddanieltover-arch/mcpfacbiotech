import Link from 'next/link';
import { FeaturedProductsSection } from '@/components/products/featured-products-section';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-start justify-center px-4 py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-deep shadow-sm ring-1 ring-brand-pale">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-leaf" />
            Enterprise Research Catalog Live
          </div>

          <h1 className="max-w-4xl font-heading text-5xl font-bold tracking-tight text-brand-deep md:text-6xl lg:text-7xl">
            MCPFAC <span className="text-gradient">BIOTECH</span>
          </h1>

          <p className="mb-2 mt-4 font-heading text-lg font-medium tracking-wide text-brand-natural">
            Learn • Understand • Grow
          </p>

          <p className="mb-8 max-w-2xl text-lg text-neutral-600">
            Browse research peptides, analytical standards, and laboratory supplies with verified
            documentation, transparent specifications, and global laboratory delivery.
          </p>

          <div className="flex flex-wrap items-center gap-4">
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
      </section>

      <FeaturedProductsSection />

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
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
      </section>
    </>
  );
}
