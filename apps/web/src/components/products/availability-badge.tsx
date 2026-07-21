import { cn } from '@/lib/utils';
import { formatAvailability } from '@/lib/catalog-api';
import { Badge, type BadgeProps } from '@/components/ui';

const availabilityVariant: Record<string, NonNullable<BadgeProps['variant']>> = {
  IN_STOCK: 'success',
  LOW_STOCK: 'warning',
  MADE_TO_ORDER: 'info',
  BACK_ORDER: 'warning',
  PRE_ORDER: 'info',
  UNAVAILABLE: 'neutral',
  DISCONTINUED: 'error',
};

export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: string;
  className?: string;
}) {
  return (
    <Badge
      variant={availabilityVariant[availability] ?? 'neutral'}
      className={cn(className)}
    >
      {formatAvailability(availability)}
    </Badge>
  );
}
