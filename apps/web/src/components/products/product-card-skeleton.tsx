import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200/80',
        className,
      )}
      aria-hidden
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="hidden h-3 w-full sm:block" />
        <Skeleton className="hidden h-3 w-2/3 sm:block" />
        <div className="mt-auto space-y-3 border-t border-neutral-100 pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
