'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ProductSummary } from '@mcpfac/shared-types';
import { AvailabilityBadge } from '@/components/products/availability-badge';
import { formatPrice, getProductsByIds } from '@/lib/catalog-api';
import { useCompareStore } from '@/stores/compare.store';

export function ComparePageClient() {
  const productIds = useCompareStore((state) => state.productIds);
  const clearAll = useCompareStore((state) => state.clearAll);
  const removeItem = useCompareStore((state) => state.removeItem);
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

  const rows = [
    { label: 'SKU', getValue: (product: ProductSummary) => product.sku },
    { label: 'CAS Number', getValue: (product: ProductSummary) => product.casNumber ?? '—' },
    { label: 'Purity', getValue: (product: ProductSummary) => product.purity ?? '—' },
    { label: 'Price', getValue: (product: ProductSummary) => formatPrice(product.price) },
    {
      label: 'Availability',
      getValue: (product: ProductSummary) => product.availability,
      isBadge: true,
    },
  ] as const;

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-heading text-4xl font-bold text-brand-deep">Compare Products</h1>
          <p className="mt-3 text-neutral-600">
            Side-by-side comparison of up to four research products.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
            Loading comparison...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-brand-deep">No products to compare</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add products from the catalog to compare specifications and pricing.
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
              <p className="text-sm text-neutral-600">{products.length} of 4 products selected</p>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear compare list
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-700">Attribute</th>
                    {products.map((product) => (
                      <th key={product.id} className="min-w-[220px] px-4 py-4 text-left">
                        <div className="space-y-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-heading text-sm font-semibold text-brand-deep hover:text-brand-natural"
                          >
                            {product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(product.id)}
                            className="block text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-4 text-sm font-medium text-neutral-500">{row.label}</td>
                      {products.map((product) => (
                        <td key={`${row.label}-${product.id}`} className="px-4 py-4 text-sm text-neutral-900">
                          {'isBadge' in row && row.isBadge ? (
                            <AvailabilityBadge availability={product.availability} />
                          ) : (
                            row.getValue(product)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
