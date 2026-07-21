import { cn } from '@/lib/utils';
import { formatAvailability } from '@/lib/catalog-api';

const availabilityStyles: Record<string, string> = {
  IN_STOCK: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  LOW_STOCK: 'bg-amber-50 text-amber-700 ring-amber-200',
  MADE_TO_ORDER: 'bg-blue-50 text-blue-700 ring-blue-200',
  BACK_ORDER: 'bg-orange-50 text-orange-700 ring-orange-200',
  PRE_ORDER: 'bg-violet-50 text-violet-700 ring-violet-200',
  UNAVAILABLE: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
  DISCONTINUED: 'bg-red-50 text-red-700 ring-red-200',
};

export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        availabilityStyles[availability] ?? availabilityStyles.UNAVAILABLE,
        className,
      )}
    >
      {formatAvailability(availability)}
    </span>
  );
}
