'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProductSummary } from '@mcpfac/shared-types';
import { ProductCard } from '@/components/products/product-card';
import { ProductCardSkeleton } from '@/components/products/product-card-skeleton';
import { easeOut } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ProductCardGridProps = {
  products: ProductSummary[];
  className?: string;
  /** Hide items from this index upward below the `lg` breakpoint (show from `lg` up). */
  collapseBelowLgFromIndex?: number;
  /** Skeleton placeholders while loading the next page */
  skeletonCount?: number;
};

/** Cap entrance stagger so large catalog pages never sit at opacity 0 for seconds. */
const MAX_STAGGERED_ITEMS = 12;
const STAGGER_DELAY = 0.05;

export function ProductCardGrid({
  products,
  className,
  collapseBelowLgFromIndex,
  skeletonCount = 0,
}: ProductCardGridProps) {
  const reduceMotion = useReducedMotion();
  /** Count of products already committed after paint — new items animate from this index. */
  const committedCountRef = useRef(0);
  const animateFrom = committedCountRef.current;

  useEffect(() => {
    committedCountRef.current = products.length;
  }, [products]);

  return (
    <div className={cn(className)}>
      {products.map((product, index) => {
        const itemClassName = cn(
          collapseBelowLgFromIndex != null &&
            index >= collapseBelowLgFromIndex &&
            'hidden lg:block',
        );
        const isNew = index >= animateFrom;
        const staggerIndex = index - animateFrom;
        const shouldAnimate =
          !reduceMotion && isNew && staggerIndex < MAX_STAGGERED_ITEMS;

        if (!shouldAnimate) {
          return (
            <div key={product.id} className={itemClassName}>
              <ProductCard product={product} />
            </div>
          );
        }

        return (
          <motion.div
            key={product.id}
            className={itemClassName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: staggerIndex * STAGGER_DELAY,
              ease: easeOut,
            }}
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
    </div>
  );
}
