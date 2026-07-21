'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { subscribeNewsletter } from '@/lib/newsletter-api';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || subscribed) return;

    setPending(true);
    try {
      await subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
      toast.success('Subscribed — check your inbox for a confirmation.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to subscribe right now. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  if (subscribed) {
    return (
      <p className="w-full max-w-sm rounded-lg border border-brand-leaf/40 bg-white/10 px-4 py-3 text-sm text-brand-light">
        You are subscribed. Watch your inbox for research updates.
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex w-full max-w-sm gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 outline-none transition-colors focus:border-brand-leaf focus:bg-white/15"
        required
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-leaf px-5 py-2 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? 'Sending…' : 'Subscribe'}
      </button>
    </form>
  );
}
