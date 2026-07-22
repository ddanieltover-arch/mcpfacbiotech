import Link from 'next/link';
import type { Metadata } from 'next';
import {
  CategoryHubGrid,
  ComparisonTable,
  HomeHero,
  MarketingSection,
  ProcessSteps,
  PromoBar,
  ResearchUseBanner,
  TestimonialGrid,
  WhyUsGrid,
} from '@/components/marketing';
import { HomeProductShelves } from '@/components/products/home-product-shelves';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { HOME_FAQ_TEASER } from '@/lib/marketing-content';

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

      <HomeHero />

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
