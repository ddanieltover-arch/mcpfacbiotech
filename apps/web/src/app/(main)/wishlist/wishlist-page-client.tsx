'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ProductSummary } from '@mcpfac/shared-types';
import { ProductCard } from '@/components/products/product-card';
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
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-heading text-4xl font-bold text-brand-deep">Wishlist</h1>
          <p className="mt-3 text-neutral-600">Saved products for your research procurement workflow.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
            Loading wishlist...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-brand-deep">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Browse the catalog and save products for later review.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-neutral-600">{products.length} saved products</p>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear wishlist
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
