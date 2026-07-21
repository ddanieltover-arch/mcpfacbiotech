import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { RESEARCH_ARTICLES } from '@/lib/research-articles';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Lab procurement notes, shipping guidance, and compliance reminders from MCPFAC BIOTECH — plus links to the research library.',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

const POSTS = [...BLOG_POSTS].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

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
            Updates
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Procurement notes, logistics explainers, and compliance reminders for research buyers.
            For peptide mechanism briefs, visit the Research library.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Research library
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              FAQ
            </Link>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Featured
            </p>
            <Link href={`/blog/${featured.slug}`} className="group mt-3 block max-w-4xl">
              <p className="text-sm text-neutral-500">
                {featured.category}
                <span className="mx-2 text-neutral-300" aria-hidden>
                  ·
                </span>
                {formatDate(featured.publishedAt)}
                <span className="mx-2 text-neutral-300" aria-hidden>
                  ·
                </span>
                {featured.readingTime}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-brand-deep transition-colors group-hover:text-brand-natural sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                {featured.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural">
                Read post
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <MarketingSection
          eyebrow="Latest posts"
          title="More from the editorial desk"
          description="Short updates for laboratory buyers — documentation, shipping, and compliance framing."
          tone="muted"
        >
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200 bg-white">
            {rest.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-2 px-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
                      {post.category}
                    </p>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-brand-deep group-hover:text-brand-natural">
                      {post.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="shrink-0 text-sm text-neutral-500 sm:text-right">
                    <p>{formatDate(post.publishedAt)}</p>
                    <p className="mt-0.5">{post.readingTime}</p>
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
        eyebrow="Research library"
        title="Peptide briefs & guides"
        description="Literature-oriented notes for qualified researchers — not medical advice."
        action={{ href: '/research', label: 'Browse all briefs' }}
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {RESEARCH_ARTICLES.slice(0, 4).map((article, index) => (
            <li key={article.slug}>
              <Link href={`/research/${article.slug}`} className="group flex gap-4">
                <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="font-heading text-base font-semibold text-brand-deep group-hover:text-brand-natural">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    {article.category} · {article.readingTime}
                  </span>
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
