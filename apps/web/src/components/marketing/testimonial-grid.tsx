'use client';

import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/marketing-content';
import { slideUp, staggerChildren } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Testimonial = { quote: string; author: string; role: string };

type TestimonialGridProps = {
  items?: ReadonlyArray<Testimonial>;
  className?: string;
};

export function TestimonialGrid({ items = TESTIMONIALS, className }: TestimonialGridProps) {
  return (
    <motion.div
      className={cn('grid gap-4 md:grid-cols-3', className)}
      variants={staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((item) => (
        <motion.blockquote
          key={item.author + item.role}
          variants={slideUp}
          className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <Quote className="h-5 w-5 text-brand-leaf" aria-hidden />
          <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700">&ldquo;{item.quote}&rdquo;</p>
          <footer className="mt-4 border-t border-neutral-100 pt-3">
            <p className="text-sm font-semibold text-brand-deep">{item.author}</p>
            <p className="text-xs text-neutral-500">{item.role}</p>
          </footer>
        </motion.blockquote>
      ))}
    </motion.div>
  );
}
