'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PROCESS_STEPS } from '@/lib/marketing-content';
import { slideUp, staggerChildren, staggerFor, variantsFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Step = { step: string; title: string; description: string };

type ProcessStepsProps = {
  steps?: ReadonlyArray<Step>;
  className?: string;
};

export function ProcessSteps({ steps = PROCESS_STEPS, className }: ProcessStepsProps) {
  const reduceMotion = useReducedMotion();
  const container = staggerFor(reduceMotion, staggerChildren);
  const item = variantsFor(reduceMotion, slideUp);

  return (
    <motion.ol
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {steps.map((itemStep) => (
        <motion.li
          key={itemStep.step}
          variants={item}
          className="relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
            {itemStep.step}
          </span>
          <h3 className="mt-2 font-heading text-lg font-semibold text-brand-deep">
            {itemStep.title}
          </h3>
          <p className="mt-2 text-sm text-neutral-600">{itemStep.description}</p>
        </motion.li>
      ))}
    </motion.ol>
  );
}
