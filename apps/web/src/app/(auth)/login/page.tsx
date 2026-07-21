'use client';

import Link from 'next/link';
import { Suspense, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '../actions';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-neutral-100" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Show error from auth callback if present
  const callbackError = searchParams.get('error');
  const successMessage = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
      // On success, the Server Action redirects — no client-side handling needed.
    });
  };

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-neutral-900">Welcome back</h1>
      <p className="mb-8 text-neutral-500">Sign in to your MCPFAC BIOTECH account</p>

      {/* Error messages */}
      {(error || callbackError) && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            {error || 'Authentication failed. Please try signing in again.'}
          </p>
        </div>
      )}

      {successMessage === 'password_reset_success' && !error && !callbackError && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-brand-pale bg-brand-pale/40 p-4">
          <p className="text-sm text-brand-deep">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@organization.com"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-natural hover:text-brand-deep"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-natural disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-deep hover:text-brand-natural">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
