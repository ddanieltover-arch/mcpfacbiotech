'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Beaker, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductSummary } from '@mcpfac/shared-types';
import { formatPrice } from '@/lib/catalog-api';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';

export function ProductCard({ product }: { product: ProductSummary }) {
  const hasMeta = Boolean(product.casNumber || product.purity);
  const addToCart = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (product.price == null) {
      toast.error('Pricing unavailable — open the product to request a quote');
      return;
    }

    setAdding(true);
    try {
      await addToCart(
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productImage: product.imageUrl,
          unitPrice: product.price,
        },
        1,
      );
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200/80 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brand-pale/30">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-[12%] transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-natural">
            <Beaker className="h-12 w-12" strokeWidth={1.25} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="mb-2 min-w-0 sm:mb-3">
          {product.categoryName && (
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-brand-natural sm:text-xs">
              {product.categoryName}
            </p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading text-sm font-semibold text-brand-deep transition-colors group-hover:text-brand-natural sm:text-lg">
              {product.name}
            </h3>
          </Link>
        </div>

        {hasMeta && (
          <dl className="mb-3 hidden space-y-1 text-sm text-neutral-600 sm:mb-4 sm:block">
            {product.casNumber && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">CAS</dt>
                <dd>{product.casNumber}</dd>
              </div>
            )}
            {product.purity && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Purity</dt>
                <dd>{product.purity}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-auto space-y-3 border-t border-neutral-100 pt-3 sm:pt-4">
          <div className="flex items-end justify-between gap-3">
            <p className="font-heading text-base font-bold text-brand-deep sm:text-xl">
              {formatPrice(product.price)}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-natural transition-colors hover:text-brand-deep sm:text-sm"
            >
              View <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {product.price != null ? (
            <Button
              type="button"
              size="sm"
              fullWidth
              isLoading={adding}
              onClick={(e) => void handleAddToCart(e)}
              className="gap-1.5"
            >
              {!adding ? <ShoppingCart className="h-3.5 w-3.5" /> : null}
              Add to Cart
            </Button>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-brand-deep bg-transparent px-3 text-xs font-semibold text-brand-deep transition-colors hover:bg-brand-pale/60"
            >
              Request Quote
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
