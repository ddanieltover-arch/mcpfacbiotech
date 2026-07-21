'use client';

import { motion } from 'framer-motion';
import { TRUST_STATS } from '@/lib/marketing-content';
import { fadeIn, staggerChildren } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Stat = { value: string; label: string };

type StatGridProps = {
  stats?: ReadonlyArray<Stat>;
  className?: string;
};

export function StatGrid({ stats = TRUST_STATS, className }: StatGridProps) {
  return (
    <motion.div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6',
        className,
      )}
      variants={staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeIn}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm"
        >
          <p className="font-heading text-2xl font-bold text-brand-deep sm:text-3xl">{stat.value}</p>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
