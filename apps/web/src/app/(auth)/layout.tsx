import Link from 'next/link';
import { Beaker } from 'lucide-react';

/**
 * Auth layout — minimal layout without Header/Footer for login, register, etc.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Left branding panel */}
      <div className="hidden w-1/2 bg-brand-deep lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <Beaker className="h-8 w-8 text-brand-leaf" strokeWidth={1.5} />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              MCPFAC
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-light">
              BIOTECH
            </span>
          </div>
        </Link>

        <div>
          <h2 className="mb-4 font-heading text-3xl font-bold text-white">
            Your trusted partner in biotechnology research
          </h2>
          <p className="max-w-md text-brand-light">
            Access thousands of research-grade peptides, chemicals, and laboratory supplies.
            Backed by COA, MSDS, and HPLC documentation for every product.
          </p>
          <p className="mt-6 font-heading text-sm font-semibold tracking-wide text-brand-leaf">
            Learn • Understand • Grow
          </p>
        </div>

        <p className="text-xs text-brand-light/60">
          © 2016–{new Date().getFullYear()} MCPFAC BIOTECH. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Beaker className="h-7 w-7 text-brand-deep" strokeWidth={1.5} />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-lg font-bold tracking-tight text-brand-deep">
                MCPFAC
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-natural">
                BIOTECH
              </span>
            </div>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
