'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { ProductCardGrid } from '@/components/products/product-card-grid';
import { ProductCardSkeleton } from '@/components/products/product-card-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getProductsByIds } from '@/lib/catalog-api';
import { useWishlistStore } from '@/stores/wishlist.store';

export function WishlistPageClient() {
  const productIds = useWishlistStore((state) => state.productIds);
  const clearAll = useWishlistStore((state) => state.clearAll);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      try {
        const data = await getProductsByIds(productIds);
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [productIds]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Wishlist</h1>
        <p className="mt-2 text-neutral-600">Saved products for your research procurement workflow.</p>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          role="status"
          aria-label="Loading wishlist"
        >
          {Array.from({ length: Math.max(productIds.length, 3) }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Browse the catalog and save products for later review."
          action={{ href: '/products', label: 'Browse products' }}
          className="py-10 shadow-none"
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">{products.length} saved products</p>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear wishlist
            </button>
          </div>
          <ProductCardGrid
            products={products}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          />
        </>
      )}
    </div>
  );
}
