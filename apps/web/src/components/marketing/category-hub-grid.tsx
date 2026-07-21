'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_HUBS } from '@/lib/marketing-content';
import { slideUp, staggerChildren } from '@/lib/motion';
import { cn } from '@/lib/utils';

type CategoryHub = {
  title: string;
  description: string;
  href: string;
  examples?: string;
};

type CategoryHubGridProps = {
  categories?: ReadonlyArray<CategoryHub>;
  className?: string;
};

export function CategoryHubGrid({
  categories = CATEGORY_HUBS,
  className,
}: CategoryHubGridProps) {
  return (
    <motion.div
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
      variants={staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {categories.map((category) => (
        <motion.div key={category.href} variants={slideUp}>
          <Link
            href={category.href}
            className="group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-deep/30 hover:shadow-md"
          >
            <h3 className="font-heading text-lg font-semibold text-brand-deep group-hover:text-brand-natural">
              {category.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-neutral-600">{category.description}</p>
            {category.examples ? (
              <p className="mt-3 text-xs text-neutral-400">{category.examples}</p>
            ) : null}
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-natural">
              Open category <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
