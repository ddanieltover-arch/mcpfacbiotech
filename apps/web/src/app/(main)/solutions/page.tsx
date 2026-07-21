import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';
import { SOLUTIONS_NAV } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Procurement solutions for universities, research labs, pharma companies, and distributors.',
};

export default function SolutionsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 88% 10%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Institutional & partner paths
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Solutions
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Purpose-built purchasing paths for the institutions and partners we serve — from campus
            procurement to wholesale distribution.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Talk to sales
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Browse catalog
            </Link>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Choose your path"
        title="Built for how you procure"
        description="Select your organization type to see capabilities, quotation workflows, and next steps."
      >
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {SOLUTIONS_NAV.map((solution, index) => (
            <li key={solution.href}>
              <Link
                href={solution.href}
                className="group flex flex-col gap-3 py-7 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-8"
              >
                <div className="flex min-w-0 gap-4">
                  <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-brand-deep group-hover:text-brand-natural sm:text-2xl">
                      {solution.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                      {solution.description}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-natural">
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Shared capabilities
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Documentation, quoting, and fulfilment
            </h2>
            <p className="mt-4 text-neutral-600">
              Every solution path connects to the same research catalog, COA-forward documentation
              where published, and checkout shipping options for laboratory delivery.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { href: '/coa', label: 'COA library' },
              { href: '/shipping', label: 'Shipping information' },
              { href: '/quality', label: 'Quality assurance' },
              { href: '/faq', label: 'FAQ' },
            ].map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between border-b border-neutral-200 pb-4"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-heading font-semibold text-brand-deep group-hover:text-brand-natural">
                      {item.label}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-brand-leaf" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner ctaHref="/contact" ctaLabel="Talk to sales" />
        </div>
      </section>
    </>
  );
}
