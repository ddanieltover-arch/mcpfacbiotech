import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileCheck2, FlaskConical, Search } from 'lucide-react';
import { CoaBatchLookup } from '@/components/content/coa-batch-lookup';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'COA Library',
  description:
    'Certificates of Analysis for MCPFAC BIOTECH research materials — batch lookup, HPLC identity notes, and documentation access.',
};

const PACKET_ITEMS = [
  'Certificate of Analysis (COA) with lot identity',
  'HPLC purity / primary-peak context when included',
  'MSDS and handling notes where provided',
  'Links from catalog product pages when files are attached',
] as const;

const ACCESS_STEPS = [
  {
    icon: Search,
    title: 'Product page',
    body: 'Open the SKU and use the documentation section when files are attached.',
  },
  {
    icon: FileCheck2,
    title: 'Downloads Center',
    body: 'Browse document types and account-linked files from prior orders.',
  },
  {
    icon: FlaskConical,
    title: 'Batch lookup',
    body: 'Request a packet by SKU and lot if the file is not published online yet.',
  },
] as const;

const RELATED_LINKS = [
  {
    href: '/downloads',
    title: 'Downloads Center',
    description: 'MSDS, HPLC, and other document types',
  },
  {
    href: '/quality',
    title: 'Quality Assurance',
    description: 'COA-first workflow and purity expectations',
  },
  {
    href: '/research',
    title: 'Research library',
    description: 'Literature-oriented peptide briefs',
  },
  {
    href: '/products',
    title: 'Product catalog',
    description: 'SKU pages with specs and attached docs',
  },
] as const;

export default function CoaLibraryPage() {
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
            Documentation
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            COA library
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Batch-level Certificates of Analysis and related analytical packets for research
            procurement. Verify lot documentation before experimental use.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#batch-lookup"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Batch lookup
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
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
        eyebrow="What you receive"
        title="Documentation packets for receiving docks"
        description="Where published, each research lot maps to a packet suitable for laboratory receiving and protocol packages. Availability varies by SKU."
        tone="muted"
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {PACKET_ITEMS.map((item, index) => (
            <li key={item} className="flex gap-4">
              <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">{item}</p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-stretch gap-10 px-4 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Example packet
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Illustrative certificate fields
            </h2>
            <p className="mt-4 text-neutral-600">
              Real certificates are lot-specific. Do not use this example for experimental decisions.
            </p>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-leaf">
                COA · example only
              </p>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-white/60">Lot</dt>
                  <dd className="mt-1 font-heading text-base font-semibold">MCP-EX-2409</dd>
                </div>
                <div>
                  <dt className="text-white/60">Analyte</dt>
                  <dd className="mt-1 font-heading text-base font-semibold">
                    Research peptide (example)
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60">HPLC purity</dt>
                  <dd className="mt-1 font-heading text-base font-semibold">99.4% (illustrative)</dd>
                </div>
                <div>
                  <dt className="text-white/60">Methods</dt>
                  <dd className="mt-1 font-heading text-base font-semibold">
                    HPLC · LC–MS (when on file)
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              How to get a COA
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Three paths to documentation
            </h2>
            <ol className="mt-6 space-y-5">
              {ACCESS_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-heading text-base font-semibold text-brand-deep">
                      <span className="mr-2 text-brand-leaf">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="batch-lookup"
        className="scroll-mt-24 border-y border-neutral-200 bg-neutral-50 py-14 sm:py-16"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Batch lookup
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Request a lot packet
            </h2>
            <p className="mt-4 text-neutral-600">
              Enter the product SKU and batch number from your vial or packing slip. Until the full
              document CMS is live, this form opens an email request to our documentation team.
            </p>
            <p className="mt-4 border-l-2 border-brand-leaf pl-5 text-sm text-neutral-600">
              For published lots, check the product page documentation section or Downloads Center
              first.
            </p>
          </div>
          <CoaBatchLookup />
        </div>
      </section>

      <MarketingSection
        eyebrow="Related"
        title="More documentation surfaces"
        description="Pair COA requests with quality standards, downloads, and catalog specs."
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
