import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Clock, Mail } from 'lucide-react';
import { ContactForm } from '@/components/content/contact-form';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';
import { CONTACT_CHANNELS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Get help with MCPFAC BIOTECH orders, shipping, COA documentation, and account issues for research procurement.',
};

const BEFORE_YOU_WRITE = [
  'Have your order or quote number ready when possible',
  'Include product SKUs for documentation requests',
  'Describe shipping issues with photos if packages arrived damaged',
] as const;

const HELPFUL_LINKS = [
  {
    href: '/faq',
    title: 'FAQ',
    description: 'Research use, shipping, payments, and returns',
  },
  {
    href: '/coa',
    title: 'COA library / batch lookup',
    description: 'Request lot documentation packets',
  },
  {
    href: '/shipping',
    title: 'Shipping information',
    description: 'Rates, dispatch windows, and customs',
  },
  {
    href: '/returns',
    title: 'Return policy',
    description: 'Damaged or incorrect shipments',
  },
  {
    href: '/contact',
    title: 'Contact form',
    description: 'General sales and inquiry messages',
  },
  {
    href: '/account',
    title: 'Account portal',
    description: 'Orders, quotes, and invoices when signed in',
  },
] as const;

export default function SupportPage() {
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
            Customer care
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Support
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Help with orders, documentation requests, shipping issues, and account questions for
            research procurement.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600">
            <a
              href={`mailto:${CONTACT_CHANNELS.email}`}
              className="inline-flex items-center gap-2 font-medium text-brand-deep transition-colors hover:text-brand-natural"
            >
              <Mail className="h-4 w-4 text-brand-leaf" aria-hidden />
              {CONTACT_CHANNELS.email}
            </a>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-leaf" aria-hidden />
              {CONTACT_CHANNELS.hours}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Browse FAQ
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#support-form"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Submit a request
            </a>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Before you write"
        title="Details that speed up resolution"
        description="A few specifics help us route your message to the right specialist."
        tone="muted"
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          {BEFORE_YOU_WRITE.map((item, index) => (
            <li key={item} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white font-heading text-sm font-bold text-brand-deep ring-1 ring-neutral-200/80">
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-neutral-700 sm:text-base">{item}</p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <section className="border-y border-neutral-200 bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <aside>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Helpful links
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep">
              Self-serve first
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              Many answers live on dedicated policy and documentation pages.
            </p>
            <ul className="mt-6 space-y-4">
              {HELPFUL_LINKS.map((link, index) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex gap-4">
                    <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="inline-flex items-center gap-1.5 font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                        {link.title}
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        {link.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div id="support-form" className="scroll-mt-24">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Submit a request
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep">
              Support message
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              Full ticket tracking will connect to the customer portal in a later release. For now,
              send a support message below and our team will follow up by email — typically within
              one business day.
            </p>
            <div className="mt-6">
              <Suspense fallback={<p className="text-sm text-neutral-500">Loading form…</p>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner ctaHref="/faq" ctaLabel="Browse FAQ" />
        </div>
      </section>
    </>
  );
}
