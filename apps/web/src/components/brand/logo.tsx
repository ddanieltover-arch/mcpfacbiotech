import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: { dimension: 28, className: 'h-7 w-7' },
  md: { dimension: 32, className: 'h-8 w-8' },
  lg: { dimension: 48, className: 'h-12 w-12' },
  xl: { dimension: 160, className: 'h-40 w-40' },
} as const;

type LogoSize = keyof typeof sizeMap;

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  variant?: 'default' | 'light';
  className?: string;
  href?: string;
}

export function Logo({
  size = 'md',
  showText = true,
  variant = 'default',
  className,
  href = '/',
}: LogoProps) {
  const { dimension, className: imageClassName } = sizeMap[size];
  const isLight = variant === 'light';

  const content = (
    <>
      <Image
        src="/logo.jpg"
        alt="MCPFAC BIOTECH"
        width={dimension}
        height={dimension}
        className={cn('shrink-0 rounded-full object-cover', imageClassName)}
        priority={size === 'xl'}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-heading font-bold tracking-tight',
              size === 'lg' || size === 'xl' ? 'text-xl' : 'text-lg',
              isLight ? 'text-white' : 'text-brand-deep',
            )}
          >
            MCPFAC
          </span>
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.2em]',
              isLight ? 'text-brand-light' : 'text-brand-natural',
            )}
          >
            BIOTECH
          </span>
        </div>
      )}
    </>
  );

  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      {content}
    </Link>
  );
}
