'use client';

import { Quote } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/marketing-content';
import { slideUp, staggerChildren, staggerFor, variantsFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Testimonial = { quote: string; author: string; role: string };

type TestimonialGridProps = {
  items?: ReadonlyArray<Testimonial>;
  className?: string;
};

export function TestimonialGrid({ items = TESTIMONIALS, className }: TestimonialGridProps) {
  const reduceMotion = useReducedMotion();
  const container = staggerFor(reduceMotion, staggerChildren);
  const item = variantsFor(reduceMotion, slideUp);

  return (
    <motion.div
      className={cn('grid gap-4 md:grid-cols-3', className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((entry) => (
        <motion.blockquote
          key={entry.author + entry.role}
          variants={item}
          className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <Quote className="h-5 w-5 text-brand-leaf" aria-hidden />
          <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700">
            &ldquo;{entry.quote}&rdquo;
          </p>
          <footer className="mt-4 border-t border-neutral-100 pt-3">
            <p className="text-sm font-semibold text-brand-deep">{entry.author}</p>
            <p className="text-xs text-neutral-500">{entry.role}</p>
          </footer>
        </motion.blockquote>
      ))}
    </motion.div>
  );
}
