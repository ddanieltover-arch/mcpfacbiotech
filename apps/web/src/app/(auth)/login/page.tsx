'use client';

import Link from 'next/link';
import { Suspense, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, Button, Input, Label, Skeleton } from '@/components/ui';
import { login } from '../actions';

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const callbackError = searchParams.get('error');
  const successMessage = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const redirectTo = searchParams.get('redirect');
    if (redirectTo) {
      formData.set('redirect', redirectTo);
    }

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-neutral-900">Welcome back</h1>
      <p className="mb-8 text-neutral-500">Sign in to your MCPFAC BIOTECH account</p>

      {(error || callbackError) && (
        <Alert variant="error" className="mb-6">
          {error || 'Authentication failed. Please try signing in again.'}
        </Alert>
      )}

      {successMessage === 'password_reset_success' && !error && !callbackError && (
        <Alert variant="brand" className="mb-6">
          Your password has been updated. You can now sign in with your new password.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email" isRequired>
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@organization.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" isRequired className="mb-0">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-natural hover:text-brand-deep"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="pr-10"
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

        <Button type="submit" fullWidth isLoading={isPending}>
          {!isPending ? (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            'Signing in…'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href={searchParams.get('redirect') ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : '/register'} className="font-semibold text-brand-deep hover:text-brand-natural">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
