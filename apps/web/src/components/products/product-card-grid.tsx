'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProductSummary } from '@mcpfac/shared-types';
import { ProductCard } from '@/components/products/product-card';
import { ProductCardSkeleton } from '@/components/products/product-card-skeleton';
import { slideUp, staggerChildren, staggerFor, variantsFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ProductCardGridProps = {
  products: ProductSummary[];
  className?: string;
  /** Hide items from this index upward below the `lg` breakpoint (show from `lg` up). */
  collapseBelowLgFromIndex?: number;
  /** Skeleton placeholders while loading the next page */
  skeletonCount?: number;
};

export function ProductCardGrid({
  products,
  className,
  collapseBelowLgFromIndex,
  skeletonCount = 0,
}: ProductCardGridProps) {
  const reduceMotion = useReducedMotion();
  const container = staggerFor(reduceMotion, staggerChildren);
  const item = variantsFor(reduceMotion, slideUp);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());
  const [isFirstPass, setIsFirstPass] = useState(true);

  useEffect(() => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      products.forEach((product) => next.add(product.id));
      return next;
    });
    setIsFirstPass(false);
  }, [products]);

  return (
    <motion.div
      className={cn(className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {products.map((product, index) => {
        const isAppended = !isFirstPass && !seenIds.has(product.id);

        return (
          <motion.div
            key={product.id}
            variants={item}
            initial={isAppended ? 'hidden' : undefined}
            animate="visible"
            className={cn(
              collapseBelowLgFromIndex != null &&
                index >= collapseBelowLgFromIndex &&
                'hidden lg:block',
            )}
          >
            <ProductCard product={product} />
          </motion.div>
        );
      })}
      {skeletonCount > 0
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))
        : null}
    </motion.div>
  );
}
