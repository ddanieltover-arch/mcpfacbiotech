import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Press-scale is marketing polish; disabled inside [data-motion=reduce] (admin/checkout/portal).
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[color,background-color,box-shadow,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-safe:active:scale-[0.98] in-data-[motion=reduce]:transform-none in-data-[motion=reduce]:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-deep text-white shadow-sm hover:bg-brand-natural hover:shadow-md in-data-[motion=reduce]:hover:shadow-sm',
        secondary:
          'border border-brand-deep bg-transparent text-brand-deep hover:bg-brand-pale/60',
        ghost: 'bg-transparent text-brand-deep hover:bg-brand-pale/50',
        danger: 'bg-error text-white shadow-sm hover:bg-red-700',
        outline:
          'border border-neutral-300 bg-white text-neutral-800 hover:border-brand-leaf hover:bg-neutral-50',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 py-2.5',
        lg: 'h-11 px-5 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
