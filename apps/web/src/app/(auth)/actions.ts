'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ──────────────────────────────────────────────────────────────────────────────
// Auth Server Actions (Volume 3 — Next.js App Router Conventions)
// All auth mutations run server-side via Server Actions.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Sign in with email and password.
 * Returns an error message string on failure; redirects on success.
 */
export async function login(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Create a new account with email, password, and profile metadata.
 * Requires email verification before the account is active.
 */
export async function register(formData: FormData): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const organizationName = (formData.get('organizationName') as string) || '';
  const organizationType = (formData.get('organizationType') as string) || '';
  const country = formData.get('country') as string;

  // Server-side validation
  if (!email || !password || !firstName || !lastName || !country) {
    return { error: 'Please fill in all required fields.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        organization_name: organizationName,
        organization_type: organizationType,
        country,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : ''}${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Send a password reset email.
 */
export async function forgotPassword(formData: FormData): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email address is required.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
