import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { ProductCardGrid } from '@/components/products/product-card-grid';
import { cn } from '@/lib/utils';

type ProductShelfProps = {
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  actionLabel?: string;
  products: ProductSummary[];
  tone?: 'default' | 'muted';
};

export function ProductShelf({
  eyebrow,
  title,
  description,
  href,
  actionLabel = 'View all',
  products,
  tone = 'default',
}: ProductShelfProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'py-14 sm:py-16',
        tone === 'muted' ? 'bg-neutral-50' : 'bg-white',
        tone === 'default' && 'border-y border-neutral-200',
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-natural">
              {eyebrow}
            </p>
            <h2 className="font-heading text-2xl font-bold text-brand-deep sm:text-3xl">{title}</h2>
            {description ? (
              <p className="mt-3 max-w-2xl text-neutral-600">{description}</p>
            ) : null}
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep hover:text-brand-natural"
          >
            {actionLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductCardGrid
          products={products}
          className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
          collapseBelowLgFromIndex={6}
        />
      </div>
    </section>
  );
}
