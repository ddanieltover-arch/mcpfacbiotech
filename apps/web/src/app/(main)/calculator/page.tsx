import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PeptideCalculator } from '@/components/content/peptide-calculator';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Peptide Calculator',
  description:
    'Laboratory peptide reconstitution calculator — concentration and aliquot volume planning for research use only.',
};

const HOW_TO_STEPS = [
  'Enter the peptide mass on the vial label (mg)',
  'Enter the solvent volume you will add (mL)',
  'Enter the aliquot size you want to draw for your assay (mcg)',
  'Review concentration (mg/mL) and suggested draw volume (mL / U-100 units)',
] as const;

const RELATED_LINKS = [
  {
    href: '/research/peptide-basics-reconstitution',
    title: 'Peptide basics & reconstitution',
    description: 'Storage and aliquoting notes for laboratory workflows',
  },
  {
    href: '/coa',
    title: 'COA library',
    description: 'Verify lot documentation before wet-lab work',
  },
  {
    href: '/quality',
    title: 'Quality Assurance',
    description: 'Purity expectations and documentation workflow',
  },
  {
    href: '/products',
    title: 'Product catalog',
    description: 'Browse research materials with published specs',
  },
] as const;

export default function CalculatorPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 14% 18%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 86% 12%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Research tools
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Peptide reconstitution calculator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Plan concentration and aliquot volume after reconstituting lyophilized research peptides.
            For laboratory use only — not medical or dosing advice.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#calculator"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Open calculator
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/research/peptide-basics-reconstitution"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Reconstitution guide
            </Link>
          </div>
        </div>
      </section>

      <section
        id="calculator"
        className="scroll-mt-24 border-y border-neutral-200 bg-white py-14 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Interactive tool
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Concentration & aliquot planning
            </h2>
            <p className="mt-3 text-neutral-600">
              Adjust inputs to estimate solution concentration and the volume needed for a chosen
              research aliquot.
            </p>
          </div>
          <PeptideCalculator />
        </div>
      </section>

      <MarketingSection
        eyebrow="How to use"
        title="Four steps before the bench"
        description="Cross-check vial labels and COA documentation before wet-lab work."
        tone="muted"
        action={{ href: '/coa', label: 'COA library' }}
      >
        <ol className="grid gap-5 sm:grid-cols-2">
          {HOW_TO_STEPS.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale font-heading text-sm font-bold text-brand-deep">
                {index + 1}
              </span>
              <p className="pt-1.5 text-sm leading-relaxed text-neutral-700 sm:text-base">{step}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection
        eyebrow="Related"
        title="Pair the calculator with documentation"
        description="Use these resources alongside reconstitution planning for research protocols."
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {RELATED_LINKS.map((item, index) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex gap-4">
                <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="inline-flex items-center gap-1.5 font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                    {item.title}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">{item.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner />
        </div>
      </section>
    </>
  );
}
