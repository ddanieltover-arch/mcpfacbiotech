import Image from 'next/image';
import { Logo } from '@/components/brand/logo';

/**
 * Auth layout — minimal layout without Header/Footer for login, register, etc.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Left branding panel */}
      <div className="hidden w-1/2 bg-brand-deep lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo size="md" variant="light" />

        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.jpg"
            alt="MCPFAC BIOTECH"
            width={200}
            height={200}
            className="mb-8 h-48 w-48 rounded-full object-cover shadow-xl"
            priority
          />
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
        <div className="mb-8 lg:hidden">
          <Logo size="sm" />
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
