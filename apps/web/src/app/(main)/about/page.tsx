import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Mail, MapPin } from 'lucide-react';
import {
  MarketingSection,
  ResearchUseBanner,
  WhyUsGrid,
} from '@/components/marketing';
import {
  ABOUT_HERO,
  ABOUT_HIGHLIGHTS,
  ABOUT_IMAGES,
  ABOUT_OFFERINGS,
  CONTACT_CHANNELS,
} from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'MCPFAC BIOTECH is a Shenzhen-based biotechnology research laboratory and global supplier established in 2016 — Learn · Understand · Grow.',
};

export default function AboutPage() {
  return (
    <>
      {/* Full-bleed lab hero — darkened + brand-tinted for readable type */}
      <section className="relative isolate min-h-[70vh] overflow-hidden bg-brand-deep text-white sm:min-h-[78vh]">
        <Image
          src={ABOUT_IMAGES.hero.src}
          alt={ABOUT_IMAGES.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.45] contrast-[1.1] saturate-[0.7]"
        />
        <div className="absolute inset-0 bg-brand-deep/55 mix-blend-multiply" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/92 to-brand-deep/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/40 to-brand-deep/50"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:min-h-[78vh] sm:pb-20 sm:pt-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-leaf">
              {ABOUT_HERO.eyebrow}
            </p>

            <h1 className="font-heading text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
              {ABOUT_HERO.title}
            </h1>

            <p className="mt-4 font-heading text-lg font-medium tracking-wide text-brand-leaf sm:text-xl">
              {ABOUT_HERO.subtitle}
            </p>

            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
              {ABOUT_HERO.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-deep shadow-md transition-all hover:bg-brand-pale"
              >
                Explore catalog
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg border border-white/50 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/15"
              >
                Contact our team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-neutral-200 sm:grid-cols-4 sm:divide-x">
          {ABOUT_HIGHLIGHTS.map((item) => (
            <div key={item.label} className="px-4 py-8 text-center sm:py-10">
              <p className="font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
                {item.value}
              </p>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:text-sm sm:normal-case sm:tracking-normal">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <MarketingSection
        eyebrow="Our mission"
        title="Help researchers Learn · Understand · Grow"
        description="We focus on transparent specifications, verified documentation, and dependable fulfilment so laboratories can move from inquiry to experiment with confidence."
        tone="muted"
      >
        <div className="max-w-3xl border-l-2 border-brand-leaf pl-5 sm:pl-6">
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            Established in <strong className="font-semibold text-brand-deep">2016</strong> and based
            in Shenzhen, China, MCPFAC BIOTECH serves research institutions, universities,
            pharmaceutical companies, laboratories, distributors, and international buyers
            worldwide.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Capabilities"
        title="What we provide"
        description="Research materials and procurement support designed for modern laboratory environments."
        action={{ href: '/products', label: 'Browse products' }}
      >
        <ul className="grid gap-8 sm:grid-cols-2">
          {ABOUT_OFFERINGS.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-brand-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection
        eyebrow="Lab standards"
        title="Quality, documentation, and fulfilment"
        description="The same standards we emphasise across the catalog — purity context, COA-forward listings, and reliable dispatch."
        tone="muted"
        action={{ href: '/quality', label: 'Quality assurance' }}
      >
        <WhyUsGrid />
      </MarketingSection>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Wholesale & institutions
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Built for research procurement
            </h2>
            <p className="mt-4 text-neutral-600">
              Volume and customer-group pricing is available for universities, research labs, and
              distributors. Share SKUs, quantities, and delivery location — or submit a quote from
              your cart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
              >
                Request a quote
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/shipping"
                className="inline-flex items-center text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                Shipping options
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-heading text-xl font-bold sm:text-2xl">Location & support</h2>
            <p className="mt-4 flex gap-3 text-sm leading-relaxed text-white/90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-leaf" aria-hidden />
              {CONTACT_CHANNELS.address}
            </p>
            <p className="mt-3 flex items-center gap-3 text-sm text-white/90">
              <Mail className="h-4 w-4 shrink-0 text-brand-leaf" aria-hidden />
              <a
                className="font-medium text-white underline-offset-2 hover:text-brand-leaf hover:underline"
                href={`mailto:${CONTACT_CHANNELS.email}`}
              >
                {CONTACT_CHANNELS.email}
              </a>
            </p>
            <p className="mt-6 border-t border-white/15 pt-5 text-xs leading-relaxed text-white/70">
              Support hours: {CONTACT_CHANNELS.hours}. {CONTACT_CHANNELS.response}.
            </p>
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
