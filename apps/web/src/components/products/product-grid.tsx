import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { ProductCard } from './product-card';

type ProductGridProps = {
  products: ProductSummary[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
};

function buildPageHref(
  page: number,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === 'page' || value == null) return;
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized) params.set(key, normalized);
  });

  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

export function ProductGrid({ products, page, totalPages, searchParams }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <h3 className="font-heading text-xl font-semibold text-brand-deep">No products found</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Try adjusting your filters or search terms to discover more research products.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <Link
            href={buildPageHref(page - 1, searchParams)}
            aria-disabled={page <= 1}
            className={`inline-flex items-center gap-1 text-sm font-medium ${
              page <= 1
                ? 'pointer-events-none text-neutral-300'
                : 'text-brand-deep hover:text-brand-natural'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>

          <p className="text-sm text-neutral-600">
            Page {page} of {totalPages}
          </p>

          <Link
            href={buildPageHref(page + 1, searchParams)}
            aria-disabled={page >= totalPages}
            className={`inline-flex items-center gap-1 text-sm font-medium ${
              page >= totalPages
                ? 'pointer-events-none text-neutral-300'
                : 'text-brand-deep hover:text-brand-natural'
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
