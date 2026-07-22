'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { slideUp, staggerChildren, staggerFor, variantsFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

type MarketingSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'muted' | 'brand';
};

export function MarketingSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  tone = 'default',
}: MarketingSectionProps) {
  const reduceMotion = useReducedMotion();
  const header = staggerFor(reduceMotion, staggerChildren);
  const item = variantsFor(reduceMotion, slideUp);

  return (
    <section
      className={cn(
        'py-14 sm:py-16',
        tone === 'muted' && 'bg-neutral-50',
        tone === 'brand' && 'bg-gradient-to-br from-brand-pale via-white to-white',
        tone === 'default' && 'bg-white',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
          variants={header}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.div variants={item} className="max-w-2xl">
            {eyebrow ? (
              <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-neutral-600">{description}</p>
            ) : null}
          </motion.div>
          {action ? (
            <motion.div variants={item}>
              <Link
                href={action.href}
                className="shrink-0 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                {action.label}
              </Link>
            </motion.div>
          ) : null}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
