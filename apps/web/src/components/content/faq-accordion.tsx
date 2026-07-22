'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { easeOut, transitionFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();
  const panelTransition = transitionFor(reduceMotion, {
    duration: 0.28,
    ease: easeOut,
  });

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div
            key={item.question}
            className={cn(index > 0 && 'border-t border-neutral-100')}
          >
            <button
              id={buttonId}
              type="button"
              className={cn(
                'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors sm:px-6 sm:py-5',
                open ? 'bg-brand-pale/40' : 'hover:bg-neutral-50',
              )}
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              aria-controls={panelId}
            >
              <span className="flex min-w-0 items-start gap-3 sm:gap-4">
                <span
                  className="mt-0.5 hidden font-heading text-xs font-bold tracking-widest text-brand-leaf sm:inline"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-heading text-sm font-semibold text-brand-deep md:text-base">
                  {item.question}
                </span>
              </span>
              <span
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                  open ? 'bg-brand-deep text-white' : 'bg-brand-pale text-brand-deep',
                )}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
                    open && 'rotate-180',
                  )}
                  aria-hidden
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  key={panelId}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={panelTransition}
                  className="overflow-hidden border-t border-brand-pale/60 bg-white"
                >
                  <p className="max-w-2xl px-5 pb-5 pt-1 text-sm leading-relaxed text-neutral-600 sm:px-6 sm:pb-6 sm:pl-16">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
