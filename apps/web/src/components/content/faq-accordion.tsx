'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div
            key={item.question}
            className={cn(index > 0 && 'border-t border-neutral-100')}
          >
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors sm:px-6 sm:py-5',
                open ? 'bg-brand-pale/40' : 'hover:bg-neutral-50',
              )}
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
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
                  className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
                  aria-hidden
                />
              </span>
            </button>
            {open ? (
              <div className="border-t border-brand-pale/60 bg-white px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
                <p className="max-w-2xl pl-0 text-sm leading-relaxed text-neutral-600 sm:pl-10">
                  {item.answer}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
