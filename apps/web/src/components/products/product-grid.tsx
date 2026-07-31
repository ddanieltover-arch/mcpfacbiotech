import Link from 'next/link';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { PRODUCTS_PAGE_SIZE } from '@/lib/catalog-api';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { ProductCardGrid } from './product-card-grid';

type ProductGridProps = {
  products: ProductSummary[];
  page: number;
  totalPages: number;
  total: number;
  /** Current catalog query string params (without `page`) for pagination links. */
  query: Record<string, string | undefined>;
};

function buildPageHref(query: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

function visiblePages(total: number): number[] {
  return Array.from({ length: total }, (_, index) => index + 1);
}

export function ProductGrid({ products, page, totalPages, total, query }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        description="Try adjusting your filters or search terms to discover more research products."
        action={{ href: '/products', label: 'Clear filters' }}
      />
    );
  }

  const rangeStart = (page - 1) * PRODUCTS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PRODUCTS_PAGE_SIZE, total);
  const pages = visiblePages(totalPages);
  const showPagination = totalPages > 1;

  return (
    <div className="space-y-8">
      <ProductCardGrid
        products={products}
        className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3"
      />

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-neutral-500">
          Showing {rangeStart}–{rangeEnd} of {total} products
        </p>

        {showPagination ? (
          <nav aria-label="Product pages" className="flex flex-wrap items-center justify-center gap-1.5">
            <Link
              href={buildPageHref(query, page - 1)}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
              className={cn(
                'inline-flex h-10 items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-leaf hover:bg-neutral-50',
                page <= 1 && 'pointer-events-none opacity-40',
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </Link>

            {pages.map((entry) => (
              <Link
                key={entry}
                href={buildPageHref(query, entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors',
                  entry === page
                    ? 'bg-brand-deep text-white'
                    : 'border border-neutral-300 bg-white text-neutral-700 hover:border-brand-leaf hover:bg-neutral-50',
                )}
              >
                {entry}
              </Link>
            ))}

            <Link
              href={buildPageHref(query, page + 1)}
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
              className={cn(
                'inline-flex h-10 items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-leaf hover:bg-neutral-50',
                page >= totalPages && 'pointer-events-none opacity-40',
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
