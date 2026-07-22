'use client';

import { useMemo, useState } from 'react';
import type { ProductDetail, ProductVariant } from '@mcpfac/shared-types';
import { formatPrice } from '@/lib/catalog-api';
import { ProductActions } from '@/components/products/product-actions';

function pickDefaultVariant(variants: ProductVariant[]): ProductVariant | undefined {
  if (variants.length === 0) return undefined;
  return variants.find((variant) => variant.isDefault) ?? variants[0];
}

function sortVariantsByPriceAsc(variants: ProductVariant[]): ProductVariant[] {
  return [...variants].sort(
    (a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY),
  );
}

export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const variants = useMemo(
    () => sortVariantsByPriceAsc(product.variants ?? []),
    [product.variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => pickDefaultVariant(variants)?.id,
  );

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId),
    [variants, selectedVariantId],
  );

  const unitPrice = selectedVariant?.price ?? product.price;
  const displaySku = selectedVariant?.sku || product.sku;
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  const optionGroups = useMemo(() => {
    const groups = new Map<string, ProductVariant[]>();
    for (const variant of variants) {
      const existing = groups.get(variant.name) ?? [];
      existing.push(variant);
      groups.set(variant.name, existing);
    }
    return Array.from(groups.entries());
  }, [variants]);

  return (
    <div className="border-y border-neutral-200 py-6">
      <p className="font-heading text-3xl font-bold text-brand-deep">{formatPrice(unitPrice)}</p>
      {product.priceMin != null &&
      product.priceMax != null &&
      product.priceMin !== product.priceMax &&
      !selectedVariant ? (
        <p className="mt-1 text-sm text-neutral-500">
          From {formatPrice(product.priceMin)} – {formatPrice(product.priceMax)}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-neutral-500">
        Minimum order quantity: {product.minimumOrderQuantity}
      </p>

      {optionGroups.length > 0 ? (
        <div className="mt-5 space-y-4">
          {optionGroups.map(([groupName, groupVariants]) => (
            <div key={groupName}>
              <p className="mb-2 text-sm font-medium text-neutral-700">{groupName}</p>
              <div className="flex flex-wrap gap-2">
                {groupVariants.map((variant) => {
                  const active = variant.id === selectedVariantId;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? 'border-brand-deep bg-brand-pale text-brand-deep'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-brand-leaf hover:bg-neutral-50'
                      }`}
                    >
                      <span className="block font-medium">{variant.value}</span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {formatPrice(variant.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5">
        <ProductActions
          productId={product.id}
          productName={product.name}
          productSku={displaySku}
          unitPrice={unitPrice}
          productImage={primaryImage?.url}
          minimumOrderQuantity={product.minimumOrderQuantity}
          variantId={selectedVariant?.id}
          variantLabel={
            selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined
          }
        />
      </div>
    </div>
  );
}
