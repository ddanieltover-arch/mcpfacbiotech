'use client';

import { FlaskConical, FileCheck2, ShieldCheck, Truck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { WHY_US_FEATURES } from '@/lib/marketing-content';
import { slideUp, staggerChildren, staggerFor, variantsFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

const ICONS = [ShieldCheck, FlaskConical, FileCheck2, Truck] as const;

type Feature = { title: string; description: string };

type WhyUsGridProps = {
  features?: ReadonlyArray<Feature>;
  className?: string;
};

export function WhyUsGrid({ features = WHY_US_FEATURES, className }: WhyUsGridProps) {
  const reduceMotion = useReducedMotion();
  const container = staggerFor(reduceMotion, staggerChildren);
  const item = variantsFor(reduceMotion, slideUp);

  return (
    <motion.div
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {features.map((feature, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <motion.div
            key={feature.title}
            variants={item}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-heading text-base font-semibold text-brand-deep">{feature.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
