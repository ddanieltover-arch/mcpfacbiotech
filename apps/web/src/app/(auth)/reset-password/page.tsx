'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '../actions';

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-neutral-900">Set a new password</h1>
      <p className="mb-8 text-neutral-500">Choose a strong password for your MCPFAC BIOTECH account</p>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
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

          {password.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {passwordRequirements.map((req) => {
                const passed = req.test(password);
                return (
                  <li
                    key={req.label}
                    className={`flex items-center gap-2 text-xs ${passed ? 'text-brand-natural' : 'text-neutral-400'}`}
                  >
                    <Check className={`h-3.5 w-3.5 ${passed ? 'opacity-100' : 'opacity-30'}`} />
                    {req.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Confirm your new password"
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
              Update Password <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-brand-deep hover:text-brand-natural"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
