import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';
import { fetchFaqItems } from '@/lib/cms-content';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about research-use products, purity, COA documentation, shipping, payments, and returns.',
};

export const revalidate = 60;

const RELATED_RESOURCES = [
  {
    href: '/quality',
    title: 'Quality Assurance',
    description: 'COA / HPLC workflow and purity expectations',
  },
  {
    href: '/shipping',
    title: 'Shipping Information',
    description: 'Standard $25 / Priority Express $50 and dispatch windows',
  },
  {
    href: '/downloads',
    title: 'Downloads Center',
    description: 'COA, MSDS, and HPLC access',
  },
  {
    href: '/returns',
    title: 'Return Policy',
    description: 'Damaged or incorrect shipments',
  },
] as const;

export default async function FaqPage() {
  const faqItems = await fetchFaqItems();

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
            Support
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Quick answers on research use, purity, COA documentation, shipping tiers, payments, and
            returns. For deeper policy detail, use the linked resources below.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Contact support
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Support center
            </Link>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Common questions"
        title="Answers for research buyers"
        description="Tap a question to expand. Topics cover research-use framing, documentation, logistics, and payments."
      >
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={faqItems} />
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Related resources"
        title="Go deeper when you need policy detail"
        description="Full pages for quality, shipping, documentation, and returns."
        tone="muted"
        action={{ href: '/contact', label: 'Still need help?' }}
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {RELATED_RESOURCES.map((item, index) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex gap-4">
                <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                    {item.title}
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
          <ResearchUseBanner ctaHref="/contact" ctaLabel="Contact our team" />
        </div>
      </section>
    </>
  );
}
