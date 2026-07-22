'use client';

import { useState } from 'react';
import { PackageSearch } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { getProducts, PRODUCTS_PAGE_SIZE, type ProductListParams } from '@/lib/catalog-api';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductCardGrid } from './product-card-grid';

type ProductGridProps = {
  products: ProductSummary[];
  page: number;
  totalPages: number;
  total: number;
  filters: Omit<ProductListParams, 'page' | 'limit'>;
};

export function ProductGrid({
  products: initialProducts,
  page: initialPage,
  totalPages: initialTotalPages,
  total,
  filters,
}: ProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = page < totalPages;
  const skeletonCount = isLoading
    ? Math.min(PRODUCTS_PAGE_SIZE, Math.max(total - products.length, 2))
    : 0;

  const handleViewMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const catalog = await getProducts(
        {
          ...filters,
          page: nextPage,
          limit: PRODUCTS_PAGE_SIZE,
        },
        { cache: false },
      );

      if (catalog.items.length === 0) {
        setError('Could not load more products. Please try again.');
        return;
      }

      setProducts((current) => {
        const seen = new Set(current.map((product) => product.id));
        const appended = catalog.items.filter((product) => !seen.has(product.id));
        return [...current, ...appended];
      });
      setPage(catalog.page);
      setTotalPages(catalog.totalPages);
    } catch {
      setError('Could not load more products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="space-y-8">
      <ProductCardGrid
        products={products}
        skeletonCount={skeletonCount}
        className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3"
      />

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-neutral-500">
          Showing {products.length} of {total} products
        </p>

        {hasMore && (
          <button
            type="button"
            onClick={() => void handleViewMore()}
            disabled={isLoading}
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-brand-deep px-6 py-2.5 text-sm font-semibold text-white transition-[color,background-color,transform] duration-200 hover:bg-brand-natural disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.98]"
          >
            {isLoading ? 'Loading…' : 'View more'}
          </button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
