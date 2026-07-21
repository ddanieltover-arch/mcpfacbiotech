import Link from 'next/link';
import type { Metadata } from 'next';
import {
  CategoryHubGrid,
  ComparisonTable,
  MarketingSection,
  ProcessSteps,
  PromoBar,
  ResearchUseBanner,
  StatGrid,
  TestimonialGrid,
  WhyUsGrid,
} from '@/components/marketing';
import { HomeProductShelves } from '@/components/products/home-product-shelves';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { HOME_FAQ_TEASER, HOME_HERO } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: {
    absolute: 'MCPFAC BIOTECH — Research Peptides & Laboratory Materials',
  },
  description:
    'High-purity research peptides, chemicals, and laboratory supplies with transparent specifications, COA-backed documentation, and global laboratory fulfilment.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MCPFAC BIOTECH — Research Peptides & Laboratory Materials',
    description:
      'High-purity research peptides, chemicals, and laboratory supplies with transparent specifications and COA-backed documentation.',
  },
};

export default function HomePage() {
  return (
    <>
      <PromoBar />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-deep shadow-sm ring-1 ring-brand-pale">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-leaf" />
              {HOME_HERO.eyebrow}
            </p>

            <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl lg:text-6xl">
              {HOME_HERO.title}
              <br />
              <span className="text-gradient">{HOME_HERO.titleAccent}</span>
            </h1>

            <p className="mt-3 font-heading text-base font-medium tracking-wide text-brand-natural sm:text-lg">
              Learn • Understand • Grow
            </p>

            <p className="mt-5 max-w-xl text-base text-neutral-600 sm:text-lg">
              {HOME_HERO.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={HOME_HERO.primaryCta.href}
                className="inline-flex items-center rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
              >
                {HOME_HERO.primaryCta.label}
              </Link>
              <Link
                href={HOME_HERO.secondaryCta.href}
                className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
              >
                {HOME_HERO.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-deep/10 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
              Laboratory trust signals
            </p>
            <StatGrid className="mt-5" />
            <p className="mt-5 text-xs leading-relaxed text-neutral-500">
              Specs and batch documents vary by SKU. Always confirm purity and COA availability on the
              product page before experimental use.
            </p>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Shop by category"
        title="Product categories"
        description="Navigate the catalogue by scientific grouping — peptides, specialty compounds, and laboratory supplies."
        action={{ href: '/products', label: 'View all products' }}
        tone="muted"
      >
        <CategoryHubGrid />
      </MarketingSection>

      <HomeProductShelves />

      <MarketingSection
        eyebrow="Why laboratories choose MCPFAC"
        title="Quality, documentation, and fulfilment"
        description="We supply research materials with transparent specifications — not commodity listings without analytical context."
      >
        <WhyUsGrid />
      </MarketingSection>

      <MarketingSection
        eyebrow="The research standard"
        title="How our standards compare"
        description="A concise view of purity, documentation, and logistics expectations versus common industry averages."
        tone="muted"
      >
        <ComparisonTable />
      </MarketingSection>

      <MarketingSection
        eyebrow="Sourcing simplified"
        title="From catalog to dispatch"
        description="A streamlined procurement path designed for modern research environments."
      >
        <ProcessSteps />
      </MarketingSection>

      <MarketingSection
        eyebrow="Investigator feedback"
        title="What research teams report"
        description="Illustrative narratives reflecting documentation and procurement priorities — not clinical endorsements."
        tone="muted"
      >
        <TestimonialGrid />
      </MarketingSection>

      <MarketingSection
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Quick answers on research use, documentation, shipping, and payments."
        action={{ href: '/faq', label: 'View all FAQ topics' }}
      >
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={[...HOME_FAQ_TEASER]} />
        </div>
      </MarketingSection>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner />
        </div>
      </section>
    </>
  );
}
