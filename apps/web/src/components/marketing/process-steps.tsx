'use client';

import { motion } from 'framer-motion';
import { PROCESS_STEPS } from '@/lib/marketing-content';
import { slideUp, staggerChildren } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Step = { step: string; title: string; description: string };

type ProcessStepsProps = {
  steps?: ReadonlyArray<Step>;
  className?: string;
};

export function ProcessSteps({ steps = PROCESS_STEPS, className }: ProcessStepsProps) {
  return (
    <motion.ol
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
      variants={staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {steps.map((item) => (
        <motion.li
          key={item.step}
          variants={slideUp}
          className="relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
            {item.step}
          </span>
          <h3 className="mt-2 font-heading text-lg font-semibold text-brand-deep">{item.title}</h3>
          <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
        </motion.li>
      ))}
    </motion.ol>
  );
}
