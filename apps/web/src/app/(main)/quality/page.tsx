import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileCheck2, FlaskConical, ShieldCheck, ThermometerSnowflake } from 'lucide-react';
import {
  ComparisonTable,
  MarketingSection,
  ResearchUseBanner,
} from '@/components/marketing';
import { QUALITY_PILLARS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Quality Assurance',
  description:
    'COA-forward quality practices for MCPFAC BIOTECH — HPLC-oriented purity targets, identity documentation, and laboratory storage guidance.',
};

const PILLAR_ICONS = [FlaskConical, ShieldCheck, FileCheck2, ThermometerSnowflake] as const;

const PURITY_EXPECTATIONS = [
  '99%+ purity target where batch COAs are published for lyophilized peptides',
  'Identity confirmation referenced via HPLC and, when available, mass spectrometry',
  'Clear product identity, molecular data, and storage guidance on catalog pages',
  'Traceable order and invoice records for institutional receiving docks',
] as const;

export default function QualityPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 22%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 90% 8%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Quality assurance
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Specifications you can verify
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Scientific trust starts with consistent specifications, verifiable documentation, and
            packaging that protects research materials in transit.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/coa"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              COA library
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/downloads"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Downloads Center
            </Link>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="COA-first workflow"
        title="Documentation built into procurement"
        description="Catalog products are presented with the analytical context laboratories need — not listings without batch context."
        tone="muted"
      >
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-neutral-700 sm:text-lg">
          <p>
            Where batch documents are published, you can cross-check Certificates of Analysis (COA),
            HPLC reports, and Material Safety Data Sheets (MSDS) from product pages or the{' '}
            <Link
              href="/downloads"
              className="font-medium text-brand-deep underline-offset-2 hover:underline"
            >
              Downloads Center
            </Link>
            .
          </p>
          <p className="border-l-2 border-brand-leaf pl-5 text-neutral-600 sm:pl-6">
            Always match the lot reference on your shipment to the documentation on file before
            experimental use. If a file is missing for your SKU, contact support with the product code
            and document type requested.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Quality pillars"
        title="How we frame laboratory trust"
        description="Four practices that shape how materials are listed, documented, and prepared for dispatch."
        action={{ href: '/products', label: 'Browse catalog' }}
      >
        <ul className="grid gap-8 sm:grid-cols-2">
          {QUALITY_PILLARS.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
            return (
              <li key={pillar.title} className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-brand-deep">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{pillar.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </MarketingSection>

      <MarketingSection
        eyebrow="Purity & identity"
        title="What laboratories should expect"
        description="Clear targets where documents are published — always confirm lot-level records before use."
        tone="muted"
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {PURITY_EXPECTATIONS.map((item, index) => (
            <li key={item} className="flex gap-4">
              <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">{item}</p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection
        eyebrow="How we compare"
        title="Standards at a glance"
        description="A concise view of purity, documentation, and logistics expectations versus common industry averages."
      >
        <ComparisonTable />
      </MarketingSection>

      <section className="border-y border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Cold-chain & packaging
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Integrity through transit
            </h2>
            <p className="mt-4 text-neutral-600">
              Temperature-sensitive and lyophilized materials are packed to protect integrity during
              transit. Desiccated primary containment and discrete outer packaging are used where
              appropriate. Special handling notes appear on applicable product pages — follow those
              instructions on receipt.
            </p>
            <Link
              href="/shipping"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
            >
              Shipping information
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">Need a batch document?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Use the COA library for published files, or contact support with your product code and
              document type.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/coa"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-pale"
              >
                Open COA library
              </Link>
              <Link
                href="/contact?subject=COA%20%2F%20batch%20document%20request"
                className="inline-flex items-center text-sm font-semibold text-white/90 underline-offset-2 hover:underline"
              >
                Request a file
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner ctaHref="/products" ctaLabel="Browse research catalog" />
        </div>
      </section>
    </>
  );
}
