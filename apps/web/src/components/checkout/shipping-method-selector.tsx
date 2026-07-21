'use client';

import { Truck } from 'lucide-react';
import type { OrderShippingMethod } from '@mcpfac/shared-types';
import { SHIPPING_METHOD_OPTIONS } from '@mcpfac/shared-types';
import { cn, formatCurrency } from '@/lib/utils';

type ShippingMethodSelectorProps = {
  value: OrderShippingMethod;
  onChange: (value: OrderShippingMethod) => void;
};

export function ShippingMethodSelector({ value, onChange }: ShippingMethodSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <Truck className="h-5 w-5 text-brand-deep" aria-hidden />
        <h2 className="font-heading text-lg font-semibold text-brand-deep">Shipping Method</h2>
      </div>

      <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Shipping method</legend>
        {SHIPPING_METHOD_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-4 transition-colors',
                selected
                  ? 'border-brand-deep ring-1 ring-brand-deep'
                  : 'border-neutral-200 hover:border-brand-light',
              )}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-1 h-4 w-4 accent-brand-deep"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-brand-deep">{option.label}</span>
                    <span className="mt-1 block text-xs text-neutral-500">{option.eta}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-brand-deep">
                    {formatCurrency(option.price)}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
