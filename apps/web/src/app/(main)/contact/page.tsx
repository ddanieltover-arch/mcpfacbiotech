import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Clock, Mail, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/content/contact-form';
import { ResearchUseBanner } from '@/components/marketing';
import {
  CONTACT_CHANNELS,
  CONTACT_HERO,
  CONTACT_QUICK_PATHS,
} from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact MCPFAC BIOTECH for product inquiries, bulk quotations, COA requests, shipping questions, and laboratory support.',
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(27, 67, 50, 0.08) 0%, transparent 40%), radial-gradient(circle at 88% 10%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-natural">
            {CONTACT_HERO.eyebrow}
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            {CONTACT_HERO.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            {CONTACT_HERO.description}
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
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <aside className="space-y-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
                Direct channels
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep">
                How to reach us
              </h2>

              <ul className="mt-6 space-y-6">
                <li className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-brand-deep">Email</p>
                    <a
                      href={`mailto:${CONTACT_CHANNELS.email}`}
                      className="mt-1 block text-sm font-medium text-brand-natural underline-offset-2 hover:underline"
                    >
                      {CONTACT_CHANNELS.email}
                    </a>
                    <p className="mt-1 text-xs text-neutral-500">{CONTACT_CHANNELS.response}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
                    <Clock className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-brand-deep">Support hours</p>
                    <p className="mt-1 text-sm text-neutral-700">{CONTACT_CHANNELS.hours}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Orders on business days typically enter preparation within 24–48 hours when
                      stock allows.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-brand-deep">Address</p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                      {CONTACT_CHANNELS.address}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
                Quick paths
              </p>
              <ul className="mt-4 space-y-4">
                {CONTACT_QUICK_PATHS.map((path, index) => (
                  <li key={path.href}>
                    <Link
                      href={path.href}
                      className="group flex gap-4 transition-colors"
                    >
                      <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="flex items-center gap-1.5 font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                          {path.title}
                          <ArrowRight
                            className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-500">
                          {path.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Send a message
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep">
              Laboratory inquiry form
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              For research use only. Include your organization name and intended research application
              when requesting quotations.
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
          <ResearchUseBanner ctaHref="/products" ctaLabel="Browse catalog" />
        </div>
      </section>
    </>
  );
}
