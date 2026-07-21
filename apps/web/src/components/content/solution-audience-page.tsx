import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { ResearchUseBanner } from '@/components/marketing';
import { SOLUTIONS_NAV } from '@/lib/marketing-content';
import { cn } from '@/lib/utils';

type SolutionAudiencePageProps = {
  currentPath: string;
  title: string;
  description: string;
  highlights: readonly string[];
  highlightsTitle: string;
  cta: { href: string; label: string };
  children?: ReactNode;
};

export function SolutionAudiencePage({
  currentPath,
  title,
  description,
  highlights,
  highlightsTitle,
  cta,
  children,
}: SolutionAudiencePageProps) {
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
          <nav className="mb-4 text-sm text-neutral-500">
            <Link href="/solutions" className="transition-colors hover:text-brand-deep">
              Solutions
            </Link>
            <span className="mx-2 text-neutral-300" aria-hidden>
              /
            </span>
            <span className="text-brand-deep">{title}</span>
          </nav>
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Solutions
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="Solution audiences"
        className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
          {SOLUTIONS_NAV.map((item) => {
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-deep text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-brand-pale hover:text-brand-deep',
                )}
              >
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
            What you get
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
            {highlightsTitle}
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <li key={item} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale font-heading text-sm font-bold text-brand-deep">
                  {index + 1}
                </span>
                <p className="pt-1.5 text-sm leading-relaxed text-neutral-700 sm:text-base">{item}</p>
              </li>
            ))}
          </ul>
          {children}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Next step
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Ready to procure with confidence?
            </h2>
            <p className="mt-4 text-neutral-600">
              Browse the catalog, submit a quotation, or speak with our team about institutional and
              wholesale workflows.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex items-center text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                All solutions
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
            <h2 className="font-heading text-xl font-bold sm:text-2xl">Other audiences</h2>
            <ul className="mt-5 space-y-3">
              {SOLUTIONS_NAV.filter((item) => item.href !== currentPath).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-3 border-b border-white/15 pb-3 text-sm last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-white/90 group-hover:text-white">
                      {item.title}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-brand-leaf" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner />
        </div>
      </section>
    </>
  );
}
