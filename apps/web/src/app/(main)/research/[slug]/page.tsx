import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ResearchUseBanner } from '@/components/marketing';
import {
  getAllResearchSlugs,
  getResearchArticle,
  RESEARCH_ARTICLES,
} from '@/lib/research-articles';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllResearchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) {
    return { title: 'Research article' };
  }
  return {
    title: article.title,
    description: article.excerpt,
  };
}

const RESOURCE_LINKS = [
  { href: '/calculator', label: 'Peptide calculator' },
  { href: '/coa', label: 'COA library' },
  { href: '/quality', label: 'Quality assurance' },
  { href: '/products', label: 'Browse catalog' },
] as const;

export default async function ResearchArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getResearchArticle(slug);
  if (!article) notFound();

  const related = RESEARCH_ARTICLES.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-deep text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 0% 0%, rgba(82, 183, 136, 0.25) 0%, transparent 45%), radial-gradient(circle at 100% 100%, rgba(45, 106, 79, 0.5) 0%, transparent 40%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14 lg:py-16">
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-leaf transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Research library
          </Link>

          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-brand-leaf">
            {article.category}
            <span className="mx-2 text-white/30" aria-hidden>
              ·
            </span>
            {article.readingTime} read
          </p>

          <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {article.excerpt}
          </p>
        </div>
      </section>

      <section className="bg-neutral-50/80 bg-lab-pattern py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
            <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-pale/50 to-white px-6 py-4 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
                Educational brief — not medical advice
              </p>
            </div>

            <div className="divide-y divide-neutral-100 px-6 py-2 sm:px-8">
              {article.sections.map((section, index) => (
                <section key={section.heading} className="scroll-mt-28 py-7 sm:py-8">
                  <div className="flex gap-4">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale font-heading text-sm font-bold text-brand-deep"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-heading text-lg font-semibold tracking-tight text-brand-deep sm:text-xl">
                        {section.heading}
                      </h2>
                      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                        ))}
                        {section.bullets ? (
                          <ul className="space-y-0 overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200/70">
                            {section.bullets.map((item, bulletIndex) => (
                              <li
                                key={item}
                                className={`flex gap-3 px-4 py-3 text-neutral-700 ${
                                  bulletIndex > 0 ? 'border-t border-neutral-200/70' : ''
                                }`}
                              >
                                <span
                                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-leaf"
                                  aria-hidden
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </article>

          {related.length > 0 ? (
            <div className="mt-10">
              <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
                More from the library
              </p>
              <ul className="mt-4 space-y-4">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/research/${item.slug}`}
                      className="group flex items-start justify-between gap-4 border-b border-neutral-200 pb-4"
                    >
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-brand-natural">
                          {item.category}
                        </span>
                        <span className="mt-1 block font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                          {item.title}
                        </span>
                      </span>
                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0 text-brand-leaf transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-neutral-200/80 sm:p-7">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Related resources
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-natural"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <ResearchUseBanner ctaHref="/products" ctaLabel="Browse research catalog" />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to research library
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
