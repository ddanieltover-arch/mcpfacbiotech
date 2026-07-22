'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Beaker, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductSummary } from '@mcpfac/shared-types';
import { formatPrice, formatProductPrice } from '@/lib/catalog-api';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';

function defaultVariantId(product: ProductSummary): string | undefined {
  const variants = product.variants ?? [];
  if (variants.length === 0) return undefined;
  return variants.find((variant) => variant.isDefault)?.id ?? variants[0]?.id;
}

function sortVariantsByPriceAsc<T extends { price?: number }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const hasMeta = Boolean(product.casNumber || product.purity);
  const addToCart = useCartStore((s) => s.addItem);
  const variants = useMemo(
    () => sortVariantsByPriceAsc(product.variants ?? []),
    [product.variants],
  );
  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(() => defaultVariantId(product));

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId),
    [variants, selectedVariantId],
  );

  const displayPrice = selectedVariant?.price ?? product.price;
  const variantGroupLabel = variants[0]?.name ?? 'Option';

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (displayPrice == null) {
      toast.error('Pricing unavailable — open the product to request a quote');
      return;
    }

    if (hasVariants && !selectedVariant) {
      toast.error('Please select an option');
      return;
    }

    await addToCart(
      {
        productId: product.id,
        productName: selectedVariant
          ? `${product.name} (${selectedVariant.name}: ${selectedVariant.value})`
          : product.name,
        productSku: product.sku,
        productImage: product.imageUrl,
        unitPrice: displayPrice,
        variantId: selectedVariant?.id,
        variantLabel: selectedVariant
          ? `${selectedVariant.name}: ${selectedVariant.value}`
          : undefined,
      },
      1,
    );
    toast.success('Added to cart');
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200/80 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-brand-pale/30"
      >
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
          {hasVariants ? (
            <div>
              <label
                htmlFor={`variant-${product.id}`}
                className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-neutral-500 sm:text-xs"
              >
                {variantGroupLabel}
              </label>
              <select
                id={`variant-${product.id}`}
                value={selectedVariantId ?? ''}
                onChange={(event) => setSelectedVariantId(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-xs text-neutral-800 outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20 sm:text-sm"
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.value}
                    {variant.price != null ? ` — ${formatPrice(variant.price)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-heading text-base font-bold text-brand-deep sm:text-xl">
                {formatPrice(displayPrice)}
              </p>
              {hasVariants &&
              product.priceMin != null &&
              product.priceMax != null &&
              product.priceMin !== product.priceMax ? (
                <p className="mt-0.5 text-[10px] text-neutral-500 sm:text-xs">
                  {formatProductPrice(product)}
                </p>
              ) : null}
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-natural transition-colors hover:text-brand-deep sm:text-sm"
            >
              View <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {displayPrice != null ? (
            <Button
              type="button"
              size="sm"
              fullWidth
              onClick={(e) => void handleAddToCart(e)}
              className="gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
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
