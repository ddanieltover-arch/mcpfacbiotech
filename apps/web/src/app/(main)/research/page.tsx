import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';
import { RESEARCH_ARTICLES } from '@/lib/research-articles';

export const metadata: Metadata = {
  title: 'Research Library',
  description:
    'Peptide research briefs and laboratory guides for qualified researchers — mechanisms, literature themes, and reconstitution notes. Not medical advice.',
};

const RELATED_TOOLS = [
  {
    href: '/calculator',
    title: 'Peptide calculator',
    description: 'Reconstitution concentration and aliquot volume',
  },
  {
    href: '/downloads',
    title: 'Downloads Center',
    description: 'COA, MSDS, and HPLC where published',
  },
  {
    href: '/quality',
    title: 'Quality Assurance',
    description: 'Documentation and purity expectations',
  },
  {
    href: '/blog',
    title: 'Blog',
    description: 'Procurement, shipping, and compliance notes',
  },
] as const;

export default function ResearchPage() {
  const [featured, ...rest] = RESEARCH_ARTICLES;

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
            Educational resources
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Peptide research library
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Summaries, mechanisms, and literature-oriented notes for qualified researchers — not
            medical advice. Pair readings with our documentation library and catalogue.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Explore catalog
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Peptide calculator
            </Link>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Featured brief
            </p>
            <Link href={`/research/${featured.slug}`} className="group mt-3 block max-w-4xl">
              <p className="text-sm text-neutral-500">
                {featured.category}
                <span className="mx-2 text-neutral-300" aria-hidden>
                  ·
                </span>
                {featured.readingTime} read
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-brand-deep transition-colors group-hover:text-brand-natural sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                {featured.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural">
                Read brief
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
      <MarketingSection
        eyebrow="Browse library"
        title="Briefs & laboratory guides"
        description="Literature-oriented peptide notes for controlled research contexts — verify lot documentation before experimental use."
        tone="muted"
      >
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200 bg-white">
          {rest.map((article, index) => (
            <li key={article.slug}>
              <Link
                href={`/research/${article.slug}`}
                className="group flex flex-col gap-2 px-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-2"
              >
                <div className="flex min-w-0 gap-4">
                  <span className="hidden font-heading text-sm font-bold tracking-widest text-brand-leaf sm:block">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
                      {article.category}
                    </p>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-brand-deep group-hover:text-brand-natural">
                      {article.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-sm text-neutral-500 sm:text-right">
                  <p>{article.readingTime}</p>
                  <span className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-natural sm:mt-3">
                    Read
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>
      ) : null}

      <MarketingSection
        eyebrow="Related tools"
        title="Pair reading with lab workflows"
        description="Use these surfaces alongside research briefs for documentation, reconstitution, and procurement."
        action={{ href: '/faq', label: 'View FAQ' }}
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {RELATED_TOOLS.map((tool, index) => (
            <li key={tool.href}>
              <Link href={tool.href} className="group flex gap-4">
                <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                    {tool.title}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">{tool.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner ctaHref="/products" ctaLabel="Browse research catalog" />
        </div>
      </section>
    </>
  );
}
