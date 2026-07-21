import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, FileText, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LEGAL_NAV = [
  {
    href: '/terms',
    label: 'Terms & Conditions',
    short: 'Terms',
    blurb: 'Website use, orders, and liability',
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
    short: 'Privacy',
    blurb: 'How we handle account and order data',
  },
  {
    href: '/returns',
    label: 'Return Policy',
    short: 'Returns',
    blurb: 'Damaged or incorrect shipments',
  },
  {
    href: '/cookies',
    label: 'Cookie Policy',
    short: 'Cookies',
    blurb: 'Sessions, cart, and analytics',
  },
] as const;

type LegalPageProps = {
  title: string;
  description: string;
  currentPath: string;
  updated?: string;
  children: ReactNode;
  cta?: {
    href: string;
    label: string;
  };
};

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

type LegalListProps = {
  items: string[];
};

function splitSectionTitle(title: string): { index?: string; label: string } {
  const match = title.match(/^(\d+)\.\s+(.*)$/);
  if (!match) return { label: title };
  return { index: match[1], label: match[2] };
}

/**
 * Shared shell for Terms, Privacy, Returns, and Cookies.
 */
export function LegalPage({
  title,
  description,
  currentPath,
  updated = '21 July 2026',
  children,
  cta,
}: LegalPageProps) {
  const active = LEGAL_NAV.find((item) => item.href === currentPath);

  return (
    <>
      {/* Compact brand document header */}
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
          <div className="flex flex-wrap items-center gap-3 text-sm text-brand-leaf">
            <span className="inline-flex items-center gap-2 font-medium uppercase tracking-wide">
              <Scale className="h-4 w-4" aria-hidden />
              Legal
            </span>
            <span className="text-white/30" aria-hidden>
              /
            </span>
            <span className="text-white/70">{active?.short ?? 'Policy'}</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white/85 ring-1 ring-white/15">
              <FileText className="h-3.5 w-3.5 text-brand-leaf" aria-hidden />
              Last updated {updated}
            </span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-medium text-brand-leaf transition-colors hover:text-white"
            >
              Questions? Contact support
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile policy switcher */}
      <nav
        aria-label="Legal policies"
        className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur lg:hidden"
      >
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
          {LEGAL_NAV.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
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

      {/* Document body + sticky sidebar */}
      <section className="bg-neutral-50/80 bg-lab-pattern">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 lg:py-16">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
                  Policies
                </p>
                <ul className="mt-3 space-y-1">
                  {LEGAL_NAV.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'block rounded-lg px-3 py-2.5 transition-colors',
                            isActive
                              ? 'bg-brand-deep text-white shadow-sm'
                              : 'text-neutral-700 hover:bg-white hover:text-brand-deep',
                          )}
                        >
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span
                            className={cn(
                              'mt-0.5 block text-xs',
                              isActive ? 'text-white/70' : 'text-neutral-500',
                            )}
                          >
                            {item.blurb}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-xl bg-white p-4 ring-1 ring-neutral-200/80">
                <p className="text-sm font-semibold text-brand-deep">Need clarification?</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Our team can help with order, shipping, or documentation questions.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
                >
                  Contact us
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>

          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
            <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-pale/50 to-white px-6 py-5 sm:px-8 sm:py-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
                Official policy document
              </p>
              <p className="mt-1 font-heading text-lg font-semibold text-brand-deep">{title}</p>
            </div>

            <div className="divide-y divide-neutral-100 px-6 py-2 sm:px-8">
              {children}
            </div>

            {cta ? (
              <div className="border-t border-neutral-100 bg-neutral-50/80 px-6 py-6 sm:px-8">
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : null}
          </article>
        </div>
      </section>
    </>
  );
}

export function LegalSection({ title, children }: LegalSectionProps) {
  const { index, label } = splitSectionTitle(title);

  return (
    <section className="scroll-mt-28 py-7 sm:py-8">
      <div className="flex gap-4">
        {index ? (
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale font-heading text-sm font-bold text-brand-deep"
            aria-hidden
          >
            {index}
          </span>
        ) : (
          <span className="mt-2 h-8 w-1 shrink-0 rounded-full bg-brand-leaf" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-brand-deep sm:text-xl">
            {label}
          </h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-600 sm:text-base [&_a]:font-medium [&_a]:text-brand-deep [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:font-semibold [&_strong]:text-brand-deep">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LegalList({ items }: LegalListProps) {
  return (
    <ul className="space-y-0 overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200/70">
      {items.map((item, index) => (
        <li
          key={item}
          className={cn(
            'flex gap-3 px-4 py-3 text-[15px] text-neutral-700 sm:text-base',
            index > 0 && 'border-t border-neutral-200/70',
          )}
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-leaf" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
