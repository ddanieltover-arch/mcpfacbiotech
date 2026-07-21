import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin } from 'lucide-react';
import { MarketingSection } from '@/components/marketing';
import {
  CAREERS_APPLY_STEPS,
  CAREERS_HERO,
  CAREERS_ROLE_FAMILIES,
  CONTACT_CHANNELS,
} from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Career opportunities at MCPFAC BIOTECH — operations, laboratory support, customer success, and digital product roles.',
};

export default function CareersPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 14% 20%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 88% 12%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-natural">
            {CAREERS_HERO.eyebrow}
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            {CAREERS_HERO.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            {CAREERS_HERO.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${CONTACT_CHANNELS.email}?subject=Career%20application`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Email your CV
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/about"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              About MCPFAC
            </Link>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Working with us"
        title="Help researchers access reliable materials"
        description="We periodically hire people who care about scientific quality, dependable fulfilment, and clear communication with laboratory buyers."
        tone="muted"
      >
        <div className="max-w-3xl border-l-2 border-brand-leaf pl-5 sm:pl-6">
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            If you are passionate about helping research institutions, universities, and laboratories
            source documented research materials, we would like to hear from you — even when a role is
            not formally posted.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Role families"
        title="Where you can contribute"
        description="Openings vary by season. Tell us which area fits your experience when you apply."
      >
        <ul className="grid gap-8 sm:grid-cols-2">
          {CAREERS_ROLE_FAMILIES.map((role, index) => (
            <li key={role.title} className="flex gap-4">
              <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-brand-deep">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{role.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <section className="border-y border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              How to apply
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Send a concise introduction
            </h2>
            <ol className="mt-6 space-y-4">
              {CAREERS_APPLY_STEPS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale font-heading text-sm font-bold text-brand-deep">
                    {index + 1}
                  </span>
                  <p className="pt-1.5 text-sm leading-relaxed text-neutral-700 sm:text-base">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">Ready to apply?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Applications are reviewed as roles open. Include your preferred role family and relevant
              experience so we can route your message quickly.
            </p>
            <a
              href={`mailto:${CONTACT_CHANNELS.email}?subject=Career%20application`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-pale"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {CONTACT_CHANNELS.email}
            </a>
            <p className="mt-6 flex gap-3 border-t border-white/15 pt-5 text-sm text-white/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-leaf" aria-hidden />
              Based in Shenzhen — serving research teams worldwide
            </p>
            <p className="mt-4 text-sm text-white/70">
              Learn more on{' '}
              <Link href="/about" className="font-medium text-white underline-offset-2 hover:underline">
                About
              </Link>{' '}
              or use the{' '}
              <Link href="/contact" className="font-medium text-white underline-offset-2 hover:underline">
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
