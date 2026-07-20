'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPassword } from '../actions';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await forgotPassword(formData);
      if ('error' in result) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setIsSubmitted(true);
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pale">
          <Mail className="h-8 w-8 text-brand-deep" />
        </div>
        <h1 className="mb-2 font-heading text-2xl font-bold text-neutral-900">Check your email</h1>
        <p className="mb-6 text-sm text-neutral-500">
          If an account exists with that email, we&apos;ve sent you a password reset link.
          Please check your inbox and spam folder.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep hover:text-brand-natural"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-neutral-900">Reset your password</h1>
      <p className="mb-8 text-neutral-500">
        Enter your email address and we&apos;ll send you a reset link
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
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

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-natural disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Send Reset Link <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-brand-deep"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
