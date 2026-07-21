import Link from 'next/link';
import type { ReactNode } from 'react';

type ContentPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  cta?: {
    href: string;
    label: string;
  };
};

/**
 * Shared shell for public marketing / informational pages.
 * Breadcrumb → header → body → optional CTA.
 */
export function ContentPage({
  title,
  description,
  eyebrow = 'MCPFAC BIOTECH',
  children,
  cta,
}: ContentPageProps) {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200 bg-gradient-to-br from-brand-pale via-white to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-brand-deep md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="prose-mcpfac space-y-6 text-neutral-700">{children}</div>

        {cta ? (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-natural"
            >
              {cta.label}
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-brand-deep">{title}</h2>
      <div className="mt-3 space-y-3 text-neutral-600">{children}</div>
    </div>
  );
}

export function ContentList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-neutral-600">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
