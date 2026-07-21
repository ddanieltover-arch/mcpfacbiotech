import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileCheck2, FileText, FlaskConical, ScrollText } from 'lucide-react';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Downloads Center',
  description:
    'Access COA, MSDS, HPLC, and other research documentation from MCPFAC BIOTECH. Start with the COA library for batch lookup.',
};

const DOCUMENT_TYPES = [
  {
    icon: FileCheck2,
    title: 'Certificates of Analysis (COA)',
    description: 'Lot identity and purity context — start in the COA library for batch requests.',
    href: '/coa',
    action: 'Open COA library',
  },
  {
    icon: ScrollText,
    title: 'Material Safety Data Sheets (MSDS)',
    description: 'Handling and safety notes where provided for catalog materials.',
    href: '/coa',
    action: 'Request via batch lookup',
  },
  {
    icon: FlaskConical,
    title: 'HPLC & analytical reports',
    description: 'Chromatographic and related packets when included with the lot documentation.',
    href: '/quality',
    action: 'Quality expectations',
  },
  {
    icon: FileText,
    title: 'Product specification sheets',
    description: 'Molecular data and storage guidance linked from individual catalog pages.',
    href: '/products',
    action: 'Browse catalog',
  },
] as const;

const DOWNLOAD_STEPS = [
  {
    title: 'Product documentation',
    description:
      'Open any product detail page and use the documentation section when files are attached.',
  },
  {
    title: 'Account order files',
    description:
      'Signed-in customers can retrieve order-related documents from their account after purchase.',
  },
  {
    title: 'Batch request',
    description:
      'If a file is missing, use COA batch lookup or contact support with SKU, lot, and document type.',
  },
] as const;

export default function DownloadsPage() {
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
            Downloads Center
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Central access point for research documentation distributed with our catalog — COA,
            MSDS, HPLC, and specification sheets where published.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/coa"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Open COA library
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact?subject=Documentation%20request"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
                Start here
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
                COA library for batch lookup
              </h2>
              <p className="mt-4 text-neutral-600">
                Need a Certificate of Analysis for a specific lot? Use the COA library for batch
                lookup, illustrative packet context, and documentation request routing.
              </p>
              <Link
                href="/coa#batch-lookup"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                Go to batch lookup
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-leaf">
                Before experimental use
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                Always match the lot reference on your shipment to the documentation on file. If a
                file is missing, include product SKU, batch number, and document type in your
                request.
              </p>
              <Link
                href="/quality"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-2 hover:underline"
              >
                Quality assurance notes
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Document types"
        title="What you can access"
        description="Availability varies by SKU. Confirm attachments on the product page or request unpublished lots via COA lookup."
        tone="muted"
      >
        <ul className="grid gap-8 sm:grid-cols-2">
          {DOCUMENT_TYPES.map((doc, index) => (
            <li key={doc.title} className="flex gap-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-deep ring-1 ring-neutral-200/80">
                <doc.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-heading text-xs font-bold tracking-widest text-brand-leaf">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 font-heading text-lg font-semibold text-brand-deep">
                  {doc.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{doc.description}</p>
                <Link
                  href={doc.href}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
                >
                  {doc.action}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection
        eyebrow="How to download"
        title="Three ways to retrieve files"
        description="Published docs stay on product pages; unpublished lots route through support or batch lookup."
        action={{ href: '/account', label: 'Go to account' }}
      >
        <ol className="space-y-5">
          {DOWNLOAD_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4 border-b border-neutral-200 pb-5 last:border-0 last:pb-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale font-heading text-sm font-bold text-brand-deep">
                {index + 1}
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold text-brand-deep">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner ctaHref="/coa" ctaLabel="Open COA library" />
        </div>
      </section>
    </>
  );
}
