import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Beaker } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { formatPrice } from '@/lib/catalog-api';
import { AvailabilityBadge } from './availability-badge';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-brand-pale/30">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-natural">
            <Beaker className="h-12 w-12" strokeWidth={1.25} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {product.categoryName && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-natural">
                {product.categoryName}
              </p>
            )}
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-heading text-lg font-semibold text-brand-deep transition-colors group-hover:text-brand-natural">
                {product.name}
              </h3>
            </Link>
          </div>
          <AvailabilityBadge availability={product.availability} />
        </div>

        <dl className="mb-4 space-y-1 text-sm text-neutral-600">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">SKU</dt>
            <dd className="font-mono text-xs">{product.sku}</dd>
          </div>
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

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
          <p className="font-heading text-xl font-bold text-brand-deep">{formatPrice(product.price)}</p>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
          >
            View <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
