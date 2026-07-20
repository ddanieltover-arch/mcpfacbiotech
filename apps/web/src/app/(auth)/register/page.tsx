'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

const organizationTypes = [
  { value: 'INDIVIDUAL', label: 'Individual Researcher' },
  { value: 'UNIVERSITY', label: 'University / Academic' },
  { value: 'LABORATORY', label: 'Research Laboratory' },
  { value: 'COMPANY', label: 'Pharmaceutical / Biotech Company' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'INSTITUTION', label: 'Government / Institution' },
];

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase auth
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-neutral-900">Create an account</h1>
      <p className="mb-8 text-neutral-500">
        Join thousands of researchers and institutions worldwide
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-neutral-700">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="name@organization.com"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          />
        </div>

        {/* Organization */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="organizationName"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Organization
            </label>
            <input
              id="organizationName"
              type="text"
              placeholder="Optional"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            />
          </div>
          <div>
            <label
              htmlFor="organizationType"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Type
            </label>
            <select
              id="organizationType"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            >
              <option value="">Select...</option>
              {organizationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Country
          </label>
          <input
            id="country"
            type="text"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
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
          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req) => (
                <div
                  key={req.label}
                  className={`flex items-center gap-1.5 text-xs ${
                    req.test(password) ? 'text-success' : 'text-neutral-400'
                  }`}
                >
                  <Check className="h-3 w-3" />
                  {req.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="agreeToTerms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-deep focus:ring-brand-leaf"
          />
          <label htmlFor="agreeToTerms" className="text-xs text-neutral-500">
            I agree to the{' '}
            <Link href="/terms" className="font-medium text-brand-deep hover:underline">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-brand-deep hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-natural disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Create Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-deep hover:text-brand-natural">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
